"use client";

import { useRouter } from "next/navigation";
import { useAuthorList } from "../../generated/flow/author/client/hooks";
import { usePostForm } from "../../generated/flow/post/client/forms";
import type { FlowPost } from "../../generated/flow/post/types/schemas";

export default function EditPostForm({ post, onClose }: { post: FlowPost; onClose: () => void }) {
  const { data: authorsData } = useAuthorList();
  const router = useRouter();
  
  console.log('[EditPostForm] Initializing with post:', {
    id: post.id,
    title: post.title,
    authorId: post.authorId,
    published: post.published
  });
  
  const { form, submit, isSubmitting, error } = usePostForm({
    id: post.id,
    onSuccess: (data) => {
      console.log('[EditPostForm] Update successful:', data);
      onClose();
      router.refresh();
    },
    onError: (err) => {
      console.error('[EditPostForm] Update failed:', err);
    }
  });

  // Enhanced submit handler with debugging
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formValues = form.getValues();
    console.log('[EditPostForm] Submitting form:', {
      postId: post.id,
      formValues,
      formState: {
        isDirty: form.formState.isDirty,
        dirtyFields: form.formState.dirtyFields,
        isValid: form.formState.isValid,
        errors: form.formState.errors
      }
    });
    submit(e);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4">Edit Post</h2>

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
              rows={4}
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

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
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
    </div>
  );
}