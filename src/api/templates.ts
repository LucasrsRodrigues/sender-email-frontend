import { apiClient } from "../lib/axios";

export async function getTemplates() {
  const response = await apiClient.get("/admin/templates");
  return response.data;
}

export async function getTemplate(name: string) {
  const response = await apiClient.get(`/admin/templates/${name}`);
  return response.data;
}

export async function createTemplate(templateData: any) {
  const response = await apiClient.post("/admin/templates", templateData);
  return response.data;
}

export async function updateTemplate(name: string, data: any) {
  const response = await apiClient.put(`/admin/templates/${name}`, data);
  return response.data;
}

export async function toggleTemplate(name: string, isActive: boolean, updatedBy: string) {
  const response = await apiClient.put(`/admin/templates/${name}/toggle`, {
    isActive,
    updatedBy,
  });
  return response.data;
}

export async function previewTemplate(name: string, variables: any) {
  const response = await apiClient.post(`/admin/templates/${name}/preview`, variables);
  return response.data;
}

export async function getTemplateHistory(name: string) {
  const response = await apiClient.get(`/admin/templates/${name}/history`);
  return response.data;
}
