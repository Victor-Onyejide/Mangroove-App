import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/footer.css';

export default function Footer(){
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-left">
            <div className="footer-logo"> 
              <div className="logo-mark">♫</div>
              <div className="logo-text">
                <div className="brand-large">MANGROVE</div>
                <div className="brand-small">STUDIOS</div>
              </div>
            </div>
          </div>

          <nav className="footer-links">
            <Link to="#">EMAIL US</Link>
            <Link to="#">TERMS OF SERVICE</Link>
            <Link to="#">PRIVACY POLICY</Link>
          </nav>

          <div className="footer-social">
            <a href="#" aria-label="TikTok" className="social-icon">♪</a>
            <a href="#" aria-label="Instagram" className="social-icon">📷</a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">Copyright © 2025 Mangrove Studios. All Rights Reserved.</div>
          <div className="designed">Designed by <strong>La Fleur</strong> <span className="flower">❀</span></div>
        </div>
      </div>
    </footer>
  )
}
