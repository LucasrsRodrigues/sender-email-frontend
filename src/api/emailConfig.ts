// src/api/emailConfig.ts
import { apiClient } from "../lib/axios";

export interface EmailConfig {
  GMAIL_USER: string;
  GMAIL_PASS: string;
  GMAIL_ENABLED: boolean;
  SENDGRID_API_KEY: string;
  SENDGRID_ENABLED: boolean;
  EMAIL_RETRY_ATTEMPTS: number;
  EMAIL_RETRY_DELAY: number;
  EMAIL_RATE_LIMIT: number;
}

export interface EmailProviderStatus {
  provider: 'gmail' | 'sendgrid';
  configured: boolean;
  enabled: boolean;
  lastTested?: string;
  status: 'connected' | 'error' | 'untested';
  error?: string;
}

export interface TestConnectionData {
  provider: 'gmail' | 'sendgrid' | 'auto';
  config?: {
    user?: string;
    pass?: string;
    apiKey?: string;
  };
}

export interface TestEmailData {
  to: string;
  provider: 'gmail' | 'sendgrid' | 'auto';
}

export interface TestResult {
  success: boolean;
  provider?: string;
  message: string;
  logId?: string;
  error?: string;
  timestamp: string;
}

// Buscar configurações de email
export async function getEmailConfigs(): Promise<{
  status: string;
  data: {
    configs: EmailConfig;
    status: {
      gmail: EmailProviderStatus;
      sendgrid: EmailProviderStatus;
    };
  };
}> {
  const response = await apiClient.get("/admin/config/category/email");
  return response.data;
}

// Buscar status dos provedores
export async function getEmailProvidersStatus(): Promise<{
  status: string;
  data: {
    gmail: EmailProviderStatus;
    sendgrid: EmailProviderStatus;
  };
}> {
  const response = await apiClient.get("/admin/email/providers/status");
  return response.data;
}

// Atualizar configuração específica
export async function updateEmailConfig(
  key: keyof EmailConfig,
  value: string | number | boolean,
  changedBy: string = 'admin',
  reason: string = 'Atualização via interface'
): Promise<{
  status: string;
  message: string;
}> {
  const response = await apiClient.put(`/admin/config/${key}`, {
    value,
    changedBy,
    reason,
  });
  return response.data;
}

// Testar conexão com provedor
export async function testEmailConnection(data: TestConnectionData): Promise<{
  status: string;
  data: TestResult;
}> {
  const response = await apiClient.post("/admin/email/test-connection", data);
  return response.data;
}

// Enviar email de teste
export async function sendTestEmail(data: TestEmailData): Promise<{
  status: string;
  data: TestResult;
}> {
  const response = await apiClient.post("/admin/email/test-send", data);
  return response.data;
}

// Buscar histórico de configurações de email
export async function getEmailConfigHistory(limit: number = 20): Promise<{
  status: string;
  data: {
    history: Array<{
      id: string;
      configKey: string;
      oldValue: string;
      newValue: string;
      changedBy: string;
      reason: string;
      createdAt: string;
    }>;
  };
}> {
  const response = await apiClient.get(`/admin/config/email/history?limit=${limit}`);
  return response.data;
}

// Resetar configurações para padrão
export async function resetEmailConfigsToDefault(
  configs: string[],
  changedBy: string = 'admin',
  reason: string = 'Reset para configurações padrão'
): Promise<{
  status: string;
  message: string;
  data: {
    reset: number;
    configs: string[];
  };
}> {
  const response = await apiClient.post("/admin/config/email/reset", {
    configs,
    changedBy,
    reason,
  });
  return response.data;
}

// Validar configurações de email
export async function validateEmailConfigs(configs: Partial<EmailConfig>): Promise<{
  status: string;
  data: {
    isValid: boolean;
    errors: Array<{
      config: string;
      message: string;
    }>;
    warnings: Array<{
      config: string;
      message: string;
    }>;
  };
}> {
  const response = await apiClient.post("/admin/email/validate", { configs });
  return response.data;
}

// Backup das configurações atuais
export async function backupEmailConfigs(): Promise<{
  status: string;
  data: {
    backupId: string;
    filename: string;
    configs: EmailConfig;
    createdAt: string;
  };
}> {
  const response = await apiClient.post("/admin/config/email/backup");
  return response.data;
}