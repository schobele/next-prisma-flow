# next-prisma-flow Cheat Sheet

## 🚀 Quick Setup

```bash
# 1. Install
npm install next-prisma-flow-state-engine

# 2. Configure in schema.prisma
generator flow {
  provider = "next-prisma-flow-state-engine"
  output = "../lib/flow"
  tenantField = "companyId"  # Optional: for multi-tenancy
}

# 3. Generate
npx prisma generate

# 4. Wrap app with provider
<FlowProvider ctx={{ userId: "...", tenantId: "..." }}>
  {children}
</FlowProvider>
```

## 📦 Import Map

### 🖥️ Server-Side (use in Server Components, API routes, server actions)

```typescript
// All server exports from barrel
import { 
  // Methods - Direct Prisma access with policies
  findMany, findUnique, create, update, delete as deleteMethod,
  // Actions - High-level operations with validation  
  createPost, updatePost, deletePost,
  // Queries - Cached reads
  getPostById, listPosts,
  // Selects - Field selections (usually not imported directly)
  PostSelect
} from '@/lib/flow/post/server'
```

### 🎨 Client-Side (use in Client Components)

```typescript
// All client exports from barrel
import { 
  // 🆕 FormProvider Components (Recommended)
  PostFormProvider,     // Context provider for forms
  PostField,           // Convenience field component
  PostFieldWrapper,    // Flexible field wrapper
  PostSubmit,          // Submit button
  PostFormActions,     // Accept/reject dirty fields
  usePostField,        // Field hook
  
  // Hooks - React Query powered
  usePost, usePostList, useCreatePost, useUpdatePost, useDeletePost,
  
  // Legacy Forms - Still available
  useCreatePostForm, useUpdatePostForm,
  
  // Composables - Reusable form features
  usePostFormAutosave, usePostFormFieldTracking, usePostFormHistory
} from '@/lib/flow/post/client'
```

### 📝 Types & Schemas (use anywhere)

```typescript
// All type exports from barrel
import { 
  // Types
  type FlowPost, type FlowPostCreate, type FlowPostUpdate,
  // Schemas - Zod validation
  PostScalarSchema, PostCreateSchema, PostUpdateSchema,
  // Transforms - Data converters
  transformPostCreate, transformPostUpdate
} from '@/lib/flow/post/types'
```

### 🔧 Core Utilities

```typescript
// Context & Provider
import { FlowProvider, useFlowCtx } from '@/lib/flow/core/provider'

// 🆕 Form System Core
import { 
  FlowFormProvider,      // Base form provider
  FlowFieldWrapper,      // Base field wrapper
  FlowFieldRegistry,     // Field component registry
  useFlowFormContext,    // Form context hook
  useFlowField          // Field hook
} from '@/lib/flow/core'

// Errors
import { FlowPolicyError, FlowValidationError } from '@/lib/flow/core'

// Types
import type { FlowCtx } from '@/lib/flow/core/ctx'
```

## 📁 Generated Structure

```
lib/flow/
├── /[model]/                    # For each Prisma model
│   ├── /server/                 # 🖥️ Server-only code
│   │   ├── methods.ts          # "use server" - All Prisma methods
│   │   ├── actions.ts          # "use server" - CRUD with validation
│   │   ├── queries.ts          # "use server" - Cached reads
│   │   └── selects.ts          # import "server-only" - Field selections
│   ├── /client/                 # 🎨 Client-only code  
│   │   ├── provider.tsx        # "use client" - Model FormProvider 🆕
│   │   ├── field.tsx           # "use client" - Field components 🆕
│   │   ├── hooks.ts            # "use client" - React Query hooks
│   │   ├── forms.ts            # "use client" - Legacy form hooks
│   │   └── composables.ts      # "use client" - Reusable form features
│   └── /types/                  # 📝 Shared (no directive)
│       ├── schemas.ts          # Zod schemas
│       └── transforms.ts       # Data transformers
├── /core/                       # 🔧 Runtime utilities
│   ├── form-provider.tsx       # Base FormProvider 🆕
│   ├── field-wrapper.tsx       # Base field wrapper 🆕
│   ├── field-registry.tsx      # Field registry 🆕
│   └── ...
├── policies.ts                  # 🔐 Authorization logic
└── prisma.ts                   # Prisma client export
```

