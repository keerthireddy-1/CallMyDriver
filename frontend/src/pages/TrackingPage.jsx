import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cancelBooking, getBookings } from '../services/api';
import '../styles/tracking.css';

export default function TrackingPage() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const booking_id = localStorage.getItem('booking_id');

  // Poll booking status every 5 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getBookings();
        const found = res.data.find(b => b.booking_id === booking_id);
        if (found) setBooking(found);
      } catch (err) {
        console.error('Failed to fetch booking status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async () => {
    try {
      await cancelBooking(booking_id);
      localStorage.removeItem('booking_id');
      navigate('/home');
    } catch (err) {
      alert('Could not cancel. Try again.');
    }
  };

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>Live Tracking</h2>
        <button className="cancel-btn" onClick={() => navigate('/home')}>✕</button>
      </div>

      <div className="map-placeholder">
        <div className="map-pulse" />
        <span className="map-icon">🔑</span>
        <p>Driver is on the way to your vehicle</p>
        <small>Connect Google Maps API for live map</small>
      </div>

      <div className="tracking-card">
        {loading ? (
          <p style={{ color: '#6a7a4a', textAlign: 'center', padding: '20px' }}>
            Loading booking details...
          </p>
        ) : booking ? (
          <>
            <div className="driver-info">
              <div className="driver-avatar">👤</div>
              <div>
                <p className="driver-name">{booking.driver_name}</p>
                <p className="driver-vehicle">Distance: {booking.distance?.toFixed(2)} km</p>
              </div>
              <div className="driver-rating">🔑 Driver</div>
            </div>

            <div className="vehicle-reminder">
              📋 Booking ID: {booking.booking_id}
            </div>

            <div className="status-timeline">
              {['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED'].map((step, i) => {
                const current = ['PENDING','ACCEPTED','EN_ROUTE','ARRIVED','COMPLETED']
                  .indexOf(booking.status);
                return (
                  <div key={step} className={`status-step ${i <= current ? 'done' : ''} ${i === current ? 'active' : ''}`}>
                    <div className="status-dot" />
                    <p>{step.replace('_', ' ')}</p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ color: '#ff4466', textAlign: 'center', padding: '20px' }}>
            ⚠️ Booking not found.
          </p>
        )}

        <div className="tracking-actions">
          <button className="action-btn">📞 Call Driver</button>
          <button className="action-btn danger" onClick={handleCancel}>❌ Cancel</button>
        </div>
      </div>
    </div>
  );
}