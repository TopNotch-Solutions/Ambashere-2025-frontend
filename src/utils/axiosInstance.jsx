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
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await axiosInstance.post('/auth/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
          },
        });

        const newToken = refreshResponse.data.token;
        const newRefreshToken = refreshResponse.data.refreshToken;

        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        if(originalRequest.customName){
          localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
        }else{
          localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
         window.location.replace("/");
        return Promise.reject(refreshError);
        }
        
      }
    }

    return Promise.reject(error);
  }
);


export default axiosInstance;
