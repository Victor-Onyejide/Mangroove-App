import Avatar from "../components/Avatar";
import React, { use, useEffect } from 'react';
import io from 'socket.io-client';
import { useDispatch, useSelector } from "react-redux";
import { fetchSession, joinSession } from "../features/sessionSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import socket from "../socket.js";

export default function JoinedSession() {
    const { id: sessionId } = useParams();
    const dispatch = useDispatch();

    const { current: session, loading, error } = useSelector((s) => s.sessions);
    const userId = useSelector((s) => s.user.id); // TODO: Make sure you have access to Id
    const [sessionData, setSessionData] = React.useState(null);

    useEffect(() => {
        dispatch(fetchSession(sessionId));
    }, [dispatch, sessionId]);

    useEffect(() => {
        if(session){
            setSessionData(session);
        }
    },[session]);

    useEffect(() => {
        const eventSource = new EventSource(`http://localhost:4000/event/${sessionId}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received SSE event:", data);
            dispatch(fetchSession(sessionId));
        }

        eventSource.onerror = (error) => {
            console.error("SSE error:", error);
            eventSource.close();
        };

        return () => {
         eventSource.close();
        };
    }, [dispatch, sessionId]);

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

    const isSongwriter = session.songwriters.map((u) => u._id).includes(userId);
    console.log("Is current user a songwriter?", isSongwriter);

    return ( 
        <div>
            <h2>Avatar</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
                {session.songwriters.map((user, index) => (
                    <Avatar key={index} name={user.username} />
                ))}
            </div>
        </div>
    );
}