# next-prisma-flow Cheat Sheet

## 🚀 Quick Setup

```bash
# 1. Install
npm install next-prisma-flow-state-engine --save-dev
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers

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
  // Selects - Field selections (rarely imported directly)
  PostSelect
} from '@/lib/flow/post/server'
```

### 🎨 Client-Side (use in Client Components)

```typescript
// All client exports from barrel
import { 
  // Form Components
  FlowPostForm,           // Main form component
  PostFormField,          // Type-safe field component
  FlowPostFormSubmit,     // Submit button
  FlowPostFormReset,      // Reset button
  FlowPostFormState,      // Save status indicator
  usePostFieldValue,      // Field value hook
  
  // React Query Hooks
  usePost, usePostList, useCreatePost, useUpdatePost, useDeletePost,
  
  // Legacy Form Hooks (still available)
  useCreatePostForm, useUpdatePostForm,
  
  // Composables - Reusable features
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

// Form System Core
import { 
  FlowFormProvider,      // Base form provider
  FlowField,            // Base field wrapper
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
│   │   ├── provider.tsx        # "use client" - FlowModelForm component
│   │   ├── field.tsx           # "use client" - ModelFormField component
│   │   ├── hooks.ts            # "use client" - React Query hooks
│   │   ├── forms.ts            # "use client" - Legacy form hooks
│   │   └── composables.ts      # "use client" - Reusable form features
│   └── /types/                  # 📝 Shared (no directive)
│       ├── schemas.ts          # Zod schemas
│       └── transforms.ts       # Data transformers
├── /core/                       # 🔧 Runtime utilities
│   ├── form-provider.tsx       # Base FormProvider with AutosaveWatcher
│   ├── field-wrapper.tsx       # Base field wrapper
│   ├── field-registry.tsx      # Field registry
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
// Form Component (Recommended)
import { FlowPostForm, PostFormField, FlowPostFormSubmit } from '@/lib/flow/post/client'

function CreatePostForm() {
  return (
    <FlowPostForm 
      mode="create" 
      onSuccess={(post) => router.push(`/posts/${post.id}`)}
    >
      <PostFormField name="title" render={({ field }) => (
        <input {...field} placeholder="Title" />
      )} />
      <PostFormField name="content" render={({ field }) => (
        <textarea {...field} placeholder="Content" />
      )} />
      <FlowPostFormSubmit>Create Post</FlowPostFormSubmit>
    </FlowPostForm>
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

### Update Item

```typescript
// Update Form (Recommended)
import { FlowPostForm, PostFormField, FlowPostFormState } from '@/lib/flow/post/client'

function EditPost({ id }) {
  return (
    <FlowPostForm 
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
      <PostFormField name="title" render={({ field }) => (
        <input {...field} />
      )} />
      <PostFormField name="content" render={({ field }) => (
        <textarea {...field} />
      )} />
      <FlowPostFormState /> {/* Shows save status */}
    </FlowPostForm>
  )
}

// Server Action
import { updatePost } from '@/lib/flow/post/server'

const updated = await updatePost(id, { title: 'New Title' }, ctx)

// Client Mutation
import { useUpdatePost } from '@/lib/flow/post/client'

const updatePost = useUpdatePost(id, {
  onSuccess: () => toast.success('Updated!')
})

updatePost.mutate({ title: 'New Title' })
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

### Forms with shadcn/ui

```typescript
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { FlowPostForm, PostFormField, FlowPostFormSubmit } from '@/lib/flow/post/client'

function PostFormWithUI() {
  return (
    <FlowPostForm mode="create">
      <PostFormField
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FlowPostFormSubmit className="btn btn-primary">
        Create Post
      </FlowPostFormSubmit>
    </FlowPostForm>
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

// Update Form with Autosave
function EditPost({ id }) {
  const { 
    form, 
    submit, 
    isSubmitting,
    autosave,
    tracking,
    history
  } = useUpdatePostForm(id, {
    features: {
      autosave: {
        enabled: true,
        debounceMs: 1000,
        fields: ['title', 'content'],
        onFieldSave: (field) => toast.success(`${field} saved`)
      },
      tracking: true,
      history: { enabled: true }
    }
  })

  return (
    <form onSubmit={submit}>
      <input {...form.register('title')} />
      {autosave?.fieldSaveStates.title === 'saving' && '⏳'}
      {autosave?.fieldSaveStates.title === 'saved' && '✅'}
      
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
  tenantField = "companyId"   # Foreign key field
  tenantModel = "Company"     # Model name (for finding relations)
  
  # Model filtering
  models = "all"  # or ["Post", "User", "Comment"]
  
  # Custom selects (fields + relations)
  postSelect = ["id", "title", "content", "author", "comments"]
  
  # Relation limits & ordering
  postCommentsLimit = 100
  postCommentsOrder = "{ createdAt: 'desc' }"
  
  # Prisma client path (relative to output)
  prismaImport = "../prisma"
}
```

