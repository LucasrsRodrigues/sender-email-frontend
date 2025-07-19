import {
  FileText,
  Mail,
  Search,
  User,
  Webhook,
  X,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useAdminSearch } from "../../../hooks/queries/admin";

export function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [currentQuery, setCurrentQuery] = useState("");

  const { data: searchData, isLoading, error } = useAdminSearch(currentQuery, searchType);

  const handleSearch = () => {
    if (query.trim().length > 2) {
      setCurrentQuery(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery("");
    setCurrentQuery("");
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "template":
        return <FileText className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      case "webhook":
        return <Webhook className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      email: "Email",
      template: "Template",
      user: "Usuário",
      webhook: "Webhook",
      config: "Configuração",
    };
    return labels[type] || type;
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Busca Administrativa</h1>
        <p className="text-gray-600">
          Pesquise em todos os recursos do sistema
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Busca Global</span>
          </CardTitle>
          <CardDescription>
            Busque por emails, templates, usuários, webhooks e configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Digite sua busca (mínimo 3 caracteres)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="user">Usuários</SelectItem>
                <SelectItem value="webhook">Webhooks</SelectItem>
                <SelectItem value="config">Configurações</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={query.length < 3}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            {currentQuery && (
              <Button variant="outline" onClick={clearSearch}>
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {currentQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>
              {isLoading
                ? "Buscando..."
                : searchData?.data.total
                  ? `${searchData.data.total} resultado(s) encontrado(s) para "${currentQuery}"`
                  : `Nenhum resultado encontrado para "${currentQuery}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Erro ao buscar. Tente novamente.
              </div>
            ) : searchData?.data.results && searchData.data.results.length > 0 ? (
              <div className="space-y-4">
                {searchData.data.results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}-${index}`}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getIconByType(result.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {result.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {result.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>ID: {result.id}</span>
                            <span>•</span>
                            <span>{formatDate(result.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : currentQuery && !isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">Nenhum resultado encontrado</h3>
                <p className="text-sm">
                  Tente usar termos diferentes ou verifique a ortografia
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Search Tips */}
      {!currentQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Dicas de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Exemplos de busca:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "welcome" - Busca templates de boas-vindas</li>
                  <li>• "admin@empresa.com" - Busca emails específicos</li>
                  <li>• "webhook" - Busca configurações de webhook</li>
                  <li>• "rate_limit" - Busca configurações relacionadas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tipos de conteúdo:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Emails:</strong> Logs de envio e histórico</li>
                  <li>• <strong>Templates:</strong> Templates de email</li>
                  <li>• <strong>Usuários:</strong> Contas e perfis</li>
                  <li>• <strong>Webhooks:</strong> Configurações de webhook</li>
                  <li>• <strong>Configurações:</strong> Settings do sistema</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}