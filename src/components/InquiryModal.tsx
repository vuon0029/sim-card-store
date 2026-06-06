import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../firebase/config';
import type { SimCard, InquiryForm } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { CarrierLogo } from './CarrierLogo';

interface InquiryModalProps {
  simCard: SimCard;
  onClose: () => void;
}

export function InquiryModal({ simCard, onClose }: InquiryModalProps) {
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

    const inquiryData = {
      customer: formData,
      simCard: {
        number: simCard.number,
        carrier: simCard.carrier,
        price: simCard.price,
      },
      submittedAt: new Date().toISOString(),
    };

    try {
      // Save to Firestore
      const db = getFirestoreDb();
      const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);

      // Send email notification via Cloud Function (fire-and-forget)
      fetch(import.meta.env.VITE_FUNCTIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId: docRef.id }),
      }).catch(() => {
        // Email failure shouldn't block the success flow
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inquiry-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Tư vấn SIM">
      <div className="inquiry-panel" onClick={(e) => e.stopPropagation()}>
        <div className="inquiry-header">
          <h2>Tư vấn SIM</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className={`inquiry-sim-preview sim-card-${simCard.carrier.toLowerCase()}`}>
          <CarrierLogo carrier={simCard.carrier} className="inquiry-sim-logo" />
          <span className="inquiry-sim-number">{simCard.number}</span>
          <span className="inquiry-sim-price">{formatPrice(simCard.price)}</span>
        </div>

        {submitSuccess ? (
          <div className="success-message">
            <h3>Gửi yêu cầu thành công!</h3>
            <p>Đội ngũ của chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất.</p>
          </div>
        ) : (
          <form className="inquiry-form" onSubmit={handleSubmit}>
            <p className="form-description">
              Vui lòng điền thông tin để chúng tôi liên hệ tư vấn về số SIM này.
            </p>

            <div className="form-group">
              <label htmlFor="direct-inquiry-name">Họ và tên *</label>
              <input
                id="direct-inquiry-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label htmlFor="direct-inquiry-phone">Số điện thoại *</label>
              <input
                id="direct-inquiry-phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912 345 678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="direct-inquiry-email">Email</label>
              <input
                id="direct-inquiry-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="direct-inquiry-id">Số Căn Cước Công Dân *</label>
              <input
                id="direct-inquiry-id"
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                placeholder="001234567890"
                maxLength={12}
              />
            </div>

            <div className="form-group">
              <label htmlFor="direct-inquiry-message">Ghi chú</label>
              <textarea
                id="direct-inquiry-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Thời gian liên hệ thuận tiện, yêu cầu đặc biệt..."
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Hủy
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
