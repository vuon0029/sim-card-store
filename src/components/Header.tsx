import { useCart } from '../context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { itemCount } = useCart();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">📱</span>
          <h1>SIM Số Đẹp</h1>
          <span className="logo-subtitle">Vietnam +84</span>
        </div>
        <button
          className="cart-button"
          onClick={onCartClick}
          aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}
        >
          <span className="cart-icon">🛒</span>
          <span className="cart-label">Giỏ hàng</span>
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>
      </div>
    </header>
  );
}
