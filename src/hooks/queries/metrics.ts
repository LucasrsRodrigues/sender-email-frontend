import { useQuery } from "@tanstack/react-query";
import { getBasicMetrics, getMetricsHealth, type IGetMetricsHealthResponse, type IGetMetricsResponse } from "../../api/metrics";

export const useDashboardMetrics = (period = "24h") => {
  return useQuery<IGetMetricsResponse>({
    queryKey: ["metrics", period],
    queryFn: () => getBasicMetrics(period),
    refetchInterval: 30000,
  });
};

export const useHealthCheckold = () => {
  return useQuery<IGetMetricsHealthResponse>({
    queryKey: ["health"],
    queryFn: () => getMetricsHealth(),
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });
};
