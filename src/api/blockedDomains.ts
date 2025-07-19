import { apiClient } from "../lib/axios";

export interface BlockedDomain {
  id: string;
  domain: string;
  reason: string;
  blockType: "FULL" | "SUBDOMAIN" | "PATTERN";
  isActive: boolean;
  blockedBy: string;
  blockedAt: string;
  expiresAt?: string;
  hitCount: number;
  lastHit?: string;
  metadata?: {
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category: "SPAM" | "PHISHING" | "MALWARE" | "ABUSE" | "POLICY" | "OTHER";
    source: "MANUAL" | "AUTOMATED" | "REPORTED" | "EXTERNAL";
    notes?: string;
  };
}

export interface BlockedDomainsListResponse {
  status: string;
  data: {
    domains: BlockedDomain[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    stats: {
      totalBlocked: number;
      activeBlocks: number;
      expiredBlocks: number;
      totalHits: number;
    };
  };
}

export interface BlockedDomainDetailResponse {
  status: string;
  data: {
    domain: BlockedDomain;
    relatedDomains: string[];
    blockHistory: Array<{
      action: "BLOCKED" | "UNBLOCKED" | "UPDATED";
      performedBy: string;
      performedAt: string;
      reason: string;
      metadata?: Record<string, any>;
    }>;
    hitHistory: Array<{
      emailAddress: string;
      blockedAt: string;
      templateUsed?: string;
      userAgent?: string;
      ipAddress?: string;
    }>;
  };
}

export interface CreateBlockedDomainData {
  domain: string;
  reason: string;
  blockType: "FULL" | "SUBDOMAIN" | "PATTERN";
  expiresAt?: string;
  metadata?: {
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category: "SPAM" | "PHISHING" | "MALWARE" | "ABUSE" | "POLICY" | "OTHER";
    source: "MANUAL" | "AUTOMATED" | "REPORTED" | "EXTERNAL";
    notes?: string;
  };
}

export interface UpdateBlockedDomainData {
  reason?: string;
  blockType?: "FULL" | "SUBDOMAIN" | "PATTERN";
  isActive?: boolean;
  expiresAt?: string;
  metadata?: {
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category?: "SPAM" | "PHISHING" | "MALWARE" | "ABUSE" | "POLICY" | "OTHER";
    source?: "MANUAL" | "AUTOMATED" | "REPORTED" | "EXTERNAL";
    notes?: string;
  };
}

export interface DomainFilters {
  page?: number;
  limit?: number;
  search?: string;
  blockType?: "FULL" | "SUBDOMAIN" | "PATTERN";
  isActive?: boolean;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category?: "SPAM" | "PHISHING" | "MALWARE" | "ABUSE" | "POLICY" | "OTHER";
  sortBy?: "domain" | "blockedAt" | "hitCount" | "lastHit";
  sortOrder?: "asc" | "desc";
}

export interface DomainValidationResponse {
  status: string;
  data: {
    domain: string;
    isBlocked: boolean;
    blockInfo?: {
      rule: string;
      reason: string;
      blockedAt: string;
      severity: string;
    };
    suggestions?: string[];
  };
}

export interface BulkDomainOperation {
  domains: string[];
  action: "block" | "unblock" | "delete";
  reason?: string;
  blockType?: "FULL" | "SUBDOMAIN" | "PATTERN";
  metadata?: {
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    category: "SPAM" | "PHISHING" | "MALWARE" | "ABUSE" | "POLICY" | "OTHER";
    source: "MANUAL" | "AUTOMATED" | "REPORTED" | "EXTERNAL";
  };
}

// CRUD Operations
export async function getBlockedDomains(filters: DomainFilters = {}): Promise<BlockedDomainsListResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`/admin/security/blocked-domains?${params.toString()}`);
  return response.data;
}

export async function getBlockedDomain(id: string): Promise<BlockedDomainDetailResponse> {
  const response = await apiClient.get(`/admin/security/blocked-domains/${id}`);
  return response.data;
}

export async function createBlockedDomain(data: CreateBlockedDomainData): Promise<BlockedDomainDetailResponse> {
  const response = await apiClient.post("/admin/security/blocked-domains", data);
  return response.data;
}

export async function updateBlockedDomain(id: string, data: UpdateBlockedDomainData): Promise<BlockedDomainDetailResponse> {
  const response = await apiClient.put(`/admin/security/blocked-domains/${id}`, data);
  return response.data;
}

export async function deleteBlockedDomain(id: string): Promise<{ status: string; message: string }> {
  const response = await apiClient.delete(`/admin/security/blocked-domains/${id}`);
  return response.data;
}

// Domain Validation
export async function validateDomain(domain: string): Promise<DomainValidationResponse> {
  const response = await apiClient.post("/admin/security/blocked-domains/validate", { domain });
  return response.data;
}

export async function checkDomainStatus(email: string): Promise<{
  status: string;
  data: {
    email: string;
    domain: string;
    isBlocked: boolean;
    blockInfo?: {
      rule: string;
      reason: string;
      severity: string;
      category: string;
    };
  };
}> {
  const response = await apiClient.post("/admin/security/blocked-domains/check", { email });
  return response.data;
}

// Bulk Operations
export async function bulkManageDomains(data: BulkDomainOperation): Promise<{
  status: string;
  data: {
    processed: number;
    successful: number;
    failed: number;
    errors: Array<{
      domain: string;
      error: string;
    }>;
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/security/blocked-domains/bulk", data);
  return response.data;
}

// Import/Export
export async function importBlockedDomains(data: {
  domains: Array<{
    domain: string;
    reason: string;
    blockType?: "FULL" | "SUBDOMAIN" | "PATTERN";
    metadata?: any;
  }>;
  replaceExisting?: boolean;
}): Promise<{
  status: string;
  data: {
    imported: number;
    skipped: number;
    errors: number;
    details: Array<{
      domain: string;
      status: "imported" | "skipped" | "error";
      reason?: string;
    }>;
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/security/blocked-domains/import", data);
  return response.data;
}

export async function exportBlockedDomains(format: "csv" | "json" | "txt"): Promise<{
  status: string;
  data: {
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/security/blocked-domains/export", { format });
  return response.data;
}

// Statistics and Analytics
export async function getBlockedDomainsStats(period = "week"): Promise<{
  status: string;
  data: {
    period: string;
    totalBlocked: number;
    activeBlocks: number;
    totalHits: number;
    topBlockedDomains: Array<{
      domain: string;
      hits: number;
      category: string;
      severity: string;
    }>;
    blocksByCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    blocksBySeverity: Array<{
      severity: string;
      count: number;
      percentage: number;
    }>;
    dailyBlocks: Array<{
      date: string;
      blocks: number;
      hits: number;
    }>;
  };
}> {
  const response = await apiClient.get(`/admin/security/blocked-domains/stats?period=${period}`);
  return response.data;
}

// External Threat Intelligence
export async function syncExternalBlocklists(): Promise<{
  status: string;
  data: {
    synced: number;
    added: number;
    updated: number;
    removed: number;
    sources: Array<{
      name: string;
      status: "success" | "failed";
      domains: number;
      lastSync: string;
    }>;
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/security/blocked-domains/sync-external");
  return response.data;
}

// Whitelist Management
export async function addToWhitelist(domain: string, reason: string): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.post("/admin/security/whitelisted-domains", {
    domain,
    reason,
  });
  return response.data;
}

export async function removeFromWhitelist(domain: string): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.delete(`/admin/security/whitelisted-domains/${domain}`);
  return response.data;
}