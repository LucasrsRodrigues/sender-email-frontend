import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../api";
import { useProfile } from "../hooks/queries/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("authToken"),
  );
  const [user, setUser] = useState<User | null>(null);

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useProfile();

  // Sincroniza user com o profile da API
  useEffect(() => {
    if (profileData?.data?.user) {
      setUser(profileData.data.user);
    } else if (profileError) {
      // Se erro ao buscar profile, limpa autenticação
      setToken(null);
      setUser(null);
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");
    }
  }, [profileData, profileError]);

  // Verifica se token está expirado
  useEffect(() => {
    const checkTokenExpiration = () => {
      const expiresAt = localStorage.getItem("tokenExpiresAt");
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        // Token expirado
        setToken(null);
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiresAt");
      }
    };

    checkTokenExpiration();
    // Verifica a cada minuto
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("authToken", newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("tokenExpiresAt");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!token && !!user,
    isLoading: !!token && profileLoading, // Só loading se tem token
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
