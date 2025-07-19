import { apiClient } from "../lib/axios";


export async function sendEmail(emailData: any) {
  const response = await apiClient.post("/email/send", emailData);
  return response.data;
}

export async function getEmailStatus(logId: string) {
  const response = await apiClient.get(`/email/status/${logId}`);
  return response.data;
}

export async function getEmailLogs(filters: Record<string, any> = {}) {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });

  const response = await apiClient.get(`/email/logs?${queryParams.toString()}`);
  return response.data;
}

export async function getEmailFlows(limit = 50) {
  const response = await apiClient.get(`/email/flows?limit=${limit}`);
  return response.data;
}

export async function getFlowStats(period = "day") {
  const response = await apiClient.get(`/email/flows/stats?period=${period}`);
  return response.data;
}

export async function getFlowStatus(flowId: string) {
  const response = await apiClient.get(`/email/flows/${flowId}/status`);
  return response.data;
}

export async function cancelFlow(flowId: string) {
  const response = await apiClient.delete(`/email/flows/${flowId}`);
  return response.data;
}
