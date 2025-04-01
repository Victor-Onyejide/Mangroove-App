import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import AllSessionsPage from './pages/AllSessionsPage';
import SessionsPage from './pages/SessionsPage';
import QrCode from './pages/QrCodePage';
import GuestPage from './pages/GuestPage';


const toggle = () => 
  {
    const toggleButton = document.getElementsByClassName('menu')[0]
    const navbarLinks = document.getElementsByClassName('links')[0]
    navbarLinks.classList.toggle('active');
  }

function App() {
  return (
    <Router>
      <div className="navContainer">
        <nav>
          <Link to="/" className="logo">
              M
          </Link>

          <div className="menu" onClick={toggle}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
          <div className="links">
          <Link to="/" className="link p-5">Home</Link>
            <Link to="/login" className="link p-5"> Login</Link>
            <Link to="/signup" className="link p-5"> Sign Up</Link>
            <Link to="/sessions" className="link p-5"> All Sessions</Link>
          </div> 
        </nav>
      </div>

      <div className="App">
          <Routes>
            {/* <Route path="/" element={<HomePage/>}/> */}
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignUpPage/>}/>
            <Route path="/sessions" element={<AllSessionsPage/>}/>
            <Route path="/session/:id" element={<SessionsPage/>}/>
            <Route path="/qrcode/:id" element={<QrCode />}/>
            <Route path="/guest" element={<GuestPage/>}/>
          </Routes>
      </div>

    </Router>
  );
}

export default App;
