import { useQuery } from "@tanstack/react-query";
import {
  getAllConfigs,
  getConfigCategories,
  getConfigHistory,
  getConfigsByCategory,
} from "../../api/config";

// Buscar categorias de configuração
export const useConfigCategories = () =>
  useQuery({
    queryKey: ["config-categories"],
    queryFn: getConfigCategories,
  });

// Buscar configurações por categoria
export const useConfigsByCategory = (category: string) =>
  useQuery({
    queryKey: ["configs-by-category", category],
    queryFn: () => getConfigsByCategory(category),
    enabled: !!category,
  });

// Buscar histórico de uma configuração
export const useConfigHistory = (key: string, limit?: number) =>
  useQuery({
    queryKey: ["config-history", key, limit],
    queryFn: () => getConfigHistory(key, limit),
    enabled: !!key,
  });

// Buscar todas as configurações
export const useAllConfigs = () =>
  useQuery({
    queryKey: ["all-configs"],
    queryFn: getAllConfigs,
  });
