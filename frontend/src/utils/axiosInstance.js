import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, ''),
    timeout: 100000,
    headers: {
        'Content-Type': 'multipart/form-data',
    }
});

axiosInstance.interceptors.request.use(
    (config) => config,
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('请求错误: ', error.response ? error.response.data : error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;
