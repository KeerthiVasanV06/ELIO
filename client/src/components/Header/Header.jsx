import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext/useAuth";
import { useEffect, useState } from "react";
import PersonalizeMenu from "../PersonalizeMenu/PersonalizeMenu";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/home");
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`header ${hidden ? "header-hidden" : ""}`}>
      <nav className="header-inner">
        {/* LOGO */}
        <NavLink to="/" className="header-logo">
          <span className="logo-text">Elio</span>
        </NavLink>

        {/* DESKTOP NAVIGATION */}
        <div className="header-nav-wrapper">
          <div className="header-nav">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Home
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Blogs
              </NavLink>
            )}

            {isAuthenticated && (
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Profile
              </NavLink>
            )}

            {isAuthenticated && isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Admin
              </NavLink>
            )}
          </div>

          {/* AUTH BUTTONS */}
          <div className="header-auth">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-primary btn-sm">
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-sm">
                  Log In
                </NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">
                  Get Started
                </NavLink>
              </>
            )}
            <PersonalizeMenu />
          </div>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
            Home
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/blog" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Blogs
              </NavLink>
              <NavLink to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Admin
                </NavLink>
              )}
              <PersonalizeMenu />
            </>
          )}
          <div className="mobile-auth">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-primary btn-block">
                Logout
              </button>
            ) : (
              <>
                <NavLink to="/login" className="btn btn-ghost btn-block">
                  Log In
                </NavLink>
                <NavLink to="/register" className="btn btn-primary btn-block">
                  Get Started
                </NavLink>
              </>
            )}
             
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

