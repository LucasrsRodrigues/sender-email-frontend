// src/hooks/queries/analytics.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomReport,
  deleteCustomReport,
  exportAnalytics,
  getAnalyticsAlerts,
  getAnalyticsOverview,
  getComparativeAnalytics,
  getCustomReports,
  getEmailAnalytics,
  getRealTimeMetrics,
  getSecurityAnalytics,
  getSystemAnalytics,
  getUserAnalytics,
  runCustomReport,
  setAnalyticsThreshold,
} from "../../api/analytics";

// Analytics Queries
export const useEmailAnalytics = (period = "week") =>
  useQuery({
    queryKey: ["email-analytics", period],
    queryFn: () => getEmailAnalytics(period),
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });

export const useSystemAnalytics = (period = "week") =>
  useQuery({
    queryKey: ["system-analytics", period],
    queryFn: () => getSystemAnalytics(period),
    refetchInterval: 60000, // Atualiza a cada minuto
  });

export const useUserAnalytics = (period = "week") =>
  useQuery({
    queryKey: ["user-analytics", period],
    queryFn: () => getUserAnalytics(period),
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });

export const useSecurityAnalytics = (period = "week") =>
  useQuery({
    queryKey: ["security-analytics", period],
    queryFn: () => getSecurityAnalytics(period),
    refetchInterval: 300000, // Atualiza a cada 5 minutos
  });

export const useAnalyticsOverview = (period = "week") =>
  useQuery({
    queryKey: ["analytics-overview", period],
    queryFn: () => getAnalyticsOverview(period),
    refetchInterval: 120000, // Atualiza a cada 2 minutos
  });

// Real-time Metrics
export const useRealTimeMetrics = () =>
  useQuery({
    queryKey: ["realtime-metrics"],
    queryFn: getRealTimeMetrics,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

// Custom Reports
export const useCustomReports = () =>
  useQuery({
    queryKey: ["custom-reports"],
    queryFn: getCustomReports,
  });

export const useCreateCustomReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-reports"] });
    },
  });
};

export const useRunCustomReport = () =>
  useMutation({
    mutationFn: runCustomReport,
  });

export const useDeleteCustomReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-reports"] });
    },
  });
};

// Export and Comparison
export const useExportAnalytics = () =>
  useMutation({
    mutationFn: exportAnalytics,
  });

export const useComparativeAnalytics = () =>
  useMutation({
    mutationFn: getComparativeAnalytics,
  });

// Alerts and Thresholds
export const useAnalyticsAlerts = () =>
  useQuery({
    queryKey: ["analytics-alerts"],
    queryFn: getAnalyticsAlerts,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

export const useSetAnalyticsThreshold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setAnalyticsThreshold,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-alerts"] });
    },
  });
};