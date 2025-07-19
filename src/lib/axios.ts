import axios from "axios";
import { env } from "@/env";

export const apiClient = axios.create({
  baseURL: env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token automaticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se token expirado ou inválido, limpa dados locais
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");

      // Se não está na página de login, redireciona
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);