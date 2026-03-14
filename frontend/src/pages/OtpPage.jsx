import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/otp.css';

export default function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '+91 XXXXXXXX89';

  // Countdown timer
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

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) return setError('Please enter the complete 6-digit OTP');
    setLoading(true);
    // TODO: POST /verify-otp with { phone, otp: code }
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      setTimeout(() => navigate('/home'), 1500);
    }, 1200);
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputs.current[0]?.focus();
    // TODO: POST /resend-otp
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        {/* Cyber corner decorations */}
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
            <p className="otp-sub">
              OTP sent to <span className="phone-highlight">{phone}</span>
            </p>

            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputs.current[i] = el}
                  className={`otp-box ${digit ? 'filled' : ''} ${error ? 'shake' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(e.target.value, i)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <p className="otp-error">⚠️ {error}</p>}

            <button
              className="btn-verify"
              onClick={handleVerify}
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? (
                <span className="verifying">
                  <span className="dot-flash" />
                  Verifying...
                </span>
              ) : 'Verify & Continue →'}
            </button>

            <div className="resend-row">
              {timer > 0 ? (
                <p className="resend-timer">Resend OTP in <span>00:{String(timer).padStart(2, '0')}</span></p>
              ) : (
                <button className="resend-btn" onClick={handleResend}>↺ Resend OTP</button>
              )}
            </div>

            <p className="otp-note">🔒 This OTP expires in 10 minutes</p>
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