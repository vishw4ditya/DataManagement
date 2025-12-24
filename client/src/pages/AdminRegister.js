import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../index.css';

const AdminRegister = () => {
  const [step, setStep] = useState(1); // 1: phone & send OTP, 2: verify OTP & register
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/send-otp', { phoneNumber });
      
      if (response.data.success) {
        if (response.data.otp) {
          setSuccess(`✅ OTP sent successfully! Your OTP is: ${response.data.otp} (Check server console for details)`);
        } else {
          setSuccess(response.data.message || 'OTP sent successfully!');
        }
        setStep(2);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Error sending OTP. Please check your phone number format.';
      setError(errorMessage);
      console.error('OTP Error:', error.response?.data || error.message);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data (ONLY these fields, no adminID)
      const registrationData = {
        phoneNumber,
        name: name.trim(),
        password,
        otp
      };
      
      console.log('📝 Attempting registration with:', {
        phoneNumber,
        name: name.trim(),
        otp: otp ? '***' : 'missing',
        hasPassword: !!password
      });
      
      // Make sure we're using the correct endpoint
      const endpoint = '/auth/register';
      console.log('🌐 API Endpoint:', endpoint);
      console.log('🌐 Full URL will be:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}${endpoint}`);
      
      const response = await api.post(endpoint, registrationData);
      
      console.log('✅ Registration response:', response.data);

      if (response.data.token) {
        setSuccess('Registration successful! Logging you in...');
        
        // Auto login after registration
        const loginResult = await login(phoneNumber, password, 'admin');
        if (loginResult.success) {
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 1000);
        } else {
          setError('Registration successful but login failed. Please login manually.');
        }
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      console.error('Error response:', error.response);
      
      // Handle 404 errors specifically
      if (error.response?.status === 404) {
        setError('Registration endpoint not found. Please check if the server is running on port 5000.');
        return;
      }
      
      // Handle HTML error responses (like 404 pages)
      if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        setError('Server returned an error page. Please check if the backend server is running correctly.');
        return;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          error.message ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>✨</div>
          <h1 style={{ marginBottom: '10px' }}>
            Admin Registration
          </h1>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>
            {step === 1 ? 'Step 1: Verify your phone number' : 'Step 2: Complete your registration'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP}>
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

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  <span>📲</span> Send OTP
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>🔐 OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                required
                style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px', fontWeight: 'bold' }}
              />
            </div>

            <div className="form-group">
              <label>👤 Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>🔑 Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                required
              />
            </div>

            <div className="form-group">
              <label>🔑 Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registering...
                </>
              ) : (
                <>
                  <span>✅</span> Complete Registration
                </>
              )}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '10px' }}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
          </form>
        )}

        <div style={{ marginTop: '25px', textAlign: 'center', padding: '20px', background: 'rgba(102, 126, 234, 0.05)', borderRadius: '12px' }}>
          <span style={{ color: '#6c757d', fontSize: '14px' }}>Already have an account? </span>
          <Link to="/admin/login">
            🚀 Login Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;

