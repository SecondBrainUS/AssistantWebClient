import apiClient from './apiClient';
import { type User } from '../types/user';

interface LoginResponse {
	user: User;
	token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
	const res = await apiClient.post('/auth/google/login', { email, password });
	return res.data;
  }