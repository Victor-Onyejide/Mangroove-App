import { Await, useParams } from "react-router-dom";
import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSessionId, setShareLink } from "../features/userSlice";
import axios from "axios";
import jsPDF from "jspdf";


export default function SessionsPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);

  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Format the date as MM/DD/YYYY
  function formatDate(dateString) {
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  function handleDownloadPDF () {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Song Split Sheet", 14, 18);

  doc.setFontSize(12);
  doc.text(`Song Title: ${session.songTitle}`, 14, 28);

  // Table headers
  const headers = ["Songwriter", "IPI #", "Publisher", "Role", "Ownership"];
  let startY = 38;
  headers.forEach((header, i) => {
    doc.text(header, 14 + i * 35, startY);
    // Draw header cell borders
    doc.rect(14 + i * 35, startY - 6, 35, 12);
  });

  // Table Rows with borders
  session.songwriters.forEach((writer, index) => {
    const rowY = startY + 12 + index * 16;
    // Draw cell borders for each column
    doc.rect(14, rowY - 6, 35, 16);   // Songwriter cell
    doc.rect(49, rowY - 6, 35, 16);   // IPI #
    doc.rect(84, rowY - 6, 35, 16);   // Publisher
    doc.rect(119, rowY - 6, 35, 16);  // Role
    doc.rect(154, rowY - 6, 35, 16);  // Ownership

    // Songwriter name and stage name
    doc.text(writer.username, 16, rowY);
    doc.text(`(${writer.stageName || 'N/A'})`, 16, rowY + 6);

    // Other columns
    doc.text(writer.affiliation || 'N/A', 51, rowY);
    doc.text(writer.publisher || 'N/A', 86, rowY);
    doc.text(writer.role || 'N/A', 121, rowY);
    doc.text(writer.ownership || 'N/A', 156, rowY);
  });

  // Agreement text
  let agreementY = startY + 12 + session.songwriters.length * 16 + 10;
  doc.setFontSize(11);
  doc.text(
    "The undersigned all agree that the information above is correct.",
    14,
    agreementY
  );

  // Signatures
  session.songwriters.forEach((writer, index) => {
    doc.text(
      `${writer.username} ${formatDate(session.createdAt)}`,
      14,
      agreementY + 10 + index * 10
    );
  });
  doc.save(`${session.songTitle}_Split_Sheet.pdf`);
}

  useEffect(() => {

    async function fetchSession() {
      console.log("Fetching session with ID:", id);
      // Fetch session from backend
      const {data} = await axios.get(`/api/user/session/${id}`,{
        withCredentials: true,
      });
      console.log(data);
      setSession(data);
    }
    //TOD: Remove this later
    // if (isLoggedIn === false) {
    //   // dispatch(setSessionId(id));
    //   // dispatch(setShareLink(true));
    //   console.log("Navigating ...");
    //   navigate('/login');
    // }
  
    if (id && isLoggedIn) {
      fetchSession();
    }

  }, [isLoggedIn, dispatch, navigate]);

  if (!id) {
    return <div className="alert alert-danger">Invalid Session ID</div>;
  }

  if (!session) {
    return <p className="alert alert-warning">Session not found</p>;
  }

  return (
    <div className="sessionPage container">
      <div className="header-wrapper d-flex justify-content-between align-items-center mb-4">
        <button
        className="mb-3"
        onClick={() => navigate('/sessions')}
        >
          <span className="back-arrow">&#8592;</span>
            Back to All Sessions
      </button>
      <div>
        <button onClick={handleDownloadPDF}>
          Download PDF
        </button>
      </div>

      </div>
      <div className="wrapper">
        <div className="text-center mb-5">
          <h1 className="front-weight-bold">Song Split Sheet</h1>
        </div>

        <div className="form-group row">
          <label htmlFor="songTitle" className="col-sm-2 col-form-label font-weight-bold">Song Title:</label>
          <div className="col-sm-10">
            <input
              type="text"
              className="form-control"
              id="songTitle"
              value={session.songTitle}
              disabled
            />
         </div>
       </div> 

      <div className="table-responsive mt-5">
        <table className="table table-bordered">
          <thead className="thead-light">
            <tr>
              <th scope="col" className="text-center">Songwriter</th>
              <th scope="col" className="text-center">IPI #</th>
              <th scope="col" className="text-center">Publisher</th>
              <th scope="col" className="text-center">Role</th>
              <th scope="col" className="text-center">Ownership</th>
            </tr>
          </thead>
          <tbody>
            {session.songwriters.map((writer, index) => (
              <tr key={writer._id}>
                <td>
                  {writer.username}
                  <br />
                  <span>
                    ({writer.stageName || 'N/A'})
                  </span>
                </td>
                <td>{writer.affiliation}</td>
                <td>{writer.publisher}</td>
                <td>{writer.role}</td>
                <td>{writer.ownership}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <div className="text-center mt-5">
            <p className="font-italic">
            The undersigned all agree that the information above is correct.
            </p>
        </div>
        
        <div className="row mt-5">
            {session.songwriters.map((writer, index) => (
            <div key={index} className="row text-center">
                <p className="col-6 font-weight-bold"><strong>{writer.username}</strong></p>
                <p className="col-6 text-muted">{formatDate(session.createdAt)}</p>
            </div>
            ))}
        </div>

      </div>
    </div>
  );
}