import type { SimCard } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { CarrierLogo } from './CarrierLogo';

interface SimCardItemProps {
  simCard: SimCard;
}

export function SimCardItem({ simCard }: SimCardItemProps) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(simCard.id);

  const handleToggleCart = () => {
    if (inCart) {
      removeFromCart(simCard.id);
    } else {
      addToCart(simCard);
    }
  };

  return (
    <div className={`sim-card-item ${inCart ? 'in-cart' : ''}`}>
      <div className="sim-card-top">
        <CarrierLogo carrier={simCard.carrier} />
        <span className="sim-card-category">{simCard.category}</span>
      </div>
      <div className="sim-card-number">{simCard.number}</div>
      {simCard.description && (
        <p className="sim-card-description">{simCard.description}</p>
      )}
      <div className="sim-card-footer">
        <span className="sim-card-price">{formatPrice(simCard.price)}</span>
        <button
          className={`add-to-cart-btn ${inCart ? 'remove' : ''}`}
          onClick={handleToggleCart}
          aria-label={inCart ? `Xóa ${simCard.number} khỏi giỏ` : `Thêm ${simCard.number} vào giỏ`}
        >
          {inCart ? '✓ Đã thêm' : '+ Thêm vào giỏ'}
        </button>
      </div>
    </div>
  );
}