## 💻 Common Patterns

### Fetch Single Item

```typescript
// Server Component
import { getPostById } from '@/lib/flow/post/server'

export default async function PostPage({ params }) {
  const post = await getPostById(params.id, ctx)
  return <div>{post?.title}</div>
}

// Client Component
import { usePost } from '@/lib/flow/post/client'

export default function PostComponent({ id }) {
  const { data: post, isLoading } = usePost(id)
  if (isLoading) return <Spinner />
  return <div>{post?.title}</div>
}
```

### Fetch List with Pagination

```typescript
// Server Component
import { listPosts } from '@/lib/flow/post/server'

const posts = await listPosts({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: page * 10
}, ctx)

// Client Component
import { usePostList } from '@/lib/flow/post/client'

const { data, params, setParams, nextPage, hasNextPage } = usePostList({
  where: { published: true },
  take: 10
})

// Load more
<button onClick={nextPage} disabled={!hasNextPage}>
  Load More
</button>
```

### Create Item

```typescript
// 🆕 FormProvider Pattern (Recommended)
import { PostFormProvider, PostField, PostSubmit } from '@/lib/flow/post/client'

function CreatePostForm() {
  return (
    <PostFormProvider 
      mode="create" 
      onSuccess={(post) => router.push(`/posts/${post.id}`)}
    >
      <PostField name="title" label="Title" required />
      <PostField name="content" label="Content" />
      <PostSubmit>Create Post</PostSubmit>
    </PostFormProvider>
  )
}

// Client Component with Mutation
import { useCreatePost } from '@/lib/flow/post/client'

const createPost = useCreatePost({
  onSuccess: (post) => router.push(`/posts/${post.id}`)
})

<button onClick={() => createPost.mutate({ title, content })}>
  Create
</button>

// Server Action
'use server'
import { createPost } from '@/lib/flow/post/server'

async function handleCreate(formData: FormData) {
  const post = await createPost({
    title: formData.get('title'),
    content: formData.get('content')
  }, ctx)
  redirect(`/posts/${post.id}`)
}
```

### Forms with FormProvider (Recommended)

```typescript
import { PostFormProvider, PostField, PostSubmit, PostFormActions } from '@/lib/flow/post/client'

// Simple Create Form
function CreatePost() {
  return (
    <PostFormProvider mode="create" onSuccess={handleSuccess}>
      <PostField name="title" label="Title" required />
      <PostField name="content" label="Content" />
      <PostSubmit>Create Post</PostSubmit>
    </PostFormProvider>
  )
}

// Update Form with Autosave
function EditPost({ id }) {
  return (
    <PostFormProvider 
      mode="update" 
      id={id}
      features={{
        autosave: {
          enabled: true,
          debounceMs: 500,
          onFieldSave: (field, value) => toast.success(`${field} saved`)
        }
      }}
    >
      <PostField name="title" showSaveState showDirtyIndicator />
      <PostField name="content" showSaveState />
      <PostFormActions /> {/* Accept/reject buttons */}
    </PostFormProvider>
  )
}

// Custom UI Components
import { TextField } from '@mui/material'

function MaterialUIForm() {
  return (
    <PostFormProvider mode="create">
      <PostFieldWrapper name="title">
        {({ field, error, meta }) => (
          <TextField
            {...field}
            label={meta.label}
            error={!!error}
            helperText={error?.message}
          />
        )}
      </PostFieldWrapper>
    </PostFormProvider>
  )
}

// Field-Level Control
function CustomField() {
  const { field, fieldState, helpers } = usePostField('title')
  
  return (
    <div>
      <input {...field} />
      {fieldState.isDirty && (
        <>
          <button onClick={helpers.accept}>✓</button>
          <button onClick={helpers.reject}>✗</button>
        </>
      )}
    </div>
  )
}
```

### Legacy Form Hooks (Still Available)

