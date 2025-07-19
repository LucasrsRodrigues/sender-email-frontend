import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  Play,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User,
  Workflow,
  X,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useActiveFlows,
  useCancelFlow,
  useCreateMarketingCampaignFlow,
  useCreateOnboardingFlow,
  useCreatePasswordRecoveryFlow,
  useFlowExamples,
  useFlowStats,
  useRequiredTemplates,
} from "@/hooks/queries/flows";

export function FlowsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedFlowType, setSelectedFlowType] = useState("");

  // Queries
  const { data: examplesData, isLoading: examplesLoading } = useFlowExamples();
  const { data: templatesData, isLoading: templatesLoading } =
    useRequiredTemplates();
  const { data: statsData, isLoading: statsLoading } =
    useFlowStats(selectedPeriod);
  const { data: activeFlowsData, isLoading: activeFlowsLoading } =
    useActiveFlows();

  // Mutations
  const createOnboardingMutation = useCreateOnboardingFlow();
  const createPasswordRecoveryMutation = useCreatePasswordRecoveryFlow();
  const createMarketingMutation = useCreateMarketingCampaignFlow();
  const cancelFlowMutation = useCancelFlow();

  const examples = examplesData?.data?.examples;
  const templates = templatesData?.data?.templates;
  const stats = statsData?.data;
  const activeFlows = activeFlowsData?.data?.flows || [];

  const handleCreateFlow = async (flowType: string, formData: any) => {
    try {
      let result;
      switch (flowType) {
        case "onboarding":
          result = await createOnboardingMutation.mutateAsync(formData);
          break;
        case "password-recovery":
          result = await createPasswordRecoveryMutation.mutateAsync(formData);
          break;
        case "marketing":
          result = await createMarketingMutation.mutateAsync(formData);
          break;
        default:
          throw new Error("Tipo de flow inválido");
      }

      toast.success(`Flow ${flowType} criado com sucesso!`);
      setShowCreateDialog(false);
      setSelectedFlowType("");
    } catch (error) {
      toast.error(`Erro ao criar flow: ${error.message}`);
    }
  };

  const handleCancelFlow = async (flowId: string) => {
    try {
      await cancelFlowMutation.mutateAsync(flowId);
      toast.success("Flow cancelado com sucesso!");
    } catch (error) {
      toast.error(`Erro ao cancelar flow: ${error.message}`);
    }
  };

  const getFlowTypeLabel = (type: string) => {
    const labels = {
      onboarding: "Onboarding",
      "password-recovery": "Recuperação de Senha",
      marketing: "Campanha de Marketing",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestão de Email Flows
          </h1>
          <p className="text-gray-600">
            Crie e gerencie sequências automatizadas de emails
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Flow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Flow</DialogTitle>
              <DialogDescription>
                Escolha o tipo de flow e configure os parâmetros
              </DialogDescription>
            </DialogHeader>
            <CreateFlowForm
              onSubmit={handleCreateFlow}
              onCancel={() => setShowCreateDialog(false)}
              examples={examples}
              isLoading={
                createOnboardingMutation.isPending ||
                createPasswordRecoveryMutation.isPending ||
                createMarketingMutation.isPending
              }
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flows Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeFlowsLoading ? "-" : activeFlows.length}
            </div>
            <p className="text-xs text-muted-foreground">Em execução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Emails Enviados
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "-" : stats?.totalEmails || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              No período selecionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Templates Usados
            </CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "-" : stats?.templates?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Templates diferentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading
                ? "-"
                : stats?.templates
                  ? (
                    stats.templates.reduce(
                      (acc, t) => acc + t.avgAttempts,
                      0,
                    ) / stats.templates.length
                  ).toFixed(1)
                  : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Tentativas por email
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flow Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Workflow className="w-5 h-5" />
              <span>Exemplos de Flows</span>
            </CardTitle>
            <CardDescription>Templates prontos para usar</CardDescription>
          </CardHeader>
          <CardContent>
            {examplesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : examples ? (
              <div className="space-y-4">
                {Object.entries(examples).map(([key, example]) => (
                  <div
                    key={key}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{getFlowTypeLabel(key)}</h4>
                      <Badge variant="outline">
                        {example.steps.length} passos
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {example.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {example.steps.slice(0, 2).map((step, index) => (
                        <div key={index} className="flex items-center">
                          <span>{step.name}</span>
                          {index < 1 && <ArrowRight className="w-3 h-3 mx-1" />}
                        </div>
                      ))}
                      {example.steps.length > 2 && <span>...</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Exemplos não disponíveis
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Flows */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Flows Ativos</span>
                </CardTitle>
                <CardDescription>Flows em execução no momento</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar flows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-48"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeFlowsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : activeFlows.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeFlows
                  .filter((flow) =>
                    flow.flowId
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                  )
                  .map((flow) => (
                    <div
                      key={flow.flowId}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {flow.flowId}
                          </span>
                          <Badge
                            variant="outline"
                            className={getStatusColor(flow.status)}
                          >
                            {flow.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {flow.totalJobs} jobs • {flow.completed} concluídos
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelFlow(flow.flowId)}
                        disabled={cancelFlowMutation.isPending}
                      >
                        {cancelFlowMutation.isPending ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium mb-2">Nenhum flow ativo</h3>
                <p className="text-sm">
                  Crie um flow para começar a enviar sequências de emails
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Estatísticas de Flows</span>
              </CardTitle>
              <CardDescription>
                Performance dos templates por período
              </CardDescription>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Último dia</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
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
          ) : stats?.templates && stats.templates.length > 0 ? (
            <div className="space-y-4">
              {stats.templates.map((template, index) => (
                <div
                  key={template.template}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <div>
                      <div className="font-medium">{template.template}</div>
                      <div className="text-sm text-gray-600">
                        {template.count} envios
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {template.avgAttempts.toFixed(1)} tentativas
                    </div>
                    <div className="text-xs text-gray-500">média por email</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Nenhuma estatística disponível para o período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Required Templates Info */}
      {templatesData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Templates Necessários</span>
            </CardTitle>
            <CardDescription>{templatesData.data.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(templates || {}).map(
                ([flowType, templateList]) => (
                  <div key={flowType} className="space-y-2">
                    <h4 className="font-medium capitalize">
                      {getFlowTypeLabel(flowType)}
                    </h4>
                    <div className="space-y-1">
                      {templateList.map((template) => (
                        <Badge
                          key={template}
                          variant="outline"
                          className="mr-1 mb-1"
                        >
                          {template}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente do formulário de criação de flow
function CreateFlowForm({
  onSubmit,
  onCancel,
  examples,
  isLoading,
}: {
  onSubmit: (type: string, data: any) => void;
  onCancel: () => void;
  examples?: any;
  isLoading: boolean;
}) {
  const [flowType, setFlowType] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    userEmail: "",
    userName: "",
    plan: "",
    company: "",
    resetToken: "",
    campaignType: "",
    userData: "{}",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !flowType ||
      !formData.userId ||
      !formData.userEmail ||
      !formData.userName
    ) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    let submitData: any;

    try {
      const parsedUserData = JSON.parse(formData.userData);

      switch (flowType) {
        case "onboarding":
          submitData = {
            userId: formData.userId,
            userEmail: formData.userEmail,
            userData: {
              name: formData.userName,
              plan: formData.plan,
              company: formData.company,
              ...parsedUserData,
            },
          };
          break;

        case "password-recovery":
          submitData = {
            userId: formData.userId,
            userEmail: formData.userEmail,
            resetToken: formData.resetToken || `reset_${Date.now()}`,
            userData: {
              name: formData.userName,
              lastLogin: new Date().toISOString(),
              ...parsedUserData,
            },
          };
          break;

        case "marketing":
          submitData = {
            userId: formData.userId,
            userEmail: formData.userEmail,
            campaignData: {
              name: formData.userName,
              campaignType: formData.campaignType,
              userData: {
                name: formData.userName,
                ...parsedUserData,
              },
            },
          };
          break;

        default:
          throw new Error("Tipo de flow inválido");
      }

      onSubmit(flowType, submitData);
    } catch (error) {
      toast.error("Erro nos dados do usuário: verifique o JSON");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="flowType">Tipo de Flow *</Label>
        <Select value={flowType} onValueChange={setFlowType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de flow" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="password-recovery">
              Recuperação de Senha
            </SelectItem>
            <SelectItem value="marketing">Campanha de Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {flowType && examples && examples[flowType] && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {examples[flowType].description}
            <br />
            <strong>Passos:</strong> {examples[flowType].steps.length} emails
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="userId">ID do Usuário *</Label>
          <Input
            id="userId"
            value={formData.userId}
            onChange={(e) =>
              setFormData({ ...formData, userId: e.target.value })
            }
            placeholder="user123"
          />
        </div>
        <div>
          <Label htmlFor="userEmail">Email do Usuário *</Label>
          <Input
            id="userEmail"
            type="email"
            value={formData.userEmail}
            onChange={(e) =>
              setFormData({ ...formData, userEmail: e.target.value })
            }
            placeholder="usuario@exemplo.com"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="userName">Nome do Usuário *</Label>
        <Input
          id="userName"
          value={formData.userName}
          onChange={(e) =>
            setFormData({ ...formData, userName: e.target.value })
          }
          placeholder="João Silva"
        />
      </div>

      {flowType === "onboarding" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="plan">Plano</Label>
            <Input
              id="plan"
              value={formData.plan}
              onChange={(e) =>
                setFormData({ ...formData, plan: e.target.value })
              }
              placeholder="premium"
            />
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="ACME Corp"
            />
          </div>
        </div>
      )}

      {flowType === "password-recovery" && (
        <div>
          <Label htmlFor="resetToken">Token de Reset (opcional)</Label>
          <Input
            id="resetToken"
            value={formData.resetToken}
            onChange={(e) =>
              setFormData({ ...formData, resetToken: e.target.value })
            }
            placeholder="Será gerado automaticamente se vazio"
          />
        </div>
      )}

      {flowType === "marketing" && (
        <div>
          <Label htmlFor="campaignType">Tipo de Campanha</Label>
          <Select
            value={formData.campaignType}
            onValueChange={(value) =>
              setFormData({ ...formData, campaignType: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="product-launch">
                Lançamento de Produto
              </SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="promotion">Promoção</SelectItem>
              <SelectItem value="survey">Pesquisa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label htmlFor="userData">Dados Adicionais do Usuário (JSON)</Label>
        <Textarea
          id="userData"
          value={formData.userData}
          onChange={(e) =>
            setFormData({ ...formData, userData: e.target.value })
          }
          placeholder='{"segmento": "premium", "cidade": "São Paulo"}'
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
            <>
              <Play className="w-4 h-4 mr-2" />
              Criar Flow
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
