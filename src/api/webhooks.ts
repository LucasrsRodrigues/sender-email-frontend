import { apiClient } from "../lib/axios";

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  retryCount: number;
  timeout: number;
  headers?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
  lastUsed?: string;
  successCount: number;
  failureCount: number;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  url: string;
  payload: Record<string, any>;
  response?: string;
  statusCode?: number;
  success: boolean;
  errorMessage?: string;
  responseTime?: number;
  createdAt: string;
}

export interface WebhookListResponse {
  status: string;
  data: {
    webhooks: WebhookConfig[];
    count: number;
  };
}

export interface WebhookDetailResponse {
  status: string;
  data: {
    webhook: WebhookConfig;
  };
}

export interface WebhookLogsResponse {
  status: string;
  data: {
    logs: WebhookLog[];
    total: number;
    webhook: {
      id: string;
      name: string;
      url: string;
    };
  };
}

export interface CreateWebhookData {
  name: string;
  url: string;
  secret?: string;
  events: string[];
  retryCount?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface UpdateWebhookData extends Partial<CreateWebhookData> {
  isActive?: boolean;
}

export interface WebhookTestResponse {
  status: string;
  data: {
    success: boolean;
    statusCode?: number;
    responseTime: number;
    response?: string;
    error?: string;
  };
  message: string;
}

export interface WebhookStatsResponse {
  status: string;
  data: {
    period: string;
    startDate: string;
    endDate: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: number;
    avgResponseTime: number;
    eventStats: Array<{
      event: string;
      count: number;
      successRate: number;
    }>;
    webhookStats: Array<{
      webhookId: string;
      name: string;
      requests: number;
      successRate: number;
    }>;
  };
}

// Webhook CRUD
export async function getWebhooks(): Promise<WebhookListResponse> {
  const response = await apiClient.get("/admin/webhooks");
  return response.data;
}

export async function getWebhook(id: string): Promise<WebhookDetailResponse> {
  const response = await apiClient.get(`/admin/webhooks/${id}`);
  return response.data;
}

export async function createWebhook(data: CreateWebhookData): Promise<WebhookDetailResponse> {
  const response = await apiClient.post("/admin/webhooks", data);
  return response.data;
}

export async function updateWebhook(id: string, data: UpdateWebhookData): Promise<WebhookDetailResponse> {
  const response = await apiClient.put(`/admin/webhooks/${id}`, data);
  return response.data;
}

export async function deleteWebhook(id: string): Promise<{ status: string; message: string }> {
  const response = await apiClient.delete(`/admin/webhooks/${id}`);
  return response.data;
}

// Webhook Testing
export async function testWebhook(id: string, testEvent?: string): Promise<WebhookTestResponse> {
  const response = await apiClient.post(`/admin/webhooks/${id}/test`, {
    event: testEvent || "test",
  });
  return response.data;
}

// Webhook Logs
export async function getWebhookLogs(
  id: string,
  filters: {
    limit?: number;
    offset?: number;
    event?: string;
    success?: boolean;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<WebhookLogsResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) params.append(key, value.toString());
  });

  const response = await apiClient.get(`/admin/webhooks/${id}/logs?${params.toString()}`);
  return response.data;
}

// Webhook Statistics
export async function getWebhookStats(period = "week"): Promise<WebhookStatsResponse> {
  const response = await apiClient.get(`/admin/webhooks/stats?period=${period}`);
  return response.data;
}

// Available Events
export async function getAvailableEvents(): Promise<{
  status: string;
  data: {
    events: Array<{
      name: string;
      description: string;
      payload: Record<string, any>;
    }>;
  };
}> {
  const response = await apiClient.get("/admin/webhooks/events");
  return response.data;
}

// Webhook Health Check
export async function getWebhookHealth(): Promise<{
  status: string;
  data: {
    totalWebhooks: number;
    activeWebhooks: number;
    healthyWebhooks: number;
    webhooksWithErrors: number;
    lastCheckAt: string;
  };
}> {
  const response = await apiClient.get("/admin/webhooks/health");
  return response.data;
}