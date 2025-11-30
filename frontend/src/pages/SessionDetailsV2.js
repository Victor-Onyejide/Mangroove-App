import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSession } from '../features/sessionSlice';
import axios from 'axios';
import QRCode from 'react-qr-code';
import '../assets/css/sessionDetailsV2.css';
import { setSessionId, setShareLink } from '../features/userSlice';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { toast } from 'react-toastify';
import OwnershipForm from '../components/OwnershipForm';
import Modal from '../components/Modal';
import locationIcon from '../assets/svg/location.svg';
import recordingIcon from '../assets/svg/recording.svg';
import summerIcon from '../assets/svg/summer.svg';
// Placeholder for studio until studio.svg is added; using file.svg for now
import studioIcon from '../assets/svg/studio.svg';
import copyIcon from '../assets/svg/copy.svg';
import shareIcon from '../assets/svg/share.svg';

export default function SessionDetailsV2() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useSelector((s) => s.user);
  const { current: session, error} = useSelector((s) => s.sessions);
  const userId = useSelector((state) => state.user.userInfo?._id);
  // const [session, setSession] = useState(null);
  const [sessionLink, setSessionLink] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  const sseRef = useRef(null);
  const pollRef = useRef(null);
  const dispatch = useDispatch();

  // Build the accpet link (invite)
  // I do not understand
  // useEffect(() => {
  //   if(sessionId) {
  //     setSessionLink(`${window.location.origin}/accept/${id}`)
  //   }
  // }, [sessionId]);
// TODO Connect

  const handleSplit = () => {
    // Only the creator can edit splits; safeguard just in case
    if (String(session?.creator) !== String(userId)) {
      toast.error('Only the session creator can edit splits.');
      return;
    }
    setIsModalOpen(true);
  };
const handleEndSession = async () => {
  try {
    // Correct endpoint for ending a session
    await axios.post(
      `/api/user/session/${sessionId}/end`,
      {},
      { withCredentials: true }
    );
    toast.success("Session ended for all users.");
    // Navigate to existing split sheet route
    navigate(`/split-sheet/${sessionId}`);
  } catch (error) {
    toast.error("Failed to end session.");
  }
}

const handleCopyLink= () => {
  // Persist accept intent for post-auth redirects
  if (sessionId) {
    dispatch(setSessionId(sessionId));
    dispatch(setShareLink(true));
  }
  navigator.clipboard.writeText(sessionLink)
    .then(() => toast.success('Copied!'))
    .catch(() => toast.error('Failed to copy'))
}
// This coul
const handleShareLink = async () => {
  // Persist accept intent for post-auth redirects
  if (sessionId) {
    dispatch(setSessionId(sessionId));
    dispatch(setShareLink(true));
  }
  // Prefer Web Share API; gracefully ignore user cancellation (AbortError)
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join this session!',
        text: session?.songTitle || 'Session invite',
        url: sessionLink
      });
      // Optional success feedback (can be noisy, so kept subtle)
      toast.info('Share dialog opened');
    } catch (err) {
      if (err && err.name === 'AbortError') {
        // User dismissed the share sheet; silently ignore.
        return;
      }
      console.error('Share failed:', err);
      toast.error('Unable to share link');
    }
    return;
  }
  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(sessionLink);
    toast.success('Link copied to clipboard');
  } catch (err) {
    console.error('Copy failed:', err);
    toast.error('Failed to copy link');
  }
};
// On load, load fetch sessions
    // TODO
    // Update to check that it has ended and not allow the user to join again
    // And status needs to be Added to the back end so it can update on create and on end of 
    // Session
  useEffect(() => {
    if(!sessionId)return;
    if (!loading && isLoggedIn && sessionId) {
      dispatch(fetchSession(sessionId));
      setSessionLink(`${window.location.origin}/accept/${sessionId}`)

    }
  }, [dispatch, isLoggedIn, loading, sessionId]);

