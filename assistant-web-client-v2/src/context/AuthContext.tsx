import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from '../types/user';

interface AuthContextType {
	user: User | null;
	login: (user: User, token: string) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: {children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		
	})
}