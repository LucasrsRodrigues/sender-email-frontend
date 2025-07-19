import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import {
  Breadcrumb,
  ConnectionStatus,
  MobileMenu,
  NavigationMenu,
} from "./Navigation";

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Não mostrar o layout na página de login
  if (location.pathname === "/sign-in") {
    return <Outlet />;
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen">
      <ConnectionStatus />
      <div className="flex h-screen bg-gray-50">
        <NavigationMenu
          currentPath={location.pathname}
          onNavigate={handleNavigate}
        />
        <main className="flex-1 overflow-auto">
          <Breadcrumb currentPath={location.pathname} />
          <MobileMenu
            currentPath={location.pathname}
            onNavigate={handleNavigate}
          />
          <Outlet />
        </main>
      </div>
    </div>
  );
};
