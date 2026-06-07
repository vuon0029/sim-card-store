import { useState } from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './admin.css';

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading__spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-layout">
      <nav className="admin-nav">
        <div className="admin-nav__brand">Sim Đệ Nhất</div>
        <button
          className="admin-nav__toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`admin-nav__hamburger ${menuOpen ? 'admin-nav__hamburger--open' : ''}`} />
        </button>
        <div className={`admin-nav__menu ${menuOpen ? 'admin-nav__menu--open' : ''}`}>
          <ul className="admin-nav__links">
            <li>
              <NavLink to="/admin" end onClick={() => setMenuOpen(false)}>
                Danh Sách SIM
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/add" onClick={() => setMenuOpen(false)}>
                Thêm Mới
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/bulk-upload" onClick={() => setMenuOpen(false)}>
                Tải Lên
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/analytics" onClick={() => setMenuOpen(false)}>
                Thống Kê
              </NavLink>
            </li>
          </ul>
          <button className="admin-nav__logout" onClick={logout}>
            Đăng Xuất
          </button>
        </div>
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
