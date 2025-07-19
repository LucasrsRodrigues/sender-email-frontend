import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminDashboardPage } from "./pages/app/admin/dashboard";
import { AdminSearchPage } from "./pages/app/admin/search";
import { ConfigPage } from "./pages/app/configPage";
import { Dashboard } from "./pages/app/dashboard";
import { FlowsPage } from "./pages/app/flows";
import { LogsPage } from "./pages/app/logsPage";
import { QueuePage } from "./pages/app/queuePage";
import { SecurityPage } from "./pages/app/securityPage";
import { SendEmailPage } from "./pages/app/sendEmail";
import { TemplatePage } from "./pages/app/template";
import { WebhooksPage } from "./pages/app/webhooks";
import { Signin } from "./pages/auth/signin";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Layout wrapper
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "send-email",
        element: <SendEmailPage />,
      },
      {
        path: "templates",
        element: <TemplatePage />,
      },
      {
        path: "flows",
        element: <FlowsPage />,
      },
      {
        path: "webhooks",
        element: <WebhooksPage />,
      },
      {
        path: "queues",
        element: <QueuePage />,
      },
      {
        path: "security",
        element: <SecurityPage />,
      },
      {
        path: "configs",
        element: <ConfigPage />,
      },
      {
        path: "logs",
        element: <LogsPage />,
      },
      // Novas rotas administrativas
      {
        path: "admin/dashboard",
        element: <AdminDashboardPage />,
      },
      {
        path: "admin/search",
        element: <AdminSearchPage />,
      },
    ],
  },
  {
    path: "/sign-in",
    element: <Signin />, // Login fora do layout
  },
]);
