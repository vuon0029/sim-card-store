import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllSimCards, deleteSimCard } from '../firebase/simCards';
import { AdminNotification, type NotificationType } from './AdminNotification';
import { formatPrice } from '../utils/formatPrice';
import type { SimCard } from '../types';
import './admin.css';

interface SimCardWithDate extends SimCard {
  createdAt?: string | number | Date | null;
}

interface Notification {
  message: string;
  type: NotificationType;
}

export function SimCardTable() {
  const navigate = useNavigate();
  const [simCards, setSimCards] = useState<SimCardWithDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);

  const loadSimCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await fetchAllSimCards();
      setSimCards(cards as SimCardWithDate[]);
    } catch (err) {
      setError('Không thể tải danh sách SIM. Vui lòng thử lại.');
      console.error('Failed to fetch SIM cards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSimCards();
  }, [loadSimCards]);

  const filteredCards = simCards.filter((card) => {
    const query = searchQuery.toLowerCase();
    return (
      card.number.toLowerCase().includes(query) ||
      card.carrier.toLowerCase().includes(query) ||
      card.category.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (card: SimCardWithDate) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa SIM ${card.number}?`
    );
    if (!confirmed) return;

    try {
      await deleteSimCard(card.id);
      setSimCards((prev) => prev.filter((c) => c.id !== card.id));
      setNotification({ message: 'Xóa SIM thành công!', type: 'success' });
    } catch (err) {
      console.error('Failed to delete SIM card:', err);
      setNotification({ message: 'Xóa SIM thất bại. Vui lòng thử lại.', type: 'error' });
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/edit/${id}`);
  };

  if (loading) {
    return <div className="admin-table-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return (
      <div className="admin-table-error">
        <p>{error}</p>
        <button onClick={loadSimCards}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="admin-sim-table">
      {notification && (
        <AdminNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="admin-sim-table__header">
        <h2>Quản lý SIM</h2>
        <input
          type="text"
          className="admin-sim-table__search"
          placeholder="Tìm kiếm theo số, nhà mạng, loại số..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Tìm kiếm SIM"
        />
      </div>

      {filteredCards.length === 0 ? (
        <p className="admin-sim-table__empty">
          {searchQuery ? 'Không tìm thấy SIM phù hợp.' : 'Chưa có SIM nào.'}
        </p>
      ) : (
        <div className="admin-sim-table__wrapper">
          <table className="admin-sim-table__table">
            <thead>
              <tr>
                <th>Số điện thoại</th>
                <th>Nhà mạng</th>
                <th>Loại số</th>
                <th>Giá</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map((card) => (
                <tr key={card.id}>
                  <td>{card.number}</td>
                  <td>{card.carrier}</td>
                  <td>{card.category}</td>
                  <td>{formatPrice(card.price)}</td>
                  <td>{card.createdAt ? new Date(card.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="admin-sim-table__actions">
                    <button
                      className="admin-sim-table__btn admin-sim-table__btn--edit"
                      onClick={() => handleEdit(card.id)}
                      aria-label={`Sửa SIM ${card.number}`}
                    >
                      Sửa
                    </button>
                    <button
                      className="admin-sim-table__btn admin-sim-table__btn--delete"
                      onClick={() => handleDelete(card)}
                      aria-label={`Xóa SIM ${card.number}`}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
