import axios, { type AxiosInstance } from 'axios';
import { API_URL } from '../config';

const apiClient: AxiosInstance = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	withCredentials: true,
});

const refreshClient: AxiosInstance = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	withCredentials: true,
});

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
				await refreshClient.post('/auth/refresh');
                // Retry the original request
				return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear any cached user data
                // We import dynamically to avoid circular dependencies
                const { clearUserCache } = await import('./authService');
                clearUserCache();
                
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
	}
)
export default apiClient;