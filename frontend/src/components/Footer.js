import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/footer.css';
import instagramIcon from '../assets/svg/instagram.svg';
import tiktokIcon from '../assets/svg/tiktok.svg';
import logo from '../assets/svg/logo.png'
export default function Footer(){
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-left">
            <div className="footer-logo"> 
                <img src={logo} alt="Mangroove logo" className="logo" />
              <div className="logo-text">
                <div className="brand-large">MANGROVE</div>
                <div className="brand-small">STUDIOS</div>
              </div>
            </div>
          </div>

          <nav className="footer-links">
            <a href="mailto:support@mangroove.app">EMAIL US</a>
            <Link to="/terms">TERMS OF SERVICE</Link>
            <Link to="/privacy">PRIVACY POLICY</Link>
          </nav>

          <div className="footer-social">
            <a href="https://www.tiktok.com/@app4mangrove?is_from_webapp=1&sender_device=pc" aria-label="TikTok">
              <img src={tiktokIcon} alt="TikTok" width={20} height={20} />
            </a>
            <a href="https://www.instagram.com/appmangrove/" aria-label="Instagram">
              <img src={instagramIcon} alt="Instagram" width={20} height={20} />
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">Copyright © 2025 Mangrove Studios. All Rights Reserved.</div>
          {/* <div className="designed">Designed by <strong>La Fleur</strong> <span className="flower">❀</span></div> */}
        </div>
      </div>
    </footer>
  )
}