```typescript
import { useCreatePostForm, useUpdatePostForm } from '@/lib/flow/post/client'

// Create Form
function CreatePost() {
  const { 
    form,           // react-hook-form instance
    submit,         // Form submit handler
    isSubmitting    // Submit loading state
  } = useCreatePostForm({
    defaultValues: { title: '', content: '' },
    onSuccess: (post) => router.push(`/posts/${post.id}`)
  })

  return (
    <form onSubmit={submit}>
      <input {...form.register('title')} />
      <textarea {...form.register('content')} />
      <button type="submit" disabled={isSubmitting}>Create</button>
    </form>
  )
}

// Update Form with Advanced Features
function EditPost({ id }) {
  const { 
    form,               // react-hook-form instance
    submit,             // Form submit handler
    isSubmitting,       // Submit loading state
    autosave,           // Autosave feature (if enabled)
    tracking,           // Field tracking feature (if enabled)
    history,            // Undo/redo feature (if enabled)
    getFieldState,      // Get metadata for a field
    resetField,         // Reset individual field to original
    getDirtyFields      // Get all modified fields
  } = useUpdatePostForm(id, {
    features: {
      autosave: {
        enabled: true,
        debounceMs: 1000,
        fields: ['title', 'content'],  // Optional: specific fields
        onFieldSave: (field) => toast.success(`${field} saved`),
        onFieldError: (field, error) => toast.error(`Failed to save ${field}`)
      },
      tracking: true,   // Track field changes and original values
      history: {        // Enable undo/redo
        enabled: true,
        maxHistorySize: 20
      }
    }
  })

  return (
    <form onSubmit={submit}>
      <input {...form.register('title')} />
      {autosave?.fieldSaveStates.title === 'saving' && '⏳'}
      {autosave?.fieldSaveStates.title === 'saved' && '✅'}
      {autosave?.fieldSaveStates.title === 'error' && '❌'}
      
      {/* Undo/Redo buttons */}
      {history && (
        <>
          <button onClick={history.undo} disabled={!history.canUndo}>↩️</button>
          <button onClick={history.redo} disabled={!history.canRedo}>↪️</button>
        </>
      )}
      
      <button type="submit" disabled={isSubmitting}>Save All</button>
    </form>
  )
}
```

### Update Item

```typescript
// Server
import { updatePost } from '@/lib/flow/post/server'

const updated = await updatePost(id, { title: 'New Title' }, ctx)

// Client
import { useUpdatePost } from '@/lib/flow/post/client'

const updatePost = useUpdatePost({
  onSuccess: () => toast.success('Updated!')
})

updatePost.mutate({ id, data: { title: 'New Title' } })
```

### Delete Item

```typescript
// Server
import { deletePost } from '@/lib/flow/post/server'

await deletePost(id, ctx)

// Client  
import { useDeletePost } from '@/lib/flow/post/client'

const deletePost = useDeletePost({
  onSuccess: () => router.push('/posts')
})

deletePost.mutate(id)
```

## 🔐 Authorization Policies

```typescript
// lib/flow/policies.ts
import type { FlowCtx, PolicyResult } from './core'

export async function canPost(
  action: 'list' | 'read' | 'create' | 'update' | 'delete',
  ctx: FlowCtx,
  id?: string
): Promise<PolicyResult> {
  // Return false to deny
  if (!ctx.userId) return { ok: false, message: 'Not authenticated' }
  
  // Add where conditions
  if (action === 'list') {
    return { 
      ok: true, 
      where: { authorId: ctx.userId }  // Only own posts
    }
  }
  
  // Add data to create/update
  if (action === 'create') {
    return {
      ok: true,
      data: { authorId: ctx.userId }  // Auto-set author
    }
  }
  
  return { ok: true }
}
```

## ⚙️ Generator Configuration

```prisma
generator flow {
  provider = "next-prisma-flow-state-engine"
  output = "../lib/flow"
  
  # Multi-tenancy
  tenantField = "companyId"
  
  # Model filtering
  models = "all"  # or ["Post", "User", "Comment"]
  
  # Custom selects (fields + relations)
  postSelect = ["id", "title", "content", "author", "comments"]
  
  # Relation limits & ordering
  postCommentsLimit = 100
  postCommentsOrder = "{ createdAt: 'desc' }"
  
  # Prisma client instance import path (relative to output, should export { prisma, Prisma })
  prismaImport = "../prisma"
}
```

## 🎯 Quick Decisions

