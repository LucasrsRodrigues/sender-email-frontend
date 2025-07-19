import {
  AlertTriangle,
  Check,
  Database,
  Edit,
  Eye,
  FileText,
  Filter,
  Globe,
  History,
  Mail,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  Undo,
  X,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUpdateConfig } from "@/hooks/mutations";
import {
  useConfigCategories,
  useConfigHistory,
  useConfigsByCategory,
} from "@/hooks/queries";

export function ConfigPage() {
  const [selectedCategory, setSelectedCategory] = useState("security");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingConfig, setEditingConfig] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [viewingHistory, setViewingHistory] = useState(null);

  // Queries and Mutations
  const { data: categoriesData, isLoading: categoriesLoading } =
    useConfigCategories();
  const {
    data: configsData,
    isLoading: configsLoading,
    error: configsError,
    refetch: refetchConfigs,
  } = useConfigsByCategory(selectedCategory);
  const { data: historyData } = useConfigHistory(viewingHistory);

  const updateConfigMutation = useUpdateConfig();

  const categories = categoriesData?.data?.categories || [];
  const configs = configsData?.data?.configs || [];

  // Filter configs based on search
  const filteredConfigs = configs.filter(
    (config) =>
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startEdit = (config) => {
    setEditingConfig(config.key);
    setNewValue(config.value.toString());
    setChangeReason("");
  };

  const cancelEdit = () => {
    setEditingConfig(null);
    setNewValue("");
    setChangeReason("");
  };

  const saveConfig = async (key, type) => {
    try {
      let parsedValue = newValue;

      // Parse value based on type
      if (type === "NUMBER") {
        parsedValue = parseInt(newValue) || 0;
      } else if (type === "BOOLEAN") {
        parsedValue = newValue === "true";
      } else if (type === "JSON" || type === "ARRAY") {
        try {
          parsedValue = JSON.parse(newValue);
        } catch {
          throw new Error("JSON inválido");
        }
      }

      await updateConfigMutation.mutateAsync({
        key,
        value: parsedValue,
        changedBy: "admin",
        reason: changeReason || "Atualização via interface",
      });

      setEditingConfig(null);
      setNewValue("");
      setChangeReason("");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const icons = {
      security: Shield,
      email: Mail,
      performance: Zap,
      backup: Database,
      webhook: Globe,
      logs: FileText,
      custom: Settings,
    };
    return icons[categoryName] || Settings;
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      security: "text-red-600",
      email: "text-blue-600",
      performance: "text-green-600",
      backup: "text-purple-600",
      webhook: "text-orange-600",
      logs: "text-gray-600",
      custom: "text-indigo-600",
    };
    return colors[categoryName] || "text-gray-600";
  };

  if (configsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar configurações. Verifique a conexão com a API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie configurações dinâmicas do sistema</p>
        </div>
        <Button
          onClick={() => refetchConfigs()}
          variant="outline"
          disabled={configsLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${configsLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Success/Error Messages */}
      {updateConfigMutation.isSuccess && (
        <Alert className="mb-4">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Configuração atualizada com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {updateConfigMutation.isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao atualizar configuração: {updateConfigMutation.error?.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {categoriesLoading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    const isSelected = selectedCategory === category.name;

                    return (
                      <button
                        key={category.name}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${getCategoryColor(category.name)}`} />
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                            {category.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {category.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configurations */}
        <div className="lg:col-span-3">
          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar configurações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurations List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {(() => {
                  const Icon = getCategoryIcon(selectedCategory);
                  return <Icon className={`w-5 h-5 ${getCategoryColor(selectedCategory)}`} />;
                })()}
                <span className="capitalize">{selectedCategory}</span>
                <Badge variant="secondary">{filteredConfigs.length}</Badge>
              </CardTitle>
              <CardDescription>
                Configurações da categoria {selectedCategory}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredConfigs.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhuma configuração encontrada' : 'Nenhuma configuração nesta categoria'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredConfigs.map((config) => (
                    <ConfigItem
                      key={config.key}
                      config={config}
                      isEditing={editingConfig === config.key}
                      newValue={newValue}
                      setNewValue={setNewValue}
                      changeReason={changeReason}
                      setChangeReason={setChangeReason}
                      onStartEdit={startEdit}
                      onCancelEdit={cancelEdit}
                      onSave={saveConfig}
                      onViewHistory={setViewingHistory}
                      isSaving={updateConfigMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Dialog */}
      <Dialog open={!!viewingHistory} onOpenChange={() => setViewingHistory(null)}>
        <DialogContent className="max-w-2xl">
          <ConfigHistoryViewer
            configKey={viewingHistory}
            historyData={historyData?.data?.history}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


// Config Item Component
const ConfigItem = ({
  config,
  isEditing,
  newValue,
  setNewValue,
  changeReason,
  setChangeReason,
  onStartEdit,
  onCancelEdit,
  onSave,
  onViewHistory,
  isSaving
}) => {
  const getTypeColor = (type) => {
    const colors = {
      STRING: 'bg-blue-100 text-blue-800',
      NUMBER: 'bg-green-100 text-green-800',
      BOOLEAN: 'bg-purple-100 text-purple-800',
      JSON: 'bg-orange-100 text-orange-800',
      ARRAY: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const renderValueInput = () => {
    if (config.type === 'BOOLEAN') {
      return (
        <select
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }

    if (config.type === 'JSON' || config.type === 'ARRAY') {
      return (
        <Textarea
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="font-mono text-sm"
          rows={3}
          placeholder='{"key": "value"}'
        />
      );
    }

    return (
      <Input
        type={config.type === 'NUMBER' ? 'number' : 'text'}
        value={newValue}
        onChange={(e) => setNewValue(e.target.value)}
        className="text-sm"
      />
    );
  };

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1 mr-4">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="font-medium text-gray-900">{config.key}</h3>
          <Badge className={getTypeColor(config.type)}>{config.type}</Badge>
        </div>

        <p className="text-sm text-gray-600 mb-3">{config.description}</p>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-500">Novo Valor:</Label>
              {renderValueInput()}
            </div>
            <div>
              <Label className="text-xs text-gray-500">Motivo da Alteração:</Label>
              <Input
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Descreva o motivo da alteração"
                className="text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-100 p-2 rounded text-sm font-mono">
            {config.type === 'JSON' || config.type === 'ARRAY'
              ? JSON.stringify(config.value, null, 2)
              : String(config.value)
            }
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {isEditing ? (
          <>
            <Button
              size="sm"
              onClick={() => onSave(config.key, config.type)}
              disabled={isSaving}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onCancelEdit}>
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => onStartEdit(config)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(config.key)}
            >
              <History className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

// Config History Viewer Component
const ConfigHistoryViewer = ({ configKey, historyData }) => {
  if (!historyData) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
        <p>Carregando histórico...</p>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Histórico: {configKey}</span>
        </DialogTitle>
        <DialogDescription>
          Histórico de alterações desta configuração
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {historyData.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhuma alteração registrada</p>
          </div>
        ) : (
          historyData.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {entry.oldValue} → {entry.newValue}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(entry.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm">
                  <span className="text-gray-600">Alterado por:</span>
                  <span className="font-medium ml-1">{entry.changedBy}</span>
                </div>

                {entry.reason && (
                  <div className="text-sm">
                    <span className="text-gray-600">Motivo:</span>
                    <span className="ml-1">{entry.reason}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-600">Valor Anterior:</span>
                  <div className="bg-red-50 p-2 rounded mt-1 font-mono">
                    {entry.oldValue}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Novo Valor:</span>
                  <div className="bg-green-50 p-2 rounded mt-1 font-mono">
                    {entry.newValue}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};