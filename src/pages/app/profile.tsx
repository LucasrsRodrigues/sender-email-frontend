import {
  Activity,
  Calendar,
  CheckCircle,
  Edit,
  Key,
  Lock,
  LogOut,
  Monitor,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Separator } from "../../components/ui/separator";
import { useAuth } from "../../contexts/AuthContext";
import {
  useActiveSessions,
  useAuthStats,
  useLogout,
  useRevokeAllSessions,
  useRevokeSession,
  useUpdateProfile,
} from "../../hooks/queries/auth";

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showSessions, setShowSessions] = useState(false);

  const { data: sessionsData } = useActiveSessions();
  const { data: statsData } = useAuthStats();
  const updateProfileMutation = useUpdateProfile();
  const logoutMutation = useLogout();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllSessions();

  const sessions = sessionsData?.data?.sessions || [];
  const stats = statsData?.data;

  const [profileForm, setProfileForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.username.trim() || !profileForm.email.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        username: profileForm.username.trim(),
        email: profileForm.email.trim(),
      });
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar perfil");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Nova senha e confirmação não coincidem");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Senha alterada com sucesso!");
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao alterar senha");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success("Sessão revogada com sucesso!");
    } catch (error) {
      toast.error("Erro ao revogar sessão");
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm("Tem certeza que deseja revogar todas as sessões? Você será desconectado.")) {
      return;
    }

    try {
      await revokeAllSessionsMutation.mutateAsync();
      toast.success("Todas as sessões foram revogadas!");
    } catch (error) {
      toast.error("Erro ao revogar sessões");
    }
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

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
    }
    return <Badge variant="secondary">Usuário</Badge>;
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Carregando perfil...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">
            Gerencie suas informações pessoais e configurações de segurança
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                  <CardDescription>
                    Suas informações básicas de perfil
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileForm({
                        username: user.username,
                        email: user.email,
                      });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Salvar
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Nome de usuário:</span>
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Função:</span>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Membro desde:</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Último login:</span>
                      <span>{formatDate(user.lastLogin)}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Segurança</span>
              </CardTitle>
              <CardDescription>
                Configurações de segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Alterar Senha</h4>
                  <p className="text-sm text-gray-600">
                    Mantenha sua conta segura com uma senha forte
                  </p>
                </div>
                <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Lock className="w-4 h-4 mr-2" />
                      Alterar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Alterar Senha</DialogTitle>
                      <DialogDescription>
                        Digite sua senha atual e a nova senha
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Senha atual</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">Nova senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          Alterar Senha
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sessões Ativas</h4>
                  <p className="text-sm text-gray-600">
                    Gerencie onde você está logado
                  </p>
                </div>
                <Dialog open={showSessions} onOpenChange={setShowSessions}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Activity className="w-4 h-4 mr-2" />
                      Ver Sessões
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Sessões Ativas</DialogTitle>
                      <DialogDescription>
                        Dispositivos onde você está logado atualmente
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {sessions.length > 0 ? (
                        sessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getDeviceIcon(session.userAgent)}
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">
                                    {session.userAgent.includes("Chrome") ? "Chrome" :
                                      session.userAgent.includes("Firefox") ? "Firefox" :
                                        session.userAgent.includes("Safari") ? "Safari" : "Navegador"}
                                  </span>
                                  {session.isCurrentSession && (
                                    <Badge variant="outline" className="text-xs">
                                      Atual
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {session.ipAddress} • {formatDate(session.lastActivity)}
                                </div>
                              </div>
                            </div>
                            {!session.isCurrentSession && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">
                          Nenhuma sessão ativa encontrada
                        </p>
                      )}

                      {sessions.length > 1 && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRevokeAllSessions}
                            disabled={revokeAllSessionsMutation.isPending}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Revogar Todas as Sessões
                          </Button>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sair da Conta</h4>
                  <p className="text-sm text-gray-600">
                    Finalizar sua sessão atual
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  Sair
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* User Stats */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Estatísticas</span>
                </CardTitle>
                <CardDescription>
                  Atividade da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {stats.activeSessions}
                  </div>
                  <div className="text-xs text-blue-800">Sessões Ativas</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">
                      {stats.successfulLogins}
                    </div>
                    <div className="text-xs text-green-800">Logins</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">
                      {stats.failedLogins}
                    </div>
                    <div className="text-xs text-red-800">Falhas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {stats?.lastLogins && stats.lastLogins.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Atividade Recente</span>
                </CardTitle>
                <CardDescription>
                  Últimos acessos à conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.lastLogins.slice(0, 5).map((login, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <div className="flex-1">
                        <div className="font-medium">
                          {formatDate(login.loginAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {login.ipAddress}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}