import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateApiKeyData,
  createApiKey,
  deleteApiKey,
  getApiKey,
  getApiKeyStats,
  getApiKeys,
  getApiKeyUsage,
  regenerateApiKey,
  type UpdateApiKeyData,
  updateApiKey,
} from "../../api/apiKeys";

// Queries
export const useApiKeys = () =>
  useQuery({
    queryKey: ["api-keys"],
    queryFn: getApiKeys,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

export const useApiKey = (id: string) =>
  useQuery({
    queryKey: ["api-key", id],
    queryFn: () => getApiKey(id),
    enabled: !!id,
  });

export const useApiKeyStats = (period = "week") =>
  useQuery({
    queryKey: ["api-key-stats", period],
    queryFn: () => getApiKeyStats(period),
    refetchInterval: 60000, // Atualiza a cada minuto
  });

export const useApiKeyUsage = (id: string, period = "week") =>
  useQuery({
    queryKey: ["api-key-usage", id, period],
    queryFn: () => getApiKeyUsage(id, period),
    enabled: !!id,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

// Mutations
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyData) => createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-key-stats"] });
    },
  });
};

export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApiKeyData }) =>
      updateApiKey(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-key", id] });
      queryClient.invalidateQueries({ queryKey: ["api-key-stats"] });
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-key-stats"] });
    },
  });
};

export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => regenerateApiKey(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["api-key", id] });
    },
  });
};