// Redirect to Accept Page
  // useEffect(() => {
  //   if(!loading && session && isLoggedIn && userId) {
  //     const isSongwriter = session.songwriters.some(u => u._id === userId);
  //     const isCreator = session.creator === userId;

  //     if(!isSongwriter && !isCreator) {
  //       dispatch(setSessionId(sessionId));
  //       dispatch(setShareLink(true))
  //       navigate(`/accept/${sessionId}`)
  //     }
  //   }
  // }, [loading, session, isLoggedIn, userId, navigate, sessionId])

  useEffect (() =>{
    // Subscribe to SSE for this session for any viewer on the page (auth or not)
    if(loading || !sessionId) return;

    if(sseRef.current){
      sseRef.current.close();
      sseRef.current = null;
    }
    // For local development, use:
    // const eventSource = new EventSourcePolyfill(`http://localhost:4000/event/${sessionId}`, {
    //   withCredentials: true
    // });
    // sseRef.current = eventSource;

    //For production (Heroku):
    const eventSource = new EventSourcePolyfill(`https://mangrove-6abda60a6f55.herokuapp.com/event/${sessionId}`,{
      withCredentials:true
    })

    eventSource.onopen = () => {
      console.log("EventSource connection opened.");
    };

    eventSource.onmessage = (e) => {
      // Parse SSE payload to detect session end without waiting for refetch
      try {
        const payload = JSON.parse(e.data);
        if (payload?.ended === true || payload?.isEnded === true || payload?.session?.isEnded === true) {
          navigate(`/split-sheet/${sessionId}`);
          return; // Skip refetch; we know it's ended
        }
      } catch (_) {
        // Non-JSON payload; ignore and fall back to refetch
      }
      dispatch(fetchSession(sessionId));
    }

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    }

    return () => {
      console.log("Closing EventSource for session:", sessionId);
      eventSource.close();
    }
  }, [dispatch, sessionId, loading, navigate]);

  // Redirect now handled directly inside the SSE onmessage handler when an 'ended' flag is received.


  const contributors = useMemo(() => {
    const sw = Array.isArray(session?.songwriters) ? session.songwriters : [];
    const own = Array.isArray(session?.ownership) ? session.ownership : [];
    return sw.map((w) => {
      // Support new schema { user, username } with optional populated user object
      const userObj = w && typeof w === 'object' && 'user' in w ? w.user : w;
      const id = (userObj && typeof userObj === 'object' && (userObj._id || userObj.id)) || w?._id || w?.id || w;
      const o = own.find((x) => String(x.songwriter) === String(id));
      const pct = o ? (o.writing ?? o.publishing ?? 0) : 0;
      const name = (userObj && typeof userObj === 'object' && (userObj.username || userObj.stageName || userObj.email)) || w?.username || 'User';
      const role = (userObj && typeof userObj === 'object' && userObj.role) || w?.role || '';
      return {
        id,
        name,
        role,
        pct,
      };
    });
  }, [session]);

  const idShort = String(sessionId || '').slice(-5).toUpperCase();
  const status = 'In Progress';

  if (!sessionId) return <div className="container">Invalid session</div>;
  if (!session) return <div className="container">Loading…</div>;
    if(loading) {
    return <p>Loading...</p>;
  }

  if(error){
    console.error("Error state detected:", error);
    toast.error("Something Went Wrong");
    return null;
  }

  return (
    <div className="sdv2 container mt-5">
      <header className="sdv2-topbar">
        <div className="left">
          <button className="btn ghost" onClick={() => navigate('/sessions-v2')}>&larr; Back</button>
        </div>
        <div className="right mono">Session ID: {idShort}</div>
      </header>

      <div className="sdv2-layout">
        <main className="sdv2-main">
          <section className="sdv2-hero">
            <div className={`pill ${status.toLowerCase().replace(' ', '-')}`}>{status}</div>
            <div className="hero-inner mt-5">
              <div className="hero-left">
                <p className="invite-txt fs-5">Invite collaborators to</p>
                <h3>Scan QR code</h3>
                <div className="qr-wrap">
                  <div className="qr-box">
                    <QRCode value={sessionLink || ''} size={180} bgColor="transparent" fgColor="#FFFFFF" />
                  </div>
                </div>
              </div>
              <div>
                or
              </div>
              <div className="hero-right">
                <div className="join-copy">Join at <strong>mangrovestudios.org</strong></div>
                <div className="with-id">with Session ID</div>
                <div className="session-code">{idShort}</div>
                <img
                  src={copyIcon}
                  alt="Copy link"
                  className="icon-action"
                  role="button"
                  tabIndex={0}
                  onClick={handleCopyLink}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCopyLink(); }}
                />
                <img
                  src={shareIcon}
                  alt="Share link"
                  className="icon-action"
                  role="button"
                  tabIndex={0}
                  onClick={handleShareLink}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleShareLink(); }}
                />
                { session?.creator == userId &&

                <button
                  className="btn btn-danger"
                  onClick={handleEndSession}
                  // disabled={String(session?.creator) !== String(userId)}
                  title={String(session?.creator) !== String(userId) ? 'Only the session creator can end the session' : ''}
                >
                  End Session
                </button>
                }

              </div>
            </div>
          </section>

          <section className="sdv2-details">
            <ul className="facts">
              <li><span className="icon"><img src={studioIcon} alt="Studio" /></span><span>Studio</span></li>
              <li><span className="icon"><img src={locationIcon} alt="Location" /></span><span>Mangrove Studios, Toronto, ON</span></li>
              <li><span className="icon"><img src={summerIcon} alt="Summer" /></span><span>Summer Vibes Compilation</span></li>
            </ul>
            <p className="desc">
              <span className="icon"><img src={recordingIcon} alt="Recording" /></span>
              Recording vocals for the lead single, Danz, collaborating with local artists,
              and experimenting with new soundscapes.
            </p>
          </section>

          <section className="sdv2-splits">
            <h3>Song Splits</h3>
            <div className="split-card">
              <div className="split-header"><span className="badge inprogress">In Progress</span></div>
              <div className="split-rows">
                {contributors.map((c) => (
                  <div key={c.id} className="split-row">
                    <div className="avatar" aria-hidden>{(c.name || 'U').slice(0,1)}</div>
                    <div className="name">{c.name}</div>
                    <div className="pct mono">{c.pct ?? 0}%</div>
                  </div>
                ))}
              </div>
              <div className="split-actions">
                <button
                  className="btn outline"
                  onClick={handleSplit}
                  disabled={String(session?.creator) !== String(userId)}
                >
                  SPLIT
                </button>
              </div>
            </div>
          </section>

          <section className="sdv2-logs">
            <h3>Negotiations Log</h3>
            <ul className="log-list">
              <li>
                <div className="dot" />
                <div className="log-text">Split sheet ready for {contributors[0]?.name || 'Artist'}.</div>
              </li>
              <li>
                <div className="dot" />
                <div className="log-text">{contributors[0]?.name || 'Contributor'} transferred ownership update.</div>
              </li>
              <li>
                <div className="dot" />
                <div className="log-text">New collaborator joined.</div>
              </li>
            </ul>
            <button className="btn ghost">Load more logs</button>
          </section>
        </main>

        <aside className="sdv2-aside">
          <div className="aside-card">
            <div className="aside-title">
              <div className="count">{contributors.length}</div>
              <div>Contributors</div>
            </div>
            <div className="aside-list">
              {contributors.map((c) => (
                <div key={c.id} className="aside-row">
                  <div className="avatar small" aria-hidden>{(c.name || 'U').slice(0,1)}</div>
                  <div className="meta">
                    <div className="name">{c.name}</div>
                    <div className="role">{c.role || 'Artist'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <OwnershipForm
            sessionId={sessionId}
            songwriters={session.songwriters || []}
            onClose={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
