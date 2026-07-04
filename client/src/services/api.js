import axios from 'axios';
import { store } from '../store/index.js';
import { logoutSuccess } from '../features/auth/authSlice.js';

// Use environment variable if provided, otherwise default to relative URL (which uses Vite proxy)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // enables sending cookies like refreshToken
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh tokens on 401 Unauthorized
// Skip refresh for auth endpoints — a 401 on login means bad credentials, not expired token
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/send-otp', '/auth/verify-otp', '/auth/google-login', '/auth/refresh-token'];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';

    // Don't attempt token refresh for auth endpoints
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    // Avoid infinite loops, and skip auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        // Request token refresh
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshRes.data.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed → Force Logout
        store.dispatch(logoutSuccess());
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
