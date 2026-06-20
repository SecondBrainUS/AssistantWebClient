import axios from 'axios';
import { useUserStore } from '../store/userStore';

const API_URL      = import.meta.env.VITE_API_URL || '';
const API_BASE_PATH = import.meta.env.VITE_BASE_PATH || '';
const API_PATH     = import.meta.env.VITE_API_PATH || '/api/v1';
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

// In production, API_URL is absolute (https://api.sb.xelaxer.com).
// In dev, it's empty and API_BASE_PATH is used as a relative prefix.
const API_BASE = `${API_URL || API_BASE_PATH}${API_PATH}`;

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
    baseURL: API_BASE,
    withCredentials: true,
});

baseApi.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    if (MUTATING_METHODS.has(method)) {
        config.headers = config.headers ?? {};
        Object.assign(config.headers, csrfHeaders());
    }

    // Forward Cloudflare Access JWT so api.sb.xelaxer.com can validate it
    const cfToken = getCookie('CF_Authorization');
    if (cfToken) {
        config.headers = config.headers ?? {};
        config.headers['CF-Access-Token'] = cfToken;
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
                await fetch(`${API_BASE}/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        ...csrfHeaders(),
                        ...(getCookie('CF_Authorization') ? { 'CF-Access-Token': getCookie('CF_Authorization') } : {}),
                    },
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
