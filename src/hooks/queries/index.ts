import { useQuery } from "@tanstack/react-query";

import {
  getAllowedIPs,
  getBasicMetrics,
  getBlockedDomains,
  getConfigCategories,
  getConfigHistory,
  getConfigsByCategory,
  getEmailFlows,
  getEmailLogs,
  getEmailStatus,
  getFlowStats,
  getFlowStatus,
  getHealthCheck,
  getQueueStats,
  getQueueStatus,
  getTemplate,
  getTemplateHistory,
  getTemplates,
} from "@/api"; // Ajuste o caminho conforme sua estrutura

// ------------------ DASHBOARD ------------------
export const useDashboardMetrics = (period = "24h") =>
  useQuery({
    queryKey: ["metrics", period],
    queryFn: () => getBasicMetrics(period),
    refetchInterval: 30000,
  });

export const useHealthCheck = () =>
  useQuery({
    queryKey: ["health"],
    queryFn: getHealthCheck,
    refetchInterval: 10000,
  });

// ------------------ QUEUE ------------------
export const useQueueStatus = () =>
  useQuery({
    queryKey: ["queue-status"],
    queryFn: getQueueStatus,
    refetchInterval: 5000,
  });

export const useQueueStats = () =>
  useQuery({
    queryKey: ["queue-stats"],
    queryFn: getQueueStats,
    refetchInterval: 10000,
  });

// ------------------ EMAIL ------------------
export const useEmailStatus = (logId: string) =>
  useQuery({
    queryKey: ["email-status", logId],
    queryFn: () => getEmailStatus(logId),
    enabled: !!logId,
  });

export const useEmailLogs = (filters: Record<string, any> = {}) =>
  useQuery({
    queryKey: ["email-logs", filters],
    queryFn: () => getEmailLogs(filters),
    refetchInterval: 30000,
  });

export const useEmailFlows = (limit = 50) =>
  useQuery({
    queryKey: ["email-flows", limit],
    queryFn: () => getEmailFlows(limit),
  });

export const useFlowStats = (period = "day") =>
  useQuery({
    queryKey: ["flow-stats", period],
    queryFn: () => getFlowStats(period),
  });

export const useFlowStatus = (flowId: string) =>
  useQuery({
    queryKey: ["flow-status", flowId],
    queryFn: () => getFlowStatus(flowId),
    enabled: !!flowId,
  });

// ------------------ TEMPLATES ------------------
export const useTemplates = () =>
  useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates,
  });

export const useTemplate = (name: string) =>
  useQuery({
    queryKey: ["template", name],
    queryFn: () => getTemplate(name),
    enabled: !!name,
  });

export const useTemplateHistory = (name: string) =>
  useQuery({
    queryKey: ["template-history", name],
    queryFn: () => getTemplateHistory(name),
    enabled: !!name,
  });

// ------------------ SECURITY ------------------
export const useAllowedIPs = () =>
  useQuery({
    queryKey: ["allowed-ips"],
    queryFn: getAllowedIPs,
  });

export const useBlockedDomains = () =>
  useQuery({
    queryKey: ["blocked-domains"],
    queryFn: getBlockedDomains,
  });

// ------------------ CONFIG ------------------
export const useConfigCategories = () =>
  useQuery({
    queryKey: ["config-categories"],
    queryFn: getConfigCategories,
  });

export const useConfigsByCategory = (category: string) =>
  useQuery({
    queryKey: ["configs", category],
    queryFn: () => getConfigsByCategory(category),
    enabled: !!category,
  });

export const useConfigHistory = (key: string) =>
  useQuery({
    queryKey: ["config-history", key],
    queryFn: () => getConfigHistory(key),
    enabled: !!key,
  });
