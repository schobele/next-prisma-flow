"use client";

import { useRouter } from "next/navigation";
import { useAuthorList } from "../../generated/flow/author/client/hooks";
import { usePost, usePostForm } from "../../generated/flow/post/client";
import TagInput from "./TagInput";

export default function EditPostPage({ postId }: { postId: string }) {
  const router = useRouter();
  const { data: post, isLoading } = usePost(postId);
  const { data: authorsData } = useAuthorList();
  
  console.log('[EditPostPage] Rendering with post:', post);
  console.log('[EditPostPage] Post has tags:', post?.tags?.length || 0, 'tags');
  
  const { form, submit, isSubmitting, error } = usePostForm({
    id: postId,
    onSuccess: (data) => {
      console.log('[EditPostPage] Update successful:', {
      id: data.id,
      title: data.title,
      tags: data.tags?.length || 0
    });
      router.push('/');
    },
    onError: (err) => {
      console.error('[EditPostPage] Update failed:', err);
    }
  });

  // Debug submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EditPostPage] Form submitted');
    console.log('[EditPostPage] Form values:', form.getValues());
    console.log('[EditPostPage] Form state:', {
      isDirty: form.formState.isDirty,
      dirtyFields: form.formState.dirtyFields,
      isValid: form.formState.isValid,
      errors: form.formState.errors
    });
    submit(e);
  };

  if (!postId) return <div className="p-6">Missing post id</div>;
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!post) return <div className="p-6">Post not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            {...form.register("title")}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter post title"
          />
          {form.formState.errors.title && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            {...form.register("content")}
            rows={6}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your post content..."
          />
          {form.formState.errors.content && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.content.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <select
            {...form.register("authorId")}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue=""
          >
            <option value="">Keep current author</option>
            {authorsData?.items.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name || author.email}
              </option>
            ))}
          </select>
          {form.formState.errors.authorId && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.authorId.message}
            </p>
          )}
        </div>

        {/* Tag Management */}
        <div>
          <TagInput 
            value={form.watch('tags')}
            onChange={(value) => {
              console.log('[EditPostPage] Tag operations:', value);
              form.setValue('tags', value);
            }}
            mode="update"
            existingTags={post.tags || []}
          />
          {form.formState.errors.tags && (
            <p className="text-red-500 text-sm mt-1">
              {String(form.formState.errors.tags.message)}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error.message}
          </div>
        )}
      </form>
    </div>
  );
}