"use client";

import Link from "next/link";
import { usePostList } from "@/lib/flow/post";

export default function HomePage() {
  const { data: posts, isLoading } = usePostList();

  if (isLoading) return <div>Loading...</div>;

  return (
    <main>
      <h1>Flow Blog</h1>
      <Link href="/posts/new">Create Post</Link>
      <ul>
        {posts?.map((post: any) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
