import React, { type ReactNode, useEffect, useState } from "react";

type IAuthContextType = {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
};

interface IAuthProviderProps {
  children: ReactNode;
}

const AuthContext = React.createContext({} as IAuthContextType);

export const AuthProvider = ({ children }: IAuthProviderProps) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage?.getItem("authToken");
    const userData = localStorage?.getItem("userData");

    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Simulação de autenticação - substitua pela API real
      const mockUsers = [
        {
          username: "admin",
          password: "admin123",
          email: "admin@emailsystem.com",
          name: "Administrador",
          role: "admin",
          avatar: null,
        },
        {
          username: "user",
          password: "user123",
          email: "user@emailsystem.com",
          name: "Usuário",
          role: "user",
          avatar: null,
        },
      ];

      const user = mockUsers.find(
        (u) =>
          (u.username === credentials.username ||
            u.email === credentials.username) &&
          u.password === credentials.password,
      );

      if (user) {
        const token = `mock-jwt-token-${Date.now()}`;
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        };

        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        return { success: true, user: userData };
      } else {
        return { success: false, error: "Credenciais inválidas" };
      }
    } catch (error) {
      return { success: false, error: "Erro de conexão" };
    }
  };

  const logout = async () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    setIsAuthenticated(false);
  };

  const forgotPassword = async (email) => {
    try {
      // Simulação - substitua pela API real
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: "Email de recuperação enviado" };
    } catch (error) {
      return { success: false, error: "Erro ao enviar email" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
