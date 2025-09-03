import { QRCode } from 'react-qr-code';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../features/userSlice';
import user from './database.json';
import { useParams } from 'react-router-dom';
import { ReactComponent as ShareSVG } from '../assets/svg/share.svg';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const QrCode = () => {
    const [session, setSession] = useState({ id: 0, songTitle: '', songwriters: [] });
    const [sessionLink, setSessionLink] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const userInfo = useSelector((state) => state.user.userInfo);
    const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
    const loading = useSelector((state) => state.user.loading);
    // ...existing code...

    useEffect(() => {
        const fetchSession = async (req, res) => {
            try {
                const {data} = await axios.get(`/api/user/session/${id}`,
                    {
                        withCredentials: true,
                    }
                );
                setSession(data);

                //TODO: Store it in redux
                setSessionLink(`${window.location.origin}/joined/${id}`);

            }
            catch(err){
                console.log("Error Log", err)
            }

        };
        if (!loading && !isLoggedIn) {
            navigate('/login');
            return;
        }
        if (id) fetchSession();
    }, [id]);

    const handleShare = () => {
        // Always copy link to clipboard
        navigator.clipboard.writeText(sessionLink)
          .then(() => console.log('Link copied to clipboard!'))
          .catch((err) => console.error('Failed to copy text:', err));
      
        // Use native share if available
        if (navigator.share) {
          navigator.share({
            title: 'Join this session!',
            text: `Check out this session: ${session.song_title}`,
            url: sessionLink,
          })
            .then(() => console.log('Shared successfully!'))
            .catch((error) => console.error('Error sharing:', error));
        } else {
          alert('The link has been copied to your clipboard!');
        }
      };
      

    return (
        <div className="qrcode-container">
            {session ? (
                <div>
                    <h1>Start a New Session</h1>
                    <div className='mt-5'>
                        <h2>Song Name: <strong> {session.songTitle}</strong></h2>
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
                        className="action-btn mt-3"
                        onClick={() => navigate(`/joined/${id}`)}
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
