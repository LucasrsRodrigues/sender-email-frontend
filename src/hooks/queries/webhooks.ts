import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type CreateWebhookData,
  createWebhook,
  deleteWebhook,
  getAvailableEvents,
  getWebhook,
  getWebhookHealth,
  getWebhookLogs,
  getWebhookStats,
  getWebhooks,
  testWebhook,
  type UpdateWebhookData,
  updateWebhook,
} from "../../api/webhooks";

// Queries
export const useWebhooks = () =>
  useQuery({
    queryKey: ["webhooks"],
    queryFn: getWebhooks,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

export const useWebhook = (id: string) =>
  useQuery({
    queryKey: ["webhook", id],
    queryFn: () => getWebhook(id),
    enabled: !!id,
  });

export const useWebhookLogs = (
  id: string,
  filters: {
    limit?: number;
    offset?: number;
    event?: string;
    success?: boolean;
    startDate?: string;
    endDate?: string;
  } = {},
) =>
  useQuery({
    queryKey: ["webhook-logs", id, filters],
    queryFn: () => getWebhookLogs(id, filters),
    enabled: !!id,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

export const useWebhookStats = (period = "week") =>
  useQuery({
    queryKey: ["webhook-stats", period],
    queryFn: () => getWebhookStats(period),
    refetchInterval: 60000, // Atualiza a cada minuto
  });

export const useAvailableEvents = () =>
  useQuery({
    queryKey: ["webhook-events"],
    queryFn: getAvailableEvents,
    staleTime: 600000, // 10 minutos
  });

export const useWebhookHealth = () =>
  useQuery({
    queryKey: ["webhook-health"],
    queryFn: getWebhookHealth,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

// Mutations
export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookData) => createWebhook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhook-health"] });
      queryClient.invalidateQueries({ queryKey: ["webhook-stats"] });
    },
  });
};

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookData }) =>
      updateWebhook(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhook", id] });
      queryClient.invalidateQueries({ queryKey: ["webhook-health"] });
    },
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      queryClient.invalidateQueries({ queryKey: ["webhook-health"] });
      queryClient.invalidateQueries({ queryKey: ["webhook-stats"] });
    },
  });
};

export const useTestWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, event }: { id: string; event?: string }) =>
      testWebhook(id, event),
    onSuccess: (_, { id }) => {
      // Invalida os logs para mostrar o teste recente
      queryClient.invalidateQueries({ queryKey: ["webhook-logs", id] });
      queryClient.invalidateQueries({ queryKey: ["webhook", id] });
    },
  });
};
