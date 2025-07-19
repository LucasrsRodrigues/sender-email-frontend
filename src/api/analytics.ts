import { apiClient } from "../lib/axios";

export interface EmailAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  totalEmails: number;
  successfulEmails: number;
  failedEmails: number;
  successRate: number;
  avgResponseTime: number;
  dailyStats: Array<{
    date: string;
    sent: number;
    failed: number;
    rate: number;
  }>;
  providerStats: Array<{
    provider: string;
    count: number;
    successRate: number;
    avgResponseTime: number;
  }>;
  templateStats: Array<{
    template: string;
    count: number;
    successRate: number;
    avgAttempts: number;
  }>;
  errorStats: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;
}

export interface SystemAnalytics {
  period: string;
  uptime: number;
  cpuUsage: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  networkStats: {
    requestsPerSecond: number;
    avgLatency: number;
    errorRate: number;
  };
  queueStats: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    throughput: number;
  };
}

export interface UserAnalytics {
  period: string;
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  loginStats: {
    totalLogins: number;
    uniqueLogins: number;
    avgSessionDuration: number;
  };
  userActivity: Array<{
    date: string;
    activeUsers: number;
    newUsers: number;
    logins: number;
  }>;
  topUsers: Array<{
    userId: string;
    username: string;
    emailsSent: number;
    lastLogin: string;
  }>;
}

export interface SecurityAnalytics {
  period: string;
  loginAttempts: number;
  failedLogins: number;
  blockedIPs: number;
  suspiciousActivity: number;
  securityEvents: Array<{
    type: string;
    count: number;
    severity: "low" | "medium" | "high";
  }>;
  ipAnalysis: Array<{
    ip: string;
    requests: number;
    status: "allowed" | "blocked" | "suspicious";
    country?: string;
  }>;
  authenticationStats: {
    successRate: number;
    avgSessionDuration: number;
    multipleFailures: number;
  };
}

export interface AnalyticsOverview {
  status: string;
  data: {
    emails: EmailAnalytics;
    system: SystemAnalytics;
    users: UserAnalytics;
    security: SecurityAnalytics;
  };
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: "email" | "system" | "user" | "security" | "custom";
  filters: Record<string, any>;
  metrics: string[];
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    time: string;
    recipients: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastRun?: string;
}

export interface ReportResponse {
  status: string;
  data: {
    report: CustomReport;
    results: Record<string, any>;
    generatedAt: string;
    exportUrl?: string;
  };
}

// Analytics Data
export async function getEmailAnalytics(period = "week"): Promise<{
  status: string;
  data: EmailAnalytics;
}> {
  const response = await apiClient.get(`/analytics/emails?period=${period}`);
  return response.data;
}

export async function getSystemAnalytics(period = "week"): Promise<{
  status: string;
  data: SystemAnalytics;
}> {
  const response = await apiClient.get(`/analytics/system?period=${period}`);
  return response.data;
}

export async function getUserAnalytics(period = "week"): Promise<{
  status: string;
  data: UserAnalytics;
}> {
  const response = await apiClient.get(`/analytics/users?period=${period}`);
  return response.data;
}

export async function getSecurityAnalytics(period = "week"): Promise<{
  status: string;
  data: SecurityAnalytics;
}> {
  const response = await apiClient.get(`/analytics/security?period=${period}`);
  return response.data;
}

export async function getAnalyticsOverview(period = "week"): Promise<AnalyticsOverview> {
  const response = await apiClient.get(`/analytics/overview?period=${period}`);
  return response.data;
}

// Real-time Metrics
export async function getRealTimeMetrics(): Promise<{
  status: string;
  data: {
    timestamp: string;
    emailsInQueue: number;
    activeUsers: number;
    systemLoad: number;
    errorRate: number;
    throughput: number;
  };
}> {
  const response = await apiClient.get("/analytics/realtime");
  return response.data;
}

// Custom Reports
export async function getCustomReports(): Promise<{
  status: string;
  data: {
    reports: CustomReport[];
    total: number;
  };
}> {
  const response = await apiClient.get("/analytics/reports");
  return response.data;
}

export async function createCustomReport(data: Partial<CustomReport>): Promise<{
  status: string;
  data: { report: CustomReport };
  message: string;
}> {
  const response = await apiClient.post("/analytics/reports", data);
  return response.data;
}

export async function runCustomReport(reportId: string): Promise<ReportResponse> {
  const response = await apiClient.post(`/analytics/reports/${reportId}/run`);
  return response.data;
}

export async function deleteCustomReport(reportId: string): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.delete(`/analytics/reports/${reportId}`);
  return response.data;
}

// Export Data
export async function exportAnalytics(data: {
  type: "email" | "system" | "user" | "security";
  period: string;
  format: "csv" | "xlsx" | "json";
}): Promise<{
  status: string;
  data: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
  message: string;
}> {
  const response = await apiClient.post("/analytics/export", data);
  return response.data;
}

// Comparative Analysis
export async function getComparativeAnalytics(data: {
  metric: string;
  periods: string[];
  groupBy?: string;
}): Promise<{
  status: string;
  data: {
    comparison: Array<{
      period: string;
      value: number;
      change: number;
      changePercentage: number;
    }>;
    trend: "up" | "down" | "stable";
    insights: string[];
  };
}> {
  const response = await apiClient.post("/analytics/compare", data);
  return response.data;
}

// Alerts and Thresholds
export async function getAnalyticsAlerts(): Promise<{
  status: string;
  data: {
    alerts: Array<{
      id: string;
      type: string;
      metric: string;
      threshold: number;
      currentValue: number;
      severity: "info" | "warning" | "critical";
      message: string;
      triggeredAt: string;
    }>;
  };
}> {
  const response = await apiClient.get("/analytics/alerts");
  return response.data;
}

export async function setAnalyticsThreshold(data: {
  metric: string;
  operator: "gt" | "lt" | "eq";
  value: number;
  severity: "info" | "warning" | "critical";
}): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.post("/analytics/thresholds", data);
  return response.data;
}