import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/otp.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || location.state?.phone || '';

  useEffect(() => {
    if (timer === 0) return;
    const t = setTimeout(() => setTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (val, index) => {
    if (!/^\d?$/.test(val)) return;
    const updated = [...otp];
    updated[index] = val;
    setOtp(updated);
    setError('');
    if (val && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Please enter the complete 6-digit OTP');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp?phone=${email}&otp=${code}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || 'Verification failed.');
      } else {
        if (data.token) localStorage.setItem('token', data.token);
        setVerified(true);
        setTimeout(() => navigate('/home'), 1500);
      }
    } catch {
      setError('Could not connect to server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputs.current[0]?.focus();
    try {
      await fetch(`${API_URL}/api/auth/send-otp?phone=${email}`, { method: 'POST' });
    } catch {
      setError('Could not resend OTP.');
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />
        <div className="otp-logo">🔑 <span>Call<strong>My</strong>Driver</span></div>
        {!verified ? (
          <>
            <div className="otp-icon-wrap">
              <div className="otp-shield">🛡️</div>
              <div className="otp-ring" />
            </div>
            <h2>Verify Your Identity</h2>
            <p className="otp-sub">OTP sent to <span className="phone-highlight">{email}</span></p>
            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input key={i} ref={el => inputs.current[i] = el}
                  className={`otp-box ${digit ? 'filled' : ''} ${error ? 'shake' : ''}`}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleChange(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)} autoFocus={i === 0} />
              ))}
            </div>
            {error && <p className="otp-error">⚠️ {error}</p>}
            <button className="btn-verify" onClick={handleVerify} disabled={loading || otp.join('').length < 6}>
              {loading ? <span className="verifying"><span className="dot-flash" />Verifying...</span> : 'Verify & Continue →'}
            </button>
            <div className="resend-row">
              {timer > 0 ? (
                <p className="resend-timer">Resend OTP in <span>00:{String(timer).padStart(2, '0')}</span></p>
              ) : (
                <button className="resend-btn" onClick={handleResend}>↺ Resend OTP</button>
              )}
            </div>
            <p className="otp-note">🔒 This OTP expires in 60 seconds</p>
          </>
        ) : (
          <div className="verified-state">
            <div className="verified-check">✅</div>
            <h2>Identity Verified!</h2>
            <p>Redirecting to home...</p>
          </div>
        )}
      </div>
    </div>
  );
}