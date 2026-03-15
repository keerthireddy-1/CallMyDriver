import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail));
        return;
      }
      await fetch(`${API_URL}/api/auth/send-otp?phone=${form.email}`, {
        method: 'POST',
      });
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🔑</span>
          <h1>CallMyDriver</h1>
        </div>
        <p className="auth-subtitle">Join the ride.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {[
            { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email', name: 'email', type: 'email', placeholder: 'you@email.com' },
            { label: 'Phone', name: 'phone', type: 'tel', placeholder: '+91 9999999999' },
            { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
          ].map(({ label, name, type, placeholder }) => (
            <div className="input-group" key={name}>
              <label>{label}</label>
              <input type={type} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} required />
            </div>
          ))}
          {error && <p className="auth-error">⚠️ {error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register →'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}