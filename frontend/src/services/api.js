import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (username, password) =>
  API.post('/api/auth/register', { username, password });

export const login = (username, password) =>
  API.post('/api/auth/login', { username, password });

// Booking
export const bookDriver = (user_id, pickup_lat, pickup_lng, destination) =>
  API.post('/api/bookings/book', { user_id, pickup_lat, pickup_lng, destination });

export const getBookings = () =>
  API.get('/api/bookings');

export const cancelBooking = (booking_id) =>
  API.post(`/api/bookings/${booking_id}/cancel`);