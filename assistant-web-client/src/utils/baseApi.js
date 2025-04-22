import axios from 'axios';
import { useUserStore } from '../store/userStore';

const baseApi = axios.create({
    baseURL: '/assistant/api/v1',
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
                await fetch('/assistant/api/v1/auth/refresh', {
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