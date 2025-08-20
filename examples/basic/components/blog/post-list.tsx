"use client";

import { usePostList } from "@/lib/flow/post/client/hooks";
import { PostCard } from "./post-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PostListProps {
  showDrafts?: boolean;
  onlyDrafts?: boolean;
}

export function PostList({ showDrafts = false, onlyDrafts = false }: PostListProps) {
  // Using the generated usePostList hook from Flow
  const { 
    data, 
    isLoading, 
    error,
    nextPage
  } = usePostList({
    where: onlyDrafts 
      ? { published: false }
      : showDrafts 
        ? {} 
        : { published: true },
    orderBy: { publishedAt: "desc" },
    take: 6,
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[200px] w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load posts. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No posts found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {data && data.items.length < data.total && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={() => nextPage()}
            variant="outline"
          >
            Load More Posts
          </Button>
        </div>
      )}
      
      <div className="text-center text-sm text-muted-foreground">
        Showing {data.items.length} of {data.total} posts
      </div>
    </div>
  );
}