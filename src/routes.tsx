import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminDashboardPage } from "./pages/app/admin/dashboard";
import { EmailSettingsPage } from "./pages/app/admin/emailSettings";
import { AdminSearchPage } from "./pages/app/admin/search";
import { AnalyticsPage } from "./pages/app/analytics";
import { ApiKeysPage } from "./pages/app/apiKeys";
import { ConfigPage } from "./pages/app/configPage";
import { AdvancedConfigPage } from "./pages/app/configs/advanced";
import { ConfigHistoryPage } from "./pages/app/configs/history";
import { Dashboard } from "./pages/app/dashboard";
import { FlowsPage } from "./pages/app/flows";
import { LogsPage } from "./pages/app/logsPage";
import { ProfilePage } from "./pages/app/profile";
import { QueuePage } from "./pages/app/queuePage";
import { BlockedDomainsPage } from "./pages/app/security/blockedDomains";
import { SecurityPage } from "./pages/app/securityPage";
import { SendEmailPage } from "./pages/app/sendEmail";
import { TemplatePage } from "./pages/app/template";
import { TemplatePreviewPage } from "./pages/app/templates/preview";
import { UsersPage } from "./pages/app/users";
import { WebhooksPage } from "./pages/app/webhooks";
import { LoginPage } from "./pages/auth/login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "send-email", element: <SendEmailPage /> },

      // Templates
      { path: "templates", element: <TemplatePage /> },
      { path: "templates/preview", element: <TemplatePreviewPage /> },

      { path: "flows", element: <FlowsPage /> },
      { path: "webhooks", element: <WebhooksPage /> },
      { path: "api-keys", element: <ApiKeysPage /> },
      {
        path: "users",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "security/blocked-domains", element: <BlockedDomainsPage /> },

      // Configurações
      { path: "configs", element: <ConfigPage /> },
      { path: "configs/advanced", element: <AdvancedConfigPage /> },
      { path: "configs/history", element: <ConfigHistoryPage /> },

      // Admin
      {
        path: "admin/email-settings",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <EmailSettingsPage />
          </ProtectedRoute>
        ),
      },

      { path: "queues", element: <QueuePage /> },
      { path: "security", element: <SecurityPage /> },
      { path: "logs", element: <LogsPage /> },
      { path: "profile", element: <ProfilePage /> },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/search",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminSearchPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
