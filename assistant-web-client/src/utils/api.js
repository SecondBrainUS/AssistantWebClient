import axios from 'axios';

const api = axios.create({
    baseURL: '/api',  // Just use /api instead of full URL
    withCredentials: true,
});

export default api;