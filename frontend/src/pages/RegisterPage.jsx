import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST /register
    navigate('/verify-otp', { state: { phone: form.phone } });
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
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                required
              />
            </div>
          ))}
          <button type="submit" className="btn-primary">Register →</button>
        </form>

        <p className="auth-switch">
           Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}