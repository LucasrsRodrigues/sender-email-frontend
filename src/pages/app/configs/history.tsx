import {
  ArrowUpDown,
  Clock,
  FileText,
  Filter,
  History,
  RefreshCw,
  Search,
  User,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAllConfigs,
  useConfigCategories,
  useConfigHistory,
} from "@/hooks/queries/config";

interface ConfigHistoryItem {
  id: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  reason: string;
  createdAt: string;
}

interface ConfigItem {
  key: string;
  value: string | number | boolean;
  type: "STRING" | "NUMBER" | "BOOLEAN" | "JSON";
  description: string;
  category: string;
}

export function ConfigHistoryPage() {
  const [selectedConfig, setSelectedConfig] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState("25");

  // Queries usando os hooks customizados
  const { data: categoriesData } = useConfigCategories();
  const { data: allConfigsData } = useAllConfigs();
  const { data: historyData, isLoading } = useConfigHistory(
    selectedConfig,
    Number(limit),
  );

  const allConfigs = allConfigsData?.data?.configs || [];
  const filteredConfigs = allConfigs.filter(
    (config: ConfigItem) =>
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const history = historyData?.data?.history || [];

  const formatValue = (value: string, type?: string) => {
    if (type === "BOOLEAN") {
      return value === "true" ? "Verdadeiro" : "Falso";
    }
    if (type === "JSON") {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    return value;
  };

  const getValueBadgeColor = (oldValue: string, newValue: string) => {
    if (oldValue === newValue) return "secondary";
    if (newValue === "true" || Number(newValue) > Number(oldValue))
      return "default";
    return "destructive";
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

  const selectedConfigData = allConfigs.find(
    (c: ConfigItem) => c.key === selectedConfig,
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Histórico de Configurações
        </h1>
        <p className="text-gray-600">
          Visualize o histórico de alterações das configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filtros</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Buscar Configuração</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Nome, descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="config-select">Configuração</Label>
                <Select
                  value={selectedConfig}
                  onValueChange={setSelectedConfig}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma configuração" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredConfigs.map((config: ConfigItem) => (
                      <SelectItem key={config.key} value={config.key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{config.key}</span>
                          <span className="text-xs text-gray-500 capitalize">
                            {config.category} • {config.type}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limit">Limite de Registros</Label>
                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 registros</SelectItem>
                    <SelectItem value="25">25 registros</SelectItem>
                    <SelectItem value="50">50 registros</SelectItem>
                    <SelectItem value="100">100 registros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedConfigData && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm text-blue-900 mb-2">
                    Configuração Atual
                  </h4>
                  <div className="space-y-1 text-xs text-blue-800">
                    <div>
                      <strong>Tipo:</strong> {selectedConfigData.type}
                    </div>
                    <div>
                      <strong>Categoria:</strong> {selectedConfigData.category}
                    </div>
                    <div>
                      <strong>Valor:</strong>{" "}
                      {formatValue(
                        String(selectedConfigData.value),
                        selectedConfigData.type,
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Histórico */}
        <div className="lg:col-span-3">
          {!selectedConfig ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione uma Configuração
                  </h3>
                  <p className="text-gray-600">
                    Escolha uma configuração no painel lateral para ver seu
                    histórico
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Histórico: {selectedConfig}</span>
                </CardTitle>
                <CardDescription>
                  {history.length} alteraç{history.length === 1 ? "ão" : "ões"}{" "}
                  encontrada{history.length === 1 ? "" : "s"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Nenhuma alteração encontrada para esta configuração.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {history.map((item: ConfigHistoryItem) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={getValueBadgeColor(
                                item.oldValue,
                                item.newValue,
                              )}
                            >
                              <ArrowUpDown className="w-3 h-3 mr-1" />
                              Alteração
                            </Badge>
                            <span className="text-sm text-gray-600">
                              por <strong>{item.changedBy}</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.createdAt)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <Label className="text-xs text-gray-600">
                              Valor Anterior
                            </Label>
                            <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                              <code className="text-red-800">
                                {formatValue(
                                  item.oldValue,
                                  selectedConfigData?.type,
                                )}
                              </code>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-600">
                              Novo Valor
                            </Label>
                            <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                              <code className="text-green-800">
                                {formatValue(
                                  item.newValue,
                                  selectedConfigData?.type,
                                )}
                              </code>
                            </div>
                          </div>
                        </div>

                        {item.reason && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2">
                            <Label className="text-xs text-blue-600">
                              Motivo da Alteração
                            </Label>
                            <p className="text-sm text-blue-800 mt-1">
                              {item.reason}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Alert className="mt-6">
        <History className="h-4 w-4" />
        <AlertDescription>
          O histórico mostra apenas as alterações realizadas através da
          interface administrativa. Alterações diretas no banco de dados ou
          arquivos de configuração não são rastreadas.
        </AlertDescription>
      </Alert>
    </div>
  );
}
