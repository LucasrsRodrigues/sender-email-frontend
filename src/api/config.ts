import { apiClient } from "../lib/axios";

export async function getConfigCategories() {
  const response = await apiClient.get("/admin/config/categories");
  return response.data;
}

export async function getConfigsByCategory(category: string) {
  const response = await apiClient.get(`/admin/config/category/${category}`);
  return response.data;
}

export async function updateConfig(key: string, value: any, changedBy: string, reason: string) {
  const response = await apiClient.put(`/admin/config/${key}`, {
    value,
    changedBy,
    reason,
  });
  return response.data;
}

export async function getConfigHistory(key: string) {
  const response = await apiClient.get(`/admin/config/${key}/history`);
  return response.data;
}
