// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getBasicMetrics } from "../api/metrics";

// const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// // Função auxiliar para fazer requests
// const fetchAPI = async (endpoint, options = {}) => {
//   const token = localStorage.getItem("authToken");

//   const response = await fetch(`${API_BASE}${endpoint}`, {
//     headers: {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers,
//     },
//     ...options,
//   });

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// };

// // Dashboard Hooks
// export const useDashboardMetricsold = (period = "24h") => {
//   return useQuery({
//     queryKey: ["metrics", period],
//     queryFn: () => getBasicMetrics(period),
//     refetchInterval: 30000, // Atualiza a cada 30 segundos
//   });
// };

// export const useHealthCheckold = () => {
//   return useQuery({
//     queryKey: ["health"],
//     queryFn: () => fetchAPI("/metrics/health"),
//     refetchInterval: 10000, // Atualiza a cada 10 segundos
//   });
// };

// // Email Hooks
// export const useSendEmail = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (emailData) =>
//       fetchAPI("/email/send", {
//         method: "POST",
//         body: JSON.stringify(emailData),
//       }),
//     onSuccess: () => {
//       // Invalidar métricas para atualizar dashboard
//       queryClient.invalidateQueries({ queryKey: ["metrics"] });
//       queryClient.invalidateQueries({ queryKey: ["email-logs"] });
//     },
//   });
// };

// export const useEmailStatus = (logId) => {
//   return useQuery({
//     queryKey: ["email-status", logId],
//     queryFn: () => fetchAPI(`/email/status/${logId}`),
//     enabled: !!logId,
//   });
// };

// // Templates Hooks
// export const useTemplates = () => {
//   return useQuery({
//     queryKey: ["templates"],
//     queryFn: () => fetchAPI("/admin/templates"),
//   });
// };

// export const useTemplate = (name) => {
//   return useQuery({
//     queryKey: ["template", name],
//     queryFn: () => fetchAPI(`/admin/templates/${name}`),
//     enabled: !!name,
//   });
// };

// export const useCreateTemplate = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (templateData) =>
//       fetchAPI("/admin/templates", {
//         method: "POST",
//         body: JSON.stringify(templateData),
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["templates"] });
//     },
//   });
// };

// export const useUpdateTemplate = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ name, data }) =>
//       fetchAPI(`/admin/templates/${name}`, {
//         method: "PUT",
//         body: JSON.stringify(data),
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["templates"] });
//     },
//   });
// };

// export const useToggleTemplate = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ name, isActive, updatedBy }) =>
//       fetchAPI(`/admin/templates/${name}/toggle`, {
//         method: "PUT",
//         body: JSON.stringify({ isActive, updatedBy }),
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["templates"] });
//     },
//   });
// };

// export const useTemplatePreview = () => {
//   return useMutation({
//     mutationFn: ({ name, variables }) =>
//       fetchAPI(`/admin/templates/${name}/preview`, {
//         method: "POST",
//         body: JSON.stringify(variables),
//       }),
//   });
// };

// export const useTemplateHistory = (name) => {
//   return useQuery({
//     queryKey: ["template-history", name],
//     queryFn: () => fetchAPI(`/admin/templates/${name}/history`),
//     enabled: !!name,
//   });
// };

// // Queue Hooks
// export const useQueueStatusold = () => {
//   return useQuery({
//     queryKey: ["queue-status"],
//     queryFn: () => fetchAPI("/admin/queue/status"),
//     refetchInterval: 5000, // Atualiza a cada 5 segundos
//   });
// };

// export const useQueueStats = () => {
//   return useQuery({
//     queryKey: ["queue-stats"],
//     queryFn: () => fetchAPI("/admin/queue/stats"),
//     refetchInterval: 10000,
//   });
// };

// export const usePauseQueue = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: () => fetchAPI("/admin/queue/pause", { method: "POST" }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["queue-status"] });
//     },
//   });
// };

// export const useResumeQueue = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: () => fetchAPI("/admin/queue/resume", { method: "POST" }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["queue-status"] });
//     },
//   });
// };

