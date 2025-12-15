import React, { useEffect, useCallback } from 'react';
import DefaultCover from '../assets/svg/default.svg';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import jsPDF from 'jspdf';
import { fetchSession } from '../features/sessionSlice';
import '../assets/css/splitSheet.css';

// Simple date formatting (Month Day, Year)
function fmtLong(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function SplitSheetPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { current: session, loading, error } = useSelector((s) => s.sessions);
  const { isLoggedIn } = useSelector((s) => s.user);

  // Fetch session data
  useEffect(() => {
    if (!id || !isLoggedIn) return;
    dispatch(fetchSession(id));
  }, [dispatch, id, isLoggedIn]);

  const handleDownload = useCallback(() => {
    if (!session) return;
    const doc = new jsPDF('p', 'pt');
    const marginLeft = 40;
    let y = 48;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`${session.songTitle || 'Untitled'} Split Sheet`, marginLeft, y);
    y += 28;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Song Title: ${session.songTitle || ''}`, marginLeft, y); y += 14;
    doc.text(`Session ID: ${String(id).toUpperCase().slice(-5)}`, marginLeft, y); y += 14;
    doc.text(`Song Creation Date: ${fmtLong(session.createdAt)}`, marginLeft, y); y += 24;

  // Table header (expanded ownership into separate Writing/Publishing columns)
  // Adjusted column widths to fit within page width (A4 pt width ~595, usable ~555 with 40pt margin)
  const headers = ['Details', 'Affiliation', 'Publisher', 'Role', 'Writing', 'Publishing'];
  const colWidths = [150, 80, 110, 90, 60, 60];
    let x = marginLeft;
    doc.setFont('Helvetica', 'bold');
    headers.forEach((h, i) => {
      doc.text(h, x + 2, y);
      doc.rect(x, y - 10, colWidths[i], 20);
      x += colWidths[i];
    });
    y += 20;

    doc.setFont('Helvetica', 'normal');
    const writers = session.songwriters || [];
    const ownership = session.ownership || [];
    writers.forEach((w) => {
      x = marginLeft;
      // Support both shapes: { user: {...}, username } and flat user objects
      const userObj = w && typeof w === 'object' && 'user' in w ? w.user : w;
      const idVal = (userObj && (userObj._id || userObj.id)) || (w && (w._id || w.id)) || w;
      const ownRec = ownership.find(o => String(o.songwriter) === String(idVal));
      const writingPct = ownRec ? (ownRec.writing ?? 0) : 0;
      const publishingPct = ownRec ? (ownRec.publishing ?? 0) : 0;
      const detailLines = [ (userObj && (userObj.username || userObj.stageName)) || w?.username || 'User', userObj?.email || w?.email || '', userObj?.stageName ? `(${userObj.stageName})` : ''];
      // Calculate row height based on lines
      const lineHeight = 12;
      const writerHeight = (detailLines.filter(Boolean).length || 1) * lineHeight + 8;
      const rowHeight = Math.max(writerHeight, 36);
      // Draw cells
      colWidths.forEach((cw, i) => {
        doc.rect(x, y - 10, cw, rowHeight);
        x += cw;
      });
      // Write Details
      x = marginLeft + 4;
      let innerY = y;
      detailLines.filter(Boolean).forEach(dl => {
        doc.text(dl, x, innerY);
        innerY += lineHeight;
      });
      // Other columns
    let colStart = marginLeft + colWidths[0];
    doc.text(String(w?.affiliation || ''), colStart + 4, y); colStart += colWidths[1];
    doc.text(String(w?.publisher || ''), colStart + 4, y); colStart += colWidths[2];
    doc.text(String(w?.role || ''), colStart + 4, y); colStart += colWidths[3];
    doc.text(`${writingPct}%`, colStart + 4, y); colStart += colWidths[4];
    doc.text(`${publishingPct}%`, colStart + 4, y);
      y += rowHeight;
      if (y > 760) { doc.addPage(); y = 48; }
    });

    y += 28;
    doc.setFont('Helvetica', 'italic');
    doc.text('The undersigned all agree that the information above is correct.', marginLeft, y);
    y += 30;
    doc.setFont('Helvetica', 'normal');
    // Only include signers who have ownership entries (accepted participants)
    const pdfSigners = writers.filter((w) => {
      const userObj = w && typeof w === 'object' && 'user' in w ? w.user : w;
      const idVal = (userObj && (userObj._id || userObj.id)) || (w && (w._id || w.id)) || w;
      return ownership.some(o => String(o.songwriter) === String(idVal));
    });
    pdfSigners.forEach((w) => {
      const nm = w?.username || w?._id || 'User';
      doc.text(`${nm}  —  Signed on ${fmtLong(session.createdAt)}`, marginLeft, y);
      y += 16;
      if (y > 760) { doc.addPage(); y = 48; }
    });

    doc.save(`${session.songTitle || 'split-sheet'}.pdf`);
  }, [session, id]);

  if (!id) return <div className="container">Invalid session.</div>;
  if (loading && !session) return <div className="container">Loading split sheet…</div>;
  if (error) return <div className="container">Failed to load session.</div>;
  if (!session) return <div className="container">Not found.</div>;

  const writers = session.songwriters || [];
  const ownership = session.ownership || [];
  const signers = writers.filter((w) => {
    const userObj = w && typeof w === 'object' && 'user' in w ? w.user : w;
    const idVal = (userObj && (userObj._id || userObj.id)) || (w && (w._id || w.id)) || w;
    return ownership.some(o => String(o.songwriter) === String(idVal));
  });

  return (
    <div className="splitsheet-page mt-5">
      <div className="splitsheet-topbar">
        {/* <div className="splitsheet-brand">
          <div className="logo-circle">M</div>
          <span>MANGROVE STUDIOS</span>
        </div> */}
        <button className="splitsheet-download-btn" onClick={handleDownload}>DOWNLOAD SPLIT SHEET</button>
      </div>

      <div className="splitsheet-card">
        <div className="splitsheet-header-grid">
      <div className="cover-wrapper">
        {/* Use the default SVG asset for the cover; keep the same class for styling */}
        <img src={DefaultCover} alt="cover" className="splitsheet-cover" />
      </div>

          <div className="splitsheet-meta-block">
            <h1>{session.songTitle} Split Sheet</h1>
            <dl className="splitsheet-meta-columns">
              <div>
                <dt>Song Title</dt>
                <dd>{session.songTitle || 'Untitled'}</dd>
              </div>
              <div>
                <dt>Session ID</dt>
                <dd>{String(id).toUpperCase().slice(-5)}</dd>
              </div>
              <div>
                <dt>Song Creation Date</dt>
                <dd>{fmtLong(session.createdAt)}</dd>
              </div>
              <div>
                <dt>Today</dt>
                <dd>{fmtLong(Date.now())}</dd>
              </div>
            </dl>
          </div>

          {/* <div className="splitsheet-logo-mark">
            <div className="logo-circle" style={{width:48,height:48,fontSize:18}}>M</div>
            <span>MANGROVE STUDIOS</span>
          </div> */}
        </div>

        <div className="splitsheet-table-wrapper">
          <table className="splitsheet-table">
            <thead>
              <tr>
                <th>Details</th>
                <th>Affiliation</th>
                <th>Publisher</th>
                <th>Role</th>
                <th>Writing</th>
                <th>Publishing</th>
              </tr>
            </thead>
            <tbody>
              {writers.map((w) => {
                // Normalize songwriter shape
                const userObj = w && typeof w === 'object' && 'user' in w ? w.user : w;
                const idVal = (userObj && (userObj._id || userObj.id)) || (w && (w._id || w.id)) || w;
                const ownRec = ownership.find(o => String(o.songwriter) === String(idVal));
                const writingPct = ownRec ? (ownRec.writing ?? 0) : 0;
                const publishingPct = ownRec ? (ownRec.publishing ?? 0) : 0;
                const displayName = (userObj && (userObj.username || userObj.stageName)) || w?.username || 'Unknown';
                const avatarText = (displayName || 'U').slice(0, 2).toUpperCase();
                return (
                  <tr key={idVal}>
                    <td>
                      <div className="splitsheet-writer-cell">
                        <div className="writer-avatar">{avatarText}</div>
                        <div className="writer-info">
                          <div className="writer-name">{displayName}</div>
                          {(userObj?.email || w?.email) && <div className="writer-email">{userObj?.email || w?.email}</div>}
                          {(userObj?.stageName || w?.stageName) && <div className="writer-email">({userObj?.stageName || w?.stageName})</div>}
                        </div>
                      </div>
                    </td>
                    <td>{userObj?.affiliation || w?.affiliation || ''}</td>
                    <td>{userObj?.publisher || w?.publisher || ''}</td>
                    <td>{userObj?.role || w?.role || ''}</td>
                    <td className="splitsheet-ownership">{writingPct}%</td>
                    <td className="splitsheet-ownership">{publishingPct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="splitsheet-agreement">The undersigned all agree that the information above is correct.</div>
        <div className="splitsheet-signatures">
          {signers.map((w) => (
            <div key={w?._id || w?.id || w} className="signature-item">
              <div className="sig-name">{w?.username || 'Unknown'}</div>
              <div className="sig-date">Signed on {fmtLong(session.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
