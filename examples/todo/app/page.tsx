import { Suspense } from "react";
import TodoApp from "@/components/todo-app";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <TodoApp />
      </Suspense>
    </div>
  );
}