const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api/v1`
  : '/api/v1';

const TOKEN_KEY = 'tenant_jwt_token';
const CLIENT_KEY = 'tenant_client_info';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getClient: () => {
    try {
      const raw = localStorage.getItem(CLIENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setClient: (client) => localStorage.setItem(CLIENT_KEY, JSON.stringify(client)),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CLIENT_KEY);
  },
  isAuthenticated: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

/**
 * Core fetch wrapper with automatic JWT header and standardized error parsing
 */
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Parse JSON response safely
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    // If unauthorized, clean stored session
    if (response.status === 401 && !endpoint.includes('/auth/token')) {
      authStorage.clear();
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    const errorMessage = data?.error?.message || `HTTP ${response.status}: Request failed`;
    const errorCode = data?.error?.code || 'REQUEST_FAILED';

    const err = new Error(errorMessage);
    err.code = errorCode;
    err.status = response.status;
    throw err;
  }

  return data;
}

export const api = {
  // Client Registration
  registerClient: (payload) =>
    request('/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Exchange credentials for JWT
  login: async (clientId, clientSecret) => {
    const data = await request('/auth/token', {
      method: 'POST',
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (data?.access_token) {
      authStorage.setToken(data.access_token);
      authStorage.setClient(data.client || { client_id: clientId });
    }
    return data;
  },

  // Users CRUD
  getUsers: ({ search = '', status = 'all' } = {}) => {
    const params = new URLSearchParams();
    if (search && search.trim()) params.append('search', search.trim());
    if (status && status !== 'all') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/users${query}`);
  },

  getUser: (id) => request(`/users/${id}`),

  createUser: (userData) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateUser: (id, userData) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Activity logs & Usage
  getActivity: () => request('/activity'),

  // AI Activity Insights
  getInsights: () => request('/insights'),
};
