import axios from 'axios';
import { ensureHttpsUrl } from './ensureHttpsUrl';

const axiosInstance = axios.create({
  baseURL: ensureHttpsUrl(
    process.env.REACT_APP_API_URL || 'https://ambaspherebackend.mtc.com.na'
  ),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.baseURL) {
      config.baseURL = ensureHttpsUrl(config.baseURL);
    }
    if (config.url) {
      config.url = ensureHttpsUrl(config.url);
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    if (config.csrfToken) {
      config.headers['X-CSRF-Token'] = config.csrfToken;
    }

    // Let the browser set multipart boundary for file uploads
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers && typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      } else if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');

      if (!originalRequest?.customName) {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
