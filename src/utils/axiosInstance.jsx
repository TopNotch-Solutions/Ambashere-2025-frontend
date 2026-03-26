import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:4000',
   baseURL: 'http://172.19.13.140:4000',
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(
  (config) => {
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
