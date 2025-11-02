import axios from 'axios';
import { useUserStore } from '../store/userStore';

const API_BASE_PATH = import.meta.env.VITE_BASE_PATH || '';
const API_PATH = import.meta.env.VITE_API_PATH || '/api/v1';

const baseApi = axios.create({
    baseURL: `${API_BASE_PATH}${API_PATH}`,
    withCredentials: true,
});

// Add response interceptor to handle 401 errors
baseApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if ((error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                await fetch(`${API_BASE_PATH}${API_PATH}/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                });
                
                // Retry the original request
                return baseApi(originalRequest);
            } catch (refreshError) {
                // If refresh fails, logout the user
                const userStore = useUserStore();
                await userStore.logout();
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default baseApi;