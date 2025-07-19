import { Dialog } from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Check,
  Edit,
  Eye,
  Filter,
  History,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateTemplate,
  useTemplatePreview,
  useToggleTemplate,
  useUpdateTemplate,
} from "@/hooks/mutations";
import {
  useTemplate,
  useTemplateHistory,
  useTemplates,
} from "@/hooks/queries";

export function TemplatePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState("");
  const [viewingTemplate, setViewingTemplate] = useState("");
  const [previewData, setPreviewData] = useState("");

  // Queries and Mutations
  const { data: templatesData, isLoading, error, refetch } = useTemplates();
  const { data: templateDetailData } = useTemplate(viewingTemplate);
  const { data: historyData } = useTemplateHistory(viewingTemplate);

  const createTemplateMutation = useCreateTemplate();
  const updateTemplateMutation = useUpdateTemplate();
  const toggleTemplateMutation = useToggleTemplate();
  const previewMutation = useTemplatePreview();

  const templates = templatesData?.data?.templates || [];

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && template.isActive) ||
      (statusFilter === "inactive" && !template.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleToggleTemplate = async (template) => {
    try {
      await toggleTemplateMutation.mutateAsync({
        name: template.name,
        isActive: !template.isActive,
        updatedBy: "admin",
      });
    } catch (error) {
      console.error("Erro ao alterar status do template:", error);
    }
  };

  const handlePreview = async (templateName, variables = {}) => {
    try {
      const result = await previewMutation.mutateAsync({
        name: templateName,
        variables,
      });
      setPreviewData(result.data.preview);
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar templates. Verifique a conexão com a API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-600">Gerencie templates de email</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <CreateTemplateForm
                onClose={() => setShowCreateDialog(false)}
                mutation={createTemplateMutation}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success/Error Messages */}
      {createTemplateMutation.isSuccess && (
        <Alert className="mb-4">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Template criado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {(createTemplateMutation.isError || updateTemplateMutation.isError || toggleTemplateMutation.isError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro na operação. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Templates Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
              <p className="text-gray-500">Carregando templates...</p>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Nenhum template encontrado com os filtros aplicados.'
                  : 'Nenhum template encontrado. Crie o primeiro!'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assunto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Versão
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Atualizado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTemplates.map((template) => (
                    <tr key={template.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {template.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {template.subject}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        v{template.version}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingTemplate(template.name)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleTemplate(template)}
                            disabled={toggleTemplateMutation.isPending}
                          >
                            {template.isActive ? (
                              <PowerOff className="w-4 h-4 text-red-500" />
                            ) : (
                              <Power className="w-4 h-4 text-green-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Template Dialog */}
      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate("")}>
        <DialogContent className="max-w-4xl">
          <TemplateViewer
            templateName={viewingTemplate}
            templateData={templateDetailData?.data?.template}
            historyData={historyData?.data?.history}
            onPreview={handlePreview}
            previewData={previewData}
            previewLoading={previewMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate("")}>
        <DialogContent className="max-w-2xl">
          <EditTemplateForm
            template={editingTemplate}
            onClose={() => setEditingTemplate(null)}
            mutation={updateTemplateMutation}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Create Template Form Component
const CreateTemplateForm = ({ onClose, mutation }) => {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    description: "",
    variables: "{}",
  });

  const handleSubmit = async () => {
    try {
      let variables = {};
      try {
        variables = JSON.parse(formData.variables);
      } catch {
        // Keep as empty object if invalid JSON
      }

      await mutation.mutateAsync({
        ...formData,
        variables,
        createdBy: "admin",
      });

      onClose();
      setFormData({
        name: "",
        subject: "",
        content: "",
        description: "",
        variables: "{}",
      });
    } catch (error) {
      console.error("Erro ao criar template:", error);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Criar Novo Template</DialogTitle>
        <DialogDescription>
          Crie um novo template de email com variáveis dinâmicas
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Template</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="welcome, newsletter, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descrição do template"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Assunto</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="Bem-vindo {{name}}!"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo HTML</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="<h1>Olá {{name}}!</h1><p>Seu código: {{code}}</p>"
            className="h-32 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="variables">Variáveis (JSON)</Label>
          <Textarea
            id="variables"
            value={formData.variables}
            onChange={(e) =>
              setFormData({ ...formData, variables: e.target.value })
            }
            placeholder='{"name": "string", "code": "string"}'
            className="font-mono"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.name ||
              !formData.subject ||
              !formData.content ||
              mutation.isPending
            }
          >
            {mutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Criar Template
          </Button>
        </div>
      </div>
    </>
  );
};

// Edit Template Form Component
const EditTemplateForm = ({ template, onClose, mutation }) => {
  const [formData, setFormData] = useState({
    subject: template?.subject || "",
    content: template?.content || "",
    description: template?.description || "",
    reason: "",
  });

  const handleSubmit = async () => {
    try {
      await mutation.mutateAsync({
        name: template.name,
        data: {
          ...formData,
          updatedBy: "admin",
        },
      });

      onClose();
    } catch (error) {
      console.error("Erro ao atualizar template:", error);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar Template: {template?.name}</DialogTitle>
        <DialogDescription>Atualize o conteúdo do template</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Descrição do template"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Assunto</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            placeholder="Bem-vindo {{name}}!"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo HTML</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="h-32 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Motivo da Alteração</Label>
          <Input
            id="reason"
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
            placeholder="Descreva o motivo da alteração"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Salvar Alterações
          </Button>
        </div>
      </div>
    </>
  );
};

// Template Viewer Component
const TemplateViewer = ({
  templateName,
  templateData,
  historyData,
  onPreview,
  previewData,
  previewLoading,
}) => {
  const [previewVariables, setPreviewVariables] = useState("{}");

  const handlePreview = () => {
    try {
      const variables = JSON.parse(previewVariables);
      onPreview(templateName, variables);
    } catch (error) {
      console.error("JSON inválido:", error);
    }
  };

  if (!templateData) {
    return (
      <div className="p-8 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-gray-400" />
        <p>Carregando template...</p>
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Template: {templateData.name}</DialogTitle>
        <DialogDescription>{templateData.description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Template Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Informações
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Versão:</span>
                <span>v{templateData.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge
                  variant={templateData.isActive ? "default" : "secondary"}
                >
                  {templateData.isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Criado:</span>
                <span>
                  {new Date(templateData.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Atualizado:</span>
                <span>
                  {new Date(templateData.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Variáveis
            </h4>
            {templateData.variables ? (
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(templateData.variables, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma variável definida</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Assunto</h4>
          <div className="bg-gray-100 p-3 rounded">
            <code className="text-sm">{templateData.subject}</code>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Conteúdo HTML
          </h4>
          <div className="bg-gray-100 p-3 rounded max-h-32 overflow-y-auto">
            <pre className="text-xs">{templateData.content}</pre>
          </div>
        </div>

        {/* Preview Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Textarea
                placeholder='{"name": "João", "code": "123456"}'
                value={previewVariables}
                onChange={(e) => setPreviewVariables(e.target.value)}
                className="flex-1 font-mono text-sm"
                rows={3}
              />
              <Button
                onClick={handlePreview}
                disabled={previewLoading}
                size="sm"
              >
                {previewLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            {previewData && (
              <div className="border rounded p-3 bg-white">
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Assunto:
                  </span>
                  <p className="text-sm font-medium">{previewData.subject}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-600">
                    Conteúdo:
                  </span>
                  <div
                    className="text-sm mt-1 p-2 border rounded bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: previewData.content }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        {historyData && historyData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <History className="w-4 h-4 mr-1" />
              Histórico de Alterações
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {historyData.map((entry) => (
                <div key={entry.id} className="text-xs border rounded p-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">v{entry.version}</span>
                    <span className="text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{entry.reason}</p>
                  <p className="text-gray-500">por {entry.changedBy}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
