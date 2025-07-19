import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { ConfigPage } from "./pages/app/configPage";
import { Dashboard } from "./pages/app/dashboard";
import { LogsPage } from "./pages/app/logsPage";
import { QueuePage } from "./pages/app/queuePage";
import { SecurityPage } from "./pages/app/securityPage";
import { SendEmailPage } from "./pages/app/sendEmail";
import { TemplatePage } from "./pages/app/template";
import { Signin } from "./pages/auth/signin";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // Layout wrapper
    children: [
      {
        index: true, // This makes it the default route for "/"
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
    ],
  },
  {
    path: "/sign-in",
    element: <Signin />, // Login fora do layout
  },
]);
