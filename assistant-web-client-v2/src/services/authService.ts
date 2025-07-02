import apiClient from './apiClient';
import { type User } from '../types/user';

const USER_CACHE_KEY = 'user_cache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

interface CachedUser {
	user: User;
	timestamp: number;
}

function getCachedUser(): User | null {
	try {
		const cached = localStorage.getItem(USER_CACHE_KEY);
		if (!cached) return null;
		
		const { user, timestamp }: CachedUser = JSON.parse(cached);
		const now = Date.now();
		
		// Check if cache is still valid
		if (now - timestamp < CACHE_DURATION) {
			return user;
		}
		
		// Cache expired, remove it
		localStorage.removeItem(USER_CACHE_KEY);
		return null;
	} catch {
		localStorage.removeItem(USER_CACHE_KEY);
		return null;
	}
}

function setCachedUser(user: User): void {
	try {
		const cached: CachedUser = {
			user,
			timestamp: Date.now()
		};
		localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cached));
	} catch {
		// Ignore localStorage errors
	}
}

function clearCachedUser(): void {
	localStorage.removeItem(USER_CACHE_KEY);
}

export async function getCurrentUser(forceRefresh: boolean = false): Promise<User> {
	// Check cache first unless forcing refresh
	if (!forceRefresh) {
		const cachedUser = getCachedUser();
		if (cachedUser) {
			return cachedUser;
		}
	}
	
	// Make API call
	const res = await apiClient.get('/auth/me');
	const user = res.data;
	
	// Cache the result
	setCachedUser(user);
	
	return user;
}

export function logout(): Promise<void> {
	clearCachedUser();
	return apiClient.post('/auth/logout');
}

export function clearUserCache(): void {
	clearCachedUser();
}