import {
  AlertTriangle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  Copy,
  Download,
  Edit,
  Eye,
  FileDown,
  FileUp,
  Filter,
  History,
  MoreHorizontal,
  Package,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shield,
  Upload,
  Zap,
} from "lucide-react";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useBulkUpdateConfigs,
  useConfigCategories,
  useConfigsByCategory,
  useConfigTemplates,
  useCreateConfigTemplate,
  useExportConfigs,
  useResetConfigToDefault,
  useUpdateConfig,
  useValidateConfigs,
} from "@/hooks/queries/advancedConfig";

export function AdvancedConfigPage() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [viewingHistory, setViewingHistory] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  // Queries
  const { data: categoriesData, isLoading: categoriesLoading } =
    useConfigCategories();
  const { data: configsData, isLoading: configsLoading } =
    useConfigsByCategory(selectedCategory);
  const { data: templatesData } = useConfigTemplates();

  // Mutations
  const updateConfigMutation = useUpdateConfig();
  const bulkUpdateMutation = useBulkUpdateConfigs();
  const resetConfigMutation = useResetConfigToDefault();
  const validateMutation = useValidateConfigs();
  const exportMutation = useExportConfigs();
  const createTemplateMutation = useCreateConfigTemplate();

  const categories = categoriesData?.data?.categories || [];
  const configs = configsData?.data?.configs || [];
  const templates = templatesData?.data?.templates || [];

  // Auto-select first category
  if (!selectedCategory && categories.length > 0) {
    setSelectedCategory(categories[0].name);
  }

  const handleConfigChange = (key: string, value: any) => {
    setPendingChanges((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveConfig = async (key: string, value: any) => {
    try {
      await updateConfigMutation.mutateAsync({
        key,
        data: {
          value,
          reason: "Atualização via interface administrativa",
          changedBy: "admin", // Deveria vir do contexto de auth
        },
      });

      // Remove from pending changes
      setPendingChanges((prev) => {
        const newPending = { ...prev };
        delete newPending[key];
        return newPending;
      });

      toast.success("Configuração atualizada com sucesso!");
    } catch (error: any) {
      toast.error(
        `Erro ao atualizar configuração: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleBulkSave = async () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast.warning("Nenhuma alteração pendente para salvar");
      return;
    }

    try {
      const configsToUpdate = Object.entries(pendingChanges).map(
        ([key, value]) => ({
          key,
          value,
        }),
      );

      await bulkUpdateMutation.mutateAsync({
        configs: configsToUpdate,
        reason: "Atualização em lote via interface administrativa",
        changedBy: "admin",
      });

      setPendingChanges({});
      toast.success(
        `${configsToUpdate.length} configuração(ões) atualizada(s) com sucesso!`,
      );
    } catch (error: any) {
      toast.error(
        `Erro na atualização em lote: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleResetConfig = async (key: string) => {
    if (
      !confirm(
        "Tem certeza que deseja resetar esta configuração para o valor padrão?",
      )
    ) {
      return;
    }

    try {
      await resetConfigMutation.mutateAsync({
        key,
        data: {
          reason: "Reset para valor padrão",
          changedBy: "admin",
        },
      });

      toast.success("Configuração resetada para o valor padrão!");
    } catch (error: any) {
      toast.error(
        `Erro ao resetar configuração: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleValidateConfigs = async () => {
    try {
      const result = await validateMutation.mutateAsync();
      if (result.data.validationResult.isValid) {
        toast.success("Todas as configurações são válidas!");
      } else {
        toast.warning(
          `${result.data.validationResult.errors.length} erro(s) de validação encontrado(s)`,
        );
      }
    } catch (error: any) {
      toast.error(
        `Erro na validação: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleExport = async (format: string, includeSecrets: boolean) => {
    try {
      const result = await exportMutation.mutateAsync({
        categories: selectedCategory ? [selectedCategory] : undefined,
        format: format as any,
        includeSecrets,
      });

      window.open(result.data.downloadUrl, "_blank");
      toast.success(`Exportação iniciada! Arquivo: ${result.data.filename}`);
    } catch (error: any) {
      toast.error(
        `Erro na exportação: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const getConfigIcon = (type: string) => {
    switch (type) {
      case "BOOLEAN":
        return <Settings className="w-4 h-4" />;
      case "NUMBER":
        return <span className="w-4 h-4 text-center text-xs font-bold">#</span>;
      case "EMAIL":
        return <span className="w-4 h-4 text-center text-xs">@</span>;
      case "URL":
        return <span className="w-4 h-4 text-center text-xs">🔗</span>;
      case "PASSWORD":
        return <Shield className="w-4 h-4" />;
      case "JSON":
        return <span className="w-4 h-4 text-center text-xs">{"{}"}</span>;
      default:
        return <span className="w-4 h-4 text-center text-xs">T</span>;
    }
  };

  const getConfigBadge = (config: any) => {
    if (config.isSecret)
      return (
        <Badge variant="destructive" className="text-xs">
          Secret
        </Badge>
      );
    if (config.isReadOnly)
      return (
        <Badge variant="secondary" className="text-xs">
          Read-only
        </Badge>
      );
    if (config.isRequired)
      return (
        <Badge variant="default" className="text-xs">
          Required
        </Badge>
      );
    return null;
  };

  const renderConfigInput = (config: any) => {
    const pendingValue = pendingChanges[config.key];
    const currentValue =
      pendingValue !== undefined ? pendingValue : config.value;
    const hasChanges = pendingValue !== undefined;

    switch (config.type) {
      case "BOOLEAN":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!currentValue}
              onCheckedChange={(checked) =>
                handleConfigChange(config.key, checked)
              }
              disabled={config.isReadOnly}
            />
            <span className="text-sm">
              {currentValue ? "Ativado" : "Desativado"}
            </span>
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSaveConfig(config.key, currentValue)}
                disabled={updateConfigMutation.isPending}
              >
                <Save className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case "PASSWORD":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="password"
              value={currentValue || ""}
              onChange={(e) => handleConfigChange(config.key, e.target.value)}
              placeholder={config.metadata?.placeholder}
              disabled={config.isReadOnly}
              className="flex-1"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSaveConfig(config.key, currentValue)}
                disabled={updateConfigMutation.isPending}
              >
                <Save className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case "JSON":
        return (
          <div className="space-y-2">
            <Textarea
              value={
                typeof currentValue === "object"
                  ? JSON.stringify(currentValue, null, 2)
                  : currentValue
              }
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleConfigChange(config.key, parsed);
                } catch {
                  handleConfigChange(config.key, e.target.value);
                }
              }}
              placeholder={config.metadata?.placeholder}
              disabled={config.isReadOnly}
              rows={4}
              className="font-mono text-sm"
            />
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSaveConfig(config.key, currentValue)}
                disabled={updateConfigMutation.isPending}
              >
                <Save className="w-3 h-3 mr-1" />
                Salvar
              </Button>
            )}
          </div>
        );

      case "NUMBER":
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={currentValue || ""}
              onChange={(e) =>
                handleConfigChange(config.key, Number(e.target.value))
              }
              placeholder={config.metadata?.placeholder}
              disabled={config.isReadOnly}
              min={config.validation?.min}
              max={config.validation?.max}
              className="flex-1"
            />
            {config.metadata?.unit && (
              <span className="text-sm text-gray-500">
                {config.metadata.unit}
              </span>
            )}
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSaveConfig(config.key, currentValue)}
                disabled={updateConfigMutation.isPending}
              >
                <Save className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-2">
            {config.validation?.options ? (
              <Select
                value={currentValue?.toString() || ""}
                onValueChange={(value) => handleConfigChange(config.key, value)}
                disabled={config.isReadOnly}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.validation.options.map((option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={currentValue || ""}
                onChange={(e) => handleConfigChange(config.key, e.target.value)}
                placeholder={config.metadata?.placeholder}
                disabled={config.isReadOnly}
                className="flex-1"
              />
            )}
            {hasChanges && (
              <Button
                size="sm"
                onClick={() => handleSaveConfig(config.key, currentValue)}
                disabled={updateConfigMutation.isPending}
              >
                <Save className="w-3 h-3" />
              </Button>
            )}
          </div>
        );
    }
  };

  const filteredConfigs = configs.filter(
    (config) =>
      config?.displayName?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      config?.key?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
      config?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configurações Avançadas
          </h1>
          <p className="text-gray-600">
            Gerencie configurações detalhadas do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {Object.keys(pendingChanges).length > 0 && (
            <Button
              onClick={handleBulkSave}
              disabled={bulkUpdateMutation.isPending}
            >
              {bulkUpdateMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações ({Object.keys(pendingChanges).length})
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleValidateConfigs}
            disabled={validateMutation.isPending}
          >
            {validateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Validar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("json", false)}>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("yaml", false)}>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar YAML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("env", false)}>
                <FileDown className="w-4 h-4 mr-2" />
                Exportar .env
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                <FileUp className="w-4 h-4 mr-2" />
                Importar Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowCreateTemplate(true)}>
                <Package className="w-4 h-4 mr-2" />
                Criar Template
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pending Changes Alert */}
      {Object.keys(pendingChanges).length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Você tem {Object.keys(pendingChanges).length} alteração(ões)
            pendente(s). Não se esqueça de salvar suas mudanças.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorias</CardTitle>
              <CardDescription>
                Selecione uma categoria para configurar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${selectedCategory === category.name
                        ? "bg-blue-50 border border-blue-200 text-blue-900"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {category.displayName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {category.description}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {category.configCount}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configs Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {configsData?.data?.category?.displayName ||
                      "Configurações"}
                  </CardTitle>
                  <CardDescription>
                    {configsData?.data?.category?.description}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar configurações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="space-y-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 bg-gray-200 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredConfigs.length > 0 ? (
                <div className="space-y-6">
                  {filteredConfigs.map((config) => {
                    const hasChanges = pendingChanges[config.key] !== undefined;

                    return (
                      <div
                        key={config.key}
                        className={`p-4 border rounded-lg ${hasChanges
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200"
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className="mt-1">
                              {getConfigIcon(config.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium">
                                  {config.displayName}
                                </h3>
                                {getConfigBadge(config)}
                                {hasChanges && (
                                  <Badge variant="default" className="text-xs">
                                    Modificado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {config.description}
                              </p>
                              <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {config.key}
                              </code>
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
                                onClick={() => setViewingHistory(config.key)}
                              >
                                <History className="w-4 h-4 mr-2" />
                                Ver Histórico
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingConfig(config.key)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar Avançado
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleResetConfig(config.key)}
                                disabled={config.isReadOnly}
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Restaurar Padrão
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-2">
                          {renderConfigInput(config)}

                          {config.metadata?.helpText && (
                            <p className="text-xs text-blue-600">
                              💡 {config.metadata.helpText}
                            </p>
                          )}

                          {config.metadata?.warningText && (
                            <p className="text-xs text-amber-600">
                              ⚠️ {config.metadata.warningText}
                            </p>
                          )}

                          {config.metadata?.restartRequired && hasChanges && (
                            <p className="text-xs text-red-600">
                              🔄 Esta configuração requer reinicialização do
                              serviço
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="font-medium mb-2">
                    Nenhuma configuração encontrada
                  </h3>
                  <p className="text-sm">
                    {searchTerm
                      ? "Tente termos diferentes"
                      : "Selecione uma categoria"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Templates Section */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Templates de Configuração</span>
            </CardTitle>
            <CardDescription>
              Templates pré-configurados para cenários específicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </div>
                    {template.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {Object.keys(template.configs).length} configuração(ões) •
                    Usado {template.usageCount} vez(es)
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    <Zap className="w-3 h-3 mr-1" />
                    Aplicar Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Template Dialog */}
      <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Template de Configuração</DialogTitle>
            <DialogDescription>
              Salve as configurações atuais como um template reutilizável
            </DialogDescription>
          </DialogHeader>
          <CreateTemplateForm
            onSubmit={(data) => {
              // Handle template creation
              setShowCreateTemplate(false);
            }}
            onCancel={() => setShowCreateTemplate(false)}
            isLoading={createTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para criar template (simplificado)
function CreateTemplateForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
  });

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Template</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome do template..."
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Descreva o template..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSubmit(formData)} disabled={isLoading}>
          Criar Template
        </Button>
      </div>
    </div>
  );
}