// export const useRetryFailedJobs = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (limit) =>
//       fetchAPI(`/admin/queue/retry-failed?limit=${limit}`, {
//         method: "POST",
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["queue-status"] });
//       queryClient.invalidateQueries({ queryKey: ["queue-stats"] });
//     },
//   });
// };

// export const useCleanQueue = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ grace, status }) =>
//       fetchAPI(`/admin/queue/clean?grace=${grace}&status=${status}`, {
//         method: "DELETE",
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["queue-status"] });
//       queryClient.invalidateQueries({ queryKey: ["queue-stats"] });
//     },
//   });
// };

// // Security Hooks
// export const useAllowedIPs = () => {
//   return useQuery({
//     queryKey: ["allowed-ips"],
//     queryFn: () => fetchAPI("/admin/config/allowed-ips"),
//   });
// };

// export const useAddAllowedIP = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (ipData) =>
//       fetchAPI("/admin/config/allowed-ips", {
//         method: "POST",
//         body: JSON.stringify(ipData),
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["allowed-ips"] });
//     },
//   });
// };

// export const useRemoveAllowedIP = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (ip) =>
//       fetchAPI(`/admin/config/allowed-ips/${ip}`, {
//         method: "DELETE",
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["allowed-ips"] });
//     },
//   });
// };

// export const useBlockedDomains = () => {
//   return useQuery({
//     queryKey: ["blocked-domains"],
//     queryFn: () => fetchAPI("/admin/config/blocked-domains"),
//   });
// };

// export const useAddBlockedDomain = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (domainData) =>
//       fetchAPI("/admin/config/blocked-domains", {
//         method: "POST",
//         body: JSON.stringify(domainData),
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
//     },
//   });
// };

// export const useRemoveBlockedDomain = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (domain) =>
//       fetchAPI(`/admin/config/blocked-domains/${domain}`, {
//         method: "DELETE",
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
//     },
//   });
// };

// // Config Hooks
// export const useConfigCategories = () => {
//   return useQuery({
//     queryKey: ["config-categories"],
//     queryFn: () => fetchAPI("/admin/config/categories"),
//   });
// };

// export const useConfigsByCategory = (category) => {
//   return useQuery({
//     queryKey: ["configs", category],
//     queryFn: () => fetchAPI(`/admin/config/category/${category}`),
//     enabled: !!category,
//   });
// };

// export const useUpdateConfig = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ key, value, changedBy, reason }) =>
//       fetchAPI(`/admin/config/${key}`, {
//         method: "PUT",
//         body: JSON.stringify({ value, changedBy, reason }),
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["configs"] });
//     },
//   });
// };

// export const useConfigHistory = (key) => {
//   return useQuery({
//     queryKey: ["config-history", key],
//     queryFn: () => fetchAPI(`/admin/config/${key}/history`),
//     enabled: !!key,
//   });
// };

// // Logs Hooks
// export const useEmailLogs = (filters = {}) => {
//   const queryParams = new URLSearchParams();

//   Object.entries(filters).forEach(([key, value]) => {
//     if (value) queryParams.append(key, value);
//   });

//   return useQuery({
//     queryKey: ["email-logs", filters],
//     queryFn: () => fetchAPI(`/email/logs?${queryParams.toString()}`),
//     refetchInterval: 30000,
//   });
// };

// // Flows Hooks
// export const useEmailFlows = (limit = 50) => {
//   return useQuery({
//     queryKey: ["email-flows", limit],
//     queryFn: () => fetchAPI(`/email/flows?limit=${limit}`),
//   });
// };

// export const useFlowStats = (period = "day") => {
//   return useQuery({
//     queryKey: ["flow-stats", period],
//     queryFn: () => fetchAPI(`/email/flows/stats?period=${period}`),
//   });
// };

// export const useFlowStatus = (flowId) => {
//   return useQuery({
//     queryKey: ["flow-status", flowId],
//     queryFn: () => fetchAPI(`/email/flows/${flowId}/status`),
//     enabled: !!flowId,
//   });
// };

// export const useCancelFlow = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (flowId) =>
//       fetchAPI(`/email/flows/${flowId}`, {
//         method: "DELETE",
//       }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["email-flows"] });
//       queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
//     },
//   });
// };
