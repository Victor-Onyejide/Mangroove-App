import Avatar from "../components/Avatar";
import { EventSourcePolyfill } from 'event-source-polyfill';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchSession, joinSession } from "../features/sessionSlice";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SessionAvatars from "../components/SessionAvatars";
import { setSessionId, setShareLink } from "../features/userSlice";
import axios from "axios";
import OwnershipForm from '../components/OwnershipForm';
// import Modal from '../components/Modal';
import Modal from 'react-modal';
Modal.setAppElement('#root');

export default function JoinedSession() {
    const { id: sessionId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { current: session, loading, error } = useSelector((s) => s.sessions);
    // Removed local users state; always use session.songwriters from Redux
    const [selectedSongwriter, setSelectedSongwriter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const userId = useSelector((state) => state.user.userInfo?._id);
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const isLoggedOut = useSelector((state) => state.user.isLoggedOut);
    const userLoading = useSelector((state) => state.user.loading);

    const customStyles = {
        content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        borderRadius: '8px',
        width: '300px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        },
        overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
    }
    const openModal = () => {
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSongwriter(null);
    };

    const handleEndSession = async () => {
        try {
            await axios.post(`/api/user/session/${sessionId}/end`, {
                withCredentials: true,
            });
            navigate(`/session/${sessionId}`);
            toast.success("Session ended for all users.");
        } catch (err) {
            toast.error("Failed to end session.");
        }
    };

    useEffect(() => { 
        dispatch(fetchSession(sessionId));
        console.log("Fetching session:", session);
    }, [dispatch, sessionId]);

    // Track session context for deep links
    useEffect(() => {
        // Only set share-link context when the page is opened while the user is not logged in
        // and not as a result of an explicit logout action.
        if (!isLoggedIn && !isLoggedOut) {
            console.log("User is not logged in on initial access — setting shared link context");
            dispatch(setSessionId(sessionId));
            dispatch(setShareLink(true));
        }
    }, [isLoggedIn, isLoggedOut, dispatch, sessionId]);

    // Membership redirect only
    useEffect(() => {
        if (!loading && session && isLoggedIn && userId) {
            const isSongwriter = session.songwriters.some(u => u._id === userId);
            const isCreator = session.creator === userId; 

            if (!isSongwriter && !isCreator) {
                navigate(`/accept/${sessionId}`);
            }
        }
    }, [loading, session, isLoggedIn, userId, navigate, sessionId]);

    useEffect(() => {
        console.log("Opening EventSourcePolyfill for session:", sessionId);
    // For local development, use:
    const eventSource = new EventSourcePolyfill(`http://localhost:4000/event/${sessionId}`, {
      withCredentials: true
    });
    // For production (Heroku):
        // const eventSource = new EventSourcePolyfill(`https://mangrove-6abda60a6f55.herokuapp.com/event/${sessionId}`, {
        //         withCredentials: true
        //     });
        eventSource.onopen = () => {
            console.log("EventSource connection opened.");
        };
        eventSource.onmessage = (event) => {
            console.log("SSE onmessage triggered");
            const data = JSON.parse(event.data);
            console.log("Received SSE event:", data);
            if(data.ended) {
                toast.info("This session has ended.");
                navigate(`/session/${sessionId}`); // or any page you want
                return;
            }
            const stateBefore = window.store?.getState?.();
            if (stateBefore) {
                console.log("Redux session BEFORE SSE fetch:", stateBefore.sessions.current);
            }
            dispatch(fetchSession(sessionId)).then(() => {
                const stateAfter = window.store?.getState?.();
                if (stateAfter) {
                    console.log("Redux session AFTER SSE fetch:", stateAfter.sessions.current);
                }
            });
        };

        eventSource.onerror = (error) => {
            console.error("SSE error:", error);
            eventSource.close();
        };

        return () => {
            console.log("Closing EventSource for session:", sessionId);
            eventSource.close();
        };
    }, [dispatch, sessionId]);

    const handleAvatarClick = (songwriter) => {
        setSelectedSongwriter(songwriter);
        setIsModalOpen(true);
    };

    // const closeModal = () => {
    //     setIsModalOpen(false);
    //     setSelectedSongwriter(null);
    // };

    if (loading) {
        console.log("Loading state is true");
        return <p>Loading...</p>;
    }

    if (error) {
        console.error("Error state detected:", error);
        toast.error("Something Went Wrong");
        return null;
    }

    if (!session) {
        console.log("Session is null or undefined");
        return null;
    }

    // const isSongwriter = session.songwriters.map((u) => u._id).includes(userId);
    // console.log("Is current user a songwriter?", isSongwriter);
    const isCreator = session.creator === userId; 
    console.log("Session creator ID:", session.creator);
    console.log("Current user ID:", userId);
    console.log("Is current user the creator?", isCreator);
    console.log(session);
    return ( 
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>{session.songTitle}</h1>
            {isCreator && (<button onClick={handleEndSession} className="mt-3 mb-3">
                End Session
            </button>)}
            <SessionAvatars initialUsers={session.songwriters} onAvatarClick={handleAvatarClick} />
            {isModalOpen && isCreator && (
                <Modal 
                   isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    onClose={closeModal}
                    style={customStyles}
                > 
                    <OwnershipForm
                        sessionId={session._id}
                        songwriters={[selectedSongwriter]}
                    />
                </Modal>
            )}
        </div>
    );
}