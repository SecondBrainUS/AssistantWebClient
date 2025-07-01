const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL ?? 'https';
const API_HOST = import.meta.env.VITE_API_HOST ?? 'localhost';
const API_PORT = import.meta.env.VITE_API_PORT ?? '';
const BASE_PATH = import.meta.env.VITE_BASE_PATH ?? '';
const API_PATH = import.meta.env.VITE_API_PATH ?? '';
export const API_BASE_PATH = `${BASE_PATH}${API_PATH}`
export const API_ORIGIN = `${API_PROTOCOL}://${API_HOST}${API_PORT ? `:${API_PORT}` : ''}`;
export const API_URL = `${API_ORIGIN}${API_BASE_PATH}`;

// Example composed endpoints
export const AUTH_ENDPOINTS = {
  loginRedirect: `${API_URL}/auth/google/login`,
  validateToken: `${API_URL}/auth/validate-token`,
  currentUser: `${API_URL}/auth/me`,
  logout: `${API_URL}/auth/logout`,
};
