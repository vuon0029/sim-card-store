import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { validateSimCard } from '../utils/validators';
import { createSimCard, updateSimCard, deleteSimCard, fetchAllSimCards, checkDuplicateNumber } from '../firebase/simCards';
import { AdminNotification, type NotificationType } from './AdminNotification';
import { CarrierLogo } from '../components/CarrierLogo';
import { formatPrice } from '../utils/formatPrice';
import type { SimCardInput, SimCard } from '../types';
import './admin.css';

const CARRIERS = ['Viettel', 'Mobifone', 'Vinaphone'] as const;
const CATEGORIES = ['Phong Thủy', 'Lộc Phát', 'Thần Tài', 'Số Đẹp', 'Giá Rẻ'] as const;

export function SimCardForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [number, setNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Duplicate detection state
  const [duplicateSimCard, setDuplicateSimCard] = useState<SimCard | null>(null);

  // In edit mode, fetch the existing SIM card and pre-populate form
  useEffect(() => {
    if (!isEditMode || !id) return;

    async function loadSimCard() {
      setFetchingData(true);
      try {
        const allCards = await fetchAllSimCards();
        const card: SimCard | undefined = allCards.find((c) => c.id === id);
        if (card) {
          setNumber(card.number);
          setCarrier(card.carrier);
          setCategory(card.category);
          setPrice(String(card.price));
          setDescription(card.description ?? '');
        } else {
          setNotification({ message: 'Không tìm thấy SIM card', type: 'error' });
        }
      } catch {
        setNotification({ message: 'Lỗi khi tải dữ liệu SIM card', type: 'error' });
      } finally {
        setFetchingData(false);
      }
    }

    loadSimCard();
  }, [isEditMode, id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setDuplicateSimCard(null);

    const input: SimCardInput = {
      number: number.trim(),
      carrier,
      category,
      price: parseFloat(price) || 0,
      description: description.trim() || undefined,
    };

    // Client-side validation
    const result = validateSimCard(input);
    if (!result.valid) {
      setFieldErrors(result.errors);
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && id) {
        await updateSimCard(id, input);
        setNotification({ message: 'Cập nhật SIM card thành công!', type: 'success' });
      } else {
        // Check for duplicate before creating
        const existing = await checkDuplicateNumber(input.number);
        if (existing) {
          setDuplicateSimCard(existing);
          setLoading(false);
          return;
        }
        await createSimCard(input);
        setNotification({ message: 'Thêm SIM card thành công!', type: 'success' });
        setTimeout(() => navigate('/admin'), 1500);
      }
    } catch {
      setNotification({
        message: isEditMode
          ? 'Lỗi khi cập nhật SIM card. Vui lòng thử lại.'
          : 'Lỗi khi thêm SIM card. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  if (fetchingData) {
    return <div className="admin-form__loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-form">
      {/* Back button */}
      <button
        className="admin-form__back"
        onClick={() => navigate('/admin')}
        type="button"
      >
        ← Quay lại danh sách
      </button>

      <h2 className="admin-form__title">
        {isEditMode ? 'Chỉnh Sửa SIM' : 'Thêm SIM Mới'}
      </h2>

      <div className="admin-form__layout">
        {/* Live SIM card preview */}
        <div className="admin-form__preview">
          <h3 className="admin-form__preview-title">Xem truoc</h3>
          <div className={`sim-card-item sim-card-${(carrier || 'viettel').toLowerCase()}`}>
            <div className="sim-card-content">
              <div className="sim-card-top">
                {carrier ? (
                  <CarrierLogo carrier={carrier} className="sim-card-logo" />
                ) : (
                  <span className="sim-card-carrier-text" style={{ color: '#fff' }}>Nhà mạng</span>
                )}
                  {category ? (<span className="sim-card-category">{category}</span>) : null }
              </div>
              <div className="sim-card-chip"></div>
              <div className="sim-card-body">
                <div className="sim-card-number">{number || '0xxx xxx xxx'}</div>
                {description && (
                  <p className="sim-card-description">{description}</p>
                )}
              </div>
            </div>
            <div className="sim-card-footer">
              <span className="sim-card-price">
                {price ? formatPrice(parseFloat(price) || 0) : '0 ₫'}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="admin-form__form" onSubmit={handleSubmit} noValidate>
          {/* Number field */}
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="sim-number">
              Số điện thoại <span className="admin-form__required">*</span>
            </label>
            <input
              id="sim-number"
              className={`admin-form__input ${fieldErrors.number ? 'admin-form__input--error' : ''}`}
              type="text"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="VD: 0986 888 666"
              aria-invalid={Boolean(fieldErrors.number)}
              aria-describedby={fieldErrors.number ? 'error-number' : undefined}
            />
            {fieldErrors.number && (
              <span id="error-number" className="admin-form__error" role="alert">
                {fieldErrors.number}
              </span>
            )}
          </div>

          {/* Carrier dropdown */}
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="sim-carrier">
              Nhà mạng <span className="admin-form__required">*</span>
            </label>
            <select
              id="sim-carrier"
              className={`admin-form__select ${fieldErrors.carrier ? 'admin-form__select--error' : ''}`}
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              aria-invalid={Boolean(fieldErrors.carrier)}
              aria-describedby={fieldErrors.carrier ? 'error-carrier' : undefined}
            >
              <option value="">-- Chọn nhà mạng --</option>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {fieldErrors.carrier && (
              <span id="error-carrier" className="admin-form__error" role="alert">
                {fieldErrors.carrier}
              </span>
            )}
          </div>

          {/* Category dropdown */}
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="sim-category">
              Danh muc
            </label>
            <select
              id="sim-category"
              className={`admin-form__select ${fieldErrors.category ? 'admin-form__select--error' : ''}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-invalid={Boolean(fieldErrors.category)}
              aria-describedby={fieldErrors.category ? 'error-category' : undefined}
            >
              <option value="">-- Chon danh muc --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <span id="error-category" className="admin-form__error" role="alert">
                {fieldErrors.category}
              </span>
            )}
          </div>

          {/* Price field */}
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="sim-price">
              Giá (VND) <span className="admin-form__required">*</span>
            </label>
            <input
              id="sim-price"
              className={`admin-form__input ${fieldErrors.price ? 'admin-form__input--error' : ''}`}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 5000000"
              min="1"
              aria-invalid={Boolean(fieldErrors.price)}
              aria-describedby={fieldErrors.price ? 'error-price' : undefined}
            />
            {fieldErrors.price && (
              <span id="error-price" className="admin-form__error" role="alert">
                {fieldErrors.price}
              </span>
            )}
          </div>

          {/* Description field */}
          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="sim-description">
              Mô tả
            </label>
            <textarea
              id="sim-description"
              className="admin-form__textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả thêm về số điện thoại (tùy chọn)"
              rows={3}
            />
          </div>

          {/* Submit button */}
          <div className="admin-form__buttons">
            <button
              type="button"
              className="admin-form__cancel"
              onClick={() => navigate('/admin')}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="admin-form__submit"
              disabled={loading}
            >
              {loading
                ? 'Đang xử lý...'
                : isEditMode
                  ? 'Cập Nhật'
                  : 'Thêm SIM'}
            </button>
          </div>
        </form>
      </div>

      {/* Duplicate number warning */}
      {duplicateSimCard && (
        <div className="admin-form__duplicate-overlay">
          <div className="admin-form__duplicate-modal">
            <h3 className="admin-form__duplicate-title">⚠️ Số điện thoại này đã tồn tại</h3>
            <p className="admin-form__duplicate-message">
              Số <strong>{duplicateSimCard.number}</strong> đã có trong hệ thống
              ({duplicateSimCard.carrier}{duplicateSimCard.category ? ` - ${duplicateSimCard.category}` : ''}, {formatPrice(duplicateSimCard.price)}).
            </p>
            <p className="admin-form__duplicate-hint">
              Bạn có thể chỉnh sửa hoặc xóa số hiện tại thay vì tạo mới
            </p>
            <div className="admin-form__duplicate-actions">
              <button
                className="admin-form__duplicate-btn admin-form__duplicate-btn--edit"
                onClick={() => {
                  setDuplicateSimCard(null);
                  navigate(`/admin/edit/${duplicateSimCard.id}`);
                }}
              >
                Chỉnh sửa số này
              </button>
              <button
                className="admin-form__duplicate-btn admin-form__duplicate-btn--delete"
                onClick={async () => {
                  if (window.confirm(`Xóa số ${duplicateSimCard.number}?`)) {
                    await deleteSimCard(duplicateSimCard.id);
                    setDuplicateSimCard(null);
                    setNotification({ message: 'Đã xóa số trùng lặp, bạn có thể tạo lại', type: 'success' });
                  }
                }}
              >
                Xóa số cũ
              </button>
              <button
                className="admin-form__duplicate-btn admin-form__duplicate-btn--cancel"
                onClick={() => setDuplicateSimCard(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <AdminNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
