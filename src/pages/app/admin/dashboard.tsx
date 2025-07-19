import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Webhook,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAdminDashboard, useAdminStats } from "../../../hooks/queries/admin";

export function AdminDashboardPage() {
  const [statsPeriod, setStatsPeriod] = useState("week");

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useAdminDashboard();

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminStats(statsPeriod);

  const dashboard = dashboardData?.data;
  const stats = statsData?.data;

  if (dashboardError || statsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">
            Visão geral do sistema de envio de emails
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetchDashboard()}
          disabled={dashboardLoading}
        >
          {dashboardLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Atualizar
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "-" : dashboard?.overview?.totalEmails?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Emails enviados até agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Hoje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "-" : dashboard?.overview?.emailsToday?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Enviados nas últimas 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "-" : dashboard?.overview.activeTemplates}
            </div>
            <p className="text-xs text-muted-foreground">
              Templates disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Ativos</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardLoading ? "-" : dashboard?.overview.activeWebhooks}
            </div>
            <p className="text-xs text-muted-foreground">
              Webhooks configurados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>Status da Fila</span>
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real da fila de emails
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={dashboard?.queue.isHealthy ? "default" : "destructive"}>
                    {dashboard?.queue.isHealthy ? "Saudável" : "Com problemas"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aguardando:</span>
                    <span className="font-medium">{dashboard?.queue.waiting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processando:</span>
                    <span className="font-medium">{dashboard?.queue.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Concluídos:</span>
                    <span className="font-medium text-green-600">{dashboard?.queue.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Falhados:</span>
                    <span className="font-medium text-red-600">{dashboard?.queue.failed}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Workers Ativos:</span>
                  <span className="font-medium">{dashboard?.queue.workers}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Erros Recentes</span>
            </CardTitle>
            <CardDescription>
              Últimos 5 emails que falharam no envio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : dashboard?.recentErrors && dashboard.recentErrors.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentErrors.map((error, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-sm font-medium text-red-900 truncate">
                      Para: {error.to}
                    </div>
                    <div className="text-xs text-red-700 truncate">
                      {error.subject}
                    </div>
                    <div className="text-xs text-red-600 mt-1 truncate">
                      {error.errorMessage}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">Nenhum erro recente</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Estatísticas</span>
              </CardTitle>
              <CardDescription>
                Análise de performance por período
              </CardDescription>
            </div>
            <Select value={statsPeriod} onValueChange={setStatsPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Último dia</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Email Stats */}
              <div>
                <h4 className="font-medium mb-3">Performance de Emails</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.email?.totalSent?.toLocaleString() ?? 0}
                    </div>
                    <div className="text-xs text-blue-800">Enviados</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats?.email?.totalFailed?.toLocaleString() ?? 0}
                    </div>
                    <div className="text-xs text-red-800">Falharam</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.email?.successRate?.toFixed(1)}%
                    </div>
                    <div className="text-xs text-green-800">Taxa de Sucesso</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.email?.avgResponseTime ?? "--"}ms
                    </div>
                    <div className="text-xs text-purple-800">Tempo Médio</div>
                  </div>
                </div>
              </div>

              {/* Top Templates */}
              {stats.templates && stats.templates.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Templates Mais Usados</h4>
                  <div className="space-y-2">
                    {stats.templates.slice(0, 5).map((template, index) => (
                      <div key={template.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{template.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{template.count} envios</span>
                          <Badge variant={template.successRate > 95 ? "default" : "secondary"}>
                            {template.successRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Dados estatísticos não disponíveis
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}