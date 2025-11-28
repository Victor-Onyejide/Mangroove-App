import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { joinSession } from '../features/sessionSlice';
import { toast } from 'react-toastify';

export default function AcceptPage() {
    const { id: sessionId } = useParams(); // Get session ID from URL params
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userInfo = useSelector((state) => state.user.userInfo); // Get user info from Redux store

    const handleAccept = async () => {
        try {
            const result = await dispatch(joinSession(sessionId)).unwrap(); // Call joinSession route
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
            <p>Click the button below to accept the invitation and join the session.</p>
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
                }}
            >
                Accept
            </button>
        </div>
    );
}