import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import type { InquiryForm } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ isOpen, onClose }: CartProps) {
  const { items, removeFromCart, clearCart } = useCart();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [formData, setFormData] = useState<InquiryForm>({
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending notification to team
    // In production, this would be an API call to your backend
    const inquiryData = {
      customer: formData,
      simCards: items.map((item) => ({
        number: item.simCard.number,
        carrier: item.simCard.carrier,
        price: item.simCard.price,
      })),
      submittedAt: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log('Inquiry submitted:', inquiryData);
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset after showing success
    setTimeout(() => {
      setSubmitSuccess(false);
      setShowInquiryForm(false);
      setFormData({ name: '', phone: '', email: '', idNumber: '', message: '' });
      clearCart();
      onClose();
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Giỏ hàng">
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 Giỏ hàng ({items.length})</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng giỏ hàng">
            ✕
          </button>
        </div>

        {submitSuccess ? (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <h3>Gửi yêu cầu thành công!</h3>
            <p>Đội ngũ của chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất.</p>
          </div>
        ) : showInquiryForm ? (
          <form className="inquiry-form" onSubmit={handleSubmit}>
            <h3>Thông tin liên hệ</h3>
            <p className="form-description">
              Vui lòng điền thông tin để chúng tôi liên hệ tư vấn về các số SIM bạn quan tâm.
            </p>

            <div className="form-group">
              <label htmlFor="inquiry-name">Họ và tên *</label>
              <input
                id="inquiry-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label htmlFor="inquiry-phone">Số điện thoại *</label>
              <input
                id="inquiry-phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912 345 678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="inquiry-email">Email</label>
              <input
                id="inquiry-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="inquiry-id">Số Căn Cước Công Dân *</label>
              <input
                id="inquiry-id"
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="001234567890"
                maxLength={12}
              />
            </div>

            <div className="form-group">
              <label htmlFor="inquiry-message">Ghi chú</label>
              <textarea
                id="inquiry-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Thời gian liên hệ thuận tiện, yêu cầu đặc biệt..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowInquiryForm(false)}
              >
                Quay lại
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
              </button>
            </div>
          </form>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="cart-empty">
                <span className="empty-cart-icon">📋</span>
                <p>Chưa có số SIM nào trong giỏ</p>
                <p className="cart-hint">Thêm số SIM bạn quan tâm để gửi yêu cầu tư vấn</p>
              </div>
            ) : (
              <>
                <ul className="cart-items">
                  {items.map((item) => (
                    <li key={item.simCard.id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-number">{item.simCard.number}</span>
                        <span className="cart-item-meta">
                          {item.simCard.carrier} • {formatPrice(item.simCard.price)}
                        </span>
                      </div>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.simCard.id)}
                        aria-label={`Xóa ${item.simCard.number}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="cart-footer">
                  <button className="btn-clear" onClick={clearCart}>
                    Xóa tất cả
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setShowInquiryForm(true)}
                  >
                    Gửi yêu cầu tư vấn ({items.length} số)
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
