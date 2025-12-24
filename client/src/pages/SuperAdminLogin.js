import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../index.css';

const SuperAdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password, 'superAdmin');
    
    if (result.success) {
      navigate('/super-admin/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👑</div>
          <h1 style={{ marginBottom: '10px' }}>
            Super Admin Login
          </h1>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>Access the admin management dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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

        <div style={{ marginTop: '25px', textAlign: 'center', paddingTop: '20px', borderTop: '2px solid #f0f0f0' }}>
          <Link to="/admin/login">
            👤 Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;

