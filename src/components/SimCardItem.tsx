import type { SimCard } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { CarrierLogo } from './CarrierLogo';
import { trackAddToCart, trackRemoveFromCart, trackInquiryOpened } from '../utils/analytics';

interface SimCardItemProps {
  simCard: SimCard;
  onInquiry: (simCard: SimCard) => void;
}

export function SimCardItem({ simCard, onInquiry }: SimCardItemProps) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(simCard.id);

  const handleToggleCart = () => {
    if (inCart) {
      removeFromCart(simCard.id);
      trackRemoveFromCart(simCard.number);
    } else {
      addToCart(simCard);
      trackAddToCart(simCard.number, simCard.carrier, simCard.price);
    }
  };

  const handleInquiry = () => {
    trackInquiryOpened(simCard.number, simCard.carrier, simCard.price);
    onInquiry(simCard);
  };

  return (
    <div className={`sim-card-item sim-card-${simCard.carrier.toLowerCase()} ${inCart ? 'in-cart' : ''}`}>
      <div className="sim-card-content">
        <div className="sim-card-top">
          <CarrierLogo carrier={simCard.carrier} className="sim-card-logo" />
          {simCard.category ? (<span className="sim-card-category">{simCard.category}</span>) : null }
        </div>
        <div className="sim-card-chip"></div>
        <div className="sim-card-body">
          <div className="sim-card-number">{simCard.number}</div>
          {simCard.description && (
            <p className="sim-card-description">{simCard.description}</p>
          )}
        </div>
      </div>
      {inCart && (
        <div className="sim-card-cart-overlay">
          <svg className="sim-card-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
      )}
      <div className="sim-card-footer">
        <span className="sim-card-price">{formatPrice(simCard.price)}</span>
        <div className="sim-card-actions">
          <button
            className={`add-to-cart-btn ${inCart ? 'remove' : ''}`}
            onClick={handleToggleCart}
            aria-label={inCart ? `Xóa ${simCard.number} khỏi giỏ` : `Thêm ${simCard.number} vào giỏ`}
          >
            {inCart ? '\u2713 Đã thêm' : 'Thêm vào giỏ'}
          </button>
          <button
            className="inquiry-btn"
            onClick={handleInquiry}
            aria-label={`Tư vấn ngay số ${simCard.number}`}
          >
            Tư vấn ngay
          </button>
        </div>
      </div>
    </div>
  );
}
