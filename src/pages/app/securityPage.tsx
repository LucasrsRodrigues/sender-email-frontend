import {
  AlertTriangle,
  Check, Globe,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Server, Trash2,
  Unlock,
  X
} from "lucide-react";
import { useState } from "react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  useAddAllowedIP,
  useAddBlockedDomain,
  useRemoveAllowedIP,
  useRemoveBlockedDomain,
} from "../../hooks/mutations";
import { useAllowedIPs, useBlockedDomains } from "../../hooks/queries";

export function SecurityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddIPDialog, setShowAddIPDialog] = useState(false);
  const [showAddDomainDialog, setShowAddDomainDialog] = useState(false);

  // IP Management
  const {
    data: allowedIPsData,
    isLoading: ipsLoading,
    error: ipsError,
    refetch: refetchIPs,
  } = useAllowedIPs();

  const addIPMutation = useAddAllowedIP();
  const removeIPMutation = useRemoveAllowedIP();

  // Domain Management
  const {
    data: blockedDomainsData,
    isLoading: domainsLoading,
    error: domainsError,
    refetch: refetchDomains,
  } = useBlockedDomains();

  const addDomainMutation = useAddBlockedDomain();
  const removeDomainMutation = useRemoveBlockedDomain();

  const allowedIPs = allowedIPsData?.data?.ips || [];
  const blockedDomains = blockedDomainsData?.data?.domains || [];

  const handleRemoveIP = async (ip) => {
    try {
      await removeIPMutation.mutateAsync(ip);
    } catch (error) {
      console.error("Erro ao remover IP:", error);
    }
  };

  const handleRemoveDomain = async (domain) => {
    try {
      await removeDomainMutation.mutateAsync(domain);
    } catch (error) {
      console.error("Erro ao remover domínio:", error);
    }
  };

  const refreshAll = () => {
    refetchIPs();
    refetchDomains();
  };

  // Filter IPs and domains based on search
  const filteredIPs = allowedIPs.filter((ip) =>
    typeof ip === "string"
      ? ip.includes(searchTerm)
      : ip.ipAddress?.includes(searchTerm) ||
      ip.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredDomains = blockedDomains.filter((domain) =>
    typeof domain === "string"
      ? domain.includes(searchTerm)
      : domain.domain?.includes(searchTerm) ||
      domain.reason?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (ipsError || domainsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados de segurança. Verifique a conexão com a API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Segurança</h1>
          <p className="text-gray-600">Gerencie IPs permitidos e domínios bloqueados</p>
        </div>
        <Button
          onClick={refreshAll}
          variant="outline"
          disabled={ipsLoading || domainsLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${(ipsLoading || domainsLoading) ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Success/Error Messages */}
      {(addIPMutation.isSuccess || addDomainMutation.isSuccess) && (
        <Alert className="mb-4">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Operação realizada com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {(addIPMutation.isError || removeIPMutation.isError || addDomainMutation.isError || removeDomainMutation.isError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro na operação. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar IPs ou domínios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="ips" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ips" className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>IPs Permitidos</span>
            <Badge variant="secondary">{allowedIPs.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <span>Domínios Bloqueados</span>
            <Badge variant="secondary">{blockedDomains.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* IPs Tab */}
        <TabsContent value="ips">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-green-600" />
                  <span>IPs Permitidos</span>
                </CardTitle>
                <CardDescription>
                  Lista de endereços IP autorizados a usar a API
                </CardDescription>
              </div>
              <Dialog open={showAddIPDialog} onOpenChange={setShowAddIPDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar IP
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AddIPForm
                    onClose={() => setShowAddIPDialog(false)}
                    mutation={addIPMutation}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {ipsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredIPs.length === 0 ? (
                <div className="text-center py-8">
                  <Server className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhum IP encontrado' : 'Nenhum IP configurado'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredIPs.map((ip, index) => (
                    <IPItem
                      key={typeof ip === 'string' ? ip : ip.ipAddress || index}
                      ip={ip}
                      onRemove={handleRemoveIP}
                      isRemoving={removeIPMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Unlock className="w-5 h-5 text-red-600" />
                  <span>Domínios Bloqueados</span>
                </CardTitle>
                <CardDescription>
                  Lista de domínios bloqueados para envio de emails
                </CardDescription>
              </div>
              <Dialog open={showAddDomainDialog} onOpenChange={setShowAddDomainDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Bloquear Domínio
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <AddDomainForm
                    onClose={() => setShowAddDomainDialog(false)}
                    mutation={addDomainMutation}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {domainsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredDomains.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhum domínio encontrado' : 'Nenhum domínio bloqueado'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDomains.map((domain, index) => (
                    <DomainItem
                      key={typeof domain === 'string' ? domain : domain.domain || index}
                      domain={domain}
                      onRemove={handleRemoveDomain}
                      isRemoving={removeDomainMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// IP Item Component
const IPItem = ({ ip, onRemove, isRemoving }) => {
  const ipAddress = typeof ip === 'string' ? ip : ip.ipAddress;
  const description = typeof ip === 'string' ? null : ip.description;
  const createdBy = typeof ip === 'string' ? null : ip.createdBy;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div>
          <div className="font-medium text-gray-900">{ipAddress}</div>
          {description && (
            <div className="text-sm text-gray-500">{description}</div>
          )}
          {createdBy && (
            <div className="text-xs text-gray-400">Criado por: {createdBy}</div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-green-700">
          Permitido
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(ipAddress)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 text-red-500" />
          )}
        </Button>
      </div>
    </div>
  );
};

// Domain Item Component
const DomainItem = ({ domain, onRemove, isRemoving }) => {
  const domainName = typeof domain === 'string' ? domain : domain.domain;
  const reason = typeof domain === 'string' ? null : domain.reason;
  const blockedBy = typeof domain === 'string' ? null : domain.blockedBy;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div>
          <div className="font-medium text-gray-900">{domainName}</div>
          {reason && (
            <div className="text-sm text-gray-500">{reason}</div>
          )}
          {blockedBy && (
            <div className="text-xs text-gray-400">Bloqueado por: {blockedBy}</div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="destructive">
          Bloqueado
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(domainName)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4 text-red-500" />
          )}
        </Button>
      </div>
    </div>
  );
};

// Add IP Form Component
const AddIPForm = ({ onClose, mutation }) => {
  const [formData, setFormData] = useState({
    ipAddress: '',
    description: ''
  });

  const handleSubmit = async () => {
    if (!formData.ipAddress) return;

    try {
      await mutation.mutateAsync({
        ...formData,
        createdBy: 'admin'
      });

      onClose();
      setFormData({ ipAddress: '', description: '' });
    } catch (error) {
      console.error('Erro ao adicionar IP:', error);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Adicionar IP Permitido</DialogTitle>
        <DialogDescription>
          Adicione um novo endereço IP à lista de permitidos
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ipAddress">Endereço IP</Label>
          <Input
            id="ipAddress"
            value={formData.ipAddress}
            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            placeholder="192.168.1.100"
            pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
          />
          <p className="text-xs text-gray-500">
            Digite um endereço IP válido (ex: 192.168.1.100)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Servidor de produção, Escritório, etc."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.ipAddress || mutation.isPending}
          >
            {mutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Adicionar IP
          </Button>
        </div>
      </div>
    </>
  );
};

// Add Domain Form Component
const AddDomainForm = ({ onClose, mutation }) => {
  const [formData, setFormData] = useState({
    domain: '',
    reason: ''
  });

  const handleSubmit = async () => {
    if (!formData.domain) return;

    try {
      await mutation.mutateAsync({
        ...formData,
        blockedBy: 'admin'
      });

      onClose();
      setFormData({ domain: '', reason: '' });
    } catch (error) {
      console.error('Erro ao bloquear domínio:', error);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Bloquear Domínio</DialogTitle>
        <DialogDescription>
          Adicione um domínio à lista de bloqueados
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain">Domínio</Label>
          <Input
            id="domain"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="spam-domain.com"
          />
          <p className="text-xs text-gray-500">
            Digite apenas o domínio (ex: exemplo.com)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Motivo do Bloqueio</Label>
          <Input
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="Histórico de spam, domínio suspeito, etc."
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.domain || mutation.isPending}
            variant="destructive"
          >
            {mutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Unlock className="w-4 h-4 mr-2" />
            )}
            Bloquear Domínio
          </Button>
        </div>
      </div>
    </>
  );
};
