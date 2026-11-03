import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { AuthProvider } from "./auth/AuthProvider";
import { Toaster } from "./components/Toast";
import "./styles/app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    // Refetch when the app comes back to the foreground: that is how phone and laptop stay in sync.
    queries: { staleTime: 30_000, refetchOnWindowFocus: true, retry: 1 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
