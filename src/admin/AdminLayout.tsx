import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './admin.css';

export function AdminLayout() {
  const { user, loading, logout } = useAuth();

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
        <div className="admin-nav__brand">Bảng Điều Khiển Sim Đệ Nhất</div>
        <ul className="admin-nav__links">
          <li>
            <NavLink to="/admin" end>
              Danh Sách SIM
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/add">Thêm Mới</NavLink>
          </li>
          <li>
            <NavLink to="/admin/bulk-upload">Tải Lên Hàng Loạt</NavLink>
          </li>
        </ul>
        <button className="admin-nav__logout" onClick={logout}>
          Đăng Xuất
        </button>
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
