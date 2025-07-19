import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  backupEmailConfigs,
  type EmailConfig,
  getEmailConfigHistory,
  getEmailConfigs,
  getEmailProvidersStatus,
  resetEmailConfigsToDefault,
  sendTestEmail,
  type TestConnectionData,
  type TestEmailData,
  testEmailConnection,
  updateEmailConfig,
  validateEmailConfigs,
} from "../../api/emailConfig";

// Queries
export const useEmailConfigs = () =>
  useQuery({
    queryKey: ["email-configs"],
    queryFn: getEmailConfigs,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

export const useEmailProvidersStatus = () =>
  useQuery({
    queryKey: ["email-providers-status"],
    queryFn: getEmailProvidersStatus,
    refetchInterval: 60000, // Atualiza a cada minuto
  });

export const useEmailConfigHistory = (limit: number = 20) =>
  useQuery({
    queryKey: ["email-config-history", limit],
    queryFn: () => getEmailConfigHistory(limit),
  });

// Mutations
export const useUpdateEmailConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      value,
      changedBy,
      reason,
    }: {
      key: keyof EmailConfig;
      value: string | number | boolean;
      changedBy?: string;
      reason?: string;
    }) => updateEmailConfig(key, value, changedBy, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-configs"] });
      queryClient.invalidateQueries({ queryKey: ["email-providers-status"] });
      queryClient.invalidateQueries({ queryKey: ["email-config-history"] });
    },
  });
};

export const useTestEmailConnection = () =>
  useMutation({
    mutationFn: (data: TestConnectionData) => testEmailConnection(data),
  });

export const useSendTestEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TestEmailData) => sendTestEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-providers-status"] });
    },
  });
};

export const useResetEmailConfigs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      configs,
      changedBy,
      reason,
    }: {
      configs: string[];
      changedBy?: string;
      reason?: string;
    }) => resetEmailConfigsToDefault(configs, changedBy, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-configs"] });
      queryClient.invalidateQueries({ queryKey: ["email-providers-status"] });
      queryClient.invalidateQueries({ queryKey: ["email-config-history"] });
    },
  });
};

export const useValidateEmailConfigs = () =>
  useMutation({
    mutationFn: (configs: Partial<EmailConfig>) =>
      validateEmailConfigs(configs),
  });

export const useBackupEmailConfigs = () =>
  useMutation({
    mutationFn: backupEmailConfigs,
  });
