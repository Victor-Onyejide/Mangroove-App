import { Await, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSessionId, setShareLink } from "../features/userSlice";
import axios from "axios";
import jsPDF from "jspdf";
import { fetchSession } from '../features/sessionSlice';


export default function SessionsPage() {
  const { id } = useParams();
  // Use Redux session store to stay in sync after updates performed elsewhere
  const session = useSelector((state) => state.sessions.current);

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
  doc.text(`Song Title: ${String(session.songTitle || '')}`, 14, 28);

  // Compute column widths based on page width so content doesn't run off the right edge
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 14;
  const marginRight = 14;
  const availableWidth = pageWidth - marginLeft - marginRight;
  // 6 columns total, give equal width (adjust if you want different proportions)
  const colCount = 6;
  const baseColWidth = Math.floor(availableWidth / colCount);
  // Build widths array and x positions
  const colWidths = new Array(colCount).fill(baseColWidth);
  // If there's remaining space due to rounding, add it to the last column
  const remainder = availableWidth - baseColWidth * colCount;
  if (remainder > 0) colWidths[colCount - 1] += remainder;
  const startX = marginLeft;
  const xPositions = colWidths.reduce((acc, w, i) => {
    if (i === 0) acc.push(startX);
    else acc.push(acc[i - 1] + colWidths[i - 1]);
    return acc;
  }, []);

  // Two header rows: first row has Ownership spanning Writing+Publishing
  const headerRowHeight = 12;
  const headerRow1Y = 38;
  const headerRow2Y = headerRow1Y + headerRowHeight;

  // Draw first header row (cols 0..3 single, cols 4+5 merged as Ownership)
  const firstRowLabels = ["Songwriter", "IPI #", "Publisher", "Role"];
  firstRowLabels.forEach((label, i) => {
    const x = xPositions[i];
    doc.text(label, x + 2, headerRow1Y, { maxWidth: colWidths[i] - 4 });
    doc.rect(x, headerRow1Y - 6, colWidths[i], headerRowHeight);
  });
  // Ownership merged cell
  const ownershipX = xPositions[4];
  const ownershipWidth = colWidths[4] + colWidths[5];
  // center the Ownership label
  const ownershipLabel = 'Ownership';
  const ownershipLabelWidth = doc.getTextWidth ? doc.getTextWidth(ownershipLabel) : ownershipLabel.length * 4;
  doc.text(ownershipLabel, ownershipX + ownershipWidth / 2 - ownershipLabelWidth / 2, headerRow1Y);
  doc.rect(ownershipX, headerRow1Y - 6, ownershipWidth, headerRowHeight);

  // Draw second header row (Writing %, Publishing %)
  doc.text('Writing %', xPositions[4] + 2, headerRow2Y, { maxWidth: colWidths[4] - 4 });
  doc.rect(xPositions[4], headerRow2Y - 6, colWidths[4], headerRowHeight);
  doc.text('Publishing %', xPositions[5] + 2, headerRow2Y, { maxWidth: colWidths[5] - 4 });
  doc.rect(xPositions[5], headerRow2Y - 6, colWidths[5], headerRowHeight);

  // Table Rows with borders (start after second header row)
  const bodyStartY = headerRow2Y + headerRowHeight + 6;
  // Use dynamic row heights so wrapped names and stage names stay inside their cell
  let currentY = bodyStartY;
  const lineHeight = 6; // approximate line height in points for this font/size
  session.songwriters.forEach((writer) => {
    // Prepare data
    const writerId = (writer && (writer._id || writer)) || '';
    const writerName = (writer && writer.username) || writerId;
    const writerStage = (writer && writer.stageName) || 'N/A';
    const affiliation = (writer && writer.affiliation) || 'N/A';
    const publisher = (writer && writer.publisher) || 'N/A';
    const role = (writer && writer.role) || 'N/A';
    const ownRec = session.ownership && session.ownership.find(o => String(o.songwriter) === String(writerId));

    // Wrap text for name and compute required height
    const nameLines = doc.splitTextToSize(String(writerName), colWidths[0] - 4);
    const stageLine = String(`(${writerStage})`);
    const nameBlockHeight = nameLines.length * lineHeight + lineHeight; // include stage line
    const cellHeight = Math.max(16, nameBlockHeight + 6); // add small padding

    // Draw cell borders for each column with computed height
    for (let i = 0; i < colWidths.length; i++) {
      doc.rect(xPositions[i], currentY - 6, colWidths[i], cellHeight);
    }

    // Draw name block (wrapped) and stage name inside the same cell
    doc.text(nameLines, xPositions[0] + 2, currentY, { maxWidth: colWidths[0] - 4 });
    const stageY = currentY + nameLines.length * lineHeight + 2;
    doc.text(stageLine, xPositions[0] + 2, stageY, { maxWidth: colWidths[0] - 4 });

    // Other columns (align to top of cell)
    doc.text(String(affiliation), xPositions[1] + 2, currentY, { maxWidth: colWidths[1] - 4 });
    doc.text(String(publisher), xPositions[2] + 2, currentY, { maxWidth: colWidths[2] - 4 });
    doc.text(String(role), xPositions[3] + 2, currentY, { maxWidth: colWidths[3] - 4 });
    doc.text(String((ownRec && ownRec.writing) || 'N/A'), xPositions[4] + 2, currentY, { maxWidth: colWidths[4] - 4 });
    doc.text(String((ownRec && ownRec.publishing) || 'N/A'), xPositions[5] + 2, currentY, { maxWidth: colWidths[5] - 4 });

    // Advance currentY by this row's height + small gap
    currentY += cellHeight + 4;
  });

  // Agreement text (position after the dynamically rendered rows)
  let agreementY = currentY + 10;
  doc.setFontSize(11);
  doc.text(
    "The undersigned all agree that the information above is correct.",
    14,
    agreementY
  );

  // Signatures
  session.songwriters.forEach((writer, index) => {
    const writerName = (writer && writer.username) || (writer && writer._id) || '';
    doc.text(
      String(`${writerName} ${formatDate(session.createdAt)}`),
      14,
      agreementY + 10 + index * 10
    );
  });
  doc.save(`${session.songTitle}_Split_Sheet.pdf`);
}

  useEffect(() => {
    // Fetch the session into the Redux store so this page stays up-to-date
    if (!id) return;
    const doFetch = async () => {
      try {
        await dispatch(fetchSession(id)).unwrap();
      } catch (err) {
        console.error('SessionsPage: fetchSession error', err);
      }
    };

    if (isLoggedIn) {
      doFetch();
    }
  }, [isLoggedIn, dispatch, id]);

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
              <th rowSpan="2" scope="col" className="text-center">Songwriter</th>
              <th rowSpan="2" scope="col" className="text-center">IPI #</th>
              <th rowSpan="2" scope="col" className="text-center">Publisher</th>
              <th rowSpan="2" scope="col" className="text-center">Role</th>
              <th colSpan="2" scope="col" className="text-center">Ownership</th>
            </tr>
            <tr>
              <th scope="col" className="text-center">Writing %</th>
              <th scope="col" className="text-center">Publishing %</th>
            </tr>
          </thead>
          <tbody>
            {session.songwriters.map((writer, index) => {
              const writerId = (writer && (writer._id || writer)) || index;
              const ownRec = session.ownership && session.ownership.find(o => String(o.songwriter) === String(writerId));
              return (
        <tr key={writerId}>
                <td>
                  {(writer && writer.username) || writerId}
                  <br />
                  <span>
                    ({(writer && writer.stageName) || 'N/A'})
                  </span>
                </td>
                <td>{(writer && writer.affiliation) || ''}</td>
                <td>{(writer && writer.publisher) || ''}</td>
                <td>{(writer && writer.role) || ''}</td>
          <td>{(ownRec && ownRec.writing) || 0}</td>
          <td>{(ownRec && ownRec.publishing) || 0}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
        <div className="text-center mt-5">
            <p className="font-italic">
            The undersigned all agree that the information above is correct.
            </p>
        </div>
        
        <div className="row mt-5">
      {session.songwriters.map((writer, index) => {
      const writerId = (writer && (writer._id || writer)) || index;
      const writerName = (writer && writer.username) || writerId;
      return (
      <div key={writerId} className="row text-center">
        <p className="col-6 font-weight-bold"><strong>{writerName}</strong></p>
        <p className="col-6 text-muted">{formatDate(session.createdAt)}</p>
      </div>
      )})}
        </div>

      </div>
    </div>
  );
}