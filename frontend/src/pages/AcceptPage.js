import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { setSessionId, setShareLink } from '../features/userSlice';
import { joinSession, fetchSession } from '../features/sessionSlice';
import { toast } from 'react-toastify';

export default function AcceptPage() {
    const { id: sessionId } = useParams(); // Get session ID from URL params
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.user); // Get user info from Redux store
    const { current: session } = useSelector((state) => state.sessions);
    const [selectedRole, setSelectedRole] = useState('');

    // If user is not logged in, remember the share intent so post-login redirect works
    useEffect(() => {
        if (!userInfo && sessionId) {
            dispatch(setSessionId(sessionId));
            dispatch(setShareLink(true));
        }
    }, [userInfo, sessionId, dispatch]);

    // Fetch basic session info so we can show the song title on the accept page
    useEffect(() => {
        if (userInfo && sessionId) {
            dispatch(fetchSession(sessionId));
        }
    }, [userInfo, sessionId, dispatch]);

    const handleAccept = async () => {
        // If user is not authenticated, store intent and redirect to login/signup
        if (!userInfo) {
            dispatch(setSessionId(sessionId));
            dispatch(setShareLink(true));
            toast.info('Please sign in or sign up to join the session');
            navigate('/login');
            return;
        }

        try {
            const payload = { sessionId };
            if (selectedRole) {
                payload.role = selectedRole;
            }
            const result = await dispatch(joinSession(payload)).unwrap(); // Call joinSession route
            toast.success("You have successfully joined the session!");
            // The joinSession route already updates the session and triggers SSE
            navigate(`/session-v2/${sessionId}`); // Redirect to JoinedSession page
        } catch (error) {
            toast.error("Failed to join the session. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to the Session!</h1>
            {session && (
                <>
                    <p style={{ fontSize: 18, fontWeight: 600 }}>"{session.songTitle}"</p>
                    <p style={{ color: '#4b5563', marginBottom: 24 }}>Hosted by this Mangrove session.</p>
                </>
            )}

            <p style={{ marginBottom: 16 }}>Choose your role for this session (optional):</p>
            <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', minWidth: 220 }}
            >
                <option value="">Keep my current role</option>
                <option value="artist">Artist</option>
                <option value="producer">Producer</option>
                <option value="executive">Executive</option>
            </select>

            <p style={{ marginTop: 24 }}>Click the button below to accept the invitation and join the session.</p>
            <button
                onClick={handleAccept}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginTop: 8,
                }}
            >
                Accept
            </button>
        </div>
    );
}