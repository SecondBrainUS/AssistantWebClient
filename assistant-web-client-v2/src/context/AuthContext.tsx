import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, logout as logoutApi, clearUserCache } from '../services/authService';
import { type User } from '../types/user';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (user: User | null) => void;
	logout: () => void;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: {children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	const loadUser = async (forceRefresh: boolean = false) => {
		try {
			setLoading(true);
			const userData = await getCurrentUser(forceRefresh);
			setUser(userData);
		} catch (err) {
			console.warn('Failed to load user:', err);
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadUser();
	}, []);

	const logout = async () => {
		try {
			await logoutApi();
		} catch (err) {
			console.error('Logout failed:', err);
		}
		clearUserCache();
		setUser(null);
	};

	const refreshUser = async () => {
		await loadUser(true); // Force refresh from API
	};

	return (
		<AuthContext.Provider value={{ user, loading, login: setUser, logout, refreshUser }}>
		  {children}
		</AuthContext.Provider>
	);
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
	  throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};