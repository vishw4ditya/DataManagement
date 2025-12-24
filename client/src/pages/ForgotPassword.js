import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../index.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: phone & send OTP, 2: verify OTP & reset password
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password/send-otp', { phoneNumber });
      setSuccess(response.data.message);
      if (response.data.otp) {
        setSuccess(`OTP sent! (For testing: ${response.data.otp})`);
      }
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.message || 'Error sending OTP');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/forgot-password/reset', {
        phoneNumber,
        otp,
        newPassword
      });

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Password reset failed');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔓</div>
          <h1 style={{ marginBottom: '10px' }}>
            Forgot Password
          </h1>
          <p style={{ color: '#6c757d', fontSize: '14px' }}>
            {step === 1 ? 'Step 1: Verify your phone number' : 'Step 2: Reset your password'}
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
                placeholder="Enter your registered phone number"
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
          <form onSubmit={handleResetPassword}>
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
              <label>🔑 New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
            </div>

            <div className="form-group">
              <label>🔑 Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
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
                  Resetting Password...
                </>
              ) : (
                <>
                  <span>✅</span> Reset Password
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

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <Link to="/admin/login">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

