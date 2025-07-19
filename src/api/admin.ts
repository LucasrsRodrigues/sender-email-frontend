import { apiClient } from "../lib/axios";

export interface AdminDashboardResponse {
  status: string;
  data: {
    overview: {
      totalEmails: number;
      emailsToday: number;
      activeTemplates: number;
      activeWebhooks: number;
    };
    queue: {
      queueName: string;
      isHealthy: boolean;
      waiting: number;
      active: number;
      completed: number;
      failed: number;
      delayed: number;
      paused: boolean;
      workers: number;
    };
    recentErrors: Array<{
      to: string;
      subject: string;
      errorMessage: string;
      createdAt: string;
    }>;
    timestamp: string;
  };
}

export interface AdminStatsResponse {
  status: string;
  data: {
    period: string;
    startDate: string;
    endDate: string;
    email: {
      totalSent: number;
      totalFailed: number;
      successRate: number;
      avgResponseTime: number;
    };
    templates: Array<{
      name: string;
      count: number;
      successRate: number;
    }>;
    providers: Array<{
      name: string;
      count: number;
      successRate: number;
    }>;
  };
}

export interface AdminSearchResponse {
  status: string;
  data: {
    results: Array<{
      type: string;
      id: string;
      title: string;
      description: string;
      createdAt: string;
    }>;
    total: number;
    query: string;
  };
}

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await apiClient.get("/admin/dashboard");
  return response.data;
}

export async function getAdminStats(period = "week"): Promise<AdminStatsResponse> {
  const response = await apiClient.get(`/admin/stats?period=${period}`);
  return response.data;
}

export async function searchAdmin(query: string, type?: string): Promise<AdminSearchResponse> {
  const params = new URLSearchParams({ q: query });
  if (type) params.append("type", type);

  const response = await apiClient.get(`/admin/search?${params.toString()}`);
  return response.data;
}