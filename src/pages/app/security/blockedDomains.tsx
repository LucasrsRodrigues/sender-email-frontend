import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileDown,
  FileUp,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import {
  useBlockedDomains,
  useBlockedDomainsStats,
  useBulkManageDomains,
  useCheckDomainStatus,
  useCreateBlockedDomain,
  useDeleteBlockedDomain,
  useExportBlockedDomains,
  useSyncExternalBlocklists,
  useUpdateBlockedDomain,
  useValidateDomain,
} from "../../../hooks/queries/blockedDomains";

export function BlockedDomainsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    blockType: "",
    isActive: "",
    severity: "",
    category: "",
    sortBy: "blockedAt",
    sortOrder: "desc",
  });
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingDomain, setEditingDomain] = useState<string | null>(null);
  const [viewingDomain, setViewingDomain] = useState<string | null>(null);

  // Queries
  const {
    data: domainsData,
    isLoading: domainsLoading,
    error: domainsError,
  } = useBlockedDomains(filters);
  const { data: statsData } = useBlockedDomainsStats();

  // Mutations
  const createDomainMutation = useCreateBlockedDomain();
  const updateDomainMutation = useUpdateBlockedDomain();
  const deleteDomainMutation = useDeleteBlockedDomain();
  const bulkManageMutation = useBulkManageDomains();
  const exportMutation = useExportBlockedDomains();
  const syncMutation = useSyncExternalBlocklists();
  const validateMutation = useValidateDomain();
  const checkStatusMutation = useCheckDomainStatus();

  const domains = domainsData?.data?.domains || [];
  const pagination = domainsData?.data?.pagination;
  const stats = domainsData?.data?.stats;
  const globalStats = statsData?.data;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleCreateDomain = async (data: any) => {
    try {
      await createDomainMutation.mutateAsync(data);
      toast.success("Domínio bloqueado com sucesso!");
      setShowCreateDialog(false);
    } catch (error: any) {
      toast.error(
        `Erro ao bloquear domínio: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleUpdateDomain = async (id: string, data: any) => {
    try {
      await updateDomainMutation.mutateAsync({ id, data });
      toast.success("Domínio atualizado com sucesso!");
      setEditingDomain(null);
    } catch (error: any) {
      toast.error(
        `Erro ao atualizar domínio: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleDeleteDomain = async (id: string, domain: string) => {
    if (
      !confirm(
        `Tem certeza que deseja remover o bloqueio do domínio "${domain}"?`,
      )
    ) {
      return;
    }

    try {
      await deleteDomainMutation.mutateAsync(id);
      toast.success("Bloqueio removido com sucesso!");
    } catch (error: any) {
      toast.error(
        `Erro ao remover bloqueio: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDomains.length === 0) {
      toast.error("Selecione pelo menos um domínio");
      return;
    }

    const actionNames = {
      unblock: "desbloquear",
      delete: "excluir",
      activate: "ativar",
      deactivate: "desativar",
    };

    if (
      !confirm(
        `Tem certeza que deseja ${actionNames[action]} ${selectedDomains.length} domínio(s)?`,
      )
    ) {
      return;
    }

    try {
      const result = await bulkManageMutation.mutateAsync({
        domains: selectedDomains,
        action: action as any,
        reason: `Ação em lote: ${action}`,
      });

      toast.success(
        `${result.data.successful} domínio(s) processado(s) com sucesso!`,
      );
      if (result.data.failed > 0) {
        toast.warning(
          `${result.data.failed} domínio(s) falharam no processamento`,
        );
      }
      setSelectedDomains([]);
    } catch (error: any) {
      toast.error(
        `Erro na operação em lote: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleExport = async (format: string) => {
    try {
      const result = await exportMutation.mutateAsync(format as any);
      window.open(result.data.downloadUrl, "_blank");
      toast.success(`Exportação iniciada! Arquivo: ${result.data.filename}`);
    } catch (error: any) {
      toast.error(
        `Erro ao exportar: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleSyncExternal = async () => {
    try {
      const result = await syncMutation.mutateAsync();
      toast.success(
        `Sincronização concluída! ${result.data.added} novos domínios adicionados`,
      );
    } catch (error: any) {
      toast.error(
        `Erro na sincronização: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleSelectDomain = (domainId: string, checked: boolean) => {
    setSelectedDomains((prev) =>
      checked ? [...prev, domainId] : prev.filter((id) => id !== domainId),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedDomains(checked ? domains.map((domain) => domain.id) : []);
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

  const getSeverityBadge = (severity: string) => {
    const colors = {
      LOW: "bg-blue-100 text-blue-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[severity] || colors.LOW}>{severity}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      SPAM: "bg-gray-100 text-gray-800",
      PHISHING: "bg-red-100 text-red-800",
      MALWARE: "bg-purple-100 text-purple-800",
      ABUSE: "bg-orange-100 text-orange-800",
      POLICY: "bg-blue-100 text-blue-800",
      OTHER: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge variant="outline" className={colors[category] || colors.OTHER}>
        {category}
      </Badge>
    );
  };

  const getBlockTypeIcon = (blockType: string) => {
    switch (blockType) {
      case "FULL":
        return <Ban className="w-4 h-4 text-red-500" />;
      case "SUBDOMAIN":
        return <ShieldAlert className="w-4 h-4 text-orange-500" />;
      case "PATTERN":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <ShieldX className="w-4 h-4 text-gray-500" />;
    }
  };

  if (domainsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar domínios bloqueados. Tente novamente.
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
            Domínios Bloqueados
          </h1>
          <p className="text-gray-600">
            Gerencie domínios que não podem receber emails
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleSyncExternal}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Sincronizar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileDown className="w-4 h-4 mr-2" />
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileDown className="w-4 h-4 mr-2" />
                JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("txt")}>
                <FileDown className="w-4 h-4 mr-2" />
                TXT
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Bloquear Domínio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bloquear Novo Domínio</DialogTitle>
                <DialogDescription>
                  Adicione um domínio à lista de bloqueados
                </DialogDescription>
              </DialogHeader>
              <CreateDomainForm
                onSubmit={handleCreateDomain}
                onCancel={() => setShowCreateDialog(false)}
                isLoading={createDomainMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bloqueados
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBlocked}</div>
              <p className="text-xs text-muted-foreground">Domínios na lista</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeBlocks}
              </div>
              <p className="text-xs text-muted-foreground">Bloqueios ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirados</CardTitle>
              <ShieldX className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.expiredBlocks}
              </div>
              <p className="text-xs text-muted-foreground">
                Bloqueios expirados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Hits
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalHits}
              </div>
              <p className="text-xs text-muted-foreground">
                Tentativas bloqueadas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por domínio..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Block Type Filter */}
            <Select
              value={filters.blockType}
              onValueChange={(value) => handleFilterChange("blockType", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo de Bloqueio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="FULL">Completo</SelectItem>
                <SelectItem value="SUBDOMAIN">Subdomínio</SelectItem>
                <SelectItem value="PATTERN">Padrão</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="SPAM">Spam</SelectItem>
                <SelectItem value="PHISHING">Phishing</SelectItem>
                <SelectItem value="MALWARE">Malware</SelectItem>
                <SelectItem value="ABUSE">Abuso</SelectItem>
                <SelectItem value="POLICY">Política</SelectItem>
                <SelectItem value="OTHER">Outro</SelectItem>
              </SelectContent>
            </Select>

            {/* Severity Filter */}
            <Select
              value={filters.severity}
              onValueChange={(value) => handleFilterChange("severity", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="LOW">Baixa</SelectItem>
                <SelectItem value="MEDIUM">Média</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="CRITICAL">Crítica</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.isActive}
              onValueChange={(value) => handleFilterChange("isActive", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedDomains.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium">
                {selectedDomains.length} domínio(s) selecionado(s):
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("activate")}
              >
                <ShieldCheck className="w-3 h-3 mr-1" />
                Ativar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("deactivate")}
              >
                <ShieldX className="w-3 h-3 mr-1" />
                Desativar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("delete")}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Excluir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedDomains([])}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domains Table */}
      <Card>
        <CardHeader>
          <CardTitle>Domínios Bloqueados ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {domainsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : domains.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center space-x-4 p-2 bg-gray-50 rounded font-medium text-sm">
                <div className="w-8">
                  <Checkbox
                    checked={selectedDomains.length === domains.length}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="flex-1">Domínio</div>
                <div className="w-24">Tipo</div>
                <div className="w-24">Categoria</div>
                <div className="w-24">Severidade</div>
                <div className="w-20">Hits</div>
                <div className="w-32">Bloqueado em</div>
                <div className="w-20">Ações</div>
              </div>

              {/* Table Rows */}
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-center space-x-4 p-2 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="w-8">
                    <Checkbox
                      checked={selectedDomains.includes(domain.id)}
                      onCheckedChange={(checked) =>
                        handleSelectDomain(domain.id, !!checked)
                      }
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getBlockTypeIcon(domain.blockType)}
                      <div>
                        <div className="font-medium">{domain.domain}</div>
                        <div className="text-sm text-gray-600 truncate">
                          {domain.reason}
                        </div>
                      </div>
                      {!domain.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Inativo
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="w-24">
                    <Badge variant="outline">{domain.blockType}</Badge>
                  </div>

                  <div className="w-24">
                    {domain.metadata?.category &&
                      getCategoryBadge(domain.metadata.category)}
                  </div>

                  <div className="w-24">
                    {domain.metadata?.severity &&
                      getSeverityBadge(domain.metadata.severity)}
                  </div>

                  <div className="w-20 text-center">
                    <span className="font-medium">{domain.hitCount}</span>
                  </div>

                  <div className="w-32 text-sm text-gray-600">
                    {formatDate(domain.blockedAt)}
                  </div>

                  <div className="w-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setViewingDomain(domain.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingDomain(domain.id)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteDomain(domain.id, domain.domain)
                          }
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover Bloqueio
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium mb-2">Nenhum domínio bloqueado</h3>
              <p className="text-sm">
                {filters.search || filters.category || filters.severity
                  ? "Tente ajustar os filtros"
                  : "Adicione domínios à lista de bloqueados"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                de {pagination.total} domínios
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleFilterChange("page", pagination.page - 1)
                  }
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleFilterChange("page", pagination.page + 1)
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Domain Dialog */}
      {editingDomain && (
        <Dialog
          open={!!editingDomain}
          onOpenChange={() => setEditingDomain(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Domínio Bloqueado</DialogTitle>
              <DialogDescription>
                Modificar configurações do bloqueio
              </DialogDescription>
            </DialogHeader>
            <EditDomainForm
              domainId={editingDomain}
              onSubmit={(data) => handleUpdateDomain(editingDomain, data)}
              onCancel={() => setEditingDomain(null)}
              isLoading={updateDomainMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Domain Dialog */}
      {viewingDomain && (
        <Dialog
          open={!!viewingDomain}
          onOpenChange={() => setViewingDomain(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Domínio Bloqueado</DialogTitle>
              <DialogDescription>
                Informações detalhadas e histórico
              </DialogDescription>
            </DialogHeader>
            <DomainDetailsView
              domainId={viewingDomain}
              onClose={() => setViewingDomain(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componente de formulário para criar domínio bloqueado
function CreateDomainForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    domain: "",
    reason: "",
    blockType: "FULL",
    severity: "MEDIUM",
    category: "SPAM",
    expiresAt: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.domain || !formData.reason) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const submitData = {
      domain: formData.domain.toLowerCase().trim(),
      reason: formData.reason,
      blockType: formData.blockType,
      expiresAt: formData.expiresAt || undefined,
      metadata: {
        severity: formData.severity,
        category: formData.category,
        source: "MANUAL",
        notes: formData.notes || undefined,
      },
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="domain">Domínio *</Label>
        <Input
          id="domain"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          placeholder="exemplo.com"
        />
      </div>

      <div>
        <Label htmlFor="reason">Motivo do Bloqueio *</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Descreva o motivo do bloqueio..."
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="blockType">Tipo de Bloqueio</Label>
          <Select
            value={formData.blockType}
            onValueChange={(value) =>
              setFormData({ ...formData, blockType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FULL">Completo</SelectItem>
              <SelectItem value="SUBDOMAIN">Subdomínio</SelectItem>
              <SelectItem value="PATTERN">Padrão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SPAM">Spam</SelectItem>
              <SelectItem value="PHISHING">Phishing</SelectItem>
              <SelectItem value="MALWARE">Malware</SelectItem>
              <SelectItem value="ABUSE">Abuso</SelectItem>
              <SelectItem value="POLICY">Política</SelectItem>
              <SelectItem value="OTHER">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="severity">Severidade</Label>
          <Select
            value={formData.severity}
            onValueChange={(value) =>
              setFormData({ ...formData, severity: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Baixa</SelectItem>
              <SelectItem value="MEDIUM">Média</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="CRITICAL">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="expiresAt">Data de Expiração (opcional)</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={formData.expiresAt}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notas Adicionais</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Informações adicionais sobre o bloqueio..."
          rows={2}
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
              Bloqueando...
            </>
          ) : (
            "Bloquear Domínio"
          )}
        </Button>
      </div>
    </form>
  );
}

// TODO: Componente de formulário para editar domínio (simplificado)
function EditDomainForm({
  domainId,
  onSubmit,
  onCancel,
  isLoading,
}: {
  domainId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  // Implementação simplificada
  return (
    <div className="space-y-4">
      <p>Formulário de edição para o domínio {domainId}</p>
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

// TODO: Componente para visualizar detalhes do domínio (simplificado)
function DomainDetailsView({
  domainId,
  onClose,
}: {
  domainId: string;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <p>Detalhes do domínio {domainId}</p>
      <Button onClick={onClose}>Fechar</Button>
    </div>
  );
}
