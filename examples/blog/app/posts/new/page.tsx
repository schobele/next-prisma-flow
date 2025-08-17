"use client";

import { useRouter } from "next/navigation";
import { usePostForm } from "@/lib/flow/post";

export default function NewPostPage() {
  const router = useRouter();
  const { form, submit } = usePostForm({
    onSuccess: (post: any) => router.push(`/posts/${post.id}`),
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <input {...form.register("title")} placeholder="Title" />
      <textarea {...form.register("content")} placeholder="Content" />
      <button type="submit">Create</button>
    </form>
  );
}
