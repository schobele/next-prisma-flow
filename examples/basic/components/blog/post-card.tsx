"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import type { FlowPost } from "@/lib/flow/post/types/schemas";

interface PostCardProps {
  post: FlowPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl">
            <Link href={`/posts/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
          </CardTitle>
          {!post.published && (
            <Badge variant="secondary">Draft</Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {post.author?.name || "Anonymous"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
          </span>
        </CardDescription>
      </CardHeader>
      
      {post.excerpt && (
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
        </CardContent>
      )}
      
      {post.tags && post.tags.length > 0 && (
        <CardFooter className="flex gap-2 flex-wrap">
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="outline">
              {tag.name}
            </Badge>
          ))}
        </CardFooter>
      )}
    </Card>
  );
}