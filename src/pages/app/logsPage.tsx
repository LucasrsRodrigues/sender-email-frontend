import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  Mail,
  RefreshCw,
  Search,
  Settings,
  User,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";
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
import { useEmailLogs } from "../../hooks/queries";

export function LogsPage() {
  const [filters, setFilters] = useState({
    search: '',
    level: 'all',
    template: '',
    status: 'all',
    startDate: '',
    endDate: '',
    limit: '50'
  });

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLog, setSelectedLog] = useState(null);

  // Query with filters
  const {
    data: logsData,
    isLoading,
    error,
    refetch
  } = useEmailLogs({
    ...filters,
    sortBy,
    sortOrder
  });

  const logs = logsData?.data?.logs || [];
  const totalCount = logsData?.data?.count || 0;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      level: 'all',
      template: '',
      status: 'all',
      startDate: '',
      endDate: '',
      limit: '50'
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportLogs = () => {
    // Simulate export functionality
    const csvContent = [
      ['Timestamp', 'Level', 'Message', 'Template', 'Status', 'To', 'Provider'].join(','),
      ...logs.map(log => [
        log.createdAt,
        log.level || log.status,
        `"${log.message}"`,
        log.template || '',
        log.status || '',
        log.to || '',
        log.provider || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getLevelIcon = (level) => {
    const icons = {
      INFO: Info,
      WARN: AlertTriangle,
      ERROR: XCircle,
      SENT: CheckCircle,
      FAILED: XCircle,
      PENDING: Clock,
      RETRYING: RefreshCw
    };
    return icons[level] || Info;
  };

  const getLevelColor = (level) => {
    const colors = {
      INFO: 'text-blue-600',
      WARN: 'text-yellow-600',
      ERROR: 'text-red-600',
      SENT: 'text-green-600',
      FAILED: 'text-red-600',
      PENDING: 'text-gray-600',
      RETRYING: 'text-orange-600'
    };
    return colors[level] || 'text-gray-600';
  };

  const getBadgeVariant = (level) => {
    const variants = {
      INFO: 'default',
      WARN: 'secondary',
      ERROR: 'destructive',
      SENT: 'default',
      FAILED: 'destructive',
      PENDING: 'secondary',
      RETRYING: 'secondary'
    };
    return variants[level] || 'secondary';
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar logs. Verifique a conexão com a API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs do Sistema</h1>
          <p className="text-gray-600">
            Visualize e analise logs de email e sistema
            {totalCount > 0 && (
              <span className="ml-2 text-sm">
                ({totalCount} registros)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={exportLogs}
            variant="outline"
            disabled={logs.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Buscar mensagens..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Level/Status */}
            <div className="space-y-2">
              <Label htmlFor="level">Nível/Status</Label>
              <Select value={filters.level} onValueChange={(value) => handleFilterChange('level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="ERROR">ERROR</SelectItem>
                  <SelectItem value="SENT">SENT</SelectItem>
                  <SelectItem value="FAILED">FAILED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template */}
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Input
                id="template"
                placeholder="Nome do template"
                value={filters.template}
                onChange={(e) => handleFilterChange('template', e.target.value)}
              />
            </div>

            {/* Limit */}
            <div className="space-y-2">
              <Label htmlFor="limit">Limite</Label>
              <Select value={filters.limit} onValueChange={(value) => handleFilterChange('limit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 registros</SelectItem>
                  <SelectItem value="50">50 registros</SelectItem>
                  <SelectItem value="100">100 registros</SelectItem>
                  <SelectItem value="200">200 registros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
              <p className="text-gray-500">Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                Nenhum log encontrado com os filtros aplicados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Timestamp</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nível
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mensagem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Destinatário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <LogRow
                      key={log.id}
                      log={log}
                      onViewDetails={setSelectedLog}
                      getLevelIcon={getLevelIcon}
                      getLevelColor={getLevelColor}
                      getBadgeVariant={getBadgeVariant}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl">
          <LogDetailsViewer log={selectedLog} />
        </DialogContent>
      </Dialog>
    </div>
  );
}


// Log Details Viewer Component
const LogDetailsViewer = ({ log }) => {
  if (!log) return null;

  const level = log.level || log.status || 'INFO';

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Detalhes do Log</span>
        </DialogTitle>
        <DialogDescription>
          Log registrado em {new Date(log.createdAt || log.timestamp).toLocaleString()}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Informações Básicas</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono">{log.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nível:</span>
                <Badge variant={level === 'ERROR' || level === 'FAILED' ? 'destructive' : 'default'}>
                  {level}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span>{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
              </div>
              {log.template && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Template:</span>
                  <span>{log.template}</span>
                </div>
              )}
            </div>
          </div>

          {log.to && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Email</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Para:</span>
                  <span>{log.to}</span>
                </div>
                {log.subject && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assunto:</span>
                    <span className="truncate max-w-40" title={log.subject}>
                      {log.subject}
                    </span>
                  </div>
                )}
                {log.provider && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provedor:</span>
                    <span>{log.provider}</span>
                  </div>
                )}
                {log.attempts && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tentativas:</span>
                    <span>{log.attempts}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Message */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Mensagem</h4>
          <div className="bg-gray-100 p-3 rounded text-sm">
            {log.message}
          </div>
        </div>

        {/* Error Details */}
        {log.errorMessage && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-2">Detalhes do Erro</h4>
            <div className="bg-red-50 border border-red-200 p-3 rounded text-sm">
              {log.errorMessage}
            </div>
          </div>
        )}

        {/* Additional Data */}
        {log.variables && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Variáveis do Template</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(log.variables, null, 2)}
            </pre>
          </div>
        )}

        {/* Timing Info */}
        {(log.sentAt || log.processingTime) && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Timing</h4>
            <div className="space-y-2 text-sm">
              {log.sentAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Enviado em:</span>
                  <span>{new Date(log.sentAt).toLocaleString()}</span>
                </div>
              )}
              {log.processingTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tempo de processamento:</span>
                  <span>{log.processingTime}ms</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw Data */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Dados Completos</h4>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-40">
            {JSON.stringify(log, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
};


// Log Row Component
const LogRow = ({ log, onViewDetails, getLevelIcon, getLevelColor, getBadgeVariant }) => {
  const level = log.level || log.status || 'INFO';
  const Icon = getLevelIcon(level);

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Icon className={`w-4 h-4 ${getLevelColor(level)}`} />
          <Badge variant={getBadgeVariant(level)}>
            {level}
          </Badge>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
        <div className="truncate" title={log.message}>
          {log.message}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {log.template ? (
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4" />
            <span>{log.template}</span>
          </div>
        ) : (
          '-'
        )}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {log.to || log.recipient || '-'}
      </td>
      <td className="px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(log)}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
};