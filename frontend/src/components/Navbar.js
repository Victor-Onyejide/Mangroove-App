import { Link } from "react-router-dom";
// import logo from '../assets/svg/logo.svg';
import React from "react";
import '../assets/css/navbar.css';

export default function Navbar({ onSignInClick, userInfo, onLogout }){
    const [menuOpen, setMenuOpen] = React.useState(false);
    
    const toggle = () => {
        setMenuOpen(!menuOpen);
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
                {/* <img src={logo} alt="Mangroove logo" className="logo" /> */}
                <div className="logolinetxt">
                    <span className="logotxt-bld">MANGROVE</span>
                    <span className="logotxt-sm">STUDIOS</span>
                </div>
                </Link>
            </div>

            <div className="navigation">
                <Link className="link" to="#about">ABOUT</Link>
                <Link className="link" to="#features">FEATURES</Link>
                <Link className="link">PRICING</Link>
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
