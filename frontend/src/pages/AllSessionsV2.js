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

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get('/api/user/sessions', { withCredentials: true });
        setSessionsCreated(data.created || []);
        setSessionsJoined(data.joined || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed loading sessions', err);
      }
    };
    load();
  }, []);

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
    return merged;
  }, [sessionsCreated, sessionsJoined, query, filter]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !sessionType) return;
   try {
        const payload = {
            songTitle: newTitle.trim(),
            sessionType: sessionType   
        }
        const { data } = await axios.post(
            '/api/user/create-session', 
            payload, 
            { withCredentials: true }
        );
        setCreateOpen(false);
        setNewTitle('');
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
        {list.map((s) => {
          const id = s._id || s.id || '';
          const lastViewed = s.updatedAt || s.createdAt || '';
          const dateStr = lastViewed ? new Date(lastViewed).toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' }) : '—';
          const contributors = Array.isArray(s.songwriters) ? s.songwriters : [];
          const names = contributors
            .map(w => (typeof w === 'object' ? (w.username || w.stageName || 'User') : String(w)))
            .join(', ');
          const status = 'In Progress';
          return (
            <div className="sv2-row" key={id}>
              <div className="title-cell">
                <Link to={`/session/${id}`} className="link-title">{s.songTitle || 'Untitled'}</Link>
              </div>
              <div>{dateStr}</div>
              <div className="mono">{String(id).slice(-5).toUpperCase()}</div>
              <div className="truncate" title={names}>{names || '—'}</div>
              <div>
                <span className={`badge ${status.includes('Progress') ? 'inprogress' : status.toLowerCase()}`}>{status}</span>
              </div>
              <div className="more">···</div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="sv2-empty">No sessions yet</div>
        )}
      </div>

      <footer className="sv2-pager">
        <button className="btn ghost" disabled>Previous</button>
        <button className="btn page active">1</button>
        <button className="btn page">2</button>
        <button className="btn page">3</button>
        <button className="btn ghost">Next</button>
      </footer>

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
