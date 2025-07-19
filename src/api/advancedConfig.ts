// src/api/advancedConfig.ts
import { apiClient } from "../lib/axios";

export interface ConfigCategory {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  order: number;
  configCount: number;
}

export interface ConfigItem {
  id: string;
  key: string;
  value: string | number | boolean;
  defaultValue: string | number | boolean;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON" | "EMAIL" | "URL" | "PASSWORD";
  category: string;
  displayName: string;
  description: string;
  isRequired: boolean;
  isReadOnly: boolean;
  isSecret: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  metadata?: {
    unit?: string;
    format?: string;
    placeholder?: string;
    helpText?: string;
    warningText?: string;
    restartRequired?: boolean;
  };
  lastModified: string;
  modifiedBy: string;
  version: number;
}

export interface ConfigHistory {
  id: string;
  configKey: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  reason: string;
  version: number;
  rollbackAvailable: boolean;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  configs: Record<string, any>;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  usageCount: number;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: Array<{
    key: string;
    message: string;
    severity: "error" | "warning";
  }>;
  warnings: Array<{
    key: string;
    message: string;
  }>;
  dependencies: Array<{
    key: string;
    dependsOn: string[];
    message: string;
  }>;
}

// Get Categories
export async function getConfigCategories(): Promise<{
  status: string;
  data: {
    categories: ConfigCategory[];
  };
}> {
  const response = await apiClient.get("/admin/config/categories");
  return response.data;
}

// Get Configs by Category
export async function getConfigsByCategory(category: string): Promise<{
  status: string;
  data: {
    category: ConfigCategory;
    configs: ConfigItem[];
    count: number;
  };
}> {
  const response = await apiClient.get(`/admin/config/category/${category}`);
  return response.data;
}

// Get All Configs
export async function getAllConfigs(): Promise<{
  status: string;
  data: {
    configs: ConfigItem[];
    categories: ConfigCategory[];
    total: number;
  };
}> {
  const response = await apiClient.get("/admin/config/all");
  return response.data;
}

// Get Single Config
export async function getConfig(key: string): Promise<{
  status: string;
  data: {
    config: ConfigItem;
    history: ConfigHistory[];
    relatedConfigs: ConfigItem[];
  };
}> {
  const response = await apiClient.get(`/admin/config/${key}`);
  return response.data;
}

// Update Config
export async function updateConfig(key: string, data: {
  value: any;
  reason: string;
  changedBy: string;
}): Promise<{
  status: string;
  data: {
    config: ConfigItem;
    validationResult: ConfigValidationResult;
  };
  message: string;
}> {
  const response = await apiClient.put(`/admin/config/${key}`, data);
  return response.data;
}

// Bulk Update Configs
export async function bulkUpdateConfigs(data: {
  configs: Array<{
    key: string;
    value: any;
  }>;
  reason: string;
  changedBy: string;
}): Promise<{
  status: string;
  data: {
    updated: number;
    failed: number;
    validationResult: ConfigValidationResult;
    errors: Array<{
      key: string;
      error: string;
    }>;
  };
  message: string;
}> {
  const response = await apiClient.put("/admin/config/bulk", data);
  return response.data;
}

// Reset Config to Default
export async function resetConfigToDefault(key: string, data: {
  reason: string;
  changedBy: string;
}): Promise<{
  status: string;
  data: {
    config: ConfigItem;
  };
  message: string;
}> {
  const response = await apiClient.post(`/admin/config/${key}/reset`, data);
  return response.data;
}

// Validate Configs
export async function validateConfigs(configs?: Array<{
  key: string;
  value: any;
}>): Promise<{
  status: string;
  data: {
    validationResult: ConfigValidationResult;
    affectedServices: string[];
    restartRequired: boolean;
  };
}> {
  const response = await apiClient.post("/admin/config/validate", { configs });
  return response.data;
}

// Config History
export async function getConfigHistory(key: string, params?: {
  limit?: number;
  offset?: number;
}): Promise<{
  status: string;
  data: {
    history: ConfigHistory[];
    total: number;
    key: string;
  };
}> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());

  const response = await apiClient.get(`/admin/config/${key}/history?${queryParams.toString()}`);
  return response.data;
}

// Rollback Config
export async function rollbackConfig(key: string, data: {
  version: number;
  reason: string;
  changedBy: string;
}): Promise<{
  status: string;
  data: {
    config: ConfigItem;
    previousVersion: number;
  };
  message: string;
}> {
  const response = await apiClient.post(`/admin/config/${key}/rollback`, data);
  return response.data;
}

// Config Templates
export async function getConfigTemplates(): Promise<{
  status: string;
  data: {
    templates: ConfigTemplate[];
  };
}> {
  const response = await apiClient.get("/admin/config/templates");
  return response.data;
}

export async function createConfigTemplate(data: {
  name: string;
  description: string;
  category: string;
  configs: Record<string, any>;
}): Promise<{
  status: string;
  data: {
    template: ConfigTemplate;
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/config/templates", data);
  return response.data;
}

export async function applyConfigTemplate(templateId: string, data: {
  reason: string;
  changedBy: string;
  overrideExisting?: boolean;
}): Promise<{
  status: string;
  data: {
    applied: number;
    skipped: number;
    errors: number;
    details: Array<{
      key: string;
      status: "applied" | "skipped" | "error";
      reason?: string;
    }>;
  };
  message: string;
}> {
  const response = await apiClient.post(`/admin/config/templates/${templateId}/apply`, data);
  return response.data;
}

export async function deleteConfigTemplate(templateId: string): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.delete(`/admin/config/templates/${templateId}`);
  return response.data;
}

// Export/Import Configs
export async function exportConfigs(data: {
  categories?: string[];
  format: "json" | "yaml" | "env";
  includeSecrets?: boolean;
}): Promise<{
  status: string;
  data: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/config/export", data);
  return response.data;
}

export async function importConfigs(data: {
  configs: Record<string, any>;
  reason: string;
  changedBy: string;
  dryRun?: boolean;
  overrideExisting?: boolean;
}): Promise<{
  status: string;
  data: {
    imported: number;
    updated: number;
    skipped: number;
    errors: number;
    validationResult: ConfigValidationResult;
    details: Array<{
      key: string;
      action: "imported" | "updated" | "skipped" | "error";
      reason?: string;
    }>;
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/config/import", data);
  return response.data;
}

// Config Search
export async function searchConfigs(query: string, filters?: {
  category?: string;
  type?: string;
  isSecret?: boolean;
  isModified?: boolean;
}): Promise<{
  status: string;
  data: {
    configs: ConfigItem[];
    total: number;
    query: string;
  };
}> {
  const params = new URLSearchParams({ q: query });
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString());
    });
  }

  const response = await apiClient.get(`/admin/config/search?${params.toString()}`);
  return response.data;
}

// Config Dependencies
export async function getConfigDependencies(key: string): Promise<{
  status: string;
  data: {
    dependencies: Array<{
      key: string;
      relationship: "depends_on" | "affects" | "related";
      description: string;
    }>;
    impact: Array<{
      service: string;
      action: "restart" | "reload" | "notify";
      description: string;
    }>;
  };
}> {
  const response = await apiClient.get(`/admin/config/${key}/dependencies`);
  return response.data;
}