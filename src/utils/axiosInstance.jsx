import axios from 'axios';
import { ensureHttpsUrl } from './ensureHttpsUrl';

const axiosInstance = axios.create({
  baseURL: ensureHttpsUrl(
    process.env.REACT_APP_API_URL || 'https://amberspherebackend.mtc.com.na'
  ),
  headers: { 'Content-Type': 'application/json' },
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
