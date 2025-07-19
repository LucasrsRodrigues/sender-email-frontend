import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { queryClient } from "./lib/react-query";
import { router } from "./routes";

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster richColors />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}