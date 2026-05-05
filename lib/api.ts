import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// We use a base Axios instance
// Note that the baseURL will be dynamically updated in the interceptor
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // Dynamically retrieve central base URL and JWT from Zustand
    const { jwt, apiBaseUrl } = useAuthStore.getState();

    if (apiBaseUrl) {
      config.baseURL = apiBaseUrl;
    } else {
      // Fallback base URL for the initial login call or central auth route
      // Check if it's the login route
      if (!config.baseURL && typeof window !== 'undefined') {
         // Default to an initial central auth service via env, or assume same domain /api/v1
         config.baseURL = process.env.NEXT_PUBLIC_CENTRAL_API_URL || ' http://localhost:4000/api/v1';
      }
    }
//http://34.204.174.3:4000/
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If we land a 401, automatically wipe local auth to force login
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
