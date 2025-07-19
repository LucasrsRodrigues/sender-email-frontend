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

// Preview avançado com validação e sugestões
export async function advancedPreviewTemplate(name: string, data: {
  variables: Record<string, any>;
  validateVariables?: boolean;
  includeMetadata?: boolean;
  format?: 'html' | 'text' | 'both';
}) {
  const response = await apiClient.post(`/admin/templates/${name}/preview/advanced`, data);
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

// Histórico do template
export async function getTemplateHistory(name: string, limit?: number) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());

  const response = await apiClient.get(`/admin/templates/${name}/history?${params.toString()}`);
  return response.data;
}


// Validar variáveis do template
export async function validateTemplateVariables(name: string, variables: Record<string, any>) {
  const response = await apiClient.post(`/admin/templates/${name}/validate`, { variables });
  return response.data;
}

// Buscar variáveis necessárias do template
export async function getTemplateVariables(name: string) {
  const response = await apiClient.get(`/admin/templates/${name}/variables`);
  return response.data;
}