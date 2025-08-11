/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api, {
  setAccessToken as setApiAccessToken,
  setLogoutHandler,
} from "./api";

interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (data: AuthResponse) => void;
  refreshUser: () => Promise<void>;
}

interface AuthResponse {
  accessToken: string;
  user?: User;
}
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<User>("/users/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch {
      setUser(null);
      localStorage.removeItem("user");
    }
  }, []);

  const setAuth = ({ accessToken: token, user }: AuthResponse) => {
    setAccessTokenState(token);
    setApiAccessToken(token);
    localStorage.setItem("accessToken", token);
    if (user) {
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
    }
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    setAuth(res.data);
    await refreshUser();
  };

  const register = async (name: string, email: string, password: string) => {
    const [firstName, ...rest] = name.trim().split(" ");
    const lastName = rest.join(" ") || "";
    await api.post("/auth/register", {
      firstName,
      lastName,
      email,
      password,
    });
  };

  const resendVerification = async (email: string) => {
    await api.post("/auth/resend-verification", { email });
  };

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore errors during logout
    }
    setUser(null);
    setAccessTokenState(null);
    setApiAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }, []);

  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    if (storedAccess) {
      setAccessTokenState(storedAccess);
      setApiAccessToken(storedAccess);
    }
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      void refreshUser();
    }
    setLogoutHandler(logout);
  }, [logout, refreshUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        login,
        register,
        resendVerification,
        logout,
        setAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
