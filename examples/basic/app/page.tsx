import { PostList } from "@/components/blog/post-list";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Flow Blog
        </h1>
        <p className="text-lg text-muted-foreground">
          A minimal blog example showcasing next-prisma-flow features
        </p>
        <p className="text-sm text-muted-foreground">
          ✨ React Query hooks • 🔄 Autosave forms • 🔐 Policy-based auth • ⚡ Optimistic updates
        </p>
      </div>
      
      <PostList />
    </div>
  );
}