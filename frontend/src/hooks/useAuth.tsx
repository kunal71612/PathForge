import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/endpoints';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile?: {
    college?: string;
    degree?: string;
    branch?: string;
    year?: number;
    bio?: string;
    goalId?: string;
    interests?: string[];
    goal?: { id: string; name: string } | null;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('pathforge_token')
  );
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('pathforge_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    localStorage.setItem('pathforge_token', result.token);
    localStorage.setItem('pathforge_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
    // Fetch full profile info with goal
    try {
      const fullUser = await authApi.getMe();
      if (fullUser) {
        setUser(fullUser);
        localStorage.setItem('pathforge_user', JSON.stringify(fullUser));
      }
    } catch {
      // Keep basic user
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await authApi.register({ name, email, password });
    localStorage.setItem('pathforge_token', result.token);
    localStorage.setItem('pathforge_user', JSON.stringify(result.user));
    setToken(result.token);
    setUser(result.user);
  };

  const logout = () => {
    localStorage.removeItem('pathforge_token');
    localStorage.removeItem('pathforge_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
      localStorage.setItem('pathforge_user', JSON.stringify(userData));
    } catch (err: unknown) {
      // Only logout if status is explicitly 401 (token genuinely invalid/expired)
      const error = err as { status?: number; response?: { status?: number } };
      const status = error?.status || error?.response?.status;
      if (status === 401) {
        logout();
      } else {
        console.warn('PathForge: Session verification skipped due to transient server/network state');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
