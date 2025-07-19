import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Globe,
  History,
  Home,
  Key,
  LogOut,
  Mail,
  Send,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: BarChart3,
    description: "Visão geral do sistema",
  },
  {
    path: "/send-email",
    label: "Enviar Email",
    icon: Send,
    description: "Enviar emails individuais",
  },
  {
    path: "/templates",
    label: "Templates",
    icon: FileText,
    description: "Gerir templates de email",
    submenu: [
      {
        path: "/templates",
        label: "Gerenciar Templates",
        description: "Criar e editar templates",
      },
      {
        path: "/templates/preview",
        label: "Preview Avançado",
        description: "Testar templates com variáveis",
      },
    ],
  },
  {
    path: "/flows",
    label: "Flows",
    icon: Globe,
    description: "Sequências automatizadas de emails",
  },
  {
    path: "/webhooks",
    label: "Webhooks",
    icon: Globe,
    description: "Integração com sistemas externos",
  },
  {
    path: "/api-keys",
    label: "API Keys",
    icon: Key,
    description: "Gerenciar chaves de API",
  },
  {
    path: "/users",
    label: "Usuários",
    icon: Users,
    description: "Gerenciar usuários do sistema",
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Estatísticas e relatórios",
  },
  {
    path: "/queues",
    label: "Filas",
    icon: Activity,
    description: "Monitorar filas de processamento",
  },
  {
    path: "/security",
    label: "Segurança",
    icon: Shield,
    description: "IPs e domínios bloqueados",
  },
  {
    path: "/configs",
    label: "Configurações",
    icon: Settings,
    description: "Configurações do sistema",
    submenu: [
      {
        path: "/configs",
        label: "Configurações Básicas",
        description: "Configurações principais",
      },
      {
        path: "/configs/advanced",
        label: "Configurações Avançadas",
        description: "Configurações detalhadas",
      },
      {
        path: "/configs/history",
        label: "Histórico",
        description: "Histórico de alterações",
      },
      {
        path: "/admin/email-settings",
        label: "Configurações SMTP",
        description: "Gmail e SendGrid",
      },
    ],
  },
  {
    path: "/logs",
    label: "Logs",
    icon: History,
    description: "Logs do sistema",
  },
];

// Hook para auth
const useAuth = () => {
  const logout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/sign-in";
  };

  return { logout };
};

// Componente do Menu de Navegação
export const NavigationMenu = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const handleLogout = () => {
    logout();
  };

  const toggleSubmenu = (path: string) => {
    setExpandedMenus((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  // Auto-expandir menu se estamos numa subpágina
  React.useEffect(() => {
    menuItems.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(
          (sub) => location.pathname === sub.path,
        );
        if (hasActiveSubmenu && !expandedMenus.includes(item.path)) {
          setExpandedMenus((prev) => [...prev, item.path]);
        }
      }
    });
  }, [location.pathname]);

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <Link
          to="/"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Mail className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">EmailAdmin</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 mt-6 px-6 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              isActive={location.pathname === item.path}
              isExpanded={expandedMenus.includes(item.path)}
              onToggle={() => toggleSubmenu(item.path)}
              currentPath={location.pathname}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );
};

// Componente de Item de Navegação com Submenu
const NavItem = ({
  path,
  label,
  icon: Icon,
  description,
  isActive,
  submenu,
  isExpanded,
  onToggle,
  currentPath,
}) => {
  const hasSubmenu = submenu && submenu.length > 0;
  const hasActiveSubmenu =
    hasSubmenu && submenu.some((sub) => currentPath === sub.path);
  const isMainActive = isActive && !hasActiveSubmenu;

  if (hasSubmenu) {
    return (
      <div className="space-y-1">
        {/* Menu Principal */}
        <div className="flex items-center">
          <Link
            to={path}
            className={`flex-1 flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group ${isMainActive
              ? "bg-blue-100 text-blue-700 shadow-sm"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
          >
            <Icon
              className={`w-5 h-5 transition-colors ${isMainActive
                ? "text-blue-600"
                : "text-gray-500 group-hover:text-gray-700"
                }`}
            />
            <div className="flex-1">
              <span className="font-medium block">{label}</span>
              {!isMainActive && !hasActiveSubmenu && (
                <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {description}
                </div>
              )}
            </div>
          </Link>

          {/* Botão de Expandir */}
          <button
            onClick={onToggle}
            className={`p-2 rounded-md transition-colors ${isExpanded || hasActiveSubmenu
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Submenu */}
        {(isExpanded || hasActiveSubmenu) && (
          <div className="ml-8 space-y-1 border-l-2 border-gray-100 pl-4">
            {submenu.map((subItem) => (
              <Link
                key={subItem.path}
                to={subItem.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group block ${currentPath === subItem.path
                  ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium block">
                    {subItem.label}
                  </span>
                  {currentPath !== subItem.path && (
                    <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {subItem.description}
                    </div>
                  )}
                </div>
                {currentPath === subItem.path && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Menu sem submenu (comportamento original)
  return (
    <Link
      to={path}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group block ${isActive
        ? "bg-blue-100 text-blue-700 shadow-sm"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
    >
      <Icon
        className={`w-5 h-5 transition-colors ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
          }`}
      />
      <div className="flex-1">
        <span className="font-medium block">{label}</span>
        {!isActive && (
          <div className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
            {description}
          </div>
        )}
      </div>
      {isActive && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
    </Link>
  );
};

// Componente de Breadcrumb Atualizado
export const Breadcrumb = () => {
  const location = useLocation();

  const getBreadcrumbData = (pathname) => {
    // Verificar submenus primeiro
    for (const item of menuItems) {
      if (item.submenu) {
        const submenuItem = item.submenu.find((sub) => sub.path === pathname);
        if (submenuItem) {
          return {
            parent: { label: item.label, icon: item.icon, path: item.path },
            current: { label: submenuItem.label, icon: Eye },
          };
        }
      }
    }

    // Menu principal
    const item = menuItems.find((item) => item.path === pathname);
    if (!item) return { current: { label: "Página", icon: Home } };

    return { current: { label: item.label, icon: item.icon } };
  };

  const breadcrumbData = getBreadcrumbData(location.pathname);

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Home className="w-4 h-4" />
        <span>/</span>

        {breadcrumbData.parent && (
          <>
            <Link
              to={breadcrumbData.parent.path}
              className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
            >
              <breadcrumbData.parent.icon className="w-4 h-4" />
              <span>{breadcrumbData.parent.label}</span>
            </Link>
            <span>/</span>
          </>
        )}

        <breadcrumbData.current.icon className="w-4 h-4" />
        <span className="font-medium text-gray-900">
          {breadcrumbData.current.label}
        </span>
      </div>
    </div>
  );
};

// Menu Mobile com React Router (mantido igual)
export const MobileMenu = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  // Fechar menu quando a rota muda
  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div className="lg:hidden">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        <Mail className="w-6 h-6 text-blue-600" />
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-64 h-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <NavigationMenu />
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Status de Conexão (mantido igual)
export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-2 text-sm text-center">
      <Globe className="w-4 h-4 inline mr-2" />
      Sem conexão com a internet
    </div>
  );
};
