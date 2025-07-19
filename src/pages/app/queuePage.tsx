import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Badge,
  Check,
  Clock,
  Pause,
  Play,
  RefreshCw,
  Settings,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  useCleanQueue,
  usePauseQueue,
  useResumeQueue,
  useRetryFailedJobs,
} from "../../hooks/mutations";
import { useQueueStats, useQueueStatus } from "../../hooks/queries";

export function QueuePage() {
  const [retryLimit, setRetryLimit] = useState(10);
  const [cleanGrace, setCleanGrace] = useState(3600000); // 1 hour
  const [cleanStatus, setCleanStatus] = useState("completed");

  // Queries and Mutations
  const {
    data: queueStatusData,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useQueueStatus();

  const {
    data: queueStatsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQueueStats();

  const pauseQueueMutation = usePauseQueue();
  const resumeQueueMutation = useResumeQueue();
  const retryFailedMutation = useRetryFailedJobs();
  const cleanQueueMutation = useCleanQueue();

  const queueStatus = queueStatusData?.data || {};
  const queueStats = queueStatsData?.data || {};

  const handleTogglePause = async () => {
    try {
      if (queueStatus.paused) {
        await resumeQueueMutation.mutateAsync();
      } else {
        await pauseQueueMutation.mutateAsync();
      }
    } catch (error) {
      console.error("Erro ao alterar status da fila:", error);
    }
  };

  const handleRetryFailed = async () => {
    try {
      await retryFailedMutation.mutateAsync(retryLimit);
    } catch (error) {
      console.error("Erro ao reprocessar jobs falhados:", error);
    }
  };

  const handleCleanQueue = async () => {
    try {
      await cleanQueueMutation.mutateAsync({
        grace: cleanGrace,
        status: cleanStatus,
      });
    } catch (error) {
      console.error("Erro ao limpar fila:", error);
    }
  };

  const refreshAll = () => {
    refetchStatus();
    refetchStats();
  };

  if (statusError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados da fila. Verifique a conexão com a API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Filas</h1>
          <p className="text-gray-600">
            Monitore e controle as filas de processamento
          </p>
        </div>
        <Button
          onClick={refreshAll}
          variant="outline"
          disabled={statusLoading || statsLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${statusLoading || statsLoading ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      {/* Success/Error Messages */}
      {(pauseQueueMutation.isSuccess || resumeQueueMutation.isSuccess) && (
        <Alert className="mb-4">
          <Check className="h-4 w-4" />
          <AlertDescription>Operação realizada com sucesso!</AlertDescription>
        </Alert>
      )}

      {retryFailedMutation.isSuccess && (
        <Alert className="mb-4">
          <Check className="h-4 w-4" />
          <AlertDescription>
            {retryFailedMutation.data?.data?.retried || 0} jobs reprocessados
            com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {cleanQueueMutation.isSuccess && (
        <Alert className="mb-4">
          <Check className="h-4 w-4" />
          <AlertDescription>
            {cleanQueueMutation.data?.data?.cleaned || 0} jobs removidos da
            fila!
          </AlertDescription>
        </Alert>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Queue Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Status da Fila</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nome da Fila:</span>
                  <Badge variant="outline">
                    {queueStatus.queueName || "email"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saúde:</span>
                  <Badge
                    variant={queueStatus.isHealthy ? "default" : "destructive"}
                  >
                    {queueStatus.isHealthy ? "Saudável" : "Com Problemas"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge variant={queueStatus.paused ? "secondary" : "default"}>
                    {queueStatus.paused ? "Pausada" : "Ativa"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Workers:</span>
                  <span className="text-sm font-medium">
                    {queueStatus.workers || 0}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Controles</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full"
              variant={queueStatus.paused ? "default" : "outline"}
              onClick={handleTogglePause}
              disabled={
                pauseQueueMutation.isPending || resumeQueueMutation.isPending
              }
            >
              {queueStatus.paused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Retomar Fila
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar Fila
                </>
              )}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reprocessar Falhas
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reprocessar Jobs Falhados</DialogTitle>
                  <DialogDescription>
                    Quantos jobs falhados você deseja reprocessar?
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="retryLimit">Limite de Jobs</Label>
                    <Input
                      id="retryLimit"
                      type="number"
                      value={retryLimit}
                      onChange={(e) =>
                        setRetryLimit(parseInt(e.target.value) || 0)
                      }
                      min="1"
                      max="100"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button
                      onClick={handleRetryFailed}
                      disabled={retryFailedMutation.isPending}
                    >
                      {retryFailedMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Reprocessar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Fila
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Limpar Jobs da Fila</DialogTitle>
                  <DialogDescription>
                    Remove jobs antigos para otimizar performance
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cleanGrace">Tempo de Vida (ms)</Label>
                    <Input
                      id="cleanGrace"
                      type="number"
                      value={cleanGrace}
                      onChange={(e) =>
                        setCleanGrace(parseInt(e.target.value) || 0)
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Jobs mais antigos que este tempo serão removidos
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cleanStatus">Status dos Jobs</Label>
                    <select
                      id="cleanStatus"
                      value={cleanStatus}
                      onChange={(e) => setCleanStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="completed">Completados</option>
                      <option value="failed">Falhados</option>
                      <option value="active">Ativos</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancelar</Button>
                    <Button
                      onClick={handleCleanQueue}
                      disabled={cleanQueueMutation.isPending}
                      variant="destructive"
                    >
                      {cleanQueueMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      Limpar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Job Counts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Estatísticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {queueStatus.waiting || 0}
                  </div>
                  <div className="text-xs text-gray-500">Aguardando</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {queueStatus.active || 0}
                  </div>
                  <div className="text-xs text-gray-500">Processando</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {queueStatus.completed || 0}
                  </div>
                  <div className="text-xs text-gray-500">Completados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {queueStatus.failed || 0}
                  </div>
                  <div className="text-xs text-gray-500">Falhados</div>
                </div>
                {queueStatus.delayed > 0 && (
                  <div className="col-span-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {queueStatus.delayed}
                    </div>
                    <div className="text-xs text-gray-500">Atrasados</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      {queueStatsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Workers Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Workers Ativos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : queueStats.workers && queueStats.workers.length > 0 ? (
                <div className="space-y-3">
                  {queueStats.workers.map((worker, index) => (
                    <div key={worker.id || index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="text-sm font-medium">Worker {index + 1}</div>
                        <div className="text-xs text-gray-500">{worker.addr}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600">
                          Ativo há {Math.round(worker.age / 60)}min
                        </div>
                        <div className="text-xs text-gray-600">
                          Idle: {worker.idle}s
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum worker ativo</p>
              )}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {queueStats.metrics && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Throughput:</span>
                        <span className="text-sm font-medium">
                          {queueStats.metrics.throughput?.toFixed(2) || '0'} jobs/min
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Completados:</span>
                        <span className="text-sm font-medium">
                          {queueStats.metrics.completed || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Falhados:</span>
                        <span className="text-sm font-medium">
                          {queueStats.metrics.failed || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxa de Sucesso:</span>
                        <span className="text-sm font-medium">
                          {queueStats.metrics.completed > 0
                            ? Math.round((queueStats.metrics.completed / (queueStats.metrics.completed + queueStats.metrics.failed)) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Última Atualização:</span>
                      <span className="text-xs text-gray-500">
                        {queueStats.timestamp
                          ? new Date(queueStats.timestamp).toLocaleTimeString()
                          : new Date().toLocaleTimeString()
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health Recommendations */}
      {queueStatus.isHealthy === false && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas de Saúde</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A fila apresenta problemas de saúde. Verifique os logs e considere reiniciar os workers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Jobs em Processamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ) : queueStatus.active > 0 ? (
            <div className="space-y-3">
              {Array.from({ length: Math.min(queueStatus.active, 5) }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="text-sm font-medium">
                        Processando email #{index + 1}
                      </div>
                      <div className="text-xs text-gray-500">
                        Iniciado há ~{Math.floor(Math.random() * 60)}s
                      </div>
                    </div>
                  </div>
                  <Badge variant="default">Ativo</Badge>
                </div>
              ))}
              {queueStatus.active > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  ... e mais {queueStatus.active - 5} jobs processando
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum job sendo processado no momento</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