| I want to... | Use this... |
|-------------|------------|
| Build a form (recommended) | `PostFormProvider` + `PostField` from `/client` |
| Custom field UI | `PostFieldWrapper` with render props |
| Field-level control | `usePostField()` hook |
| Accept/reject changes | `PostFormActions` component |
| Fetch in Server Component | `getPostById()`, `listPosts()` from `/server` |
| Fetch in Client Component | `usePost()`, `usePostList()` from `/client` |
| Create with validation | `createPost()` from `/server` |
| Update with validation | `updatePost()` from `/server` |
| Delete with policies | `deletePost()` from `/server` |
| Direct Prisma access | `findMany()`, `create()` from `/server` |
| Legacy create form | `useCreatePostForm()` from `/client` |
| Legacy update form | `useUpdatePostForm()` from `/client` |
| Validate input | `PostCreateSchema.parse()` from `/types` |
| Transform data | `transformPostCreate()` from `/types` |

## 🚨 Common Gotchas

1. **Always pass `ctx` to server methods**
   ```typescript
   // ❌ Wrong
   await findMany({ where: { ... } })
   
   // ✅ Right
   await findMany({ where: { ... } }, ctx)
   ```

2. **Use barrel exports for cleaner imports**
   ```typescript
   // ✅ Clean - use barrel exports
   import { usePost } from '@/lib/flow/post/client'
   import { createPost } from '@/lib/flow/post/server'
   import { PostCreateSchema } from '@/lib/flow/post/types'
   
   // Also works but more verbose
   import { usePost } from '@/lib/flow/post/client/hooks'
   ```

3. **Update forms auto-fetch data**
   ```typescript
   // Update form automatically fetches existing data
   const { form } = useUpdatePostForm(postId)
   // form.defaultValues will be populated automatically
   
   // Create form doesn't fetch (no ID needed)
   const { form } = useCreatePostForm()
   ```

4. **Field save states track individual field status**
   ```typescript
   fieldSaveStates.title  // 'idle' | 'saving' | 'saved' | 'error'
   isAutosaving          // true if ANY field is saving
   ```

5. **Transform functions handle null → undefined**
   ```typescript
   // Prisma returns null for empty relations
   // Transform converts to undefined for Zod schemas
   const transformed = transformPostCreate(data)
   ```

6. **Tenant fields are automatically injected**
   ```typescript
   // DON'T manually set tenant field in forms
   // ❌ Wrong
   const { form } = useCreateTodoForm({
     defaultValues: { companyId: ctx.tenantId }
   })
   
   // ✅ Right - policies handle it automatically
   const { form } = useCreateTodoForm({
     defaultValues: { title: '', content: '' }
   })
   // companyId is injected by policy layer during create/update
   ```

## 🆕 FormProvider API

### Model FormProvider (`PostFormProvider`)
```tsx
<PostFormProvider
  mode="create" | "update"      // Form mode
  id={string}                    // Required for update mode
  defaultValues={object}         // Initial form values
  onSuccess={(data) => void}     // Success callback
  onError={(error) => void}      // Error callback
  features={{
    autosave: {
      enabled: boolean,
      debounceMs: number,
      fields?: string[],
      onFieldSave?: (field, value) => void,
      onFieldError?: (field, error) => void
    },
    tracking?: boolean,
    history?: {
      enabled: boolean,
      maxHistorySize?: number
    }
  }}
  config={object}                // Form configuration
  fieldMeta={object}             // Override field metadata
>
  {children | (context) => ReactNode}
</PostFormProvider>
```

### Field Components
```tsx
// Convenience field with built-in UI
<PostField
  name={string}                  // Field name (typed)
  label={string}                 // Field label
  placeholder={string}           // Placeholder text
  required={boolean}             // Required field
  disabled={boolean}             // Disabled state
  showError={boolean}            // Show validation errors
  showSaveState={boolean}        // Show save indicator
  showDirtyIndicator={boolean}   // Show modified indicator
  render={(props) => ReactNode}  // Custom render function
/>

// Flexible wrapper for custom UI
<PostFieldWrapper
  name={string}                  // Field name (typed)
  defaultMeta={object}           // Override metadata
  transform={{
    input: (value) => any,       // Transform for display
    output: (value) => any       // Transform for save
  }}
  validate={(value) => boolean | string}  // Custom validation
>
  {({ field, fieldState, helpers, meta, error }) => ReactNode}
</PostFieldWrapper>

// Submit button
<PostSubmit
  className={string}
  disabled={boolean}
>
  {children}
</PostSubmit>

// Accept/reject all dirty fields
<PostFormActions />
```

