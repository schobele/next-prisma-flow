// Example demonstrating the new FormProvider-based form system
"use client";

import { TodoFormProvider, TodoField, TodoFieldWrapper, TodoSubmit, TodoFormActions } from "./lib/flow/todo/client";

// Example 1: Simple Create Form using TodoField convenience component
export function SimpleTodoCreateForm() {
  return (
    <TodoFormProvider 
      mode="create" 
      onSuccess={(todo) => console.log("Created:", todo)}
    >
      <div className="space-y-4">
        <TodoField name="title" label="Title" required />
        <TodoField name="description" label="Description" />
        <TodoField name="status" label="Status" />
        <TodoField name="priority" label="Priority" />
        <TodoSubmit>Create Todo</TodoSubmit>
      </div>
    </TodoFormProvider>
  );
}

// Example 2: Update Form with Autosave
export function TodoUpdateFormWithAutosave({ id }: { id: string }) {
  return (
    <TodoFormProvider
      mode="update"
      id={id}
      features={{
        autosave: {
          enabled: true,
          debounceMs: 500,
          onFieldSave: (field, value) => console.log(`Saved ${field}:`, value)
        }
      }}
    >
      <div className="space-y-4">
        <TodoField 
          name="title" 
          label="Title" 
          showSaveState 
          showDirtyIndicator 
        />
        <TodoField 
          name="description" 
          label="Description" 
          showSaveState 
        />
        <TodoFormActions /> {/* Shows accept/reject buttons for dirty fields */}
      </div>
    </TodoFormProvider>
  );
}

// Example 3: Custom Field Rendering with TodoFieldWrapper
export function CustomFieldExample({ id }: { id: string }) {
  return (
    <TodoFormProvider mode="update" id={id}>
      <TodoFieldWrapper name="title">
        {({ field, fieldState, helpers, meta, error }) => (
          <div className="custom-field">
            <label>
              {meta.label}
              {fieldState.isDirty && <span className="dirty-indicator">●</span>}
            </label>
            
            <input 
              {...field} 
              className={error ? "error" : ""}
              placeholder={meta.placeholder}
            />
            
            {fieldState.isDirty && (
              <div className="field-actions">
                <button onClick={() => helpers.accept()}>✓ Accept</button>
                <button onClick={() => helpers.reject()}>✗ Reject</button>
              </div>
            )}
            
            {fieldState.saveState === "saving" && <span>Saving...</span>}
            {fieldState.saveState === "saved" && <span>✓ Saved</span>}
            {error && <span className="error-message">{error.message}</span>}
          </div>
        )}
      </TodoFieldWrapper>
    </TodoFormProvider>
  );
}

// Example 4: Using with Custom UI Components
import { TextField, Select, MenuItem } from "@mui/material"; // Example with Material UI

export function MaterialUIFormExample() {
  return (
    <TodoFormProvider mode="create">
      <TodoFieldWrapper name="title">
        {({ field, error, meta }) => (
          <TextField
            {...field}
            label={meta.label}
            error={!!error}
            helperText={error?.message}
            fullWidth
            required={meta.required}
          />
        )}
      </TodoFieldWrapper>
      
      <TodoFieldWrapper name="priority">
        {({ field, meta }) => (
          <Select {...field} label={meta.label}>
            {meta.options?.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        )}
      </TodoFieldWrapper>
      
      <TodoSubmit>Create</TodoSubmit>
    </TodoFormProvider>
  );
}

// Example 5: Form with Field Registry (register custom renderers once, use everywhere)
import { FlowFieldRegistry } from "./lib/flow/core";

// Register custom field renderers once at app initialization
FlowFieldRegistry.register("text", ({ field, meta, error }) => (
  <div className="my-text-field">
    <label>{meta.label}</label>
    <input {...field} className="my-input" />
    {error && <span className="my-error">{error.message}</span>}
  </div>
));

FlowFieldRegistry.register("select", ({ field, meta, error }) => (
  <div className="my-select-field">
    <label>{meta.label}</label>
    <select {...field} className="my-select">
      {meta.options?.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <span className="my-error">{error.message}</span>}
  </div>
));

// Example 6: Full control with render props
export function RenderPropsExample({ id }: { id: string }) {
  return (
    <TodoFormProvider mode="update" id={id}>
      {({ form, fields, acceptAll, rejectAll, isDirty, isSubmitting }) => (
        <form onSubmit={form.handleSubmit(() => {})}>
          <div>
            <input {...form.register("title")} />
            {fields.title?.isDirty && (
              <span>Modified from: {fields.title.originalValue}</span>
            )}
          </div>
          
          <div>
            <textarea {...form.register("description")} />
            {fields.description?.saveState === "saving" && <span>Saving...</span>}
          </div>
          
          {isDirty && (
            <div className="form-actions">
              <button type="button" onClick={acceptAll}>Accept All Changes</button>
              <button type="button" onClick={rejectAll}>Reject All Changes</button>
            </div>
          )}
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Save"}
          </button>
        </form>
      )}
    </TodoFormProvider>
  );
}

// Example 7: Using the hook directly for maximum control
import { useTodoField } from "./lib/flow/todo/client";
import { useFlowFormContext } from "./lib/flow/core";

function CustomFieldComponent({ name }: { name: any }) {
  const { field, fieldState, helpers, meta, error } = useTodoField(name);
  
  return (
    <div>
      <label>{meta.label}</label>
      <input
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
        onBlur={field.onBlur}
      />
      <button onClick={() => helpers.validate()}>Validate</button>
      <button onClick={() => helpers.reset()}>Reset</button>
      {error && <span>{error.message}</span>}
    </div>
  );
}

export function HookBasedForm({ id }: { id: string }) {
  return (
    <TodoFormProvider mode="update" id={id}>
      <CustomFieldComponent name="title" />
      <CustomFieldComponent name="description" />
      <TodoSubmit />
    </TodoFormProvider>
  );
}