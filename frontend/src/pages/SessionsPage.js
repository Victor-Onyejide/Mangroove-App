import { useParams } from "react-router-dom";
import user from './database.json';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSessionId, setShareLink } from "../features/userSlice";


export default function SessionsPage() {
  const { id } = useParams();
  const [session, setSession] = useState();

  const navigate = useNavigate();
  const {isLoggedIn} = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // GET SESSIONS
  const fetchSessions = () => {
    const getSession = user.sessions.find(session => session.id.toString() === id);
    setSession(getSession)
  }

  // Validate ID: Example - must be a number
  useEffect(() => {
      if (isLoggedIn === false)
      {
        dispatch(setSessionId(id));
        dispatch(setShareLink(true));

        navigate('/login');
      }

    if(id) fetchSessions();
  });

  if (!/^\d+$/.test(id)) {
    return <div className="alert alert-danger">Invalid Session ID</div>;
  }

  if (!session) {
    return <p className="alert alert-warning">Session not found</p>; // Show a message if the session is not found
  }
  

  return (
    <div className="sessionPage container">
         {/* Back Arrow Button */}
      <button 
        className="mb-3"
        onClick={() => navigate("/sessions")}
      >
        <span className="back-arrow">&#8592;</span> {/* Left Arrow using HTML entity */}
        Back to All Sessions
      </button>
      <div className="wrapper">
        <div className="text-center mb-5">
            <h1 className="font-weight-bold">Song Split Sheet</h1>
        </div>

        {/* Song Title and AKA(s) */}
        <div className="form-group row">
            <label htmlFor="songTitle" className="col-sm-2 col-form-label font-weight-bold">Song Title:</label>
            <div className="col-sm-10">
            <input
                type="text"
                className="form-control"
                id="songTitle"
                value={session.song_title}
                disabled
            />
            </div>
        </div>

        <div className="form-group row">
            <label htmlFor="akas" className="col-sm-2 col-form-label font-weight-bold">AKA(s):</label>
            <div className="col-sm-10">
            <input
                type="text"
                className="form-control"
                id="akas"
                value={session.akas || ''}
                disabled
            />
            </div>
        </div>

        {/* Table for Songwriters */}
        <div className="table-responsive mt-5">
            <table className="table table-bordered">
            <thead className="thead-light">
                <tr>
                <th scope="col" className="text-center">Songwriter</th>
                <th scope="col" className="text-center">Affiliation (ASCAP,BMI,SESAC)</th>
                <th scope="col" className="text-center">Publisher</th>
                <th scope="col" className="text-center">Role</th>
                <th scope="col" className="text-center">Ownership</th>
                </tr>
            </thead>
            <tbody>
                {session.songwriters.map((writer, index) => (
                <tr key={index}>
                    <td>{writer.name}</td>
                    <td>{writer.affiliation}</td>
                    <td>{writer.publisher}</td>
                    <td>{writer.role}</td>
                    <td>{writer.ownership}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Agreement Section */}
        <div className="text-center mt-5">
            <p className="font-italic">
            The undersigned all agree that the information above is correct.
            </p>
        </div>

        {/* Signatures Section */}
        <div className="row mt-5">
            {session.songwriters.map((writer, index) => (
            <div key={index} className="row text-center">
                <p className="col-6 font-weight-bold"><strong>{writer.name}</strong></p>
                <p className="col-6 text-muted">01/01/2025</p>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}