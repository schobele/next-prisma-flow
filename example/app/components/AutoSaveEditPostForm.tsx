"use client";

import { useRouter } from "next/navigation";
import { useAuthorList } from "../../generated/flow/author/client/hooks";
import { usePostForm } from "../../generated/flow/post/client/forms";
import type { FlowPost } from "../../generated/flow/post/types/schemas";

export default function AutoSaveEditPostForm({ 
  post, 
  onClose 
}: { 
  post: FlowPost; 
  onClose: () => void;
}) {
  const { data: authorsData } = useAuthorList();
  const router = useRouter();
  
  const { 
    form, 
    submit, 
    isSubmitting, 
    error,
    fieldSaveStates,
    isAutosaving,
    autosaveEnabled
  } = usePostForm({
    id: post.id,
    autosave: {
      enabled: true,
      debounceMs: 1500,
      fields: ['title', 'content', 'authorId'], // Only autosave these fields
      onFieldSave: (field, value) => {
        console.log(`[AutoSave] Saved ${field}:`, value);
      },
      onFieldError: (field, error) => {
        console.error(`[AutoSave] Error saving ${field}:`, error);
      }
    },
    onSuccess: (data) => {
      console.log('[AutoSaveEditPostForm] Manual save successful:', data);
      onClose();
      router.refresh();
    },
    onError: (err) => {
      console.error('[AutoSaveEditPostForm] Save failed:', err);
    }
  });

  // Get field-specific CSS classes based on save state
  const getFieldClassName = (fieldName: string) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2";
    const state = fieldSaveStates[fieldName];
    
    switch (state) {
      case 'saving':
        return `${baseClass} border-yellow-400 focus:ring-yellow-500 bg-yellow-50`;
      case 'saved':
        return `${baseClass} border-green-400 focus:ring-green-500 bg-green-50`;
      case 'error':
        return `${baseClass} border-red-400 focus:ring-red-500 bg-red-50`;
      default:
        return `${baseClass} focus:ring-blue-500`;
    }
  };

  // Get field status icon
  const getFieldStatus = (fieldName: string) => {
    const state = fieldSaveStates[fieldName];
    
    switch (state) {
      case 'saving':
        return (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-600">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        );
      case 'saved':
        return (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600">
            ✓
          </span>
        );
      case 'error':
        return (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600">
            ✗
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Post (Autosave Enabled)</h2>
          {isAutosaving && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Autosaving...
            </div>
          )}
        </div>

        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          🔄 Autosave is enabled. Changes will be saved automatically after you stop typing.
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submit(e); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <div className="relative">
              <input
                {...form.register("title")}
                className={getFieldClassName("title")}
                placeholder="Enter post title"
              />
              {getFieldStatus("title")}
            </div>
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <div className="relative">
              <textarea
                {...form.register("content")}
                rows={4}
                className={getFieldClassName("content")}
                placeholder="Write your post content..."
              />
              {getFieldStatus("content")}
            </div>
            {form.formState.errors.content && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <div className="relative">
              <select
                {...form.register("authorId")}
                className={getFieldClassName("authorId")}
                defaultValue=""
              >
                <option value="">Keep current author</option>
                {authorsData?.items.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name || author.email}
                  </option>
                ))}
              </select>
              {getFieldStatus("authorId")}
            </div>
            {form.formState.errors.authorId && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.authorId.message}
              </p>
            )}
          </div>

          <div className="border-t pt-4 mt-6">
            <div className="text-sm text-gray-600 mb-4">
              <p>Field Status Legend:</p>
              <div className="flex gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-yellow-200 border border-yellow-400 rounded"></span>
                  Saving
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-200 border border-green-400 rounded"></span>
                  Saved
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-200 border border-red-400 rounded"></span>
                  Error
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isAutosaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving All..." : "Save All Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
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