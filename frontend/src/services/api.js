import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getToken() {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return null;
    return JSON.parse(stored)?.state?.token || null;
  } catch {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem('auth-storage');
}

function getTokenPayload() {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function shouldRefresh() {
  const payload = getTokenPayload();
  if (!payload?.exp) return false;
  const expiresIn = payload.exp * 1000 - Date.now();
  return expiresIn > 0 && expiresIn < 5 * 60 * 1000;
}

let refreshPromise = null;

async function refreshToken() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = api.post('/auth/refresh')
    .then((res) => {
      const newToken = res.data.data.token;
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.state.token = newToken;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
      }
      return newToken;
    })
    .catch(() => {
      clearAuth();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.request.use(async (config) => {
  if (shouldRefresh() && !config.url?.includes('/auth/')) {
    await refreshToken();
  }
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry && !error.config.url?.includes('/auth/')) {
      error.config._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
