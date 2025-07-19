import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  applyConfigTemplate,
  bulkUpdateConfigs,
  createConfigTemplate,
  deleteConfigTemplate,
  exportConfigs,
  getAllConfigs,
  getConfig,
  getConfigCategories,
  getConfigDependencies,
  getConfigHistory,
  getConfigsByCategory,
  getConfigTemplates,
  importConfigs,
  resetConfigToDefault,
  rollbackConfig,
  searchConfigs,
  updateConfig,
  validateConfigs,
} from "../../api/advancedConfig";

// Categories
export const useConfigCategories = () =>
  useQuery({
    queryKey: ["config-categories"],
    queryFn: getConfigCategories,
    staleTime: 300000, // 5 minutos
  });

// Configs by Category
export const useConfigsByCategory = (category: string) =>
  useQuery({
    queryKey: ["configs-by-category", category],
    queryFn: () => getConfigsByCategory(category),
    enabled: !!category,
  });

// All Configs
export const useAllConfigs = () =>
  useQuery({
    queryKey: ["all-configs"],
    queryFn: getAllConfigs,
  });

// Single Config
export const useConfig = (key: string) =>
  useQuery({
    queryKey: ["config", key],
    queryFn: () => getConfig(key),
    enabled: !!key,
  });

// Config History
export const useConfigHistory = (key: string, params?: { limit?: number; offset?: number }) =>
  useQuery({
    queryKey: ["config-history", key, params],
    queryFn: () => getConfigHistory(key, params),
    enabled: !!key,
  });

// Config Dependencies
export const useConfigDependencies = (key: string) =>
  useQuery({
    queryKey: ["config-dependencies", key],
    queryFn: () => getConfigDependencies(key),
    enabled: !!key,
  });

// Config Templates
export const useConfigTemplates = () =>
  useQuery({
    queryKey: ["config-templates"],
    queryFn: getConfigTemplates,
  });

// Search
export const useSearchConfigs = (query: string, filters?: any) =>
  useQuery({
    queryKey: ["search-configs", query, filters],
    queryFn: () => searchConfigs(query, filters),
    enabled: !!query && query.length > 2,
  });

// Mutations
export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => updateConfig(key, data),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["config", key] });
      queryClient.invalidateQueries({ queryKey: ["configs-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["all-configs"] });
      queryClient.invalidateQueries({ queryKey: ["config-history", key] });
    },
  });
};

export const useBulkUpdateConfigs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateConfigs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["all-configs"] });
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};

export const useResetConfigToDefault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => resetConfigToDefault(key, data),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["config", key] });
      queryClient.invalidateQueries({ queryKey: ["configs-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["all-configs"] });
      queryClient.invalidateQueries({ queryKey: ["config-history", key] });
    },
  });
};

export const useValidateConfigs = () =>
  useMutation({
    mutationFn: validateConfigs,
  });

export const useRollbackConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => rollbackConfig(key, data),
    onSuccess: (_, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["config", key] });
      queryClient.invalidateQueries({ queryKey: ["configs-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["all-configs"] });
      queryClient.invalidateQueries({ queryKey: ["config-history", key] });
    },
  });
};

// Templates
export const useCreateConfigTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConfigTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-templates"] });
    },
  });
};

export const useApplyConfigTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, data }: { templateId: string; data: any }) =>
      applyConfigTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["all-configs"] });
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};

export const useDeleteConfigTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConfigTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config-templates"] });
    },
  });
};

// Import/Export
export const useExportConfigs = () =>
  useMutation({
    mutationFn: exportConfigs,
  });

export const useImportConfigs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importConfigs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs-by-category"] });
      queryClient.invalidateQueries({ queryKey: ["all-configs"] });
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
};