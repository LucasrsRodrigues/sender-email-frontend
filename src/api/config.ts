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

export async function getAllConfigs() {
  const categoriesResponse = await apiClient.get("/admin/config/categories");
  const categories = categoriesResponse.data.data.categories;

  const allConfigs = [];
  for (const category of categories) {
    try {
      const response = await apiClient.get(`/admin/config/category/${category.name}`);
      const configs = response.data.data.configs.map((c: any) => ({
        ...c,
        category: category.name
      }));
      allConfigs.push(...configs);
    } catch (error) {
      console.error(`Erro ao buscar configurações da categoria ${category.name}:`, error);
    }
  }

  return { data: { configs: allConfigs } };
}