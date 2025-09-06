import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser } from '../features/userSlice';
import { Link } from "react-router-dom";
import { ReactComponent as FileSVG } from '../assets/svg/file.svg';
import {ReactComponent as EditWhite} from '../assets/svg/editwhite.svg';
import {ReactComponent as EditGreen} from '../assets/svg/editgreen.svg';
import {ReactComponent as Delete} from '../assets/svg/delete.svg';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import user from './database.json';
import { toast } from "react-toastify";

Modal.setAppElement('#root');

export default function AllSessionsPage() {
  const [songTitle, getSongTitle] = useState('');
  const [joinLink, setJoinLink] = useState('');
  const [linkExpiresAt, setLinkExpiresAt] = useState(new Date());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user.userInfo);
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);
  const loading = useSelector((state) => state.user.loading);
  const [mySessions, setMySessions] = useState();
  const [joinedSessions, setJoinedSessions] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showJoined, setShowJoined] = useState(false);
  const [editSession, setEditSession] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/login');
      return;
    }
  }, [isLoggedIn, loading, navigate]);
  // Custom styles for the modal to center it on the screen
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
  };

  const openModal = () => {
    getSongTitle('');
    setModalIsOpen(true);
  };

  const handleEditClick = (session) => {
    // navigate to an edit page (implement route as needed)
    navigate(`/session/${session._id}/edit`);
  };

  const handleDeleteClick = async (sessionId) => {
    if (!window.confirm('Delete this session?')) return;
    try {
      await axios.delete(`/api/user/session/${sessionId}`, { withCredentials: true });
      setMySessions(prev => prev ? prev.filter(s => s._id !== sessionId && s.id !== sessionId) : prev);
      toast.success('Session deleted');
    } catch (err) {
      console.error('Delete session error', err);
      toast.error('Failed to delete session');
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const createSession = async () => {
    try {
      const { data } = await axios.post("/api/user/create-session", { 
          songTitle,
        },
        {
          withCredentials: true,
        }
        );

      closeModal();

      toast.success("Let's goo!!!");
      navigate(`/qrcode/${data.session._id}`);

    } catch (error) {
      toast.error("Something Went wrong");
      console.log(error);
    }
  };
  useEffect(()=>{
    const getAllSessions = async (req,res) => {
      try{
        const {data} = await axios.get('/api/user/sessions', { withCredentials: true });
        console.log("Data", data);
        setMySessions(data.created || []);
        setJoinedSessions(data.joined || []);
      }
      catch(err)
      {
        console.log(err)
      }

    }
    getAllSessions();

  },[])

  return (
    <div className="allSessionsPage container">
      <div className="header d-flex align-items-center" style={{ gap: '12px' }}>
        <h3 style={{ margin: 0 }}>ALL Sessions</h3>
        <div>
          {/* New session button */}
          <button onClick={openModal} className="new-session-button p-3">New Session +</button>
          {/* Toggle edit mode */}
          <button onClick={() => setEditSession(prev => !prev)} className="btn btn-sm btn-outline-secondary">
            {/* {editSession ? 'Done' : 'Manage'} */}
            {<EditWhite width={20} height={20}/>}
          </button>
          {/* Sidebar collapse toggle */}
          <button
            onClick={() => setShowSidebar(s => !s)}
            className="btn btn-sm btn-outline-secondary ml-2"
            title={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{ marginLeft: 8 }}
          >
            {showSidebar ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
        </div>
      </div>

      {/* Modal for entering the song name */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Enter Song Name"
      >
        <h2>Enter Song Name</h2>
        <input 
          type="text" 
          value={songTitle}
          onChange={(e) => getSongTitle(e.target.value)}
          placeholder="Enter song name"
          style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
          required
        />
        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={createSession} className="btn btn-success">Submit</button>
          <button onClick={closeModal} className="btn btn-danger">Cancel</button>
        </div>
      </Modal>

      {/* Two-column layout: sidebar + main content */}
      <div className="row mt-5">
        {showSidebar && (
          <aside className="col-md-3">
          <div className="sidebar p-3" style={{ borderRight: '1px solid #eee' }}>
            <button
              onClick={() => setShowJoined(s => !s)}
              aria-expanded={showJoined}
              className="btn btn-link p-0"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <p style={{ display: 'inline', marginRight: 8 }}>Joined Sessions</p>
              <span aria-hidden>{showJoined ? '▾' : '▸'}</span>
            </button>

            {showJoined && (
              (joinedSessions && joinedSessions.length) ? (
                <ul style={{ listStyle: 'none', paddingLeft: 0, marginTop: '8px' }}>
                  {joinedSessions.map(s => (
                    <li key={s._id} style={{ marginBottom: '8px' }}>
                      <Link to={`/session/${s._id}`} style={{ textDecoration: 'none' }}>{s.songTitle}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted" style={{ marginTop: '8px' }}>No joined sessions</p>
              )
            )}
          </div>
          </aside>
        )}

        <main className={showSidebar ? 'col-md-9' : 'col-12'}>
          <div className="sessions-grid">
            {(() => {
              const created = Array.isArray(mySessions) ? mySessions : [];
              const joined = Array.isArray(joinedSessions) ? joinedSessions : [];
              // merge without duplicates (prefer created entries)
              const joinedFiltered = joined.filter(js => !created.find(cs => String(cs._id) === String(js._id)));
              const displayed = [...created, ...joinedFiltered];

              if (!displayed.length) return <div> Create A Session</div>;

              return displayed.map((session) => {
                const isCreator = userInfo && String(session.creator) === String(userInfo._id);
                return (
                  <div key={session._id || session.id} className="item">
                    {(editSession && isCreator) ? (
                      <div className="session-edit-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div className="file-icon-container">
                          <FileSVG width={50} height={50} />
                        </div>
                        <p className="mt-1">{session.songTitle}</p>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                          <button className="btn btn-sm" onClick={() => handleEditClick(session)}><EditGreen width={20} height={20} /></button>
                          <button className="btn btn-sm" onClick={() => handleDeleteClick(session._id)}><Delete width={20} height={20} /></button>
                        </div>
                      </div>
                    ) : (
                      <Link to={`/session/${session._id}`} className="session-title">
                        <div className="file-icon-container">
                          <FileSVG width={50} height={50} />
                        </div>
                        <div className="folder-icon"></div>
                        <p className="mt-1">{session.songTitle}</p>
                      </Link>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </main>
      </div>
    </div>
  );
}
