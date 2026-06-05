import { useState, useRef } from 'react';
import { parseCSV, parseJSON } from '../utils/bulkParser';
import { validateSimCard } from '../utils/validators';
import { bulkCreateSimCards, fetchExistingNumbers } from '../firebase/simCards';
import { AdminNotification, type NotificationType } from './AdminNotification';
import type { SimCardInput, BulkResult, ValidationResult } from '../types';
import './admin.css';

const CATEGORIES = ['Phong Thủy', 'Lộc Phát', 'Thần Tài', 'Số Đẹp', 'Giá Rẻ'] as const;

interface ParsedRecord {
  data: SimCardInput;
  index: number;
  validation: ValidationResult;
  isDuplicate?: boolean;
  existingId?: string;
}

type UploadPhase = 'select' | 'preview' | 'uploading' | 'result';

export function BulkUpload() {
  const [phase, setPhase] = useState<UploadPhase>('select');
  const [records, setRecords] = useState<ParsedRecord[]>([]);
  const [parseErrors, setParseErrors] = useState<{ row: number; message: string }[]>([]);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validRecords = records.filter((r) => r.validation.valid && !r.isDuplicate);
  const invalidRecords = records.filter((r) => !r.validation.valid || r.isDuplicate);

  function handleCategoryChange(recordIndex: number, newCategory: string) {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.index !== recordIndex) return r;
        const updatedData = { ...r.data, category: newCategory };
        return {
          ...r,
          data: updatedData,
          validation: validateSimCard(updatedData),
        };
      })
    );
  }

  function downloadTemplate(format: 'csv' | 'json') {
    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      content = `so dien thoai,nha mang,gia tien,mo ta
0986 888 666,Viettel,5000000,So dep phong thuy
0912 345 678,Mobifone,3000000,
0988 123 456,Vinaphone,8000000,So than tai may man`;
      filename = 'mau-sim-cards.csv';
      mimeType = 'text/csv;charset=utf-8;';
    } else {
      content = JSON.stringify([
        { number: '0986 888 666', carrier: 'Viettel', category: 'Phong Thủy', price: 5000000, description: 'So dep phong thuy' },
        { number: '0912 345 678', carrier: 'Mobifone', category: '', price: 3000000 },
        { number: '0988 123 456', carrier: 'Vinaphone', category: 'Thần Tài', price: 8000000, description: 'So than tai may man' },
      ], null, 2);
      filename = 'mau-sim-cards.json';
      mimeType = 'application/json;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'csv' && extension !== 'json') {
      setNotification({ message: 'Vui lòng tải lên tệp .csv hoặc .json', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setNotification({ message: 'Khong the doc tep', type: 'error' });
        return;
      }

      const parseResult = extension === 'csv' ? parseCSV(content) : parseJSON(content);

      if (!parseResult.success && parseResult.data.length === 0) {
        setParseErrors(parseResult.errors);
        setRecords([]);
        setPhase('preview');
        return;
      }

      // Fetch existing numbers for duplicate detection
      let existingNumbers = new Map<string, { id: string; number: string }>();
      try {
        existingNumbers = await fetchExistingNumbers();
      } catch {
        // If fetch fails, proceed without duplicate check
      }

      // Validate each parsed record and check for duplicates
      const parsedRecords: ParsedRecord[] = parseResult.data.map((data, index) => {
        const normalized = data.number.replace(/\D/g, '');
        const existing = existingNumbers.get(normalized);
        return {
          data,
          index,
          validation: validateSimCard(data),
          isDuplicate: Boolean(existing),
          existingId: existing?.id,
        };
      });

      setRecords(parsedRecords);
      setParseErrors(parseResult.errors);
      setPhase('preview');
    };

    reader.onerror = () => {
      setNotification({ message: 'Lỗi khi đọc tệp', type: 'error' });
    };

    reader.readAsText(file);
  }

  async function handleConfirmUpload() {
    if (validRecords.length === 0) return;

    setPhase('uploading');

    try {
      const validData = validRecords.map((r) => r.data);
      const bulkResult = await bulkCreateSimCards(validData);
      setResult(bulkResult);
      setPhase('result');

      if (bulkResult.failedCount === 0) {
        setNotification({
          message: `Tải lên thành công ${bulkResult.successCount} bản ghi`,
          type: 'success',
        });
      } else {
        setNotification({
          message: `${bulkResult.successCount} thành công, ${bulkResult.failedCount} thất bại`,
          type: 'error',
        });
      }
    } catch {
      setNotification({ message: 'Lỗi khi tải lên dữ liệu', type: 'error' });
      setPhase('preview');
    }
  }

  function handleReset() {
    setPhase('select');
    setRecords([]);
    setParseErrors([]);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="bulk-upload">
      <h2 className="bulk-upload__title">Tải lên hàng loạt</h2>

      {notification && (
        <AdminNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {phase === 'select' && (
        <div className="bulk-upload__select">
          <p className="bulk-upload__description">
            Chọn tệp CSV hoặc JSON chứa danh sách SIM cần tải lên.
          </p>

          <div className="bulk-upload__templates">
            <p className="bulk-upload__templates-label">Tải xuống tệp mẫu:</p>
            <div className="bulk-upload__templates-buttons">
              <button
                className="bulk-upload__btn bulk-upload__btn--template"
                onClick={() => downloadTemplate('csv')}
                type="button"
              >
                📄 Tải mẫu CSV
              </button>
              <button
                className="bulk-upload__btn bulk-upload__btn--template"
                onClick={() => downloadTemplate('json')}
                type="button"
              >
                📄 Tải mẫu JSON
              </button>
            </div>
            <p className="bulk-upload__templates-hint">
              Nhà mạng: Viettel, Mobifone, Vinaphone<br />
              Danh mục: Phong Thủy, Lộc Phát, Thần Tài, Số Đẹp, Giá Rẻ
            </p>
          </div>

          <label className="bulk-upload__file-label">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="bulk-upload__file-input"
            />
            <span className="bulk-upload__file-button">Chọn tệp</span>
          </label>
        </div>
      )}

      {phase === 'preview' && (
        <div className="bulk-upload__preview">
          <div className="bulk-upload__summary">
            <span className="bulk-upload__valid-count">
              ✓ {validRecords.length} hợp lệ
            </span>
            <span className="bulk-upload__invalid-count">
              ✕ {invalidRecords.length + parseErrors.length} không hợp lệ
            </span>
          </div>

          {parseErrors.length > 0 && (
            <div className="bulk-upload__parse-errors">
              <h4>Loi phan tich:</h4>
              <ul>
                {parseErrors.map((err, i) => (
                  <li key={i}>Dong {err.row}: {err.message}</li>
                ))}
              </ul>
            </div>
          )}

          {records.length > 0 && (
            <div className="bulk-upload__table-wrapper">
              <table className="bulk-upload__table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Số điện thoại</th>
                    <th>Nhà mạng</th>
                    <th>Danh mục</th>
                    <th>Giá tiền</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.index}
                      className={
                        record.isDuplicate
                          ? 'bulk-upload__row--duplicate'
                          : record.validation.valid
                            ? 'bulk-upload__row--valid'
                            : 'bulk-upload__row--invalid'
                      }
                    >
                      <td>{record.index + 1}</td>
                      <td>{record.data.number}</td>
                      <td>{record.data.carrier}</td>
                      <td>
                        <select
                          className="bulk-upload__category-select"
                          value={record.data.category}
                          onChange={(e) => handleCategoryChange(record.index, e.target.value)}
                        >
                          <option value="">-- Khong chon --</option>
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td>{record.data.price.toLocaleString('vi-VN')} ₫</td>
                      <td>{record.data.description || '—'}</td>
                      <td>
                        {record.isDuplicate ? (
                          <span className="bulk-upload__status--duplicate">
                            Trùng số (đã tồn tại)
                          </span>
                        ) : record.validation.valid ? (
                          <span className="bulk-upload__status--valid">Hop le</span>
                        ) : (
                          <span className="bulk-upload__status--invalid">
                            {Object.values(record.validation.errors).join(', ')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bulk-upload__actions">
            <button
              className="bulk-upload__btn bulk-upload__btn--cancel"
              onClick={handleReset}
            >
              Hủy
            </button>
            <button
              className="bulk-upload__btn bulk-upload__btn--confirm"
              onClick={handleConfirmUpload}
              disabled={validRecords.length === 0}
            >
              Xác nhận tải lên ({validRecords.length} bản ghi)
            </button>
          </div>
        </div>
      )}

      {phase === 'uploading' && (
        <div className="bulk-upload__loading">
          <p>Đang tải lên...</p>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="bulk-upload__result">
          <h3>Kết quả tải lên</h3>
          <div className="bulk-upload__result-summary">
            <p className="bulk-upload__result-success">
              ✓ Thành công: {result.successCount} bản ghi
            </p>
            {result.failedCount > 0 && (
              <>
                <p className="bulk-upload__result-failed">
                  ✕ Thất bại: {result.failedCount} bản ghi
                </p>
                <div className="bulk-upload__failures">
                  <h4>Chi tiết lỗi:</h4>
                  <ul>
                    {result.failures.map((f, i) => (
                      <li key={i}>
                        Bản ghi #{f.index + 1}: {Object.values(f.errors).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
          <button
            className="bulk-upload__btn bulk-upload__btn--confirm"
            onClick={handleReset}
          >
            Tải lên tệp khác
          </button>
        </div>
      )}
    </div>
  );
}
