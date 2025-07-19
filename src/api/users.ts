import { apiClient } from "../lib/axios";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  emailLogs?: {
    total: number;
    sent: number;
    failed: number;
  };
  apiKeys?: {
    total: number;
    active: number;
  };
}

export interface UsersListResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserDetailResponse {
  status: string;
  data: {
    user: User;
    stats: {
      emailsSent: number;
      emailsFailed: number;
      apiKeysCount: number;
      lastActivity: string;
      sessionsCount: number;
    };
    recentActivity: Array<{
      type: string;
      description: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: "ADMIN" | "USER";
  isActive?: boolean;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: "ADMIN" | "USER";
  isActive?: boolean;
  password?: string;
}

export interface UsersStatsResponse {
  status: string;
  data: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    regularUsers: number;
    newUsersThisMonth: number;
    lastLogins: Array<{
      userId: string;
      username: string;
      lastLogin: string;
    }>;
    userActivity: Array<{
      date: string;
      logins: number;
      newUsers: number;
    }>;
  };
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "USER";
  isActive?: boolean;
  sortBy?: "username" | "email" | "createdAt" | "lastLogin";
  sortOrder?: "asc" | "desc";
}

// Users CRUD
export async function getUsers(filters: UserFilters = {}): Promise<UsersListResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`/admin/users?${params.toString()}`);
  return response.data;
}

export async function getUser(id: string): Promise<UserDetailResponse> {
  const response = await apiClient.get(`/admin/users/${id}`);
  return response.data;
}

export async function createUser(data: CreateUserData): Promise<UserDetailResponse> {
  const response = await apiClient.post("/admin/users", data);
  return response.data;
}

export async function updateUser(id: string, data: UpdateUserData): Promise<UserDetailResponse> {
  const response = await apiClient.put(`/admin/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<{ status: string; message: string }> {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
}

// User Management Actions
export async function toggleUserStatus(id: string): Promise<UserDetailResponse> {
  const response = await apiClient.patch(`/admin/users/${id}/toggle-status`);
  return response.data;
}

export async function resetUserPassword(id: string): Promise<{
  status: string;
  data: {
    temporaryPassword: string;
  };
  message: string;
}> {
  const response = await apiClient.post(`/admin/users/${id}/reset-password`);
  return response.data;
}

export async function revokeUserSessions(id: string): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.delete(`/admin/users/${id}/sessions`);
  return response.data;
}

// Users Statistics
export async function getUsersStats(): Promise<UsersStatsResponse> {
  const response = await apiClient.get("/admin/users/stats");
  return response.data;
}

// User Activity
export async function getUserActivity(
  id: string,
  period = "week"
): Promise<{
  status: string;
  data: {
    userId: string;
    period: string;
    emailActivity: Array<{
      date: string;
      sent: number;
      failed: number;
    }>;
    loginActivity: Array<{
      date: string;
      logins: number;
    }>;
    apiKeyUsage: Array<{
      keyId: string;
      keyName: string;
      requests: number;
    }>;
  };
}> {
  const response = await apiClient.get(`/admin/users/${id}/activity?period=${period}`);
  return response.data;
}

// Bulk Operations
export async function bulkUpdateUsers(data: {
  userIds: string[];
  action: "activate" | "deactivate" | "delete" | "change-role";
  role?: "ADMIN" | "USER";
}): Promise<{
  status: string;
  data: {
    affected: number;
    failed: number;
    errors?: string[];
  };
  message: string;
}> {
  const response = await apiClient.post("/admin/users/bulk", data);
  return response.data;
}