import axios from 'axios';
import { useUserStore } from '../store/userStore';

const API_BASE_PATH = import.meta.env.VITE_BASE_PATH || '';
const API_PATH = import.meta.env.VITE_API_PATH || '/api/v1';
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

function getCookie(name) {
    const cookieName = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(cookieName));

    if (!cookie) {
        return null;
    }

    return decodeURIComponent(cookie.slice(cookieName.length));
}

function csrfHeaders() {
    const token = getCookie('csrf_token');
    return token ? { 'X-CSRF-Token': token } : {};
}

const baseApi = axios.create({
    baseURL: `${API_BASE_PATH}${API_PATH}`,
    withCredentials: true,
});

baseApi.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    if (MUTATING_METHODS.has(method)) {
        config.headers = config.headers ?? {};
        Object.assign(config.headers, csrfHeaders());
    }

    return config;
});

// Add response interceptor to handle 401 errors
baseApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const url = originalRequest?.url || '';
        const isAuthRecoveryEndpoint = url.includes('/auth/refresh') || url.includes('/auth/logout');

        if ((status === 401 || status === 403) && !originalRequest._retry && !isAuthRecoveryEndpoint) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token
                await fetch(`${API_BASE_PATH}${API_PATH}/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: csrfHeaders(),
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
