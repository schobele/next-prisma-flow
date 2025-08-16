"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../lib/auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  // Let FlowProvider manage its own QueryClient as designed
  // AuthProvider will conditionally wrap with FlowProvider when user is authenticated
  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}