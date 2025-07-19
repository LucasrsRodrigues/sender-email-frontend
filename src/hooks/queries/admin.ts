import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard, getAdminStats, searchAdmin } from "../../api/admin";
import {
  getQueueStatus,
  type IGetQueueStatusResponse,
} from "../../api/metrics";

export const useQueueStatus = () => {
  return useQuery<IGetQueueStatusResponse>({
    queryKey: ["queue-status"],
    queryFn: () => getQueueStatus(),
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });
};

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

export const useAdminStats = (period = "week") =>
  useQuery({
    queryKey: ["admin-stats", period],
    queryFn: () => getAdminStats(period),
    refetchInterval: 60000, // Atualiza a cada minuto
  });

export const useAdminSearch = (query: string, type?: string) =>
  useQuery({
    queryKey: ["admin-search", query, type],
    queryFn: () => searchAdmin(query, type),
    enabled: !!query && query.length > 2, // Só busca com 3+ caracteres
  });
