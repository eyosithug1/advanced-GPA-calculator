import axios from 'axios';

const API_BASE = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gpa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gpa_token');
      localStorage.removeItem('gpa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ======= AUTH =======
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// ======= USER =======
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  deleteAccount: (data) => api.delete('/users/profile', { data })
};

// ======= SEMESTERS =======
export const semesterAPI = {
  getAll: () => api.get('/semesters'),
  getOne: (id) => api.get(`/semesters/${id}`),
  create: (data) => api.post('/semesters', data),
  update: (id, data) => api.put(`/semesters/${id}`, data),
  delete: (id) => api.delete(`/semesters/${id}`),
  recalculate: (id) => api.post(`/semesters/${id}/recalculate`)
};

// ======= COURSES =======
export const courseAPI = {
  getForSemester: (semesterId) => api.get(`/courses/semester/${semesterId}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`)
};

// ======= GPA =======
export const gpaAPI = {
  getCumulative: () => api.get('/gpa/cumulative'),
  predict: (futureSemesters) => api.post('/gpa/predict', { futureSemesters }),
  calculateTarget: (data) => api.post('/gpa/target', data),
  getAnalytics: () => api.get('/gpa/analytics')
};

export default api;
