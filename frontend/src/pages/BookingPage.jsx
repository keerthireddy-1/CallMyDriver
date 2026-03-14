import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/booking.css';

const vehicleOptions = [
  { id: 'bike', icon: '🛵', name: 'Bike / Scooter', time: '5 min', price: '₹80–120', tag: 'Popular' },
  { id: 'car', icon: '🚗', name: 'Car', time: '8 min', price: '₹150–220', tag: null },
  { id: 'suv', icon: '🚙', name: 'SUV / Big Car', time: '10 min', price: '₹220–300', tag: null },
];

export default function BookingPage() {
  const [currentLocation, setCurrentLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [selected, setSelected] = useState('bike');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBook = () => {
    if (!currentLocation || !destination) return alert('Please enter your current location and destination!');
    setLoading(true);
    // TODO: POST /book-driver
    setTimeout(() => {
      setLoading(false);
      navigate('/track');
    }, 1500);
  };

  return (
    <div className="booking-container">
      <div className="booking-header">
        <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
        <h2>Call a Driver</h2>
      </div>

      {/* Info banner */}
      <div className="info-banner">
        🔑 Our driver will come to <strong>your location</strong> and drive <strong>your vehicle</strong> to the destination.
      </div>

      <div className="location-inputs">
        <div className="loc-input">
          <span className="dot green" />
          <input
            value={currentLocation}
            onChange={e => setCurrentLocation(e.target.value)}
            placeholder="Where is your vehicle right now?"
          />
        </div>
        <div className="loc-line" />
        <div className="loc-input">
          <span className="dot red" />
          <input
            value={destination}
            onChange={e => setDestination(e.target.value)}
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

      <div className="booking-footer">
        <button className="btn-book" onClick={handleBook} disabled={loading}>
          {loading ? 'Finding Driver...' : `Call Driver for ${vehicleOptions.find(v => v.id === selected)?.name} →`}
        </button>
      </div>
    </div>
  );
}