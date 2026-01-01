import "./Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-wrapper">
        {/* FOOTER CONTENT */}
        <div className="footer-content">
          {/* COMPANY INFO */}
          <div className="footer-section">
            <h3 className="footer-section-title">Elio</h3>
            <p className="footer-description">
              The platform for creators to write, grow, and monetize their ideas with a global audience.
            </p>
          </div>


          {/* COMPANY */}
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Elio. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;