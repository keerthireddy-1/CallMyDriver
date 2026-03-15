import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/tracking.css';

export default function TrackingPage() {
  const [status, setStatus] = useState(0);
  const navigate = useNavigate();

  const steps = [
    'Finding a driver near you...',
    'Driver assigned – Ramesh K. ✓',
    'Driver is on the way to your vehicle (1.4 km)',
    'Driver reached your vehicle 📍',
    'En route to your destination 🏠',
    'Arrived safely! Trip complete ✅',
  ];

  // Status will be updated via API polling (TODO when backend is ready)

// Add this instead — manual refresh button for now
const [lastUpdated, setLastUpdated] = useState('Just now');

const refreshStatus = () => {
  // TODO: GET /bookings/:id/status  → update status from response
  setLastUpdated(new Date().toLocaleTimeString());
};
  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>Driver Tracking</h2>
        <button className="cancel-btn" onClick={() => navigate('/home')}>✕</button>
      </div>

      <div className="map-placeholder">
        <div className="map-pulse" />
        <span className="map-icon">🔑</span>
        <p>Driver is on the way to your vehicle</p>
        <small>(Live map — connect Google Maps API)</small>
      </div>

      <div className="tracking-card">
        <div className="driver-info">
          <div className="driver-avatar">👤</div>
          <div>
            <p className="driver-name">Ramesh Kumar</p>
            <p className="driver-vehicle">⭐ 4.9 · 312 trips · ID verified ✓</p>
          </div>
          <div className="driver-rating">🔑 Driver</div>
        </div>

        {/* Vehicle reminder */}
        <div className="vehicle-reminder">
          🚗 Your Car · KA 05 MN 7890 · Phoenix Mall P2
        </div>

        <div className="status-timeline">
          {steps.map((step, i) => (
            <div key={i} className={`status-step ${i <= status ? 'done' : ''} ${i === status ? 'active' : ''}`}>
              <div className="status-dot" />
              <p>{step}</p>
            </div>
          ))}
        </div>

        <div className="tracking-actions">
          <button className="action-btn">📞 Call Driver</button>
          <button className="action-btn">💬 Message</button>
          <button className="action-btn danger" onClick={() => navigate('/home')}>❌ Cancel</button>
          <button className="refresh-btn" onClick={refreshStatus}>
             ↻ Refresh Status · {lastUpdated}
           </button>
        </div>
      </div>
    </div>
  );
}