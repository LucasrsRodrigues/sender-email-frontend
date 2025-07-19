import { apiClient } from "../lib/axios";
import type { User } from "./users";

// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   role: "ADMIN" | "USER";
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
//   lastLogin?: string;
// }

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  data: {
    user: User;
    token: string;
    expiresAt: string;
  };
  message: string;
}

export interface ProfileResponse {
  status: string;
  data: {
    user: User;
  };
}

export interface UpdateProfileData {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthStatsResponse {
  status: string;
  data: {
    totalSessions: number;
    activeSessions: number;
    loginAttempts: number;
    successfulLogins: number;
    failedLogins: number;
    lastLogins: Array<{
      userId: string;
      username: string;
      loginAt: string;
      ipAddress: string;
      userAgent: string;
    }>;
  };
}

// Authentication
export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
}

export async function logout(): Promise<{ status: string; message: string }> {
  const response = await apiClient.post("/auth/logout");
  return response.data;
}

export async function getProfile(): Promise<ProfileResponse> {
  const response = await apiClient.get("/auth/profile");
  return response.data;
}

export async function updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
  const response = await apiClient.put("/auth/profile", data);
  return response.data;
}

export async function refreshToken(): Promise<{
  status: string;
  data: {
    token: string;
    expiresAt: string;
  };
}> {
  const response = await apiClient.post("/auth/refresh");
  return response.data;
}

// Admin Auth Stats
export async function getAuthStats(): Promise<AuthStatsResponse> {
  const response = await apiClient.get("/admin/auth/stats");
  return response.data;
}

// Session Management
export async function getActiveSessions(): Promise<{
  status: string;
  data: {
    sessions: Array<{
      id: string;
      userId: string;
      ipAddress: string;
      userAgent: string;
      createdAt: string;
      lastActivity: string;
      isCurrentSession: boolean;
    }>;
  };
}> {
  const response = await apiClient.get("/auth/sessions");
  return response.data;
}

export async function revokeSession(sessionId: string): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.delete(`/auth/sessions/${sessionId}`);
  return response.data;
}

export async function revokeAllSessions(): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.delete("/auth/sessions");
  return response.data;
}