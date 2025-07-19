import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToWhitelist,
  type BulkDomainOperation,
  bulkManageDomains,
  type CreateBlockedDomainData,
  checkDomainStatus,
  createBlockedDomain,
  type DomainFilters,
  deleteBlockedDomain,
  exportBlockedDomains,
  getBlockedDomain,
  getBlockedDomains,
  getBlockedDomainsStats,
  importBlockedDomains,
  removeFromWhitelist,
  syncExternalBlocklists,
  type UpdateBlockedDomainData,
  updateBlockedDomain,
  validateDomain,
} from "../../api/blockedDomains";

// Queries
export const useBlockedDomains = (filters: DomainFilters = {}) =>
  useQuery({
    queryKey: ["blocked-domains", filters],
    queryFn: () => getBlockedDomains(filters),
    keepPreviousData: true,
  });

export const useBlockedDomain = (id: string) =>
  useQuery({
    queryKey: ["blocked-domain", id],
    queryFn: () => getBlockedDomain(id),
    enabled: !!id,
  });

export const useBlockedDomainsStats = (period = "week") =>
  useQuery({
    queryKey: ["blocked-domains-stats", period],
    queryFn: () => getBlockedDomainsStats(period),
    refetchInterval: 300000, // 5 minutes
  });

// Validation
export const useValidateDomain = () =>
  useMutation({
    mutationFn: (domain: string) => validateDomain(domain),
  });

export const useCheckDomainStatus = () =>
  useMutation({
    mutationFn: (email: string) => checkDomainStatus(email),
  });

// CRUD Mutations
export const useCreateBlockedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBlockedDomainData) => createBlockedDomain(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-domains-stats"] });
    },
  });
};

export const useUpdateBlockedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBlockedDomainData }) =>
      updateBlockedDomain(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-domain", id] });
      queryClient.invalidateQueries({ queryKey: ["blocked-domains-stats"] });
    },
  });
};

export const useDeleteBlockedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlockedDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-domains-stats"] });
    },
  });
};

// Bulk Operations
export const useBulkManageDomains = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkDomainOperation) => bulkManageDomains(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-domains-stats"] });
    },
  });
};

// Import/Export
export const useImportBlockedDomains = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      domains: Array<{
        domain: string;
        reason: string;
        blockType?: "FULL" | "SUBDOMAIN" | "PATTERN";
        metadata?: any;
      }>;
      replaceExisting?: boolean;
    }) => importBlockedDomains(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-domains-stats"] });
    },
  });
};

export const useExportBlockedDomains = () =>
  useMutation({
    mutationFn: (format: "csv" | "json" | "txt") =>
      exportBlockedDomains(format),
  });

// External Sync
export const useSyncExternalBlocklists = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncExternalBlocklists,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
      queryClient.invalidateQueries({ queryKey: ["blocked-domains-stats"] });
    },
  });
};

// Whitelist Management
export const useAddToWhitelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ domain, reason }: { domain: string; reason: string }) =>
      addToWhitelist(domain, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
    },
  });
};

export const useRemoveFromWhitelist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain: string) => removeFromWhitelist(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
    },
  });
};
