import {
  AlertTriangle,
  CheckCircle,
  Code,
  Copy,
  Download,
  Eye,
  FileText,
  Monitor,
  Palette,
  RefreshCw,
  Smartphone,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdvancedTemplatePreview,
  useTemplate,
  useTemplates,
  useTemplateVariables,
  useValidateTemplateVariables,
} from "@/hooks/queries/template";

export function TemplatePreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [variables, setVariables] = useState("{}");
  const [validateVariables, setValidateVariables] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [format, setFormat] = useState<"html" | "text" | "both">("both");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Queries
  const { data: templatesData } = useTemplates();
  const { data: templateData } = useTemplate(selectedTemplate);
  const { data: variablesData } = useTemplateVariables(selectedTemplate);

  // Mutations
  const previewMutation = useAdvancedTemplatePreview();
  const validateMutation = useValidateTemplateVariables();

  const templates = templatesData?.data?.templates || [];
  const template = templateData?.data?.template;
  const requiredVariables = variablesData?.data?.variables || {};
  const previewResult = previewMutation.data?.data;

  const isValidJSON = () => {
    try {
      JSON.parse(variables);
      return true;
    } catch {
      return false;
    }
  };

  const handlePreview = async () => {
    if (!selectedTemplate || !isValidJSON()) {
      toast.error("Selecione um template e forneça variáveis válidas em JSON");
      return;
    }

    try {
      await previewMutation.mutateAsync({
        name: selectedTemplate,
        data: {
          variables: JSON.parse(variables),
          validateVariables,
          includeMetadata,
          format,
        },
      });
    } catch (error) {
      console.error("Erro ao gerar preview:", error);
    }
  };

  const handleValidateVariables = async () => {
    if (!selectedTemplate || !isValidJSON()) {
      toast.error("Selecione um template e forneça variáveis válidas em JSON");
      return;
    }

    try {
      await validateMutation.mutateAsync({
        name: selectedTemplate,
        variables: JSON.parse(variables),
      });
      toast.success("Variáveis validadas com sucesso!");
    } catch (error) {
      console.error("Erro ao validar variáveis:", error);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Conteúdo copiado para a área de transferência!");
  };

  const downloadPreview = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadExampleVariables = () => {
    if (requiredVariables && Object.keys(requiredVariables).length > 0) {
      setVariables(JSON.stringify(requiredVariables, null, 2));
    } else {
      // Exemplo genérico
      const example = {
        user: {
          name: "João Silva",
          email: "joao@exemplo.com",
        },
        company: {
          name: "Minha Empresa",
          logo: "https://exemplo.com/logo.png",
        },
        data: new Date().toISOString(),
      };
      setVariables(JSON.stringify(example, null, 2));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Preview Avançado de Templates
        </h1>
        <p className="text-gray-600">
          Visualize e teste seus templates com diferentes variáveis e
          configurações
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Configurações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-select">Template</Label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template: any) => (
                      <SelectItem key={template.name} value={template.name}>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.name}</span>
                          <span className="text-xs text-gray-500">
                            v{template.version} •{" "}
                            {template.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="variables">Variáveis (JSON)</Label>
                <Textarea
                  id="variables"
                  value={variables}
                  onChange={(e) => setVariables(e.target.value)}
                  rows={8}
                  className={`font-mono text-sm ${!isValidJSON() ? "border-red-300" : ""}`}
                  placeholder='{"user": {"name": "João"}, "data": "2025-01-01"}'
                />
                {!isValidJSON() && (
                  <p className="text-xs text-red-600 mt-1">JSON inválido</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadExampleVariables}
                  className="mt-2 w-full"
                >
                  Carregar Exemplo
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="validate-vars">Validar Variáveis</Label>
                  <Switch
                    id="validate-vars"
                    checked={validateVariables}
                    onCheckedChange={setValidateVariables}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="include-meta">Incluir Metadados</Label>
                  <Switch
                    id="include-meta"
                    checked={includeMetadata}
                    onCheckedChange={setIncludeMetadata}
                  />
                </div>

                <div>
                  <Label htmlFor="format">Formato</Label>
                  <Select
                    value={format}
                    onValueChange={(value: any) => setFormat(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="both">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handlePreview}
                  disabled={
                    !selectedTemplate ||
                    !isValidJSON() ||
                    previewMutation.isPending
                  }
                  className="flex-1"
                >
                  {previewMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Eye className="w-4 h-4 mr-2" />
                  )}
                  Preview
                </Button>
                <Button
                  variant="outline"
                  onClick={handleValidateVariables}
                  disabled={
                    !selectedTemplate ||
                    !isValidJSON() ||
                    validateMutation.isPending
                  }
                >
                  {validateMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Template */}
          {template && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">
                  Informações do Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <strong>Nome:</strong> {template.name}
                </div>
                <div>
                  <strong>Descrição:</strong> {template.description || "N/A"}
                </div>
                <div>
                  <strong>Versão:</strong> v{template.version}
                </div>
                <div>
                  <strong>Status:</strong>
                  <Badge
                    variant={template.isActive ? "default" : "secondary"}
                    className="ml-2"
                  >
                    {template.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div>
                  <strong>Atualizado:</strong>{" "}
                  {new Date(template.updatedAt).toLocaleDateString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {!previewResult ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione um Template
                  </h3>
                  <p className="text-gray-600">
                    Escolha um template e configure as variáveis para gerar o
                    preview
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Preview: {selectedTemplate}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setViewMode(
                          viewMode === "desktop" ? "mobile" : "desktop",
                        )
                      }
                    >
                      {viewMode === "desktop" ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Gerado em:{" "}
                  {new Date(previewResult.metadata.generatedAt).toLocaleString(
                    "pt-BR",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="subject">Assunto</TabsTrigger>
                    <TabsTrigger value="metadata">Metadados</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <div
                      className={`border rounded-lg overflow-hidden ${viewMode === "mobile" ? "max-w-sm mx-auto" : ""
                        }`}
                    >
                      <div className="bg-gray-100 px-4 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Assunto: {previewResult.subject}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(previewResult.content)
                              }
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                downloadPreview(
                                  previewResult.content,
                                  `${selectedTemplate}-preview.html`,
                                )
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <iframe
                          srcDoc={previewResult.content}
                          className="w-full h-96 border-0"
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="html" className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium">
                          Código HTML
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(previewResult.content)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96">
                        <code>{previewResult.content}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="subject" className="mt-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <Label className="text-sm font-medium">
                        Linha de Assunto
                      </Label>
                      <div className="bg-white p-3 rounded border mt-2">
                        <span className="text-lg">{previewResult.subject}</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="metadata" className="mt-4">
                    {includeMetadata && previewResult.metadata && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Label className="text-sm font-medium">Metadados</Label>
                        <pre className="bg-white p-4 rounded border mt-2 text-xs">
                          <code>
                            {JSON.stringify(previewResult.metadata, null, 2)}
                          </code>
                        </pre>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Validação de Variáveis */}
          {validateMutation.data && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {validateMutation.data.data.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span>Validação de Variáveis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {validateMutation.data.data.isValid ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Todas as variáveis estão válidas e completas!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {validateMutation.data.data.errors?.map(
                      (error: any, index: number) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{error.variable}:</strong> {error.message}
                          </AlertDescription>
                        </Alert>
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
