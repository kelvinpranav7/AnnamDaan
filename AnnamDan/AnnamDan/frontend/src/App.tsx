import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import AppRoutes from "@/routes/AppRoutes";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          richColors
          theme="light"
          toastOptions={{
            style: {
              borderRadius: 14,
              border: "1px solid rgba(139,0,0,0.1)",
              boxShadow: "0 12px 36px -12px rgba(139,0,0,0.18)",
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
