import { apiClient } from "../lib/axios";

export interface IGetMetricsResponse {
  status: string;
  data: {
    timestamp: string;
    period: string;
    email: {
      totalSent: number;
      totalFailed: number;
      totalPending: number;
      successRate: number;
      providerStats: {
        gmail: number;
        sendgrid: number;
      }
    },
    system: {
      uptime: number;
      memoryUsage: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
      }
    }
  }
}

export interface IGetMetricsHealthResponse {
  status: string;
  timestamp: string;
  services: {
    database: {
      status: string;
      responseTime: string;
    }
  },
  metrics: {
    email: {
      totalSent: number;
      successRate: number;
    }
  },
  uptime: number;
  memory: {
    rss: number;
    heapUsed: number;
  },
  version: string;
}

export interface IGetQueueStatusResponse {
  status: string;
  data: {
    queueName: string;
    isHealthy: boolean;
    waiting: string;
    active: string;
    completed: string;
    failed: string;
    delayed: string;
    paused: boolean;
    workers: string;
  }
}

export async function getMetricsHealth(): Promise<IGetMetricsHealthResponse> {
  const response = await apiClient.get("/metrics/health");

  return response.data;
}

export async function getBasicMetrics(period = "24h"): Promise<IGetMetricsResponse> {
  const response = await apiClient.get(`/metrics?period=${period}`)

  return response.data;
}

export async function getHealthCheck() {
  const response = await apiClient.get("/metrics/health");
  return response.data;
}

// Queue
export async function getQueueStatus() {
  const response = await apiClient.get("/admin/queue/status");
  return response.data;
}

export async function getQueueStats() {
  const response = await apiClient.get("/admin/queue/stats");
  return response.data;
}

export async function pauseQueue() {
  const response = await apiClient.post("/admin/queue/pause");
  return response.data;
}

export async function resumeQueue() {
  const response = await apiClient.post("/admin/queue/resume");
  return response.data;
}

export async function retryFailedJobs(limit: number) {
  const response = await apiClient.post(`/admin/queue/retry-failed?limit=${limit}`);
  return response.data;
}

export async function cleanQueue(grace: number, status: string) {
  const response = await apiClient.delete(`/admin/queue/clean?grace=${grace}&status=${status}`);
  return response.data;
}