## 🎯 Quick Decisions

| I want to... | Use this... |
|-------------|------------|
| Build a form quickly | `FlowPostForm` + `PostFormField` from `/client` |
| Custom field UI | `PostFormField` with render prop |
| Fetch in Server Component | `getPostById()`, `listPosts()` from `/server` |
| Fetch in Client Component | `usePost()`, `usePostList()` from `/client` |
| Create with validation | `createPost()` from `/server` |
| Update with validation | `updatePost()` from `/server` |
| Delete with policies | `deletePost()` from `/server` |
| Direct Prisma access | `findMany()`, `create()` from `/server` |
| Form with autosave | `FlowPostForm` with `features.autosave` |
| Legacy form hook | `useCreatePostForm()`, `useUpdatePostForm()` from `/client` |
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
   ```

3. **Update forms auto-fetch data**
   ```typescript
   // Update form automatically fetches existing data
   <FlowPostForm mode="update" id={postId}>
   // No need to manually load data
   ```

4. **Autosave uses AutosaveWatcher internally**
   ```typescript
   // Just enable autosave in features
   features={{ autosave: { enabled: true } }}
   // AutosaveWatcher prevents re-render issues
   ```

5. **Transform functions handle null → undefined**
   ```typescript
   // Automatically applied in actions
   const transformed = transformPostCreate(data)
   ```

6. **Tenant fields are automatically injected**
   ```typescript
   // DON'T manually set tenant field
   // Policies handle it automatically via FlowCtx
   ```

## 📝 Component Props Reference

### FlowPostForm
```tsx
<FlowPostForm
  mode="create" | "update"      // Required
  id={string}                    // Required for update
  defaultValues={object}         // Optional initial values
  onSuccess={(data) => void}     // Success callback
  onError={(error) => void}      // Error callback
  features={{
    autosave: {
      enabled: boolean,
      debounceMs: number,
      onFieldSave: (field, value) => void
    }
  }}
/>
```

### PostFormField
```tsx
<PostFormField
  name={string}                  // Field name (typed)
  render={({ field, fieldState, formState }) => ReactNode}
  transform={{
    input: (value) => any,       // Display transform
    output: (value) => any        // Save transform
  }}
  rules={object}                 // Validation rules
/>
```

## 🔄 Autosave Pattern

```typescript
// Autosave is optimized to prevent re-renders
<FlowPostForm 
  mode="update" 
  id={id}
  features={{
    autosave: {
      enabled: true,
      debounceMs: 500,
      onFieldSave: (field, value) => {
        console.log(`Saved ${field}:`, value)
      },
      onError: (error) => {
        toast.error('Save failed')
      }
    }
  }}
>
  {/* Fields auto-save individually */}
  <PostFormField name="title" render={...} />
  <PostFormField name="content" render={...} />
  
  {/* Optional: Show save status */}
  <FlowPostFormState />
</FlowPostForm>
```

## 🎨 Field Transforms

```tsx
// Price: Store cents, display dollars
<PostFormField
  name="price"
  transform={{
    input: (value) => value / 100,
    output: (value) => Math.round(value * 100)
  }}
  render={({ field }) => (
    <input type="number" {...field} step="0.01" />
  )}
/>

// Date: Store ISO, display local
<PostFormField
  name="publishedAt"
  transform={{
    input: (value) => value ? new Date(value).toLocaleDateString() : '',
    output: (value) => value ? new Date(value).toISOString() : null
  }}
  render={({ field }) => (
    <input type="date" {...field} />
  )}
/>
```

## 🔍 Debugging Tips

```bash
# Regenerate after schema changes
npx prisma generate

# Check generated files
ls lib/flow/post/client/
# Should see: provider.tsx, field.tsx, hooks.ts, forms.ts, etc.

# Verify imports
# ✅ FlowPostForm (not PostFormProvider)
# ✅ PostFormField (not PostField)
# ✅ FlowPostFormSubmit (not PostSubmit)
```