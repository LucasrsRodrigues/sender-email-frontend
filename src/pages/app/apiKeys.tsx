import {
  Activity,
  AlertTriangle,
  Calendar,
  Copy,
  Edit,
  Eye,
  EyeOff,
  Key,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
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
import {
  useApiKeyStats,
  useApiKeys,
  useCreateApiKey,
  useDeleteApiKey,
  useRegenerateApiKey,
  useUpdateApiKey,
} from "../../hooks/queries/apiKeys";

export function ApiKeysPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [viewingUsage, setViewingUsage] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [newKeyData, setNewKeyData] = useState<{
    key: string;
    visible: boolean;
  } | null>(null);

  // Queries
  const {
    data: apiKeysData,
    isLoading: keysLoading,
    error: keysError,
  } = useApiKeys();
  const { data: statsData, isLoading: statsLoading } =
    useApiKeyStats(selectedPeriod);

  // Mutations
  const createApiKeyMutation = useCreateApiKey();
  const updateApiKeyMutation = useUpdateApiKey();
  const deleteApiKeyMutation = useDeleteApiKey();
  const regenerateApiKeyMutation = useRegenerateApiKey();

  const apiKeys = apiKeysData?.data?.apiKeys || [];
  const stats = statsData?.data;

  const filteredKeys = apiKeys.filter((key) =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateApiKey = async (data: {
    name: string;
    expiresAt?: string;
  }) => {
    try {
      const result = await createApiKeyMutation.mutateAsync(data);
      setNewKeyData({
        key: result.data.fullKey,
        visible: true,
      });
      toast.success("API Key criada com sucesso!");
      setShowCreateDialog(false);
    } catch (error) {
      toast.error(`Erro ao criar API Key: ${error.message}`);
    }
  };

  const handleUpdateApiKey = async (id: string, data: any) => {
    try {
      await updateApiKeyMutation.mutateAsync({ id, data });
      toast.success("API Key atualizada com sucesso!");
      setEditingKey(null);
    } catch (error) {
      toast.error(`Erro ao atualizar API Key: ${error.message}`);
    }
  };

  const handleDeleteApiKey = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a API Key "${name}"?`)) {
      return;
    }

    try {
      await deleteApiKeyMutation.mutateAsync(id);
      toast.success("API Key excluída com sucesso!");
    } catch (error) {
      toast.error(`Erro ao excluir API Key: ${error.message}`);
    }
  };

  const handleRegenerateApiKey = async (id: string, name: string) => {
    if (
      !confirm(
        `Tem certeza que deseja regenerar a API Key "${name}"? A chave atual ficará inválida.`,
      )
    ) {
      return;
    }

    try {
      const result = await regenerateApiKeyMutation.mutateAsync(id);
      setNewKeyData({
        key: result.data.fullKey,
        visible: true,
      });
      toast.success("API Key regenerada com sucesso!");
    } catch (error) {
      toast.error(`Erro ao regenerar API Key: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getKeyStatus = (key: any) => {
    if (!key.isActive)
      return { text: "Inativa", color: "bg-gray-100 text-gray-800" };
    if (isExpired(key.expiresAt))
      return { text: "Expirada", color: "bg-red-100 text-red-800" };
    return { text: "Ativa", color: "bg-green-100 text-green-800" };
  };

  if (keysError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar API Keys. Tente novamente.
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
            Gestão de API Keys
          </h1>
          <p className="text-gray-600">
            Gerencie chaves de API para autenticação externa
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova API Key</DialogTitle>
              <DialogDescription>
                Gere uma nova chave de API para autenticação
              </DialogDescription>
            </DialogHeader>
            <CreateApiKeyForm
              onSubmit={handleCreateApiKey}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createApiKeyMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* New Key Display */}
      {newKeyData && (
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Nova API Key criada com sucesso!</p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-gray-100 rounded text-sm font-mono">
                  {newKeyData.visible
                    ? newKeyData.key
                    : "••••••••••••••••••••••••••••••••"}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNewKeyData((prev) =>
                      prev ? { ...prev, visible: !prev.visible } : null,
                    )
                  }
                >
                  {newKeyData.visible ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(newKeyData.key)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-amber-600">
                ⚠️ Guarde esta chave em local seguro. Ela não será exibida
                novamente.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNewKeyData(null)}
              >
                Entendi, fechar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Keys
              </CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeys}</div>
              <p className="text-xs text-muted-foreground">
                Chaves cadastradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativas</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeKeys}
              </div>
              <p className="text-xs text-muted-foreground">Em uso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiradas</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.expiredKeys}
              </div>
              <p className="text-xs text-muted-foreground">
                Precisam renovação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Requests</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalRequests.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">No período</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Keys List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>API Keys</span>
                  </CardTitle>
                  <CardDescription>
                    {apiKeys.length} chave(s) configurada(s)
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar keys..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-48"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {keysLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredKeys.length > 0 ? (
                <div className="space-y-4">
                  {filteredKeys.map((key) => {
                    const status = getKeyStatus(key);
                    return (
                      <div
                        key={key.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900 truncate">
                                {key.name}
                              </h3>
                              <Badge className={status.color}>
                                {status.text}
                              </Badge>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              <code className="text-sm text-gray-600 font-mono">
                                {key.keyPreview}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.keyPreview)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>
                                Uso: {key.usageCount.toLocaleString()}x
                              </span>
                              {key.lastUsed && (
                                <span>
                                  Último uso: {formatDate(key.lastUsed)}
                                </span>
                              )}
                              {key.expiresAt && (
                                <span
                                  className={
                                    isExpired(key.expiresAt)
                                      ? "text-red-600"
                                      : ""
                                  }
                                >
                                  Expira: {formatDate(key.expiresAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setViewingUsage(key.id)}
                              >
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Ver Uso
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingKey(key.id)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRegenerateApiKey(key.id, key.name)
                                }
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteApiKey(key.id, key.name)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium mb-2">
                    Nenhuma API Key encontrada
                  </h3>
                  <p className="text-sm">
                    {searchTerm
                      ? "Tente termos diferentes"
                      : "Crie sua primeira API Key"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Statistics */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Uso por Período</span>
                  </CardTitle>
                  <CardDescription>
                    Estatísticas de uso das keys
                  </CardDescription>
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
              {statsLoading ? (
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-32 bg-gray-200 rounded animate-pulse" />
                </div>
              ) : stats?.keyUsageStats && stats.keyUsageStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {stats.totalRequests.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-800">
                      Total de Requests
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Top API Keys</h4>
                    <div className="space-y-2">
                      {stats.keyUsageStats
                        .slice(0, 5)
                        .map((keyUsage, index) => (
                          <div
                            key={keyUsage.keyId}
                            className="flex justify-between text-sm"
                          >
                            <span className="truncate">{keyUsage.name}</span>
                            <span className="font-medium">
                              {keyUsage.requests}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {stats.dailyUsage && stats.dailyUsage.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Uso Diário</h4>
                      <div className="space-y-1">
                        {stats.dailyUsage.slice(-7).map((day) => (
                          <div
                            key={day.date}
                            className="flex justify-between text-xs"
                          >
                            <span>
                              {new Date(day.date).toLocaleDateString("pt-BR")}
                            </span>
                            <span>{day.requests}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Nenhum dado de uso disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Key Dialog */}
      {editingKey && (
        <Dialog open={!!editingKey} onOpenChange={() => setEditingKey(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar API Key</DialogTitle>
              <DialogDescription>
                Modificar configurações da API Key
              </DialogDescription>
            </DialogHeader>
            <EditApiKeyForm
              keyId={editingKey}
              onSubmit={(data) => handleUpdateApiKey(editingKey, data)}
              onCancel={() => setEditingKey(null)}
              isLoading={updateApiKeyMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componente de formulário para criar API Key
function CreateApiKeyForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: { name: string; expiresAt?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    expiresAt: "",
    hasExpiration: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    const submitData: any = {
      name: formData.name.trim(),
    };

    if (formData.hasExpiration && formData.expiresAt) {
      submitData.expiresAt = formData.expiresAt;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da API Key *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Frontend App, Mobile App, etc."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="hasExpiration"
          checked={formData.hasExpiration}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, hasExpiration: checked })
          }
        />
        <Label htmlFor="hasExpiration">Definir data de expiração</Label>
      </div>

      {formData.hasExpiration && (
        <div>
          <Label htmlFor="expiresAt">Data de Expiração</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
          />
        </div>
      )}

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
            "Criar API Key"
          )}
        </Button>
      </div>
    </form>
  );
}

// Componente de formulário para editar API Key (simplificado)
function EditApiKeyForm({
  keyId,
  onSubmit,
  onCancel,
  isLoading,
}: {
  keyId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">API Key ativa</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSubmit({ isActive })} disabled={isLoading}>
          Salvar
        </Button>
      </div>
    </div>
  );
}
