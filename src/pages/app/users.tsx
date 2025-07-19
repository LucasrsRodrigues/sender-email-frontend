import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Filter,
  Key,
  Lock,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Square,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useBulkUpdateUsers,
  useCreateUser,
  useDeleteUser,
  useResetUserPassword,
  useRevokeUserSessions,
  useToggleUserStatus,
  useUpdateUser,
  useUsers,
  useUsersStats,
} from "@/hooks/queries/users";

export function UsersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    role: "",
    isActive: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<string | null>(null);

  // Queries
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers(filters);
  const { data: statsData } = useUsersStats();

  // Mutations
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();
  const resetPasswordMutation = useResetUserPassword();
  const revokeSessionsMutation = useRevokeUserSessions();
  const bulkUpdateMutation = useBulkUpdateUsers();

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;
  const stats = statsData?.data;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Reset page when other filters change
    }));
  };

  const handleCreateUser = async (data: any) => {
    try {
      await createUserMutation.mutateAsync(data);
      toast.success("Usuário criado com sucesso!");
      setShowCreateDialog(false);
    } catch (error: any) {
      toast.error(
        `Erro ao criar usuário: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleUpdateUser = async (id: string, data: any) => {
    try {
      await updateUserMutation.mutateAsync({ id, data });
      toast.success("Usuário atualizado com sucesso!");
      setEditingUser(null);
    } catch (error: any) {
      toast.error(
        `Erro ao atualizar usuário: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(id);
      toast.success("Usuário excluído com sucesso!");
    } catch (error: any) {
      toast.error(
        `Erro ao excluir usuário: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation.mutateAsync(id);
      toast.success("Status do usuário atualizado!");
    } catch (error: any) {
      toast.error(
        `Erro ao alterar status: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleResetPassword = async (id: string, username: string) => {
    if (
      !confirm(
        `Tem certeza que deseja resetar a senha do usuário "${username}"?`,
      )
    ) {
      return;
    }

    try {
      const result = await resetPasswordMutation.mutateAsync(id);
      toast.success(`Nova senha temporária: ${result.data.temporaryPassword}`);
    } catch (error: any) {
      toast.error(
        `Erro ao resetar senha: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleRevokeUserSessions = async (id: string, username: string) => {
    if (
      !confirm(
        `Tem certeza que deseja revogar todas as sessões do usuário "${username}"?`,
      )
    ) {
      return;
    }

    try {
      await revokeSessionsMutation.mutateAsync(id);
      toast.success("Sessões revogadas com sucesso!");
    } catch (error: any) {
      toast.error(
        `Erro ao revogar sessões: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleBulkAction = async (action: string, role?: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Selecione pelo menos um usuário");
      return;
    }

    const actionNames = {
      activate: "ativar",
      deactivate: "desativar",
      delete: "excluir",
      "change-role": "alterar função",
    };

    if (
      !confirm(
        `Tem certeza que deseja ${actionNames[action]} ${selectedUsers.length} usuário(s)?`,
      )
    ) {
      return;
    }

    try {
      const result = await bulkUpdateMutation.mutateAsync({
        userIds: selectedUsers,
        action: action as any,
        role: role as any,
      });

      toast.success(
        `${result.data.affected} usuário(s) ${actionNames[action]}(s) com sucesso!`,
      );
      setSelectedUsers([]);
    } catch (error: any) {
      toast.error(
        `Erro na operação em lote: ${error.response?.data?.message || error.message}`,
      );
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId),
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? users.map((user) => user.id) : []);
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

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
    }
    return <Badge variant="secondary">Usuário</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Ativo" : "Inativo"}
      </Badge>
    );
  };

  if (usersError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar usuários. Tente novamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestão de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie usuários e permissões do sistema
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Adicione um novo usuário ao sistema
              </DialogDescription>
            </DialogHeader>
            <CreateUserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Usuários</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">Online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.adminUsers}
              </div>
              <p className="text-xs text-muted-foreground">Administradores</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.regularUsers}
              </div>
              <p className="text-xs text-muted-foreground">Regulares</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos</CardTitle>
              <UserPlus className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.newUsersThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Role Filter */}
            <Select
              value={filters.role}
              onValueChange={(value) => handleFilterChange("role", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">Usuário</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.isActive}
              onValueChange={(value) => handleFilterChange("isActive", value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="true">Ativo</SelectItem>
                <SelectItem value="false">Inativo</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-");
                handleFilterChange("sortBy", sortBy);
                handleFilterChange("sortOrder", sortOrder);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="username-asc">Nome A-Z</SelectItem>
                <SelectItem value="username-desc">Nome Z-A</SelectItem>
                <SelectItem value="email-asc">Email A-Z</SelectItem>
                <SelectItem value="email-desc">Email Z-A</SelectItem>
                <SelectItem value="createdAt-desc">Mais recentes</SelectItem>
                <SelectItem value="createdAt-asc">Mais antigos</SelectItem>
                <SelectItem value="lastLogin-desc">Login recente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium">
                {selectedUsers.length} usuário(s) selecionado(s):
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("activate")}
              >
                <UserCheck className="w-3 h-3 mr-1" />
                Ativar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("deactivate")}
              >
                <UserMinus className="w-3 h-3 mr-1" />
                Desativar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction("delete")}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Excluir
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUsers([])}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex items-center space-x-4 p-2 bg-gray-50 rounded font-medium text-sm">
                <div className="w-8">
                  <Checkbox
                    checked={selectedUsers.length === users.length}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
                <div className="flex-1">Usuário</div>
                <div className="w-24">Função</div>
                <div className="w-24">Status</div>
                <div className="w-32">Último Login</div>
                <div className="w-20">Ações</div>
              </div>

              {/* Table Rows */}
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-4 p-2 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <div className="w-8">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user.id, !!checked)
                      }
                    />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>

                  <div className="w-24">{getRoleBadge(user.role)}</div>

                  <div className="w-24">{getStatusBadge(user.isActive)}</div>

                  <div className="w-32 text-sm text-gray-600">
                    {user.lastLogin ? formatDate(user.lastLogin) : "Nunca"}
                  </div>

                  <div className="w-20">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setViewingUser(user.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setEditingUser(user.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleResetPassword(user.id, user.username)
                          }
                        >
                          <Key className="w-4 h-4 mr-2" />
                          Resetar Senha
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRevokeUserSessions(user.id, user.username)
                          }
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Revogar Sessões
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteUser(user.id, user.username)
                          }
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="font-medium mb-2">Nenhum usuário encontrado</h3>
              <p className="text-sm">
                {filters.search || filters.role || filters.isActive
                  ? "Tente ajustar os filtros"
                  : "Crie o primeiro usuário do sistema"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                de {pagination.total} usuários
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleFilterChange("page", pagination.page - 1)
                  }
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm">
                  Página {pagination.page} de {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleFilterChange("page", pagination.page + 1)
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Modificar informações do usuário
              </DialogDescription>
            </DialogHeader>
            <EditUserForm
              userId={editingUser}
              onSubmit={(data) => handleUpdateUser(editingUser, data)}
              onCancel={() => setEditingUser(null)}
              isLoading={updateUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View User Dialog */}
      {viewingUser && (
        <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações detalhadas e atividade do usuário
              </DialogDescription>
            </DialogHeader>
            <UserDetailsView
              userId={viewingUser}
              onClose={() => setViewingUser(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Componente de formulário para criar usuário
function CreateUserForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    onSubmit({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      isActive: formData.isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="username">Nome de usuário *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            placeholder="usuario123"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="usuario@exemplo.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Senha *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar senha *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="role">Função</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Usuário</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isActive: !!checked })
          }
        />
        <Label htmlFor="isActive">Usuário ativo</Label>
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
            "Criar Usuário"
          )}
        </Button>
      </div>
    </form>
  );
}

// Componente de formulário para editar usuário (simplificado)
function EditUserForm({
  userId,
  onSubmit,
  onCancel,
  isLoading,
}: {
  userId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  // Este seria um componente mais completo que carrega os dados do usuário
  // Por brevidade, mostro uma versão simplificada
  return (
    <div className="space-y-4">
      <p>Formulário de edição para o usuário {userId}</p>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSubmit({})} disabled={isLoading}>
          Salvar
        </Button>
      </div>
    </div>
  );
}

// Componente para visualizar detalhes do usuário (simplificado)
function UserDetailsView({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  // Este seria um componente que mostra informações detalhadas do usuário
  return (
    <div className="space-y-4">
      <p>Detalhes do usuário {userId}</p>
      <Button onClick={onClose}>Fechar</Button>
    </div>
  );
}
