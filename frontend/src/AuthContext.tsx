/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api, {
  setAccessToken as setApiAccessToken,
  setRefreshToken as setApiRefreshToken,
  setLogoutHandler,
} from './api';

interface User {
  id?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (data: AuthResponse) => void;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const setAuth = ({
    accessToken: token,
    refreshToken,
    user: authUser,
  }: AuthResponse) => {
    setAccessTokenState(token);
    setApiAccessToken(token);
    setApiRefreshToken(refreshToken);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    if (authUser) {
      setUser(authUser);
      localStorage.setItem('user', JSON.stringify(authUser));
    } else {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/login', { email, password });
    setAuth(res.data);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    setAuth(res.data);
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    setApiAccessToken(null);
    setApiRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const storedAccess = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');
    if (storedAccess && storedRefresh) {
      setAccessTokenState(storedAccess);
      setApiAccessToken(storedAccess);
      setApiRefreshToken(storedRefresh);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLogoutHandler(logout);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        login,
        register,
        logout,
        setAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
