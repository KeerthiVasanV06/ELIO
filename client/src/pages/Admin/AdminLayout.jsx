import { Outlet, Link, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const AdminLayout = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === "") {
      return location.pathname === "/admin";
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
          <p className="admin-subtitle">Control Center</p>
        </div>
        
        <nav className="admin-nav">
          <Link 
            to="" 
            className={`nav-link ${isActive("") ? "active" : ""}`}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </Link>
          <Link 
            to="categories" 
            className={`nav-link ${isActive("categories") ? "active" : ""}`}
          >
            <span className="nav-icon">📁</span>
            Categories
          </Link>
          <Link 
            to="users" 
            className={`nav-link ${isActive("users") ? "active" : ""}`}
          >
            <span className="nav-icon">👥</span>
            Users
          </Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
