"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FlowProvider } from "../lib/flow/core/provider";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const flowContext = {
    user: { id: "demo-user", roles: ["user"] },
    tenantId: null,
  };

  return (
    <FlowProvider ctx={flowContext}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </FlowProvider>
  );
}
