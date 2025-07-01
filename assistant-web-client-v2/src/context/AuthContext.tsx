import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, logout as logoutApi } from '../services/authService';
import { type User } from '../types/user';

interface AuthContextType {
	user: User | null;
	login: (user: User | null) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: {children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		getCurrentUser()
		.then(setUser)
		.catch(() => {
		  setUser(null);
		});
	}, []);

	const logout = async () => {
		try {
		  await logoutApi();
		} catch (err) {
		  console.error('Logout failed:', err);
		}
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login: setUser, logout }}>
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