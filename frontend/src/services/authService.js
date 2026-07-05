import api from './api';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const debugAPI = {
  analyze: (data) => api.post('/debug/analyze', data),
  getLanguages: () => api.get('/debug/languages'),
  generatePDF: (data) => api.post('/debug/pdf', data, { responseType: 'blob' }),
  translate: (data) => api.post('/debug/translate', data),
  flowchart: (data) => api.post('/debug/flowchart', data),
};

export const historyAPI = {
  save: (data) => api.post('/history/save', data),
  getAll: (params = {}) => api.get('/history', { params }),
  getById: (id) => api.get(`/history/${id}`),
  delete: (id) => api.delete(`/history/${id}`),
  getStats: () => api.get('/history/stats'),
};

export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getLanguages: () => api.get('/chat/languages'),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};
