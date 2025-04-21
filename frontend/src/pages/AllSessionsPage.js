import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as FileSVG } from '../assets/svg/file.svg';
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
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [createdSession, setCreatedSession] = useState();
  const [mySessions, setMySessions] = useState();
  const [joinedSessions, setMyJoinedSessions] = useState();
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

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const createSession = async () => {
    try {
      const { data } = await axios.post("/api/user/create-session", { 
        songTitle,
       },
       {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
       }
      );
      setCreatedSession(data)
      closeModal();
      toast.success("Let's goo!!!");
      console.log("Created Session", createdSession);
    } catch (error) {
      toast.error("Something Went wrong");
      console.log(error);
    }
  };
  useEffect(()=>{
    const getAllSessions = async (req,res) => {
      try{
        const {data} = await axios.get('/api/user/sessions',
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`
            }
          });
        console.log("Data", data);
        setMySessions(data.created);
      }
      catch(err)
      {
        console.log(err)
      }

    }
    getAllSessions();

  })

  if(createdSession)
    {
      navigate(`/qrcode/${createdSession.session._id}`);

    }

  return (
    <div className="allSessionsPage container">
      <div className="header">
        <h3>ALL Sessions</h3>
        {/* Changed Link to a button */}
        <button onClick={openModal} className="new-session-button">New Session +</button>
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

      {/* Grid layout for sessions */}
      <div className="sessions-grid mt-5">
        
        {mySessions ? mySessions.map((session) => (
          <div key={session.id} className="item">
            <Link to={`/session/${session.id}`} className="session-title">
              <div className="file-icon-container">
                <FileSVG width={50} height={50} />
              </div>
              <div className="folder-icon"></div>
              <p className="mt-1">{session.songTitle}</p>
            </Link>
          </div>
        )): <div> Create A Session</div>}
      </div>
    </div>
  );
}
