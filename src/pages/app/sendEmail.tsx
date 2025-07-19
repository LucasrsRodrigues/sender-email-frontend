import { AlertTriangle, Check, Clock, Eye, Mail, RefreshCw, Send, User } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useSendEmail, useTemplatePreview } from "@/hooks/mutations";
import { useEmailStatus, useTemplates } from "@/hooks/queries";

const extractVariablesFromTemplate = (templateContent: string, templateSubject: string = ""): string[] => {
  const combinedContent = `${templateSubject} ${templateContent}`;
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables = new Set<string>();

  let match;
  while ((match = variableRegex.exec(combinedContent)) !== null) {
    const variable = match[1].trim();
    // Remove helpers e filtros do handlebars (ex: {{#if}}, {{currency amount}})
    if (!variable.startsWith('#') && !variable.startsWith('/') && !variable.startsWith('!')) {
      // Pega apenas o nome da variável, ignorando helpers
      const cleanVariable = variable.split(' ')[0];
      variables.add(cleanVariable);
    }
  }

  return Array.from(variables).sort();
};

// Função para gerar valor padrão baseado no nome da variável
const generateDefaultValue = (variableName: string): string => {
  const lowerName = variableName.toLowerCase();

  if (lowerName.includes('name') || lowerName.includes('nome')) {
    return 'João Silva';
  }
  if (lowerName.includes('email')) {
    return 'joao@exemplo.com';
  }
  if (lowerName.includes('code') || lowerName.includes('codigo')) {
    return '123456';
  }
  if (lowerName.includes('url')) {
    return 'https://exemplo.com';
  }
  if (lowerName.includes('date') || lowerName.includes('data')) {
    return new Date().toLocaleDateString('pt-BR');
  }
  if (lowerName.includes('phone') || lowerName.includes('telefone')) {
    return '(11) 99999-9999';
  }
  if (lowerName.includes('company') || lowerName.includes('empresa')) {
    return 'Minha Empresa';
  }
  if (lowerName.includes('price') || lowerName.includes('preco') || lowerName.includes('valor')) {
    return '99.90';
  }

  return '';
};

// Componente para formulário dinâmico de variáveis
interface DynamicVariableFormProps {
  variables: string[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
}

const DynamicVariableForm: React.FC<DynamicVariableFormProps> = ({
  variables,
  values,
  onChange
}) => {
  const handleVariableChange = (variable: string, value: any) => {
    const newValues = { ...values };

    // Suporte para variáveis aninhadas (ex: user.name)
    if (variable.includes('.')) {
      const parts = variable.split('.');
      let current = newValues;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
    } else {
      newValues[variable] = value;
    }

    onChange(newValues);
  };

  const renderVariableInput = (variable: string) => {
    const currentValue = variable.includes('.')
      ? variable.split('.').reduce((obj, key) => obj?.[key], values) || ''
      : values[variable] || '';

    const inputType = (() => {
      const lowerName = variable.toLowerCase();
      if (lowerName.includes('email')) return 'email';
      if (lowerName.includes('url')) return 'url';
      if (lowerName.includes('phone') || lowerName.includes('telefone')) return 'tel';
      if (lowerName.includes('date') || lowerName.includes('data')) return 'date';
      if (lowerName.includes('number') || lowerName.includes('numero') ||
        lowerName.includes('price') || lowerName.includes('valor')) return 'number';
      return 'text';
    })();

    const isTextarea = variable.toLowerCase().includes('message') ||
      variable.toLowerCase().includes('mensagem') ||
      variable.toLowerCase().includes('content') ||
      variable.toLowerCase().includes('description');

    return (
      <div key={variable} className="space-y-2">
        <Label htmlFor={variable} className="flex items-center gap-2">
          <span className="font-medium">{variable}</span>
          <Badge variant="outline" className="text-xs">
            {inputType === 'email' ? 'Email' :
              inputType === 'url' ? 'URL' :
                inputType === 'tel' ? 'Telefone' :
                  inputType === 'date' ? 'Data' :
                    inputType === 'number' ? 'Número' :
                      isTextarea ? 'Texto longo' : 'Texto'}
          </Badge>
        </Label>

        {isTextarea ? (
          <Textarea
            id={variable}
            value={currentValue}
            onChange={(e) => handleVariableChange(variable, e.target.value)}
            placeholder={`Digite o valor para ${variable}`}
            rows={3}
          />
        ) : (
          <Input
            id={variable}
            type={inputType}
            value={currentValue}
            onChange={(e) => handleVariableChange(variable, e.target.value)}
            placeholder={`Digite o valor para ${variable}`}
          />
        )}
      </div>
    );
  };

  if (variables.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">Nenhuma variável detectada neste template</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Variáveis Detectadas ({variables.length})</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const autoValues = variables.reduce((acc, variable) => {
              const parts = variable.split('.');
              if (parts.length > 1) {
                // Para variáveis aninhadas como user.name
                if (!acc[parts[0]]) acc[parts[0]] = {};
                acc[parts[0]][parts[1]] = generateDefaultValue(variable);
              } else {
                acc[variable] = generateDefaultValue(variable);
              }
              return acc;
            }, {} as Record<string, any>);
            onChange(autoValues);
          }}
        >
          Preencher Exemplos
        </Button>
      </div>

      <div className="space-y-3">
        {variables.map(renderVariableInput)}
      </div>
    </div>
  );
};

