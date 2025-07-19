import { apiClient } from "../lib/axios";

export interface FlowExample {
  description: string;
  steps: Array<{
    name: string;
    delay: string;
    template: string;
  }>;
  usage: string;
}

export interface FlowExamplesResponse {
  status: string;
  data: {
    examples: {
      onboarding: FlowExample;
      passwordRecovery: FlowExample;
      marketingCampaign: FlowExample;
    };
  };
}

export interface RequiredTemplatesResponse {
  status: string;
  data: {
    templates: {
      onboarding: string[];
      passwordRecovery: string[];
      marketing: string[];
    };
  };
  message: string;
}

export interface OnboardingFlowData {
  userId: string;
  userEmail: string;
  userData: {
    name: string;
    plan?: string;
    company?: string;
  };
}

export interface PasswordRecoveryFlowData {
  userId: string;
  userEmail: string;
  resetToken: string;
  userData: {
    name: string;
    lastLogin?: string;
  };
}

export interface MarketingCampaignFlowData {
  userId: string;
  userEmail: string;
  campaignData: {
    name: string;
    campaignType: string;
    userData: Record<string, any>;
  };
}

export interface FlowResponse {
  status: string;
  message: string;
  data: {
    flowId: string;
    jobIds: string[];
    steps?: number;
    resetToken?: string;
    expiresAt?: string;
  };
}

export interface FlowStatusResponse {
  status: string;
  data: {
    flowId: string;
    totalJobs: number;
    completed: number;
    waiting: number;
    delayed: number;
    failed: number;
    jobs: Array<{
      id: string;
      name: string;
      state: string;
      processedOn?: number;
      delay: number;
    }>;
  };
}

export interface FlowStatsResponse {
  status: string;
  data: {
    period: string;
    startDate: string;
    endDate: string;
    templates: Array<{
      template: string;
      count: number;
      avgAttempts: number;
    }>;
    totalEmails: number;
  };
}

// Flow Examples and Templates
export async function getFlowExamples(): Promise<FlowExamplesResponse> {
  const response = await apiClient.get("/email/flows/examples");
  return response.data;
}

export async function getRequiredTemplates(): Promise<RequiredTemplatesResponse> {
  const response = await apiClient.get("/email/flows/required-templates");
  return response.data;
}

// Flow Creation
export async function createOnboardingFlow(data: OnboardingFlowData): Promise<FlowResponse> {
  const response = await apiClient.post("/email/flows/onboarding", data);
  return response.data;
}

export async function createPasswordRecoveryFlow(data: PasswordRecoveryFlowData): Promise<FlowResponse> {
  const response = await apiClient.post("/email/flows/password-recovery", data);
  return response.data;
}

export async function createMarketingCampaignFlow(data: MarketingCampaignFlowData): Promise<FlowResponse> {
  const response = await apiClient.post("/email/flows/marketing-campaign", data);
  return response.data;
}

// Flow Management
export async function getFlowStatus(flowId: string): Promise<FlowStatusResponse> {
  const response = await apiClient.get(`/email/flows/${flowId}/status`);
  return response.data;
}

export async function cancelFlow(flowId: string): Promise<{ status: string; message: string }> {
  const response = await apiClient.delete(`/email/flows/${flowId}`);
  return response.data;
}

export async function getFlowStats(period = "day"): Promise<FlowStatsResponse> {
  const response = await apiClient.get(`/email/flows/stats?period=${period}`);
  return response.data;
}

export async function getActiveFlows(limit = 50) {
  const response = await apiClient.get(`/email/flows?limit=${limit}`);
  return response.data;
}