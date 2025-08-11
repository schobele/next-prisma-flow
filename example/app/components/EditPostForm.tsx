"use client";

import { useEffect } from "react";
import { useAuthorList } from "../../generated/flow/author/hooks";
import { usePostForm } from "../../generated/flow/post/forms";
import type { FlowPost } from "../../generated/flow/post/zod";

export default function EditPostForm({ post, onClose }: { post: FlowPost; onClose: () => void }) {
  const { data: authorsData } = useAuthorList();
  const { form, onSubmit, isSubmitting } = usePostForm({
    id: post.id,
    mode: "update",
    defaultValues: {
      title: post.title,
      content: post.content ?? "",
      author: { id: post.author?.id } as any,
    },
    form: { mode: "all" },
  });

  useEffect(() => {
    // preselect current author in UI (but don't set relation unless user changes)
    // we keep author unset by default for update to avoid unintended relation writes
  }, [post.id]);

  const handleInvalid = (errors: any) => {
    console.error("Edit post validation errors:", errors);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <h2 className="text-2xl font-bold mb-4">Edit Post</h2>

        <form onSubmit={form.handleSubmit(onSubmit, handleInvalid)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              {...form.register("title")}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter post title"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message as any}</p>
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
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.content.message as any}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  form.setValue("author", { id: e.target.value } as any);
                } else {
                  form.setValue("author", undefined);
                }
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue={post.author?.id ?? ""}
           >
              <option value="">Keep current</option>
              {authorsData?.items.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name || author.email}
                </option>
              ))}
            </select>
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

          {form.formState.isSubmitted && Object.keys(form.formState.errors).length > 0 && (
            <pre className="text-red-600 text-xs bg-red-50 p-2 rounded">
              {JSON.stringify(form.formState.errors, null, 2)}
            </pre>
          )}
        </form>
      </div>
    </div>
  );
}


