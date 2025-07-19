import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  Download,
  Eye,
  FileText,
  Filter,
  LineChart,
  Mail,
  Monitor,
  PieChart,
  Plus,
  RefreshCw,
  Shield,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  useAnalyticsAlerts,
  useAnalyticsOverview,
  useEmailAnalytics,
  useExportAnalytics,
  useRealTimeMetrics,
  useSecurityAnalytics,
  useSystemAnalytics,
  useUserAnalytics,
} from "../../hooks/queries/analytics";

export function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Queries
  const { data: overviewData, isLoading: overviewLoading } =
    useAnalyticsOverview(selectedPeriod);
  const { data: emailData } = useEmailAnalytics(selectedPeriod);
  const { data: systemData } = useSystemAnalytics(selectedPeriod);
  const { data: userData } = useUserAnalytics(selectedPeriod);
  const { data: securityData } = useSecurityAnalytics(selectedPeriod);
  const { data: realtimeData } = useRealTimeMetrics();
  const { data: alertsData } = useAnalyticsAlerts();

  // Mutations
  const exportMutation = useExportAnalytics();

  const overview = overviewData?.data;
  const emails = emailData?.data;
  const system = systemData?.data;
  const users = userData?.data;
  const security = securityData?.data;
  const realtime = realtimeData?.data;
  const alerts = alertsData?.data?.alerts || [];

  const handleExport = async (type: string, format: string) => {
    try {
      const result = await exportMutation.mutateAsync({
        type: type as any,
        period: selectedPeriod,
        format: format as any,
      });

      // Abrir link de download
      window.open(result.data.downloadUrl, "_blank");
      toast.success(`Exportação iniciada! Arquivo: ${result.data.filename}`);
      setShowExportDialog(false);
    } catch (error: any) {
      toast.error(
        `Erro ao exportar: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const formatBytes = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous)
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics & Monitoramento
          </h1>
          <p className="text-gray-600">
            Análise completa de performance e métricas do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Último dia</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exportar Analytics</DialogTitle>
                <DialogDescription>
                  Escolha o tipo de dados e formato para exportação
                </DialogDescription>
              </DialogHeader>
              <ExportForm
                onExport={handleExport}
                onCancel={() => setShowExportDialog(false)}
                isLoading={exportMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Real-time Metrics */}
      {realtime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Métricas em Tempo Real</span>
            </CardTitle>
            <CardDescription>
              Dados atualizados a cada 5 segundos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {realtime.emailsInQueue}
                </div>
                <div className="text-sm text-blue-800">Emails na Fila</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {realtime.activeUsers}
                </div>
                <div className="text-sm text-green-800">Usuários Ativos</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(realtime.systemLoad)}
                </div>
                <div className="text-sm text-purple-800">Carga do Sistema</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {formatPercentage(realtime.errorRate)}
                </div>
                <div className="text-sm text-red-800">Taxa de Erro</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {realtime.throughput}/s
                </div>
                <div className="text-sm text-orange-800">Throughput</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas Ativos ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <Alert
                  key={alert.id}
                  variant={
                    alert.severity === "critical" ? "destructive" : "default"
                  }
                >
                  {getAlertIcon(alert.severity)}
                  <AlertDescription className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {overviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : overview ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Email Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Emails Enviados
                  </CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(overview.emails.totalEmails)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(
                      overview.emails.totalEmails,
                      overview.emails.totalEmails * 0.9,
                    )}
                    <span className="ml-1">
                      Taxa de sucesso:{" "}
                      {formatPercentage(overview.emails.successRate)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* System Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(overview.system.uptime)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Activity className="w-3 h-3 mr-1 text-green-500" />
                    <span>
                      CPU: {formatPercentage(overview.system.cpuUsage)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Users Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Usuários Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overview.users.activeUsers}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {getTrendIcon(
                      overview.users.newUsers,
                      overview.users.newUsers * 0.8,
                    )}
                    <span className="ml-1">
                      +{overview.users.newUsers} novos
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Segurança
                  </CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overview.security.loginAttempts}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                    <span>{overview.security.failedLogins} falharam</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-6">
          {emails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Email Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Estatísticas de Email</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {formatNumber(emails.successfulEmails)}
                      </div>
                      <div className="text-sm text-green-800">Enviados</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">
                        {formatNumber(emails.failedEmails)}
                      </div>
                      <div className="text-sm text-red-800">Falharam</div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {formatPercentage(emails.successRate)}
                    </div>
                    <div className="text-sm text-blue-800">Taxa de Sucesso</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {emails.avgResponseTime}ms
                    </div>
                    <div className="text-sm text-purple-800">Tempo Médio</div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Performance por Provedor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emails.providerStats.map((provider, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <div className="font-medium capitalize">
                            {provider.provider}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatNumber(provider.count)} emails
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatPercentage(provider.successRate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {provider.avgResponseTime}ms
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Template Performance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Top Templates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {emails.templateStats.slice(0, 5).map((template, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">#{index + 1}</span>
                          <div>
                            <div className="font-medium">
                              {template.template}
                            </div>
                            <div className="text-sm text-gray-600">
                              {formatNumber(template.count)} usos
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatPercentage(template.successRate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {template.avgAttempts.toFixed(1)} tentativas
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          {system && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>Recursos do Sistema</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">CPU</span>
                      <span className="text-sm font-medium">
                        {formatPercentage(system.cpuUsage)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${system.cpuUsage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Memória</span>
                      <span className="text-sm font-medium">
                        {formatBytes(system.memoryUsage.used)} /{" "}
                        {formatBytes(system.memoryUsage.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${system.memoryUsage.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Disco</span>
                      <span className="text-sm font-medium">
                        {formatBytes(system.diskUsage.used)} /{" "}
                        {formatBytes(system.diskUsage.total)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${system.diskUsage.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Performance de Rede</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {system.networkStats.requestsPerSecond}
                      </div>
                      <div className="text-sm text-blue-800">
                        Requests/segundo
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {system.networkStats.avgLatency}ms
                      </div>
                      <div className="text-sm text-green-800">
                        Latência Média
                      </div>
                    </div>

                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">
                        {formatPercentage(system.networkStats.errorRate)}
                      </div>
                      <div className="text-sm text-red-800">Taxa de Erro</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Queue Performance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="w-5 h-5" />
                    <span>Performance da Fila</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">
                        {system.queueStats.waiting}
                      </div>
                      <div className="text-sm text-yellow-800">Aguardando</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {system.queueStats.active}
                      </div>
                      <div className="text-sm text-blue-800">Ativos</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {formatNumber(system.queueStats.completed)}
                      </div>
                      <div className="text-sm text-green-800">Concluídos</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">
                        {system.queueStats.failed}
                      </div>
                      <div className="text-sm text-red-800">Falharam</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        {system.queueStats.throughput}
                      </div>
                      <div className="text-sm text-purple-800">Throughput</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {users && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Estatísticas de Usuários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {users.totalUsers}
                      </div>
                      <div className="text-sm text-blue-800">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {users.activeUsers}
                      </div>
                      <div className="text-sm text-green-800">Ativos</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        {users.newUsers}
                      </div>
                      <div className="text-sm text-purple-800">Novos</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        +{formatPercentage(users.userGrowth)}
                      </div>
                      <div className="text-sm text-orange-800">Crescimento</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Login Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividade de Login</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {formatNumber(users.loginStats.totalLogins)}
                    </div>
                    <div className="text-sm text-blue-800">Total de Logins</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {users.loginStats.uniqueLogins}
                    </div>
                    <div className="text-sm text-green-800">
                      Usuários Únicos
                    </div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {Math.round(users.loginStats.avgSessionDuration)}min
                    </div>
                    <div className="text-sm text-purple-800">Sessão Média</div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Users */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Usuários Mais Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {users.topUsers.slice(0, 5).map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">#{index + 1}</span>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-gray-600">
                              Último login:{" "}
                              {new Date(user.lastLogin).toLocaleDateString(
                                "pt-BR",
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatNumber(user.emailsSent)}
                          </div>
                          <div className="text-sm text-gray-600">
                            emails enviados
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {security && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Security Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Estatísticas de Segurança</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {formatNumber(security.loginAttempts)}
                      </div>
                      <div className="text-sm text-blue-800">Tentativas</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-600">
                        {security.failedLogins}
                      </div>
                      <div className="text-sm text-red-800">Falharam</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">
                        {security.blockedIPs}
                      </div>
                      <div className="text-sm text-yellow-800">
                        IPs Bloqueados
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        {security.suspiciousActivity}
                      </div>
                      <div className="text-sm text-orange-800">
                        Atividades Suspeitas
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Auth Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance de Autenticação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {formatPercentage(
                        security.authenticationStats.successRate,
                      )}
                    </div>
                    <div className="text-sm text-green-800">
                      Taxa de Sucesso
                    </div>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {Math.round(
                        security.authenticationStats.avgSessionDuration,
                      )}
                      min
                    </div>
                    <div className="text-sm text-blue-800">Sessão Média</div>
                  </div>

                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">
                      {security.authenticationStats.multipleFailures}
                    </div>
                    <div className="text-sm text-red-800">Múltiplas Falhas</div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Events */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Eventos de Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {security.securityEvents.map((event, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {getAlertIcon(event.severity)}
                          <div>
                            <div className="font-medium">{event.type}</div>
                            <div className="text-sm text-gray-600">
                              Severidade: {event.severity}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{event.count}</div>
                          <div className="text-sm text-gray-600">
                            ocorrências
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente de formulário para exportar dados
function ExportForm({
  onExport,
  onCancel,
  isLoading,
}: {
  onExport: (type: string, format: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [exportType, setExportType] = useState("email");
  const [exportFormat, setExportFormat] = useState("csv");

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Tipo de Dados:</label>
        <Select value={exportType} onValueChange={setExportType}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email">Analytics de Email</SelectItem>
            <SelectItem value="system">Analytics do Sistema</SelectItem>
            <SelectItem value="user">Analytics de Usuários</SelectItem>
            <SelectItem value="security">Analytics de Segurança</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Formato:</label>
        <Select value={exportFormat} onValueChange={setExportFormat}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() => onExport(exportType, exportFormat)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
