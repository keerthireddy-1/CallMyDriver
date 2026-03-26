import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/tracking.css';

// Fix default marker icons for Leaflet in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const carIcon = L.divIcon({
  html: '🚗',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const pinIcon = L.divIcon({
  html: '📍',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const STEPS = [
  'Finding a driver near you...',
  'Driver assigned – Ramesh K. ✓',
  'Driver is on the way to your vehicle (1.4 km)',
  'Driver reached your vehicle 📍',
  'En route to your destination 🏠',
  'Arrived safely! Trip complete ✅',
];

const stepsLength = STEPS.length;

// Bengaluru default coords
const PICKUP = [12.9716, 77.5946];
const DESTINATION = [12.9352, 77.6245];

// Animate car marker
function MovingCar({ step }) {
  const map = useMap();
  const markerRef = useRef(null);

  const getCarPos = (s) => {
    const lat = PICKUP[0] + ((DESTINATION[0] - PICKUP[0]) * s) / (stepsLength - 1);
    const lng = PICKUP[1] + ((DESTINATION[1] - PICKUP[1]) * s) / (stepsLength - 1);
    return [lat, lng];
  };

  useEffect(() => {
    const pos = getCarPos(step);
    if (markerRef.current) {
      markerRef.current.setLatLng(pos);
      map.panTo(pos, { animate: true });
    }
  }, [step, map]);

  return (
    <Marker
      position={getCarPos(0)}
      icon={carIcon}
      ref={markerRef}
    >
      <Popup>Driver is here</Popup>
    </Marker>
  );
}

export default function TrackingPage() {
  const [status, setStatus] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const navigate = useNavigate();
  const location = useLocation();

  const currentLocation = location.state?.currentLocation || 'Your Location';
  const destination = location.state?.destination || 'Destination';

  useEffect(() => {
    if (status >= stepsLength - 1) return;
    const timer = setTimeout(() => {
      setStatus((prev) => prev + 1);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearTimeout(timer);
  }, [status]);

  const refreshStatus = () => {
    setLastUpdated(new Date().toLocaleTimeString());
  };

  return (
    <div className="tracking-container">
      <div className="tracking-header">
        <h2>Driver Tracking</h2>
        <button className="cancel-btn" onClick={() => navigate('/home')}>✕</button>
      </div>

      {/* Leaflet Map */}
      <div style={{ height: '250px', width: '100%', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px' }}>
        <MapContainer
          center={PICKUP}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {/* Pickup marker */}
          <Marker position={PICKUP} icon={pinIcon}>
            <Popup>{currentLocation}</Popup>
          </Marker>
          {/* Destination marker */}
          <Marker position={DESTINATION} icon={pinIcon}>
            <Popup>{destination}</Popup>
          </Marker>
          {/* Moving car */}
          <MovingCar step={status} />
        </MapContainer>
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

        <div className="vehicle-reminder">
          🚗 {currentLocation} → {destination}
        </div>

        <div className="status-timeline">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`status-step ${i <= status ? 'done' : ''} ${i === status ? 'active' : ''}`}
            >
              <div className="status-dot" />
              <p>{step}</p>
            </div>
          ))}
        </div>

        <div className="tracking-actions">
          <button className="action-btn">📞 Call Driver</button>
          <button className="action-btn">💬 Message</button>
          <button className="action-btn danger" onClick={() => navigate('/home')}>
            ❌ Cancel
          </button>
          <button className="refresh-btn" onClick={refreshStatus}>
            ↻ Refresh Status · {lastUpdated}
          </button>
        </div>
      </div>
    </div>
  );
}