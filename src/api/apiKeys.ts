import { apiClient } from "../lib/axios";

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPreview: string; // Apenas os primeiros e últimos caracteres
  isActive: boolean;
  expiresAt?: string;
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
}

export interface ApiKeyListResponse {
  status: string;
  data: {
    apiKeys: ApiKey[];
    count: number;
  };
}

export interface ApiKeyDetailResponse {
  status: string;
  data: {
    apiKey: ApiKey;
  };
}

export interface CreateApiKeyData {
  name: string;
  expiresAt?: string; // ISO date string
}

export interface CreateApiKeyResponse {
  status: string;
  data: {
    apiKey: ApiKey;
    fullKey: string; // Chave completa - só retornada na criação
  };
  message: string;
}

export interface UpdateApiKeyData {
  name?: string;
  isActive?: boolean;
  expiresAt?: string;
}

export interface ApiKeyStatsResponse {
  status: string;
  data: {
    period: string;
    startDate: string;
    endDate: string;
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
    totalRequests: number;
    keyUsageStats: Array<{
      keyId: string;
      name: string;
      requests: number;
      lastUsed: string;
    }>;
    dailyUsage: Array<{
      date: string;
      requests: number;
    }>;
  };
}

// API Keys CRUD
export async function getApiKeys(): Promise<ApiKeyListResponse> {
  const response = await apiClient.get("/admin/api-keys");
  return response.data;
}

export async function getApiKey(id: string): Promise<ApiKeyDetailResponse> {
  const response = await apiClient.get(`/admin/api-keys/${id}`);
  return response.data;
}

export async function createApiKey(data: CreateApiKeyData): Promise<CreateApiKeyResponse> {
  const response = await apiClient.post("/admin/api-keys", data);
  return response.data;
}

export async function updateApiKey(id: string, data: UpdateApiKeyData): Promise<ApiKeyDetailResponse> {
  const response = await apiClient.put(`/admin/api-keys/${id}`, data);
  return response.data;
}

export async function deleteApiKey(id: string): Promise<{ status: string; message: string }> {
  const response = await apiClient.delete(`/admin/api-keys/${id}`);
  return response.data;
}

export async function regenerateApiKey(id: string): Promise<CreateApiKeyResponse> {
  const response = await apiClient.post(`/admin/api-keys/${id}/regenerate`);
  return response.data;
}

// API Keys Statistics
export async function getApiKeyStats(period = "week"): Promise<ApiKeyStatsResponse> {
  const response = await apiClient.get(`/admin/api-keys/stats?period=${period}`);
  return response.data;
}

// API Keys Usage
export async function getApiKeyUsage(
  id: string,
  period = "week"
): Promise<{
  status: string;
  data: {
    keyId: string;
    period: string;
    totalRequests: number;
    dailyUsage: Array<{
      date: string;
      requests: number;
    }>;
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
    }>;
  };
}> {
  const response = await apiClient.get(`/admin/api-keys/${id}/usage?period=${period}`);
  return response.data;
}