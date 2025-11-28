import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/userSlice';
import { Link } from "react-router-dom";

import { toast } from 'react-toastify';
import '../assets/css/singupmodal.css';

// Reusable login form used by the HomePage sign-in modal
export default function SigninForm({ onSuccess, onRequestSignUp }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    try {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        toast.success('Welcome!');
        onSuccess && onSuccess();
      } else {
        toast.error(result.payload || 'Invalid login credentials');
        console.error('Login failed:', result.payload);
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="signinModal">
      <h2 className="text-center mb-2">Sign in</h2>
      <p className="text-center mb-4" style={{ color: '#666' }}>Use your Mangroove Account</p>
      <div className="form">
        <input
          className="email mt-3"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="password mt-3 mb-2"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label className="showpass-row">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((s) => !s)}
          />
          <span>Show password</span>
        </label>

        <div className="actions">
          <button
            className="action-btn mt-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Next'}
          </button>
          <button
            className="btn btn-link mt-2"
            type="button"
            onClick={() => toast.info('Forgot password flow not implemented yet')}
          >
            Forgot password?
          </button>
        </div>
      </div>
      <p className="mt-3 text-center" style={{ fontSize: 12 }}>
        Don’t have an account?{' '}
        <a href="#signup" onClick={(e) => { e.preventDefault(); onRequestSignUp && onRequestSignUp(); }}>
          CREATE AN ACCOUNT FOR FREE.
        </a>
      </p>
    </div>
  );
}
