import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({ baseURL: '/api' });

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('civic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise errors
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;

    if (!response) {
      toast.error('Network error — check your connection');
      throw { code: 'NETWORK_ERROR', message: 'No connection' };
    }

    const msg = response.data?.detail || response.data?.error?.message || 'Something went wrong';

    // Auto-retry 5xx up to 2×
    config._retry = config._retry ?? 0;
    if (response.status >= 500 && config._retry < 2) {
      config._retry++;
      await new Promise((r) => setTimeout(r, config._retry * 600));
      return api(config);
    }

    if (response.status === 401) {
      localStorage.removeItem('civic_token');
      localStorage.removeItem('civic_user');
      window.location.href = '/login';
    }

    throw { code: `HTTP_${response.status}`, message: msg, status: response.status };
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// ── Complaints ─────────────────────────────────────────────────────────────────
export const complaintsAPI = {
  create: (form: FormData) => api.post('/complaints/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: (params?: object) => api.get('/complaints/', { params }),
  get: (id: number) => api.get(`/complaints/${id}`),
  publicList: (params?: object) => api.get('/complaints/public', { params }),
  updateStatus: (id: number, data: object) => api.put(`/complaints/${id}/status`, data),
  rate: (id: number, data: object) => api.post(`/complaints/${id}/rate`, data),
  stats: () => api.get('/complaints/stats'),
  distribution: () => api.get('/complaints/distribution'),
};

// ── Users ──────────────────────────────────────────────────────────────────────
export const usersAPI = {
  officials: () => api.get('/users/officials'),
  leaderboard: () => api.get('/users/leaderboard'),
};
