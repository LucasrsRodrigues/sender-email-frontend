import {
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  History,
  Mail,
  RefreshCw,
  Save,
  Settings,
  Shield,
  TestTube,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useEmailConfigHistory,
  useEmailConfigs,
  useEmailProvidersStatus,
  useSendTestEmail,
  useTestEmailConnection,
  useUpdateEmailConfig,
  useValidateEmailConfigs,
} from "../../../hooks/queries/emailConfig";

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: string;
}

const PasswordInput = ({
  label,
  value,
  onChange,
  placeholder,
  help,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const maskedValue = value
    ? `${"•".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`
    : "";

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        {isEditing ? (
          <Input
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="pr-10"
          />
        ) : (
          <Input
            type="text"
            value={maskedValue}
            onClick={() => setIsEditing(true)}
            placeholder={placeholder || "Clique para editar"}
            className="pr-10 cursor-pointer"
            readOnly
          />
        )}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      </div>
      {help && <p className="text-xs text-gray-500">{help}</p>}
      {isEditing && (
        <div className="flex space-x-2">
          <Button size="sm" onClick={() => setIsEditing(false)}>
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  );
};

const StatusCard = ({
  title,
  status,
  provider,
  lastTested,
  error,
}: {
  title: string;
  status: "connected" | "error" | "untested";
  provider: "primary" | "fallback";
  lastTested?: string;
  error?: string;
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-100 text-green-800">✅ Conectado</Badge>
        );
      case "error":
        return <Badge variant="destructive">❌ Erro</Badge>;
      default:
        return <Badge variant="secondary">⚠️ Não testado</Badge>;
    }
  };

  return (
    <Card
      className={`status-card ${status === "connected" ? "border-green-200" : status === "error" ? "border-red-200" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium">{title}</h3>
            {getStatusBadge()}
          </div>
          <div className="text-2xl">{provider === "primary" ? "🥇" : "🥈"}</div>
        </div>
        {lastTested && (
          <p className="text-xs text-gray-500">
            Último teste: {new Date(lastTested).toLocaleString("pt-BR")}
          </p>
        )}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </CardContent>
    </Card>
  );
};

export function EmailSettingsPage() {
  const [configs, setConfigs] = useState<any>({});
  const [testEmail, setTestEmail] = useState("");
  const [testProvider, setTestProvider] = useState("auto");
  const [testResult, setTestResult] = useState<any>(null);

  // Queries
  const { data: configsData, isLoading } = useEmailConfigs();
  const { data: statusData } = useEmailProvidersStatus();
  const { data: historyData } = useEmailConfigHistory();

  // Mutations
  const updateConfigMutation = useUpdateEmailConfig();
  const testConnectionMutation = useTestEmailConnection();
  const sendTestEmailMutation = useSendTestEmail();
  const validateConfigsMutation = useValidateEmailConfigs();

  // Auto-save debounce
  useEffect(() => {
    if (configsData?.data?.configs) {
      setConfigs(configsData.data.configs);
    }
  }, [configsData]);

  const handleConfigChange = async (key: string, value: any) => {
    setConfigs((prev: any) => ({ ...prev, [key]: value }));

    try {
      await updateConfigMutation.mutateAsync({
        key: key as any,
        value,
        reason: `Atualização via interface: ${key}`,
      });
      toast.success("Configuração salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configuração");
      console.error(error);
    }
  };

  const handleTestConnection = async (provider: "gmail" | "sendgrid") => {
    try {
      const config =
        provider === "gmail"
          ? { user: configs.GMAIL_USER, pass: configs.GMAIL_PASS }
          : { apiKey: configs.SENDGRID_API_KEY };

      const result = await testConnectionMutation.mutateAsync({
        provider,
        config,
      });

      if (result.data.success) {
        toast.success(
          `${provider === "gmail" ? "Gmail" : "SendGrid"} conectado com sucesso!`,
        );
      } else {
        toast.error(`Erro na conexão: ${result.data.message}`);
      }
    } catch (error) {
      toast.error("Erro ao testar conexão");
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Digite um email para teste");
      return;
    }

    try {
      const result = await sendTestEmailMutation.mutateAsync({
        to: testEmail,
        provider: testProvider as any,
      });

      setTestResult(result.data);

      if (result.data.success) {
        toast.success(
          `Email de teste enviado com sucesso via ${result.data.provider}!`,
        );
      } else {
        toast.error(`Falha no envio: ${result.data.message}`);
      }
    } catch (error) {
      toast.error("Erro ao enviar email de teste");
      setTestResult({
        success: false,
        message: "Erro na requisição",
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const gmailStatus = statusData?.data?.gmail;
  const sendgridStatus = statusData?.data?.sendgrid;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Mail className="w-8 h-8 text-blue-600" />
          <span>Configurações de Email</span>
        </h1>
        <p className="text-gray-600">
          Gerencie provedores SMTP e configurações de envio
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatusCard
          title="Gmail SMTP"
          status={gmailStatus?.status || "untested"}
          provider="primary"
          lastTested={gmailStatus?.lastTested}
          error={gmailStatus?.error}
        />
        <StatusCard
          title="SendGrid"
          status={sendgridStatus?.status || "untested"}
          provider="fallback"
          lastTested={sendgridStatus?.lastTested}
          error={sendgridStatus?.error}
        />
      </div>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="providers">Provedores</TabsTrigger>
          <TabsTrigger value="general">Configurações</TabsTrigger>
          <TabsTrigger value="test">Teste</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Provedores */}
        <TabsContent value="providers" className="space-y-6">
          {/* Gmail Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-red-600" />
                <span>Gmail SMTP (Provedor Principal)</span>
              </CardTitle>
              <CardDescription>
                Configuração do Gmail para envio de emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gmail-user">Email Gmail</Label>
                <Input
                  id="gmail-user"
                  type="email"
                  value={configs.GMAIL_USER || ""}
                  onChange={(e) =>
                    handleConfigChange("GMAIL_USER", e.target.value)
                  }
                  placeholder="seu-email@gmail.com"
                />
              </div>

              <PasswordInput
                label="Senha de App"
                value={configs.GMAIL_PASS || ""}
                onChange={(value) => handleConfigChange("GMAIL_PASS", value)}
                placeholder="••••••••••••••••"
                help="Use senha de app, não a senha normal da conta Gmail"
              />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Ativar Gmail SMTP</Label>
                  <p className="text-sm text-gray-500">
                    Provider principal para envio
                  </p>
                </div>
                <Switch
                  checked={configs.GMAIL_ENABLED}
                  onCheckedChange={(checked) =>
                    handleConfigChange("GMAIL_ENABLED", checked)
                  }
                />
              </div>

              <Button
                variant="outline"
                onClick={() => handleTestConnection("gmail")}
                disabled={
                  !configs.GMAIL_USER ||
                  !configs.GMAIL_PASS ||
                  testConnectionMutation.isPending
                }
              >
                {testConnectionMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                Testar Conexão Gmail
              </Button>
            </CardContent>
          </Card>

          {/* SendGrid Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>SendGrid (Fallback)</span>
              </CardTitle>
              <CardDescription>
                Usado automaticamente quando Gmail falha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PasswordInput
                label="API Key SendGrid"
                value={configs.SENDGRID_API_KEY || ""}
                onChange={(value) =>
                  handleConfigChange("SENDGRID_API_KEY", value)
                }
                placeholder="SG.••••••••••••••••"
                help="API Key do SendGrid para fallback"
              />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Ativar SendGrid</Label>
                  <p className="text-sm text-gray-500">
                    Fallback quando Gmail não funciona
                  </p>
                </div>
                <Switch
                  checked={configs.SENDGRID_ENABLED}
                  onCheckedChange={(checked) =>
                    handleConfigChange("SENDGRID_ENABLED", checked)
                  }
                />
              </div>

              <Button
                variant="outline"
                onClick={() => handleTestConnection("sendgrid")}
                disabled={
                  !configs.SENDGRID_API_KEY || testConnectionMutation.isPending
                }
              >
                {testConnectionMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <TestTube className="w-4 h-4 mr-2" />
                )}
                Testar Conexão SendGrid
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Gerais */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Configurações Gerais</span>
              </CardTitle>
              <CardDescription>
                Configurações de retry, rate limiting e timeout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="retry-attempts">Tentativas de Reenvio</Label>
                <Input
                  id="retry-attempts"
                  type="number"
                  min="1"
                  max="10"
                  value={configs.EMAIL_RETRY_ATTEMPTS || 3}
                  onChange={(e) =>
                    handleConfigChange(
                      "EMAIL_RETRY_ATTEMPTS",
                      parseInt(e.target.value),
                    )
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número de tentativas antes de marcar como falha
                </p>
              </div>

              <div>
                <Label htmlFor="retry-delay">Delay entre Tentativas (ms)</Label>
                <Input
                  id="retry-delay"
                  type="number"
                  min="1000"
                  max="60000"
                  value={configs.EMAIL_RETRY_DELAY || 2000}
                  onChange={(e) =>
                    handleConfigChange(
                      "EMAIL_RETRY_DELAY",
                      parseInt(e.target.value),
                    )
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Delay em milissegundos entre tentativas
                </p>
              </div>

              <div>
                <Label htmlFor="rate-limit">Rate Limit (emails/min)</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  min="1"
                  max="1000"
                  value={configs.EMAIL_RATE_LIMIT || 60}
                  onChange={(e) =>
                    handleConfigChange(
                      "EMAIL_RATE_LIMIT",
                      parseInt(e.target.value),
                    )
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Máximo de emails por minuto
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teste */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span>Testar Configurações</span>
              </CardTitle>
              <CardDescription>
                Envie um email de teste para validar as configurações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-email">Email de Teste</Label>
                <Input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="teste@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="test-provider">Provedor</Label>
                <Select value={testProvider} onValueChange={setTestProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">
                      Automático (Gmail → SendGrid)
                    </SelectItem>
                    <SelectItem value="gmail">Apenas Gmail</SelectItem>
                    <SelectItem value="sendgrid">Apenas SendGrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSendTestEmail}
                disabled={!testEmail || sendTestEmailMutation.isPending}
                className="w-full"
              >
                {sendTestEmailMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Enviar Email de Teste
              </Button>

              {testResult && (
                <Alert
                  className={
                    testResult.success ? "border-green-200" : "border-red-200"
                  }
                >
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <strong>{testResult.success ? "Sucesso" : "Falha"}:</strong>{" "}
                    {testResult.message}
                    {testResult.provider && (
                      <span className="block text-sm mt-1">
                        Provedor usado: {testResult.provider}
                      </span>
                    )}
                    {testResult.logId && (
                      <span className="block text-xs text-gray-500 mt-1">
                        Log ID: {testResult.logId}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="w-5 h-5" />
                <span>Histórico de Mudanças</span>
              </CardTitle>
              <CardDescription>
                Últimas alterações nas configurações de email
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyData?.data?.history?.length > 0 ? (
                <div className="space-y-4">
                  {historyData.data.history.map((item: any) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{item.configKey}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Anterior:</span>
                          <code className="block bg-red-50 p-2 rounded mt-1">
                            {item.configKey.includes("PASS") ||
                              item.configKey.includes("KEY")
                              ? "••••••••"
                              : item.oldValue}
                          </code>
                        </div>
                        <div>
                          <span className="text-gray-600">Novo:</span>
                          <code className="block bg-green-50 p-2 rounded mt-1">
                            {item.configKey.includes("PASS") ||
                              item.configKey.includes("KEY")
                              ? "••••••••"
                              : item.newValue}
                          </code>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Alterado por:</strong> {item.changedBy} •
                        <strong> Motivo:</strong> {item.reason}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma alteração encontrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
