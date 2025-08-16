"use client";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { FlowProvider } from "../lib/flow/core/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  // For now, we'll use a default user context
  // In a real app, this would come from authentication
  const flowContext = {
    user: {
      id: "cmeaduj0n000010rqb31su595", // John Doe from seed data
      roles: ["user"],
    },
    tenantId: null, // Not using multi-tenancy in this example
  };

  return (
    <FlowProvider ctx={flowContext}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </FlowProvider>
  );
}