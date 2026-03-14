import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/license.css';

export default function LicensePage() {
  const [form, setForm] = useState({
    licenseNumber: '',
    fullName: '',
    dob: '',
    expiry: '',
    photo: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, photo: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.licenseNumber || !form.fullName || !form.expiry) {
      return alert('Please fill all required fields');
    }
    setSubmitted(true);
    // TODO: POST /verify-license with FormData (photo + fields)
    setTimeout(() => navigate('/home'), 2000);
  };

  return (
    <div className="license-container">
      <div className="license-card">
        <div className="corner tl" /><div className="corner tr" />
        <div className="corner bl" /><div className="corner br" />

        <div className="license-header">
          <div className="license-logo">🔑 Call<strong>My</strong>Driver</div>
          <h2>Driver Verification</h2>
          <p className="license-sub">We verify all drivers for passenger safety 🛡️</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="license-form">

            {/* Photo Upload */}
            <div className="photo-upload-section">
              <label className="photo-label" htmlFor="license-photo">
                {preview ? (
                  <img src={preview} alt="License" className="license-preview" />
                ) : (
                  <div className="photo-placeholder">
                    <span>📄</span>
                    <p>Upload License Photo</p>
                    <small>JPG, PNG · Max 5MB</small>
                  </div>
                )}
              </label>
              <input
                id="license-photo"
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                style={{ display: 'none' }}
              />
            </div>

            {/* Form Fields */}
            {[
              { label: 'License Number *', name: 'licenseNumber', type: 'text', placeholder: 'e.g. KA0519970012345' },
              { label: 'Full Name (as on license) *', name: 'fullName', type: 'text', placeholder: 'Your legal full name' },
              { label: 'Date of Birth', name: 'dob', type: 'date', placeholder: '' },
              { label: 'License Expiry Date *', name: 'expiry', type: 'date', placeholder: '' },
            ].map(({ label, name, type, placeholder }) => (
              <div className="field-group" key={name}>
                <label>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                />
              </div>
            ))}

            <div className="security-note">
              🔒 Your data is encrypted and only used for verification. We never share it.
            </div>

            <button type="submit" className="btn-submit">
              Submit for Verification →
            </button>
          </form>
        ) : (
          <div className="submitted-state">
            <div className="submitted-icon">⏳</div>
            <h3>Verification Submitted!</h3>
            <p>Our team will verify your license within 24 hours.</p>
            <p className="submitted-sub">You'll receive an SMS once approved.</p>
          </div>
        )}
      </div>
    </div>
  );
}