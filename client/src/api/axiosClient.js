import axios from 'axios';

/**
 * Pre-configured Axios instance for all API calls.
 *
 * Base URL is read from the VITE_API_BASE_URL environment variable so it can
 * be overridden per environment. In development the Vite proxy forwards /api
 * requests to the Express server, so the default empty string works fine.
 *
 * A 10-second timeout is applied to every request.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor — attaches the JWT from localStorage to every outgoing
 * request as an Authorization: Bearer header.  The token is read directly from
 * localStorage (rather than from AuthContext) because this Axios instance is
 * created outside the React component tree.
 */
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor — handles 401 Unauthorized responses globally.
 * On a 401 the stale token is removed from localStorage and the user is
 * redirected to /login.  All other errors are re-thrown so individual
 * callers can handle them as needed.
 */
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
