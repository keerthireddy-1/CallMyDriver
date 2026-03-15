import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import TrackingPage from './pages/TrackingPage';
import OtpPage from './pages/OtpPage';
import LicensePage from './pages/LicensePage';
import SplashPage from './pages/SplashPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"               element={<SplashPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/home"           element={<HomePage />} />
        <Route path="/book"           element={<BookingPage />} />
        <Route path="/track"          element={<TrackingPage />} />
        <Route path="/verify-otp"     element={<OtpPage />} />
        <Route path="/verify-license" element={<LicensePage />} />
        <Route path="*"               element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;