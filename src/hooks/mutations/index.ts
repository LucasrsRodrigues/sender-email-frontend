import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addAllowedIP,
  addBlockedDomain,
  cancelFlow,
  cleanQueue,
  createTemplate,
  pauseQueue,
  previewTemplate,
  removeAllowedIP,
  removeBlockedDomain,
  resumeQueue,
  retryFailedJobs,
  sendEmail,
  toggleTemplate,
  updateConfig,
  updateTemplate,
} from "@/api"; // Ajuste o caminho conforme sua estrutura

// ------------------ EMAIL ------------------
export const useSendEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
    },
  });
};

// ------------------ TEMPLATES ------------------
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, data }: { name: string; data: any }) =>
      updateTemplate(name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

export const useToggleTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      isActive,
      updatedBy,
    }: {
      name: string;
      isActive: boolean;
      updatedBy: string;
    }) => toggleTemplate(name, isActive, updatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
};

export const useTemplatePreview = () =>
  useMutation({
    mutationFn: ({ name, variables }: { name: string; variables: any }) =>
      previewTemplate(name, variables),
  });

// ------------------ QUEUE ------------------
export const usePauseQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pauseQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-status"] });
    },
  });
};

export const useResumeQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resumeQueue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-status"] });
    },
  });
};

export const useRetryFailedJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (limit: number) => retryFailedJobs(limit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-status"] });
      queryClient.invalidateQueries({ queryKey: ["queue-stats"] });
    },
  });
};

export const useCleanQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ grace, status }: { grace: number; status: string }) =>
      cleanQueue(grace, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue-status"] });
      queryClient.invalidateQueries({ queryKey: ["queue-stats"] });
    },
  });
};

// ------------------ SECURITY ------------------
export const useAddAllowedIP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addAllowedIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowed-ips"] });
    },
  });
};

export const useRemoveAllowedIP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ip: string) => removeAllowedIP(ip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowed-ips"] });
    },
  });
};

export const useAddBlockedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBlockedDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
    },
  });
};

export const useRemoveBlockedDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domain: string) => removeBlockedDomain(domain),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-domains"] });
    },
  });
};

// ------------------ CONFIG ------------------
export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      value,
      changedBy,
      reason,
    }: {
      key: string;
      value: any;
      changedBy: string;
      reason: string;
    }) => updateConfig(key, value, changedBy, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configs"] });
    },
  });
};

// ------------------ FLOWS ------------------
export const useCancelFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flowId: string) => cancelFlow(flowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-flows"] });
      queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
    },
  });
};
