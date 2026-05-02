const API_BASE = 'http://localhost:4000/api';

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API error');
    }

    return data;
  },

  auth: {
    signup: (data) => api.request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => api.request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  },

  projects: {
    getAll: () => api.request('/projects'),
    create: (data) => api.request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  },

  tasks: {
    getAll: () => api.request('/tasks'),
    create: (data) => api.request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  },
};
