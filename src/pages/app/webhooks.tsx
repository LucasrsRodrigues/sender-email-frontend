import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Copy,
  Edit,
  Eye,
  Globe,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Webhook,
  XCircle,
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import {
  useAvailableEvents,
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useUpdateWebhook,
  useWebhookHealth,
  useWebhookStats,
  useWebhooks,
} from "../../hooks/queries/webhooks";

export function WebhooksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<string | null>(null);
  const [viewingLogs, setViewingLogs] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Queries
  const {
    data: webhooksData,
    isLoading: webhooksLoading,
    error: webhooksError,
  } = useWebhooks();
  const { data: eventsData } = useAvailableEvents();
  const { data: healthData } = useWebhookHealth();
  const { data: statsData } = useWebhookStats(selectedPeriod);

  // Mutations
  const createWebhookMutation = useCreateWebhook();
  const updateWebhookMutation = useUpdateWebhook();
  const deleteWebhookMutation = useDeleteWebhook();
  const testWebhookMutation = useTestWebhook();

  const webhooks = webhooksData?.data?.webhooks || [];
  const availableEvents = eventsData?.data?.events || [];
  const health = healthData?.data;
  const stats = statsData?.data;

  const filteredWebhooks = webhooks.filter(
    (webhook) =>
      webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      webhook.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateWebhook = async (data: any) => {
    try {
      await createWebhookMutation.mutateAsync(data);
      toast.success("Webhook criado com sucesso!");
      setShowCreateDialog(false);
    } catch (error) {
      toast.error(`Erro ao criar webhook: ${error.message}`);
    }
  };

  const handleUpdateWebhook = async (id: string, data: any) => {
    try {
      await updateWebhookMutation.mutateAsync({ id, data });
      toast.success("Webhook atualizado com sucesso!");
      setEditingWebhook(null);
    } catch (error) {
      toast.error(`Erro ao atualizar webhook: ${error.message}`);
    }
  };

  const handleDeleteWebhook = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o webhook "${name}"?`)) {
      return;
    }

    try {
      await deleteWebhookMutation.mutateAsync(id);
      toast.success("Webhook excluído com sucesso!");
    } catch (error) {
      toast.error(`Erro ao excluir webhook: ${error.message}`);
    }
  };

  const handleTestWebhook = async (id: string, name: string) => {
    try {
      const result = await testWebhookMutation.mutateAsync({ id });
      if (result.data.success) {
        toast.success(`Teste do webhook "${name}" executado com sucesso!`);
      } else {
        toast.error(
          `Falha no teste do webhook "${name}": ${result.data.error}`,
        );
      }
    } catch (error) {
      toast.error(`Erro ao testar webhook: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const getStatusColor = (webhook: any) => {
    if (!webhook.isActive) return "bg-gray-100 text-gray-800";
    if (webhook.failureCount > webhook.successCount * 0.1)
      return "bg-red-100 text-red-800";
    return "bg-green-100 text-green-800";
  };

  const getStatusText = (webhook: any) => {
    if (!webhook.isActive) return "Inativo";
    if (webhook.failureCount > webhook.successCount * 0.1)
      return "Com Problemas";
    return "Ativo";
  };

  if (webhooksError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar webhooks. Tente novamente.
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
          <h1 className="text-3xl font-bold text-gray-900">
            Gestão de Webhooks
          </h1>
          <p className="text-gray-600">
            Configure e monitore webhooks para eventos do sistema
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Webhook</DialogTitle>
              <DialogDescription>
                Configure um novo webhook para receber eventos do sistema
              </DialogDescription>
            </DialogHeader>
            <WebhookForm
              availableEvents={availableEvents}
              onSubmit={handleCreateWebhook}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createWebhookMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Health Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{health.totalWebhooks}</div>
              <p className="text-xs text-muted-foreground">
                Webhooks cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {health.activeWebhooks}
              </div>
              <p className="text-xs text-muted-foreground">Em funcionamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saudáveis</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {health.healthyWebhooks}
              </div>
              <p className="text-xs text-muted-foreground">Sem problemas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Erros</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {health.webhooksWithErrors}
              </div>
              <p className="text-xs text-muted-foreground">Precisam atenção</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Webhook className="w-5 h-5" />
                    <span>Webhooks Configurados</span>
                  </CardTitle>
                  <CardDescription>
                    {webhooks.length} webhook(s) cadastrado(s)
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar webhooks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {webhooksLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredWebhooks.length > 0 ? (
                <div className="space-y-4">
                  {filteredWebhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {webhook.name}
                            </h3>
                            <Badge className={getStatusColor(webhook)}>
                              {getStatusText(webhook)}
                            </Badge>
                            <Badge variant="outline">
                              {webhook.events.length} evento(s)
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2 mb-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 truncate">
                              {webhook.url}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(webhook.url)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>✓ {webhook.successCount} sucessos</span>
                            <span>✗ {webhook.failureCount} falhas</span>
                            <span>Timeout: {webhook.timeout}ms</span>
                            <span>Retry: {webhook.retryCount}x</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTestWebhook(webhook.id, webhook.name)
                            }
                            disabled={testWebhookMutation.isPending}
                          >
                            {testWebhookMutation.isPending ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingLogs(webhook.id)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingWebhook(webhook.id)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteWebhook(webhook.id, webhook.name)
                            }
                            disabled={deleteWebhookMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Webhook className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium mb-2">
                    Nenhum webhook encontrado
                  </h3>
                  <p className="text-sm">
                    {searchTerm
                      ? "Tente termos diferentes"
                      : "Crie seu primeiro webhook"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Estatísticas</span>
                  </CardTitle>
                  <CardDescription>Performance dos webhooks</CardDescription>
                </div>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {stats.totalRequests}
                      </div>
                      <div className="text-xs text-blue-800">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {stats.successRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-green-800">Taxa Sucesso</div>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">
                      {stats.avgResponseTime}ms
                    </div>
                    <div className="text-xs text-purple-800">Tempo Médio</div>
                  </div>

                  {stats.eventStats && stats.eventStats.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Top Eventos</h4>
                      <div className="space-y-2">
                        {stats.eventStats.slice(0, 5).map((event, index) => (
                          <div
                            key={event.event}
                            className="flex justify-between text-sm"
                          >
                            <span className="truncate">{event.event}</span>
                            <span className="font-medium">{event.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Carregando estatísticas...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Available Events */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Eventos Disponíveis</span>
              </CardTitle>
              <CardDescription>
                Eventos que podem ser configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableEvents.length > 0 ? (
                <div className="space-y-2">
                  {availableEvents.map((event) => (
                    <div key={event.name} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="text-xs text-gray-600">
                        {event.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Carregando eventos...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Webhook Dialog */}
      {editingWebhook && (
        <Dialog
          open={!!editingWebhook}
          onOpenChange={() => setEditingWebhook(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Webhook</DialogTitle>
              <DialogDescription>
                Modificar configurações do webhook
              </DialogDescription>
            </DialogHeader>
            <WebhookEditForm
              webhookId={editingWebhook}
              availableEvents={availableEvents}
              onSubmit={(data) => handleUpdateWebhook(editingWebhook, data)}
              onCancel={() => setEditingWebhook(null)}
              isLoading={updateWebhookMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Logs Dialog */}
      {viewingLogs && (
        <Dialog open={!!viewingLogs} onOpenChange={() => setViewingLogs(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Logs do Webhook</DialogTitle>
              <DialogDescription>
                Histórico de execuções do webhook
              </DialogDescription>
            </DialogHeader>
            <WebhookLogsView
              webhookId={viewingLogs}
              onClose={() => setViewingLogs(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componente de formulário para criar webhook
function WebhookForm({
  availableEvents,
  onSubmit,
  onCancel,
  isLoading,
}: {
  availableEvents: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    secret: "",
    events: [] as string[],
    retryCount: 3,
    timeout: 5000,
    headers: "{}",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const headers = formData.headers
        ? JSON.parse(formData.headers)
        : undefined;

      onSubmit({
        name: formData.name,
        url: formData.url,
        secret: formData.secret || undefined,
        events: formData.events,
        retryCount: formData.retryCount,
        timeout: formData.timeout,
        headers,
      });
    } catch (error) {
      toast.error("Headers inválidos: verifique o JSON");
    }
  };

  const toggleEvent = (eventName: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(eventName)
        ? prev.events.filter((e) => e !== eventName)
        : [...prev.events, eventName],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Meu Webhook"
          />
        </div>
        <div>
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://example.com/webhook"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="secret">Secret (opcional)</Label>
        <Input
          id="secret"
          value={formData.secret}
          onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
          placeholder="Chave secreta para validação"
        />
      </div>

      <div>
        <Label>Eventos * (selecione pelo menos um)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
          {availableEvents.map((event) => (
            <label
              key={event.name}
              className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.events.includes(event.name)}
                onChange={() => toggleEvent(event.name)}
                className="rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{event.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {event.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="retryCount">Tentativas</Label>
          <Input
            id="retryCount"
            type="number"
            min="0"
            max="10"
            value={formData.retryCount}
            onChange={(e) =>
              setFormData({ ...formData, retryCount: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label htmlFor="timeout">Timeout (ms)</Label>
          <Input
            id="timeout"
            type="number"
            min="1000"
            max="30000"
            value={formData.timeout}
            onChange={(e) =>
              setFormData({ ...formData, timeout: Number(e.target.value) })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="headers">Headers Customizados (JSON opcional)</Label>
        <Textarea
          id="headers"
          value={formData.headers}
          onChange={(e) =>
            setFormData({ ...formData, headers: e.target.value })
          }
          placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Webhook"
          )}
        </Button>
      </div>
    </form>
  );
}

// Componente de formulário para editar webhook (simplificado)
function WebhookEditForm({
  webhookId,
  availableEvents,
  onSubmit,
  onCancel,
  isLoading,
}: {
  webhookId: string;
  availableEvents: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  // TODO: Este seria um componente similar ao WebhookForm, mas para edição
  // Por brevidade, mostro uma versão simplificada
  return (
    <div className="space-y-4">
      <p>
        Formulário de edição do webhook {webhookId} (implementar conforme
        WebhookForm)
      </p>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSubmit({})} disabled={isLoading}>
          Salvar
        </Button>
      </div>
    </div>
  );
}

// TODO: Componente para visualizar logs (simplificado)
function WebhookLogsView({
  webhookId,
  onClose,
}: {
  webhookId: string;
  onClose: () => void;
}) {
  // Este seria um componente para mostrar os logs do webhook
  return (
    <div className="space-y-4">
      <p>Logs do webhook {webhookId} (implementar visualização de logs)</p>
      <Button onClick={onClose}>Fechar</Button>
    </div>
  );
}
