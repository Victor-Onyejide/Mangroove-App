import { Link, useLocation } from "react-router-dom";
import logo from '../assets/svg/logo.png';
import React from "react";
import '../assets/css/navbar.css';

export default function Navbar({ onSignInClick, userInfo, onLogout }){
    const [menuOpen, setMenuOpen] = React.useState(false);
    const location = useLocation();

    const toggle = () => {
        setMenuOpen(!menuOpen);
    };

    const handleNavClick = (hash) => {
        if (location.pathname === "/") {
            // On home page already: scroll to section
            const el = document.querySelector(hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Navigate to home with hash; HomePage sections already have matching ids
            window.location.href = `/${hash}`.replace('//', '/');
        }
    };
    return(
        <nav className="navbarComponent">
            <div className="logowrapper">
                <div className={`menu${menuOpen ? ' open' : ''}`}  onClick={toggle}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
                </div>

                <Link to="/" className="link p-5 logotxtwrapper">
                <img src={logo} alt="Mangroove logo" className="logo" />
                <div className="logolinetxt">
                    <span className="logotxt-bld">MANGROVE</span>
                    <span className="logotxt-sm">STUDIOS</span>
                </div>
                </Link>
            </div>

            <div className="navigation">
                <button className="link as-button" type="button" onClick={() => handleNavClick('#about')}>ABOUT</button>
                <button className="link as-button" type="button" onClick={() => handleNavClick('#features')}>FEATURES</button>
                <button className="link as-button" type="button" onClick={() => handleNavClick('#pricing')}>PRICING</button>
            </div>

                                {userInfo ? (
                                    <button
                                        className="btn signinbtn"
                                        onClick={onLogout}
                                        type="button"
                                    >
                                        SIGN OUT
                                    </button>
                                ) : (
                                    <button
                                        className="btn signinbtn"
                                        onClick={onSignInClick}
                                        type="button"
                                    >
                                        SIGN IN
                                    </button>
                                )}

                    {/* Side Drawer */}
                    {menuOpen && <div className="sidenav-overlay" onClick={toggle} />}
                    <aside className={`sidenav${menuOpen ? ' show' : ''}`} aria-hidden={!menuOpen}>
                        <div className="sidenav-header">
                            <Link to="/" className="logotxtwrapper">
                                <div className="logolinetxt">
                                    <span className="logotxt-bld">MANGROVE</span>
                                    <span className="logotxt-sm">STUDIOS</span>
                                </div>
                            </Link>
                        </div>
                        <nav className="sidenav-nav">
                            <Link className="item active" to="#">Dashboard</Link>
                            <Link className="item" to="/sessions-v2">Sessions</Link>
                            <Link className="item" to="#">Split Sheets</Link>
                            <hr />
                            <Link className="item" to="#">Send us a message</Link>
                        </nav>
                    </aside>
        </nav>
    )
}
