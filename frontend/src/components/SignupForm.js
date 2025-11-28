import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser } from '../features/userSlice';
import { toast } from 'react-toastify';

export default function SignupForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { loading, sessionId, shareLink } = useSelector((state) => state.user);
  const [username, setUsername] = useState('');
  const [aka, setAka] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [publisher, setPublisher] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!username || !email || !password) {
      toast.error('Please fill in name, email and password');
      return;
    }
    try {
      await dispatch(signUpUser({ username, email, aka, role, password, affiliation, publisher })).unwrap();
      toast.success('Account created!');
      onSuccess && onSuccess({ sessionId, shareLink });
    } catch (err) {
      console.error('Signup error:', err);
      toast.error(typeof err === 'string' ? err : 'Signup failed');
    }
  };

  return (
    <div className="signupModal">
      <h2 className="text-center mb-2">Create a Mangrove Account</h2>
      <p className="text-center mb-4" style={{ color: '#666' }}>Enter your info</p>

      <div className="form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input type="text" placeholder="Full name" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input type="text" placeholder="Stage name" value={aka} onChange={(e)=>setAka(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} style={{ gridColumn: '1 / -1' }} />
        <input type="text" placeholder="Publisher" value={publisher} onChange={(e)=>setPublisher(e.target.value)} />
        <input type="text" placeholder="Affiliation" value={affiliation} onChange={(e)=>setAffiliation(e.target.value)} />
        <select
          value={role}
          onChange={(e)=>setRole(e.target.value)}
          style={{ gridColumn: '1 / -1' }}
          aria-label="Role(s)"
        >
          <option value="" disabled>Role(s)</option>
          <option value="artist">Artist</option>
          <option value="producer">Producer</option>
          <option value="executive">Executive</option>
        </select>
        <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{ gridColumn: '1 / -1' }} />
      </div>

      <label className="showpass-row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <input type="checkbox" checked={showPassword} onChange={()=>setShowPassword(s=>!s)} />
        <span>Show password</span>
      </label>

      <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button className="action-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating…' : 'Next'}
        </button>
      </div>
    </div>
  );
}
