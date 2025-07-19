import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkUpdateUsers,
  type CreateUserData,
  createUser,
  deleteUser,
  getUser,
  getUserActivity,
  getUsers,
  getUsersStats,
  resetUserPassword,
  revokeUserSessions,
  toggleUserStatus,
  type UpdateUserData,
  type UserFilters,
  updateUser,
} from "../../api/users";

// Queries
export const useUsers = (filters: UserFilters = {}) =>
  useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
    keepPreviousData: true, // Mantém dados anteriores durante loading
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });

export const useUsersStats = () =>
  useQuery({
    queryKey: ["users-stats"],
    queryFn: getUsersStats,
    refetchInterval: 60000, // Atualiza a cada minuto
  });

export const useUserActivity = (id: string, period = "week") =>
  useQuery({
    queryKey: ["user-activity", id, period],
    queryFn: () => getUserActivity(id, period),
    enabled: !!id,
  });

// Mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleUserStatus(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};

export const useRevokeUserSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeUserSessions(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};

export const useBulkUpdateUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      userIds: string[];
      action: "activate" | "deactivate" | "delete" | "change-role";
      role?: "ADMIN" | "USER";
    }) => bulkUpdateUsers(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
    },
  });
};