export function SendEmailPage() {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    template: "",
    variables: "{}",
    priority: "normal",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [lastSentLogId, setLastSentLogId] = useState("");
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
  const [useFormMode, setUseFormMode] = useState(true);
  const [formVariables, setFormVariables] = useState<Record<string, any>>({});


  // Queries
  const { data: templatesData, isLoading: templatesLoading } = useTemplates();
  const sendEmailMutation = useSendEmail();
  const previewMutation = useTemplatePreview();
  const { data: emailStatusData } = useEmailStatus(lastSentLogId);

  const templates = templatesData?.data?.templates || [];

  // Parse variables with error handling
  const parseVariables = () => {
    if (useFormMode) {
      return formVariables;
    }
    try {
      return JSON.parse(formData.variables || "{}");
    } catch {
      return null;
    }
  };

  const isValidJSON = parseVariables() !== null;

  const handleSubmit = async () => {
    if (!isValidJSON) {
      return;
    }

    try {
      const variables = parseVariables();
      const response = await sendEmailMutation.mutateAsync({
        to: formData.to,
        subject: formData.subject,
        template: formData.template,
        variables,
        priority: formData.priority,
      });

      setLastSentLogId(response.data.logId);

      // Reset form
      setFormData({
        to: "",
        subject: "",
        template: "",
        variables: "{}",
        priority: "normal",
      });
      setShowPreview(false);
    } catch (error) {
      console.error("Erro ao enviar email:", error);
    }
  };

  const handlePreview = async () => {
    if (!formData.template || !isValidJSON) {
      return;
    }

    try {
      const variables = parseVariables();
      await previewMutation.mutateAsync({
        name: formData.template,
        variables,
      });
      setShowPreview(true);
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
    }
  };

  // Auto-populate subject when template is selected
  useEffect(() => {
    if (formData.template) {
      const selectedTemplate = templates.find(
        (t) => t.name === formData.template,
      );
      if (selectedTemplate && !formData.subject) {
        setFormData((prev) => ({
          ...prev,
          subject: selectedTemplate.subject,
        }));
      }
    }
  }, [formData.template, templates]);

  useEffect(() => {
    if (formData.template) {
      const selectedTemplate = templates.find(t => t.name === formData.template);
      if (selectedTemplate) {
        const variables = extractVariablesFromTemplate(
          selectedTemplate.content || '',
          selectedTemplate.subject || ''
        );
        setDetectedVariables(variables);
        setFormVariables({});
      }
    } else {
      setDetectedVariables([]);
      setFormVariables({});
    }
  }, [formData.template, templates]);

  const priorityOptions = [
    { value: "low", label: "Baixa", delay: "30s" },
    { value: "normal", label: "Normal", delay: "15s" },
    { value: "high", label: "Alta", delay: "5s" },
    { value: "critical", label: "Crítica", delay: "Imediato" },
  ];


  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Enviar Email</h1>
        <p className="text-gray-600">
          Envie emails individuais usando templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Novo Email</span>
              </CardTitle>
              <CardDescription>
                Preencha os dados para enviar um email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Success/Error Messages */}
                {sendEmailMutation.isSuccess && (
                  <Alert>
                    <Check className="h-4 w-4" />
                    <AlertDescription>
                      Email enviado com sucesso! Log ID: {lastSentLogId}
                    </AlertDescription>
                  </Alert>
                )}

                {sendEmailMutation.isError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Erro ao enviar email: {sendEmailMutation.error?.message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Recipient */}
                <div className="space-y-2">
                  <Label htmlFor="to">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Destinatário
                  </Label>
                  <Input
                    id="to"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.to}
                    onChange={(e) =>
                      setFormData({ ...formData, to: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select
                    value={formData.template}
                    onValueChange={(value) =>
                      setFormData({ ...formData, template: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templatesLoading ? (
                        <SelectItem value="carregando..." disabled>
                          Carregando...
                        </SelectItem>
                      ) : (
                        templates
                          .filter((template) => template.isActive)
                          .map((template) => (
                            <SelectItem
                              key={template.name}
                              value={template.name}
                            >
                              <div className="flex flex-col">
                                <span>{template.name}</span>
                                <span className="text-xs text-gray-500">
                                  {template.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Assunto do email"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Variables */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="variables">
                      Variáveis do Template
                      {!useFormMode && !isValidJSON && formData.variables && (
                        <Badge variant="destructive" className="ml-2">
                          JSON Inválido
                        </Badge>
                      )}
                    </Label>
                    {detectedVariables.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Modo:</span>
                        <Button
                          variant={useFormMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseFormMode(true)}
                        >
                          Formulário
                        </Button>
                        <Button
                          variant={!useFormMode ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseFormMode(false)}
                        >
                          JSON
                        </Button>
                      </div>
                    )}
                  </div>

                  {detectedVariables.length > 0 ? (
                    useFormMode ? (
                      <DynamicVariableForm
                        variables={detectedVariables}
                        values={formVariables}
                        onChange={setFormVariables}
                      />
                    ) : (
                      <Textarea
                        id="variables"
                        placeholder='{"name": "João", "code": "123456"}'
                        className={`font-mono ${!isValidJSON && formData.variables ? "border-red-300" : ""}`}
                        value={formData.variables}
                        onChange={(e) =>
                          setFormData({ ...formData, variables: e.target.value })
                        }
                        rows={4}
                      />
                    )
                  ) : (
                    <Textarea
                      id="variables"
                      placeholder='{"name": "João", "code": "123456"}'
                      className={`font-mono ${!isValidJSON && formData.variables ? "border-red-300" : ""}`}
                      value={formData.variables}
                      onChange={(e) =>
                        setFormData({ ...formData, variables: e.target.value })
                      }
                      rows={4}
                    />
                  )}

                  <p className="text-xs text-gray-500">
                    {detectedVariables.length > 0
                      ? `${detectedVariables.length} variável(is) detectada(s) automaticamente`
                      : "Digite um objeto JSON válido com as variáveis do template"
                    }
                  </p>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {option.delay}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.to ||
                      !formData.template ||
                      !formData.subject ||
                      (useFormMode ? false : !isValidJSON) ||
                      sendEmailMutation.isPending
                    }
                    className="flex-1"
                  >
                    {sendEmailMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {sendEmailMutation.isPending
                      ? "Enviando..."
                      : "Enviar Email"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={
                      !formData.template ||
                      !isValidJSON ||
                      previewMutation.isPending
                    }
                  >
                    {previewMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Email Status */}
          {lastSentLogId && emailStatusData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status do Último Email</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={
                      emailStatusData.data.status === 'SENT' ? 'default' :
                        emailStatusData.data.status === 'FAILED' ? 'destructive' :
                          'secondary'
                    }>
                      {emailStatusData.data.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Para:</span>
                    <span className="text-sm">{emailStatusData.data.to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Template:</span>
                    <span className="text-sm">{emailStatusData.data.template}</span>
                  </div>
                  {emailStatusData.data.sentAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Enviado:</span>
                      <span className="text-sm">
                        {new Date(emailStatusData.data.sentAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {emailStatusData.data.errorMessage && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-red-600">
                        {emailStatusData.data.errorMessage}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Info */}
          {formData.template && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Template</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const selectedTemplate = templates.find(t => t.name === formData.template);
                  if (!selectedTemplate) return null;

                  return (
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium">Nome:</span>
                        <p className="text-sm text-gray-600">{selectedTemplate.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Descrição:</span>
                        <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Versão:</span>
                        <p className="text-sm text-gray-600">v{selectedTemplate.version}</p>
                      </div>
                      {selectedTemplate.variables && (
                        <div>
                          <span className="text-sm font-medium">Variáveis esperadas:</span>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                            {JSON.stringify(selectedTemplate.variables, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {showPreview && previewMutation.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Assunto:</span>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      {previewMutation.data.data.preview.subject}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Conteúdo:</span>
                    <div
                      className="text-sm bg-gray-100 p-2 rounded max-h-40 overflow-y-auto"
                      dangerouslySetInnerHTML={{
                        __html: previewMutation.data.data.preview.content
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 mt-0.5 text-blue-500" />
                  <span>Emails críticos são enviados imediatamente</span>
                </div>
                <div className="flex items-start space-x-2">
                  <User className="w-4 h-4 mt-0.5 text-green-500" />
                  <span>Use variáveis para personalizar emails</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Eye className="w-4 h-4 mt-0.5 text-purple-500" />
                  <span>Sempre visualize antes de enviar</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
