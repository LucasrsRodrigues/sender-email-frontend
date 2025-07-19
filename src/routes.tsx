import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminDashboardPage } from "./pages/app/admin/dashboard";
import { AdminSearchPage } from "./pages/app/admin/search";
import { AnalyticsPage } from "./pages/app/analytics";
import { ApiKeysPage } from "./pages/app/apiKeys";
import { ConfigPage } from "./pages/app/configPage";
import { Dashboard } from "./pages/app/dashboard";
import { FlowsPage } from "./pages/app/flows";
import { LogsPage } from "./pages/app/logsPage";
import { ProfilePage } from "./pages/app/profile";
import { QueuePage } from "./pages/app/queuePage";
import { BlockedDomainsPage } from "./pages/app/security/blockedDomains";
import { SecurityPage } from "./pages/app/securityPage";
import { SendEmailPage } from "./pages/app/sendEmail";
import { TemplatePage } from "./pages/app/template";
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
      { path: "templates", element: <TemplatePage /> },
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
      { path: "queues", element: <QueuePage /> },
      { path: "security", element: <SecurityPage /> },
      { path: "configs", element: <ConfigPage /> },
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
