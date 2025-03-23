import { QRCode } from 'react-qr-code';
import { useState, useEffect } from 'react';
import user from './database.json';
import { useParams } from 'react-router-dom';
import { ReactComponent as ShareSVG } from '../assets/svg/share.svg';
import { useNavigate } from "react-router-dom";

const QrCode = () => {
    const [session, setSession] = useState({ id: 0, song_title: '', songwriters: [] });
    const [sessionLink, setSessionLink] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchSession = () => {
            const session = user.sessions.find(session => session.id.toString() === id);
            setSession(session);
            setSessionLink(`${window.location.origin}/session/${id}`);
        };
        if (id) fetchSession();
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            // Web Share API
            navigator.share({
                title: 'Join this session!',
                text: `Check out this session: ${session.song_title}`,
                url: sessionLink,
            })
                .then(() => console.log('Shared successfully!'))
                .catch((error) => console.error('Error sharing:', error));
        } else {
            // Fallback for unsupported browsers
            alert('Web Share API is not supported. The link has been copied to your clipboard!');
            navigator.clipboard.writeText(sessionLink).catch((err) =>
                console.error('Failed to copy text to clipboard:', err)
            );
        }
    };

    return (
        <div className="qrcode__container">
            {session ? (
                <div>
                    <h1>Start a New Session</h1>
                    <div className='mt-5'>
                        <label>Song Name:</label>
                        <input />
                    </div>
                    <div className="qrcode__image mt-5">
                        <QRCode value={sessionLink} size={300} />
                    </div>
                    <p className='mt-3'>
                        Share this QR code with others to join the session. 
                        <ShareSVG
                            className="share-icon"
                            width={20}
                            height={20}
                            onClick={handleShare}
                            style={{ cursor: 'pointer' }}
                        />
                    </p>
                    <button
                        className="continue-btn mt-3"
                        onClick={() => navigate(`/session/${id}`)}
                    >
                        Continue
                    </button>
                </div>
            ) : (
                <p>Loading session...</p>
            )}
        </div>
    );
};

export default QrCode;
