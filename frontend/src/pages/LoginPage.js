import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { loginUser } from "../features/userSlice";
import { toast } from 'react-toastify';

export default function LoginPage() {
    const { sessionId, shareLink, userInfo } = useSelector((state) => state.user);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        // After login, redirect based on session join state
        if (userInfo) {
            if (shareLink && sessionId) {
                navigate(`/accept/${sessionId}`);
            } else {
                navigate('/sessions');
            }
        }
    }, [userInfo, shareLink, sessionId, navigate]);

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please enter both email and password");
            return;
        }

        try {
            const result = await dispatch(loginUser({ email, password }));

            if (loginUser.fulfilled.match(result)) {
                toast.success('Welcome!');
                // Redux state will trigger redirect via useEffect above
            } else {
                toast.error(result.payload || "Invalid login credentials");
                console.error('Login failed:', result.payload);
            }
        } catch (err) {
            console.error('Unexpected error during login:', err);
            toast.error("An unexpected error occurred");
        }
    };

    return (
        <div className="loginPage">
            <h2>Log in to your account</h2>
            <div className="form mt-4">
                <input
                    className="email mt-3"
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    className="password mt-3 mb-3"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    className="action-btn mt-3"
                    onClick={handleLogin}
                >
                    Continue
                </button>
            </div>
            <p className="mt-3">
                Don't have an account? <Link to="/signup" className="signupText">Sign up for free &#8594;</Link>
            </p>
        </div>
    );
}