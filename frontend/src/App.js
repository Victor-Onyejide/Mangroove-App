import {BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation} from 'react-router-dom';
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
import { useState, useEffect } from 'react';
import AcceptPage from './pages/AcceptPage';
import './axiosConfig.js';
import { getCurrentUser, logoutUser } from './features/userSlice';
import "jspdf-autotable";
import SessionsEditPage from './pages/SessionsEditPage.js';
import AllSessionsV2 from './pages/AllSessionsV2';
import SessionDetailsV2 from './pages/SessionDetailsV2';
import SplitSheetPage from './pages/SplitSheetPage';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import SigninForm from './components/SigninForm';
import SignupForm from './components/SignupForm';
import Footer from './components/Footer';


function App() {
  const navigate = useNavigate(); 
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoggedIn, loading } = useSelector((state) => state.user);
  const userInfo = useSelector((state) => state.user.userInfo);
  const { sessionId, shareLink } = useSelector((state) => state.user);

  //Menu Open and Close State
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  
  const toggle = () => {
    setMenuOpen((prev) => !prev); // <-- This toggles the menuOpen state
    const navbarLinks = document.getElementsByClassName('links')[0];
    navbarLinks.classList.toggle('active');
  };

  const handleLogout = async () =>{
    try{
      // Dispatch the logout thunk
      await dispatch(logoutUser()).unwrap();
      // After signing out, send the user to the home page
      navigate("/");
      toast.success("You have been logged out.");
    } catch(error){
      toast.error("Failed to log out. Please try again.");
    }
  }


useEffect(() => {
  dispatch(getCurrentUser());
}, [dispatch]);

useEffect(() => {
  // Avoid redirect flicker while checking session, and allow public home route
  if (loading) return;
  const publicPaths = ['/', '/login', '/signup'];
  const currentPath = location.pathname;
  if (!isLoggedIn && !publicPaths.includes(currentPath)) {
    const redirectTo = `${location.pathname}${location.search || ''}`;
    navigate(`/login?redirect=${encodeURIComponent(redirectTo)}`, { replace: true });
  }
}, [isLoggedIn, loading, navigate, location]);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="navContainer mb-5">
        <Navbar
          onSignInClick={() => setLoginOpen(true)}
          userInfo={userInfo}
          onLogout={handleLogout}
        />
      </div>

      {loginOpen && (
        <Modal onClose={() => setLoginOpen(false)}>
          <SigninForm
            onRequestSignUp={() => {
              setLoginOpen(false);
              setSignupOpen(true);
            }}
            onSuccess={() => {
              setLoginOpen(false);
              if (shareLink && sessionId) {
                navigate(`/accept/${sessionId}`);
              } else {
                navigate('/sessions-v2');
              }
            }}
          />
        </Modal>
      )}
      {signupOpen && (
        <Modal onClose={() => setSignupOpen(false)}>
          <SignupForm
            onSuccess={() => {
              setSignupOpen(false);
              if (shareLink && sessionId) {
                navigate(`/accept/${sessionId}`);
              } else {
                navigate('/sessions-v2');
              }
            }}
          />
        </Modal>
      )}

      <div className="App">
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            {/* <Route path="/" element={<LoginPage/>}/> */}
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/signup" element={<SignUpPage/>}/>
            <Route path="/sessions" element={<AllSessionsPage/>}/>
            <Route path="/sessions-v2" element={<AllSessionsV2/>}/>
            <Route path="/session/:id" element={<SessionsPage/>}/>
            <Route path="/session-v2/:id" element={<SessionDetailsV2 />}/>
            <Route path="/split-sheet/:id" element={<SplitSheetPage />}/>
            <Route path="/qrcode/:id" element={<QrCode />}/>
            <Route path="/guest" element={<GuestPage/>}/>
            <Route path="/joined/:id" element={<JoinedSession/>}/>
            <Route path="/accept/:id" element={<AcceptPage/>}/>
            <Route path="/session/:id/edit" element={<SessionsEditPage/>}/>
          </Routes>
      <Footer />
      </div>

    </div>
  );
}

export default App;