### Hooks
```tsx
// Use field directly
const { field, fieldState, helpers, meta, error } = usePostField(name)

// Access form context
const {
  form,                // React Hook Form instance
  mode,                // 'create' | 'update'
  fields,              // All field states
  acceptField,         // Accept single field
  rejectField,         // Reject single field
  acceptAll,           // Accept all changes
  rejectAll,           // Reject all changes
  isDirty,             // Any fields modified?
  isSubmitting,        // Form submitting?
  autosave,            // Autosave state
  history,             // Undo/redo state
  tracking             // Field tracking state
} = useFlowFormContext()
```

### Field Registry
```tsx
// Register custom field renderers
FlowFieldRegistry.register('date', DatePickerComponent)
FlowFieldRegistry.register('rich-text', RichTextEditor)

// Map fields to types
FlowFieldRegistry.mapFieldTypes({
  'dueDate': 'date',
  'content': 'rich-text'
})

// Get renderer
const Renderer = FlowFieldRegistry.get('date')
```

## 📚 Full API Reference

### Server Methods (`/server/methods`)
- `findUnique(args, ctx)`
- `findUniqueOrThrow(args, ctx)`
- `findFirst(args, ctx)`
- `findFirstOrThrow(args, ctx)`
- `findMany(args, ctx)`
- `create(args, ctx)`
- `createMany(args, ctx)`
- `update(args, ctx)`
- `updateMany(args, ctx)`
- `upsert(args, ctx)`
- `delete(args, ctx)`
- `deleteMany(args, ctx)`
- `count(args, ctx)`
- `aggregate(args, ctx)`
- `groupBy(args, ctx)`

### Server Actions (`/server/actions`)
- `createModel(data, ctx)` - Create with validation
- `updateModel(id, data, ctx)` - Update with validation
- `deleteModel(id, ctx)` - Delete with policies

### Server Queries (`/server/queries`)
- `getModelById(id, ctx)` - Cached single fetch
- `listModels(params, ctx)` - Cached list with pagination

### Client Hooks (`/client/hooks`)
- `useModel(id, options?)` - Single item
- `useModelList(params?, options?)` - Paginated list
- `useCreateModel(options?)` - Create mutation
- `useUpdateModel(options?)` - Update mutation
- `useDeleteModel(options?)` - Delete mutation

### FormProvider Components (`/client/provider`, `/client/field`)
- `ModelFormProvider` - Context provider for forms
  - Props: `mode`, `id?`, `defaultValues?`, `onSuccess?`, `onError?`, `features?`
  - Provides form context to all children
  
- `ModelField` - Convenience field component
  - Props: `name`, `label?`, `placeholder?`, `required?`, `disabled?`, `showSaveState?`
  - Auto-renders appropriate input based on field type
  
- `ModelFieldWrapper` - Flexible field wrapper
  - Props: `name`, `children` (render prop), `transform?`, `validate?`
  - Full control over field rendering
  
- `ModelSubmit` - Submit button with state
- `ModelFormActions` - Accept/reject dirty fields
- `useModelField(name)` - Hook for field control

### Legacy Form Hooks (`/client/forms`)
- `useCreateModelForm(options?)` - Create form with validation
  - Options: `defaultValues?`, `onSuccess?`, `onError?`, `features?`
  - Returns: `form`, `submit`, `isSubmitting`, plus enabled features
  
- `useUpdateModelForm(id, options?)` - Update form with auto-fetch
  - Options: `defaultValues?`, `onSuccess?`, `onError?`, `features?`
  - Features: `autosave?`, `tracking?`, `history?`
  - Returns: `form`, `submit`, `isSubmitting`, `autosave?`, `tracking?`, `history?`
  - Field operations: `getFieldState`, `resetField`, `setFieldValue`, `validateField`, `getDirtyFields`

### Composables (`/client/composables`)
- `useModelFormAutosave(form, mutation, options)` - Add autosave to any form
- `useModelFormFieldTracking(form, original?)` - Track field changes
- `useModelFormHistory(form, options)` - Add undo/redo functionality