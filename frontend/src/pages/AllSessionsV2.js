import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../components/Modal';
import '../assets/css/sessionsV2.css';

export default function AllSessionsV2() {
  const navigate = useNavigate();
  const { userInfo, isLoggedIn, loading } = useSelector((s) => s.user);

  const [sessionsCreated, setSessionsCreated] = useState([]);
  const [sessionsJoined, setSessionsJoined] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'created' | 'joined'
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // number of sessions per page

  // Close the three-dots delete menu when clicking anywhere outside it
  useEffect(() => {
    if (!menuOpenId) return;

    const handleClickOutside = () => {
      setMenuOpenId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpenId]);

  useEffect(() => {
    // Defer loading until auth is resolved and user is logged in.
    if (loading || !isLoggedIn) return;
    const load = async () => {
      try {
        const { data } = await axios.get('/api/user/sessions', { withCredentials: true });
        setSessionsCreated(data.created || []);
        setSessionsJoined(data.joined || []);
        console.log(data)
      } catch (err) {
        // If the cookie isn't ready yet, retry once shortly after.
        setTimeout(async () => {
          try {
            const { data } = await axios.get('/api/user/sessions', { withCredentials: true });
            setSessionsCreated(data.created || []);
            setSessionsJoined(data.joined || []);
          } catch (err2) {
            // eslint-disable-next-line no-console
            console.error('Failed loading sessions (retry)', err2);
          }
        }, 400);
      }
    };
    load();
  }, [isLoggedIn, loading]);

  const list = useMemo(() => {
    const created = Array.isArray(sessionsCreated) ? sessionsCreated : [];
    const joined = Array.isArray(sessionsJoined) ? sessionsJoined : [];
    const joinedFiltered = joined.filter(js => !created.find(cs => String(cs._id) === String(js._id)));
    let merged;
    if (filter === 'created') {
      merged = [...created];
    } else if (filter === 'joined') {
      merged = [...joinedFiltered];
    } else {
      merged = [...created, ...joinedFiltered];
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      merged = merged.filter(s => (s.songTitle || '').toLowerCase().includes(q));
    }
    // Sort by most recent first: prefer updatedAt, fallback to createdAt
    merged.sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
    return merged;
  }, [sessionsCreated, sessionsJoined, query, filter]);

  // Derived pagination values
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageList = list.slice(startIdx, endIdx);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/user/session/${id}`, { withCredentials: true });
      setSessionsCreated(prev => prev.filter(s => String(s._id) !== String(id)));
      setSessionsJoined(prev => prev.filter(s => String(s._id) !== String(id)));
      setMenuOpenId(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('delete session failed', err);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !sessionType) return;
    try {
      const payload = {
        songTitle: newTitle.trim(),
        sessionType: sessionType
      };
      const { data } = await axios.post(
        '/api/user/create-session',
        payload,
        { withCredentials: true }
      );
      setCreateOpen(false);
      setNewTitle('');
      // Newly created sessions start as in progress (isEnded false by default)
      navigate(`/session-v2/${data.session._id}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('create session failed', err);
    }
  };

  return (
    <div className="sessionsV2 container mt-5">
      <header className="sv2-header">
        <div className="sv2-title">
          <span className="dot-menu" aria-hidden />
          <h1>Sessions</h1>
        </div>
        <div className="sv2-actions">
          <div className="sv2-search-wrap">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="session-action-wrapper">
            <div className="sv2-filter">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter sessions">
                <option value="all">All</option>
                <option value="created">Created</option>
                <option value="joined">Joined</option>
              </select>
            </div>
            <div className="botton-wrapper">
              <button className="btn hollow" onClick={() => setCreateOpen(true)}>Create a Session</button>
              <button className="btn primary" >Join a Session</button>
            </div>
          </div>
        </div>
      </header>

      <div className="sv2-table">
        <div className="sv2-row sv2-head">
          <div>Title</div>
          <div>Last Viewed</div>
          <div>ID</div>
          <div>Contributors</div>
          <div>Status</div>
          <div />
        </div>
  {pageList.map((s) => {
          const id = s._id || s.id || '';
          const lastViewed = s.updatedAt || s.createdAt || '';
          const dateStr = lastViewed ? new Date(lastViewed).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : '—';
          // Support both populated users and denormalized songwriter subdocs
          const contributors = Array.isArray(s.songwriters) ? s.songwriters : [];
          const names = contributors
            .map(sw => {
              // case 1: new schema subdoc { user: ObjectId, username }
              if (sw && typeof sw === 'object' && 'user' in sw) {
                // if populated, sw.user may be an object with username/stageName
                const u = sw.user;
                const nameFromPopulated = u && typeof u === 'object' ? (u.username || u.stageName || u.email) : null;
                return nameFromPopulated || sw.username || 'User';
              }
              // case 2: legacy populated user object
              if (sw && typeof sw === 'object') {
                return sw.username || sw.stageName || sw.email || 'User';
              }
              // case 3: raw ObjectId string fallback
              return String(sw);
            })
            .join(', ');
          const status = s.isEnded ? 'Completed' : 'In Progress';
          const href = s.isEnded ? `/split-sheet/${id}` : `/session-v2/${id}`;
          return (
            <div className="sv2-row" key={id}>
              <div className="title-cell">
                <Link to={href} className="link-title">{s.songTitle || 'Untitled'}</Link>
              </div>
              <div>{dateStr}</div>
              <div className="mono">{String(id).slice(-5).toUpperCase()}</div>
              <div className="truncate" title={names}>{names || '—'}</div>
              <div>
                <span className={`badge ${status.includes('Progress') ? 'inprogress' : status.toLowerCase()}`}>{status}</span>
              </div>
              <div className="more" style={{ position: 'relative' }}>
                <span
                  role="button"
                  aria-label="More options"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === id ? null : id);
                  }}
                  style={{ cursor: 'pointer' }}
                >···</span>
                {menuOpenId === id && (
                  <div
                    className="sv2-popover"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '100%',
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,.12)',
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,.08)',
                      padding: '6px 8px',
                      zIndex: 10
                    }}
                  >
                    <button className="btn outline" onClick={() => handleDelete(id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {pageList.length === 0 && (
          <div className="sv2-empty">No sessions yet</div>
        )}
      </div>

      {totalPages > 1 && (
        <footer className="sv2-pager">
          <button
            className="btn ghost"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`btn page ${p === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(p)}
            >{p}</button>
          ))}
          <button
            className="btn ghost"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >Next</button>
        </footer>
      )}

      {createOpen && (
        <Modal onClose={() => setCreateOpen(false)}>
          <div className="createSessionModal">
            <h2 className="text-center mb-2">Create a Session</h2>
            <div className="form" style={{ gap: 8 }}>
              <input
                type="text"
                placeholder="Enter song title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <select
                value={sessionType}
                onChange={(e)=>setSessionType(e.target.value)}
                style={{ gridColumn: '1 / -1'}}
                aria-label="Session Type"
              >
                <option value="" disabled>Session Type</option>
                <option value="writing" >Writing</option>
                <option value="recording" >Recording</option>
                <option value="mixing" >Mixing</option>
                <option value="mastering" >Mastering</option>
              </select>
            </div> 
            <div className="actions">
              <button className="save-btn" onClick={handleCreate}>SAVE</button>
              <button className="moreOptions-btn" onClick={() => setCreateOpen(false)}>MORE OPTIONS</button>
            </div>
          </div>
          <span className="sendAMessage">Have questions? <strong>SEND US A MESSAGE</strong></span>

        </Modal>
        
      )}
    </div>
  );
}
