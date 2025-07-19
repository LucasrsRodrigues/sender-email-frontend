import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getActiveSessions,
  getAuthStats,
  getProfile,
  type LoginData,
  login,
  logout,
  refreshToken,
  revokeAllSessions,
  revokeSession,
  type UpdateProfileData,
  updateProfile,
} from "../../api/auth";

// Queries
export const useProfile = () =>
  useQuery({
    queryKey: ["auth-profile"],
    queryFn: getProfile,
    retry: false, // Não tenta novamente se falhar (pode indicar não autenticado)
  });

export const useAuthStats = () =>
  useQuery({
    queryKey: ["auth-stats"],
    queryFn: getAuthStats,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

export const useActiveSessions = () =>
  useQuery({
    queryKey: ["active-sessions"],
    queryFn: getActiveSessions,
    refetchInterval: 60000, // Atualiza a cada minuto
  });

// Mutations
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: (response) => {
      // Armazena o token
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("tokenExpiresAt", response.data.expiresAt);

      // Invalida queries para recarregar dados
      queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Remove dados de autenticação
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");

      // Limpa todas as queries
      queryClient.clear();
    },
    onError: () => {
      // Mesmo com erro, limpa dados locais
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");
      queryClient.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-profile"] });
    },
  });
};

export const useRefreshToken = () =>
  useMutation({
    mutationFn: refreshToken,
    onSuccess: (response) => {
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("tokenExpiresAt", response.data.expiresAt);
    },
  });

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
    },
  });
};

export const useRevokeAllSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-sessions"] });
      // Se revogar todas, faz logout local também
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiresAt");
      queryClient.clear();
    },
  });
};
