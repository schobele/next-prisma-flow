// Test component to verify autosave works without infinite loops
"use client";

import { useUpdateTodoForm } from "./lib/flow/todo/client/forms";

export function TestAutosaveComponent({ todoId }: { todoId: string }) {
  const {
    form,
    autosave,
    submit,
    isSubmitting
  } = useUpdateTodoForm(todoId, {
    features: {
      autosave: {
        enabled: true,
        debounceMs: 500,
        onFieldSave: (field, value) => {
          console.log(`✅ Field saved: ${field} = ${value}`);
        },
        onFieldError: (field, error) => {
          console.error(`❌ Field save error: ${field}`, error);
        }
      }
    }
  });

  // Log render count to detect infinite loops
  console.log("[TestAutosave] Component rendered");

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Test Autosave (Todo ID: {todoId})</h2>
      
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Title
            {autosave?.fieldSaveStates?.title === 'saving' && <span className="ml-2 text-blue-500">Saving...</span>}
            {autosave?.fieldSaveStates?.title === 'saved' && <span className="ml-2 text-green-500">✓ Saved</span>}
            {autosave?.fieldSaveStates?.title === 'error' && <span className="ml-2 text-red-500">Error</span>}
          </label>
          <input
            {...form.register('title')}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description
            {autosave?.fieldSaveStates?.description === 'saving' && <span className="ml-2 text-blue-500">Saving...</span>}
            {autosave?.fieldSaveStates?.description === 'saved' && <span className="ml-2 text-green-500">✓ Saved</span>}
            {autosave?.fieldSaveStates?.description === 'error' && <span className="ml-2 text-red-500">Error</span>}
          </label>
          <textarea
            {...form.register('description')}
            className="w-full border rounded px-3 py-2"
            rows={4}
            placeholder="Enter description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Status
            {autosave?.fieldSaveStates?.status === 'saving' && <span className="ml-2 text-blue-500">Saving...</span>}
            {autosave?.fieldSaveStates?.status === 'saved' && <span className="ml-2 text-green-500">✓ Saved</span>}
            {autosave?.fieldSaveStates?.status === 'error' && <span className="ml-2 text-red-500">Error</span>}
          </label>
          <select
            {...form.register('status')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Priority
            {autosave?.fieldSaveStates?.priority === 'saving' && <span className="ml-2 text-blue-500">Saving...</span>}
            {autosave?.fieldSaveStates?.priority === 'saved' && <span className="ml-2 text-green-500">✓ Saved</span>}
            {autosave?.fieldSaveStates?.priority === 'error' && <span className="ml-2 text-red-500">Error</span>}
          </label>
          <select
            {...form.register('priority')}
            className="w-full border rounded px-3 py-2"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save All'}
          </button>
          
          {autosave?.isAutosaving && (
            <span className="flex items-center text-sm text-gray-500">
              <span className="animate-pulse">Autosaving...</span>
            </span>
          )}
        </div>
      </form>

      <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs">
          {JSON.stringify({
            isAutosaving: autosave?.isAutosaving,
            fieldStates: autosave?.fieldSaveStates,
            formDirty: form.formState.isDirty,
            dirtyFields: Object.keys(form.formState.dirtyFields)
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}