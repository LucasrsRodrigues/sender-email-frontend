import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelFlow,
  createMarketingCampaignFlow,
  createOnboardingFlow,
  createPasswordRecoveryFlow,
  getActiveFlows,
  getFlowExamples,
  getFlowStats,
  getFlowStatus,
  getRequiredTemplates,
  type MarketingCampaignFlowData,
  type OnboardingFlowData,
  type PasswordRecoveryFlowData,
} from "../../api/flows";

// Queries
export const useFlowExamples = () =>
  useQuery({
    queryKey: ["flow-examples"],
    queryFn: getFlowExamples,
    staleTime: 300000, // 5 minutos
  });

export const useRequiredTemplates = () =>
  useQuery({
    queryKey: ["required-templates"],
    queryFn: getRequiredTemplates,
    staleTime: 300000, // 5 minutos
  });

export const useFlowStatus = (flowId: string) =>
  useQuery({
    queryKey: ["flow-status", flowId],
    queryFn: () => getFlowStatus(flowId),
    enabled: !!flowId,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

export const useFlowStats = (period = "day") =>
  useQuery({
    queryKey: ["flow-stats", period],
    queryFn: () => getFlowStats(period),
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

export const useActiveFlows = (limit = 50) =>
  useQuery({
    queryKey: ["active-flows", limit],
    queryFn: () => getActiveFlows(limit),
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

// Mutations
export const useCreateOnboardingFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingFlowData) => createOnboardingFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-flows"] });
      queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
};

export const useCreatePasswordRecoveryFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PasswordRecoveryFlowData) =>
      createPasswordRecoveryFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-flows"] });
      queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
};

export const useCreateMarketingCampaignFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MarketingCampaignFlowData) =>
      createMarketingCampaignFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-flows"] });
      queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
      queryClient.invalidateQueries({ queryKey: ["metrics"] });
    },
  });
};

export const useCancelFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flowId: string) => cancelFlow(flowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-flows"] });
      queryClient.invalidateQueries({ queryKey: ["flow-stats"] });
      queryClient.invalidateQueries({ queryKey: ["flow-status"] });
    },
  });
};
