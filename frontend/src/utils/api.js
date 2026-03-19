import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('suraksha_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('suraksha_token');
      localStorage.removeItem('suraksha_user');
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──
export const authAPI = {
  register: (data)       => api.post('/auth/register', data),
  login: (data)          => api.post('/auth/login', data),
  getMe: ()              => api.get('/auth/me'),
  updateProfile: (data)  => api.patch('/auth/profile', data),
  updateLocation: (data) => api.patch('/auth/location', data),
};

// ── Alerts ──
export const alertAPI = {
  trigger: (data)          => api.post('/alerts', data),
  updateLocation: (id, d)  => api.patch(`/alerts/${id}/location`, d),
  resolve: (id, status)    => api.patch(`/alerts/${id}/resolve`, { status }),
  getMyAlerts: ()          => api.get('/alerts/my'),
};

// ── Zones ──
export const zoneAPI = {
  getAll: ()                  => api.get('/zones'),
  getNearby: (lat, lng, r)    => api.get('/zones/nearby', { params: { lat, lng, radius: r } }),
  report: (id)                => api.patch(`/zones/${id}/report`),
};

// ── Routes ──
export const routeAPI = {
  getSafeRoutes: (oLat, oLng, dLat, dLng) =>
    api.get('/routes/safe', { params: { originLat: oLat, originLng: oLng, destLat: dLat, destLng: dLng } }),
};

// ── Contacts ──
export const contactAPI = {
  getAll: ()     => api.get('/contacts'),
  add: (data)    => api.post('/contacts', data),
  remove: (id)   => api.delete(`/contacts/${id}`),
};

// ── Recordings ──
export const recordingAPI = {
  save: (data)   => api.post('/recordings', data),
  getAll: ()     => api.get('/recordings/my'),
};
