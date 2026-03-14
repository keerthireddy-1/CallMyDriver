import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const services = [
  { icon: '🛵', label: 'Scooter/Bike', desc: 'Driver rides your two-wheeler' },
  { icon: '🚗', label: 'Car', desc: 'Driver drives your car' },
  { icon: '🍺', label: 'Drunk? Safe ride', desc: 'We get you & your vehicle home' },
  { icon: '🤕', label: 'Can\'t drive?', desc: 'Injured or unwell? We help' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-logo">🔑 <span>CallMyDriver</span></div>
        <div className="header-profile">👤
          {/* Add this just before the closing </div> of home-container */}
          <nav className="bottom-nav">
            <div className="nav-item active">
              <span>🏠</span><span>HOME</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/book')}>
              <span>🔑</span><span>BOOK</span>
            </div>
            <div className="nav-item">
              <span>📋</span><span>RIDES</span>
            </div>
            <div className="nav-item">
              <span>👤</span><span>PROFILE</span>
            </div>
          </nav>
        </div>
      </header>

      <section className="home-hero">
        <p className="home-greeting">Your vehicle. Our driver. 🔑</p>
        <h2>Can't drive right now?<br /><span>We've got you covered.</span></h2>
        <p className="hero-desc">We send a driver to your location — they drive YOUR vehicle home safely.</p>
        <button className="hero-cta" onClick={() => navigate('/book')}>
          📍 Call a Driver Now
        </button>
      </section>

      <section className="how-it-works">
        <p className="section-label">How it works</p>
        <div className="steps-row">
          <div className="step"><span>📍</span><p>Share your location</p></div>
          <div className="step-arrow">→</div>
          <div className="step"><span>🔑</span><p>Driver comes to you</p></div>
          <div className="step-arrow">→</div>
          <div className="step"><span>🏠</span><p>Drives you home</p></div>
        </div>
      </section>

      <section className="services-section">
        <p className="section-label">Vehicle Types</p>
        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s.label} onClick={() => navigate('/book')}>
              <span className="service-icon">{s.icon}</span>
              <p className="service-label">{s.label}</p>
              <p className="service-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="recent-section">
        <p className="section-label">Recent Rides</p>
        <div className="ride-item">
          <span>🚗</span>
          <div>
            <p>Phoenix Mall Parking → Home</p>
            <small>Yesterday, 11:30 PM · ₹180 · Car</small>
          </div>
          <button onClick={() => navigate('/book')}>Rebook</button>
        </div>
      </section>
    </div>

  );
}