import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../features/userSlice";
import { useState } from "react";
import { toast } from "react-toastify";
import '../assets/css/signup.css';

export default function SignUpPage() {
  const { sessionId, shareLink, userInfo } = useSelector((state) => state.user);
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [affiliation, setAffliliation] = useState();
  const [publisher, setPublisher] = useState();
  const [role, setRole] = useState();
  const [aka, setAka] = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    try {
      const result = await dispatch(
        signUpUser({ username, email, aka, role, password, affiliation, publisher })
      ).unwrap();
      toast.success('Welcome!');
      if (shareLink) {
          //TODO: Check if the sessionId is valid(i.e if the link has expired)
          navigate(`/accept/${sessionId}`);
    } else {
      navigate('/sessions-v2');
    }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Signup failed. Please try again.");
    }
  };

  return (
    <div className="signupPage">
      <div className="wrapper">
        <h2 className="mt-5"><strong>Sign up for your <br />Mangroove account</strong></h2>
        <div className="form scrollable-form">
          <input
            className="mt-3"
            type="text"
            placeholder="Enter your Name"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="mt-3"
            type="text"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="mt-3"
            type="text"
            placeholder="Enter your Stage Name"
            onChange={(e) => setAka(e.target.value)}
            required
          />
          <input
            className="mt-3"
            type="text"
            placeholder="Enter your Affiliation"
            onChange={(e) => setAffliliation(e.target.value)}
            required
          />
          <input
            className="mt-3"
            type="text"
            placeholder="Enter your Publisher"
            onChange={(e) => setPublisher(e.target.value)}
            required
          />
          <input
            className="mt-3"
            type="text"
            placeholder="Enter your role"
            onChange={(e) => setRole(e.target.value)}
            required
          />
          <input
            className="mt-3"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="action-btn mt-3"
            onClick={handleSignUp}
          >
            Sign Up
          </button>
        </div>
      </div>
      <div className="content">
        <h2>Create your free account</h2>
        <p>
          Effortlessly track your music session data! Start a session,
          and have all contributors sign in with just a scan of their
          QR codes.
        </p>
      </div>
    </div>
  );
}