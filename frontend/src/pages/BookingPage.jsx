import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookDriver } from '../services/api';
import '../styles/booking.css';

const vehicleOptions = [
  { id: 'bike', icon: '🛵', name: 'Bike / Scooter', time: '5 min', price: '₹80–120', tag: 'Popular' },
  { id: 'car',  icon: '🚗', name: 'Car',            time: '8 min', price: '₹150–220', tag: null },
  { id: 'suv',  icon: '🚙', name: 'SUV / Big Car',  time: '10 min', price: '₹220–300', tag: null },
];

export default function BookingPage() {
  const [pickup, setPickup]       = useState('');
  const [destination, setDest]    = useState('');
  const [selected, setSelected]   = useState('bike');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const navigate = useNavigate();

  const handleBook = async () => {
    if (!pickup || !destination) return setError('Please enter both pickup and destination!');
    setLoading(true);
    setError('');
    try {
      const user_id = localStorage.getItem('user_id') || 'guest';
      // Using fixed coords for now — swap with real GPS later
      const res = await bookDriver(user_id, 12.9716, 77.5946, destination);
      // Save booking id for tracking
      localStorage.setItem('booking_id', res.data.booking_id);
      navigate('/track');
    } catch (err) {
      setError(err.response?.data?.detail || 'No drivers available right now. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
        <h2>Call a Driver</h2>
      </div>

      <div className="info-banner">
        🔑 Our driver will come to <strong>your location</strong> and drive <strong>your vehicle</strong> to the destination.
      </div>

      <div className="location-inputs">
        <div className="loc-input">
          <span className="dot green" />
          <input
            value={pickup}
            onChange={e => setPickup(e.target.value)}
            placeholder="Where is your vehicle right now?"
          />
        </div>
        <div className="loc-line" />
        <div className="loc-input">
          <span className="dot red" />
          <input
            value={destination}
            onChange={e => setDest(e.target.value)}
            placeholder="Where should driver take it?"
          />
        </div>
      </div>

      <div className="ride-options">
        <p className="section-label">Your Vehicle Type</p>
        {vehicleOptions.map((v) => (
          <div
            key={v.id}
            className={`ride-option ${selected === v.id ? 'active' : ''}`}
            onClick={() => setSelected(v.id)}
          >
            <span className="ride-icon">{v.icon}</span>
            <div className="ride-info">
              <p>{v.name} {v.tag && <span className="ride-tag">{v.tag}</span>}</p>
              <small>Driver arrives in ~{v.time}</small>
            </div>
            <p className="ride-price">{v.price}</p>
          </div>
        ))}
      </div>

      {error && <p style={{ color: '#ff4466', padding: '0 20px', fontSize: '0.85rem' }}>⚠️ {error}</p>}

      <div className="booking-footer">
        <button className="btn-book" onClick={handleBook} disabled={loading}>
          {loading ? 'Finding Driver...' : `Call Driver for ${vehicleOptions.find(v => v.id === selected)?.name} →`}
        </button>
      </div>
    </div>
  );
}