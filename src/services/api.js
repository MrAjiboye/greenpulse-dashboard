import axios from 'axios';

// Base API URL — override with VITE_API_URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't fire during a login attempt itself
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/auth/me', data);
    return response.data;
  },

  getOAuthUrl: async (provider) => {
    const response = await api.get(`/auth/${provider}/authorize`);
    return response.data; // { authorization_url: "..." }
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data; // { access_token, token_type }
  },

  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getRecentEnergy: async (limit = 24) => {
    const response = await api.get(`/dashboard/recent-energy?limit=${limit}`);
    return response.data;
  },
  
  getWasteBreakdown: async (days = 30) => {
    const response = await api.get(`/dashboard/waste-breakdown?days=${days}`);
    return response.data;
  }
};

// Energy APIs
export const energyAPI = {
  getCurrent: async () => {
    const response = await api.get('/energy/current');
    return response.data;
  },
  
  getTrends: async (hours = 24) => {
    const response = await api.get(`/energy/trends?hours=${hours}`);
    return response.data;
  },
  
  getAnomalies: async () => {
    const response = await api.get('/energy/anomalies');
    return response.data;
  },

  getZones: async () => {
    const response = await api.get('/energy/zones');
    return response.data;
  },

  compare: async (period = 'this_month', compareTo = 'last_month') => {
    const response = await api.get(`/energy/compare?period=${period}&compare_to=${compareTo}`);
    return response.data;
  },
};

// Waste APIs
export const wasteAPI = {
  getBreakdown: async (days = 30) => {
    const response = await api.get(`/waste/breakdown?days=${days}`);
    return response.data;
  },
  
  getLogs: async (limit = 50, offset = 0) => {
    const response = await api.get(`/waste/logs?limit=${limit}&offset=${offset}`);
    return response.data;
  },
  
  getContaminationAlerts: async () => {
    const response = await api.get('/waste/contamination-alerts');
    return response.data;
  },
  
  createLog: async (logData) => {
    const response = await api.post('/waste/logs', logData);
    return response.data;
  },

  resolveAlert: async (id) => {
    const response = await api.patch(`/waste/contamination-alerts/${id}/resolve`);
    return response.data;
  },

  compare: async (period = 'this_month', compareTo = 'last_month') => {
    const response = await api.get(`/waste/compare?period=${period}&compare_to=${compareTo}`);
    return response.data;
  },
};

// Insights APIs
export const insightsAPI = {
  getList: async (status = null, category = null) => {
    let url = '/insights/';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/insights/${id}`);
    return response.data;
  },
  
  apply: async (id, reason = null) => {
    const response = await api.post(`/insights/${id}/apply`, { 
      action: 'applied',
      reason 
    });
    return response.data;
  },
  
  dismiss: async (id, reason = null) => {
    const response = await api.post(`/insights/${id}/dismiss`, { 
      action: 'dismissed',
      reason 
    });
    return response.data;
  }
};

// Reports APIs
export const reportsAPI = {
  getPerformance: async (months = 6) => {
    const response = await api.get(`/reports/performance?months=${months}`);
    return response.data;
  },
  
  getInsightsLog: async (limit = 50, offset = 0) => {
    const response = await api.get(`/reports/insights-log?limit=${limit}&offset=${offset}`);
    return response.data;
  }
};

// Notifications APIs
export const notificationsAPI = {
  getList: async () => {
    const response = await api.get('/notifications/');
    return response.data;
  },

  markRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }
};

// Admin APIs
export const adminAPI = {
  getUsers: async (limit = 20, offset = 0) => {
    const response = await api.get('/admin/users', { params: { limit, offset } });
    return response.data;
  },

  updateRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  toggleStatus: async (userId, is_active) => {
    const response = await api.patch(`/admin/users/${userId}/status`, { is_active });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getOrganizations: async (limit = 100, offset = 0) => {
    const response = await api.get('/admin/organizations', { params: { limit, offset } });
    return response.data;
  },
};

const _qs = (orgId) => orgId ? `?organization_id=${orgId}` : '';

export const mlAPI = {
  getStatus:        async ()        => (await api.get('/admin/ml/status')).data,
  train:            async (orgId)   => (await api.post(`/admin/ml/train${_qs(orgId)}`)).data,
  trainAndInsights: async (orgId)   => (await api.post(`/admin/ml/train-and-insights${_qs(orgId)}`)).data,
  generateInsights: async (orgId)   => (await api.post(`/admin/ml/generate-insights${_qs(orgId)}`)).data,
  getAnomalies:     async (orgId)   => (await api.get(`/admin/ml/anomalies${_qs(orgId)}`)).data,
  getForecast:      async (orgId)   => (await api.get(`/admin/ml/forecast${_qs(orgId)}`)).data,
};

export const carbonAPI = {
  getSummary:   async () => (await api.get('/carbon/summary')).data,
  getTrends:    async (months = 12) => (await api.get(`/carbon/trends?months=${months}`)).data,
  getBreakdown: async () => (await api.get('/carbon/breakdown')).data,
};

export const goalsAPI = {
  getList: async () => (await api.get('/goals')).data,
  create:  async (data) => (await api.post('/goals', data)).data,
  update:  async (id, data) => (await api.patch(`/goals/${id}`, data)).data,
  delete:  async (id) => api.delete(`/goals/${id}`),
};

export const teamAPI = {
  getMembers:    async () => (await api.get('/team/members')).data,
  getInvites:    async () => (await api.get('/team/invites')).data,
  invite:        async (data) => (await api.post('/team/invite', data)).data,
  updateRole:    async (uid, role) => (await api.patch(`/team/members/${uid}/role`, { role })).data,
  removeMember:  async (uid) => api.delete(`/team/members/${uid}`),
  getInviteInfo: async (token) => (await api.get(`/team/accept-invite?token=${encodeURIComponent(token)}`)).data,
  acceptInvite:  async (data) => (await api.post('/team/accept-invite', data)).data,
};

export const ingestAPI = {
  sendReading: async (data) => (await api.post('/ingest/reading', data)).data,
};

export const importAPI = {
  energyCsv: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return (await api.post('/ingest/energy/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
  wasteCsv: async (file) => {
    const form = new FormData();
    form.append('file', file);
    return (await api.post('/ingest/waste/csv', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
  },
};

export const billingAPI = {
  createCheckoutSession: async (plan) => (await api.post('/billing/create-checkout-session', { plan })).data,
  getStatus: async () => (await api.get('/billing/status')).data,
};

export const octopusAPI = {
  getStatus:   async () => (await api.get('/octopus/status')).data,
  connect:     async (data) => (await api.post('/octopus/connect', data)).data,
  sync:        async () => (await api.post('/octopus/sync')).data,
  disconnect:  async () => (await api.delete('/octopus/disconnect')).data,
};

export const demoAPI = {
  request: async (data) => (await api.post('/demo/request', data)).data,
};

export default api;