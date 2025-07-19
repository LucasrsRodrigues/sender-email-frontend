import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  FileText,
  Mail,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueueStatus } from "@/hooks/queries/admin";
import {
  useDashboardMetrics,
  useHealthCheckold,
} from "@/hooks/queries/metrics";
import { getBasicMetrics } from "../../api/metrics";

export function Dashboard() {
  const [period, setPeriod] = useState("24h");

  const {
    data: metricsData,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useDashboardMetrics();

  const {
    data: healthData,
    isLoading: healthLoading,
    error: healthError,
  } = useHealthCheckold();

  const { data: queueData, isLoading: queueLoading } = useQueueStatus();

  if (metricsError || healthError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do dashboard. Verifique a conexão com a API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = metricsData?.data || {};
  const health = healthData || {};
  const queueStats = queueData?.data || {};

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de emails</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hora</SelectItem>
              <SelectItem value="24h">24 horas</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchMetrics()}
            disabled={metricsLoading}
          >
            <RefreshCw
              className={`w-4 h-4 ${metricsLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Health Status */}
      {healthData && (
        <div className="mb-6">
          <Alert
            variant={health.status === "healthy" ? "default" : "destructive"}
          >
            {health.status === "healthy" ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>
              Sistema{" "}
              {health.status === "healthy"
                ? "operando normalmente"
                : "com problemas"}
              {health.version && ` - Versão ${health.version}`}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Emails"
          value={
            metricsLoading
              ? "..."
              : (metrics.email?.totalEmails || 0).toLocaleString()
          }
          icon={Mail}
          color="blue"
          subtitle={`Período: ${period}`}
        />
        <StatCard
          title="Taxa de Sucesso"
          value={metricsLoading ? "..." : `${metrics.email?.successRate || 0}%`}
          icon={Check}
          color="green"
          subtitle={`${metrics.email?.sentEmails || 0} enviados`}
        />
        <StatCard
          title="Templates Ativos"
          value={metricsLoading ? "..." : metrics.templates?.active || 0}
          icon={FileText}
          color="purple"
          subtitle="Disponíveis"
        />
        <StatCard
          title="Fila de Envio"
          value={queueLoading ? "..." : queueStats.waiting || 0}
          icon={Clock}
          color="orange"
          subtitle={`${queueStats.active || 0} processando`}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Email Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Performance de Emails</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <PerformanceItem
                  label="Emails Enviados"
                  value={metrics.email?.sentEmails || 0}
                  color="green"
                />
                <PerformanceItem
                  label="Emails Falharam"
                  value={metrics.email?.failedEmails || 0}
                  color="red"
                />
                <PerformanceItem
                  label="Emails Pendentes"
                  value={metrics.email?.pendingEmails || 0}
                  color="blue"
                />
                <PerformanceItem
                  label="Tempo Médio"
                  value={`${metrics.email?.averageProcessingTime || 0}ms`}
                  color="gray"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Status da Fila</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {queueLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <QueueStatus
                  label="Aguardando"
                  count={queueStats.waiting || 0}
                  color="blue"
                />
                <QueueStatus
                  label="Processando"
                  count={queueStats.active || 0}
                  color="green"
                />
                <QueueStatus
                  label="Completados"
                  count={queueStats.completed || 0}
                  color="gray"
                />
                <QueueStatus
                  label="Falharam"
                  count={queueStats.failed || 0}
                  color="red"
                />
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <Badge
                      variant={queueStats.paused ? "secondary" : "default"}
                    >
                      {queueStats.paused ? "Pausada" : "Ativa"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Provider Stats */}
      {metrics?.email?.providerStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Estatísticas por Provedor</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProviderStat
                  name="Gmail"
                  count={metrics.email.providerStats.gmail || 0}
                  total={metrics.email.totalEmails || 1}
                />
                <ProviderStat
                  name="SendGrid"
                  count={metrics.email.providerStats.sendgrid || 0}
                  total={metrics.email.totalEmails || 1}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>Saúde do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <HealthItem
                  service="Database"
                  status={health.services?.database?.status || "unknown"}
                  responseTime={health.services?.database?.responseTime}
                />
                <HealthItem
                  service="Redis"
                  status={health.services?.redis?.status || "unknown"}
                />
                <HealthItem
                  service="Email Queue"
                  status={queueStats.isHealthy ? "healthy" : "unhealthy"}
                />
                {health.memory && (
                  <div className="pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      Memória:{" "}
                      {Math.round(health.memory.heapUsed / 1024 / 1024)}MB /
                      {Math.round(health.memory.rss / 1024 / 1024)}MB
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Componentes auxiliares
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceItem = ({ label, value, color }) => {
  const colorClasses = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    gray: "text-gray-600",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-sm font-bold ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  );
};

const QueueStatus = ({ label, count, color }) => {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <Badge className={colorClasses[color]}>{count}</Badge>
    </div>
  );
};

const ProviderStat = ({ name, count, total }) => {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{name}</span>
        <span className="text-sm text-gray-600">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const HealthItem = ({ service, status, responseTime }) => {
  const statusColors = {
    healthy: "bg-green-100 text-green-800",
    unhealthy: "bg-red-100 text-red-800",
    unknown: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{service}</span>
      <div className="flex items-center space-x-2">
        {responseTime && (
          <span className="text-xs text-gray-500">{responseTime}</span>
        )}
        <Badge className={statusColors[status] || statusColors.unknown}>
          {status === "healthy"
            ? "OK"
            : status === "unhealthy"
              ? "Erro"
              : "N/A"}
        </Badge>
      </div>
    </div>
  );
};
