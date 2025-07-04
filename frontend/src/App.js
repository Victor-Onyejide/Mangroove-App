import {BrowserRouter as Router, Routes, Route, Link, useNavigate} from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import AllSessionsPage from './pages/AllSessionsPage';
import SessionsPage from './pages/SessionsPage';
import QrCode from './pages/QrCodePage';
import GuestPage from './pages/GuestPage';
import { ToastContainer, toast } from 'react-toastify';
import JoinedSession from './pages/JoinedSession';
import Avatar from './components/Avatar';
import './assets/css/navbar.css';
import { logout } from './features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { use, useEffect } from 'react';
import AcceptPage from './pages/AcceptPage';
import './axiosConfig.js';
import { getCurrentUser, logoutUser } from './features/userSlice';
import "jspdf-autotable";


function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.user);

  const toggle = () => 
    {
      const toggleButton = document.getElementsByClassName('menu')[0]
      const navbarLinks = document.getElementsByClassName('links')[0]
      navbarLinks.classList.toggle('active');
    }
  const userInfo = useSelector((state) => state.user.userInfo);

  const handleLogout = async () =>{
    try{
      // Dispatch the logout thunk
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
      toast.success("You have been logged out.");
    } catch(error){
      toast.error("Failed to log out. Please try again.");
    }
  }
  const fetchUser = async () => {
        try {
            await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
            console.error('Error fetching user info:', error);
            navigate("/login"); // Redirect to login if fetching user info fails
        }
    };

useEffect(() => {
    const controller = new AbortController();
    // Only fetch the user if userInfo is null and not on public routes

    console.log("useEffect triggered");
    console.log("userInfo:", userInfo);
    const fetchUser = async () => {
      try {
          await dispatch(getCurrentUser()).unwrap();
      } catch (error) {
          console.error('Error fetching user info:', error);
          navigate("/login"); // Redirect to login if fetching user info fails
        }
      }
    if (
      !userInfo &&
      window.location.pathname !== '/signup' &&
      window.location.pathname !== '/login'
      && !isLoggedIn
    ) {
      console.log("Fetching user info...");
      console.log("Current path:", window.location.pathname);

      fetchUser();
    }

}, []);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="navContainer">
        <nav>
          <Link to="/" className="logo">
              M
          </Link>

          <div className="wrapper">

            {userInfo ? <Avatar name={userInfo.username}/>: <Link to="/login">Login</Link>}

            <div className="menu" onClick={toggle}>
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </div>
            <div className="links">
              <Link to="/" className="link p-5">Home</Link>
              {userInfo ? 
                <Link className="link p-5" onClick={handleLogout}>LogOut</Link>:<></>
              }
              <Link to="/signup" className="link p-5"> Sign Up</Link>
              <Link to="/sessions" className="link p-5"> All Sessions</Link>
            </div>
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
            <Route path="/joined/:id" element={<JoinedSession/>}/>
            <Route path="/accept/:id" element={<AcceptPage/>}/>
          </Routes>
      </div>

    </div>
  );
}

export default App;
