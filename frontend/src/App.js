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
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';


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
  // Track completion of initial auth check to avoid premature sign-in modal
  const [authChecked, setAuthChecked] = useState(false);
  
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
  // Perform initial auth check; mark when finished regardless of outcome
  dispatch(getCurrentUser()).finally(() => setAuthChecked(true));
}, [dispatch]);

useEffect(() => {
  // Wait until initial auth check completes to decide about sign-in modal
  if (loading || !authChecked) return;
  const publicPaths = ['/', '/login', '/signup', '/terms', '/privacy'];
  const currentPath = location.pathname;
  if (!isLoggedIn && !publicPaths.includes(currentPath)) {
    setLoginOpen(true);
  }
}, [isLoggedIn, loading, authChecked, location]);

  return (
    <div className="app-shell">
      <ToastContainer position="top-right" autoClose={3000} containerStyle={{ zIndex: 1000001 }} />
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

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage/>}/>
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
          <Route path="/terms" element={<TermsPage/>}/>
          <Route path="/privacy" element={<PrivacyPage/>}/>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
