import { Link } from "react-router-dom";
// import logo from '../assets/svg/logo.svg';
import React from "react";
import '../assets/css/navbar.css';

export default function NavBar(){
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
                <Link className="link">ABOUT</Link>
                <Link className="link">FEATURES</Link>
                <Link className="link">PRICING</Link>
            </div>

         <button
            className="btn signinbtn"
          >
            SIGN IN
          </button>
        </nav>
    )
}
