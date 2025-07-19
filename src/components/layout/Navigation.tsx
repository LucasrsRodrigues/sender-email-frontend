import {
  Activity,
  BarChart3,
  FileText,
  Globe,
  Home,
  LogOut,
  Mail,
  Send,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";

// Configuração dos itens do menu
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
  },
  {
    path: "/logs",
    label: "Logs",
    icon: Users,
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

  const handleLogout = () => {
    logout();
  };

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
      <nav className="flex-1 mt-6 px-6">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              isActive={location.pathname === item.path}
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

// Componente de Item de Navegação com React Router
const NavItem = ({ path, label, icon: Icon, description, isActive }) => {
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

// Componente de Breadcrumb
export const Breadcrumb = () => {
  const location = useLocation();

  const getBreadcrumbData = (pathname) => {
    const item = menuItems.find((item) => item.path === pathname);
    if (!item) return { label: "Página", icon: Home };
    return item;
  };

  const breadcrumbData = getBreadcrumbData(location.pathname);
  const Icon = breadcrumbData.icon;

  return (
    <div className="bg-white border-b px-6 py-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Home className="w-4 h-4" />
        <span>/</span>
        <Icon className="w-4 h-4" />
        <span className="font-medium text-gray-900">
          {breadcrumbData.label}
        </span>
      </div>
    </div>
  );
};

// Menu Mobile com React Router
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

// Componente de Status de Conexão
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
