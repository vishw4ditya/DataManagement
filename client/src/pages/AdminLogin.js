import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const AdminLogin = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(phoneNumber, password, 'admin');
    
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔐</div>
          <h1 style={{ marginBottom: '10px' }}>
            Admin Login
          </h1>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>Welcome back! Please login to continue</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>📱 Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>🔑 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                <span>🚀</span> Login
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <Link to="/admin/forgot-password">
            🔓 Forgot Password?
          </Link>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', padding: '20px', background: 'rgba(102, 126, 234, 0.05)', borderRadius: '12px' }}>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Don't have an account? </span>
          <Link to="/admin/register">
            ✨ Register Now
          </Link>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '20px', borderTop: '2px solid #f0f0f0' }}>
          <Link to="/super-admin/login">
            👑 Super Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

