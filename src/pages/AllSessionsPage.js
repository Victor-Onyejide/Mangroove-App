import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import user from './database.json';
import { ReactComponent as FileSVG } from '../assets/svg/file.svg';

export default function AllSessionsPage() {
    // container allSessionsPage

  return (
    <div className="allSessionsPage container">
      <div className="header">
        <h3>ALL Sessions</h3>
        <Link to={'/qrcode/1'} className="new-session-link">New Session +</Link>
      </div>

      {/* Grid layout for sessions */}
      <div className="sessions-grid mt-5">
        {user.sessions.map((session) => (
          <div key={session.id} className="item">
            <Link to={`/session/${session.id}`} className="session-title">
                  {/* Display file icon above the sessions */}
                <div className="file-icon-container">
                    <FileSVG width={50} height={50} />
                </div>
                <div className="folder-icon"></div>
                <p className="mt-1">{session.song_title}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
