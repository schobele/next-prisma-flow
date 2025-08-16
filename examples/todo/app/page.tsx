import { Suspense } from "react";
import { Header, TenantBreadcrumb } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import TodoApp from "@/components/todo-app";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TenantBreadcrumb />
      <main className="container mx-auto px-4 py-6 flex-1">
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <TodoApp />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}