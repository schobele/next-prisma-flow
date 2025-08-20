"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePost, useDeletePost } from "@/lib/flow/post/client/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  User, 
  Edit, 
  Trash2, 
  AlertCircle,
  ArrowLeft 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { isPostAuthor } from "@/lib/auth";

interface PostViewProps {
  postId: string;
}

export function PostView({ postId }: PostViewProps) {
  const router = useRouter();
  
  // Using the generated usePost hook
  const { data: post, isLoading, error } = usePost(postId);
  
  // Using the generated delete mutation
  const deletePost = useDeletePost({
    onSuccess: () => {
      router.push("/");
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load post. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const canEdit = isPostAuthor(post.authorId);

  return (
    <article className="max-w-4xl mx-auto">
      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/posts/${post.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deletePost.mutate(postId)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Post Header */}
      <header className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          {!post.published && (
            <Badge variant="secondary">Draft</Badge>
          )}
          {post.tags?.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight">
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-xl text-muted-foreground">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {post.author?.name || "Anonymous"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* Post Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        {post.content.split("\n").map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Author Bio */}
      {post.author && (
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">About the Author</h3>
          <p className="text-muted-foreground">
            {post.author.bio || `${post.author.name} is a writer on our blog.`}
          </p>
        </div>
      )}
    </article>
  );
}