import apiClient from './apiClient';
import { type User } from '../types/user';

export async function getCurrentUser(): Promise<User> {
	const res = await apiClient.get('/auth/me');
	return res.data;
}
  
export function logout(): Promise<void> {
	return apiClient.post('/auth/logout');
}