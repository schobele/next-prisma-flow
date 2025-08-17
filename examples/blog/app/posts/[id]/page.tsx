"use client";

import { usePost } from "@/lib/flow/post";

export default function PostPage({ params }: { params: { id: string } }) {
  const { data: post, isLoading } = usePost(params.id);

  if (isLoading) return <div>Loading...</div>;
  if (!post) return <div>Not found</div>;

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
