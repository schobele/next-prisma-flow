# next-prisma-flow

A powerful Prisma generator that creates a complete, type-safe data layer for Next.js applications. Generates React components, hooks, server actions, and Zod schemas with built-in authorization, caching, and optimistic updates.

## ✨ Features

- 🎯 **Simple Form System** - Clean `FlowModelForm` component with type-safe fields
- 🔄 **Smart Autosave** - Debounced per-field saving without re-render issues  
- 🎨 **UI Library Agnostic** - Works with shadcn/ui, Material UI, or custom components
- 🔐 **Policy-Based Authorization** - Row-level security with context-aware policies
- ⚡ **Full Type Safety** - End-to-end TypeScript with Zod validation
- 🚀 **Optimized Performance** - React Query caching, optimistic updates, request deduplication
- 🏢 **Multi-Tenancy Ready** - Built-in tenant isolation via configurable field
- 📦 **Smart Selects** - Optimized queries with relation limits and circular reference prevention
- 🔧 **Zero Boilerplate** - Complete CRUD operations generated from Prisma schema

## 📦 Installation

```bash
npm install next-prisma-flow-state-engine --save-dev
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers
```

## 🚀 Quick Start

### 1. Configure Generator

Add to your `schema.prisma`:

```prisma
generator flow {
  provider = "next-prisma-flow-state-engine"
  output   = "../lib/flow"
  
  // Optional: Multi-tenancy support
  tenantField = "companyId"  // Foreign key field
  tenantModel = "Company"     // Model name (helps find correct relation)
  
  // Optional: Custom field selections  
  postSelect = ["id", "title", "content", "author", "tags"]
  postCommentsLimit = 50
}
```

### 2. Generate Code

```bash
npx prisma generate
```

### 3. Setup Provider

```tsx
import { FlowProvider } from '@/lib/flow/core';

function App({ children }) {
  const user = useAuth();
  
  return (
    <FlowProvider 
      ctx={{ 
        userId: user.id,
        tenantId: user.companyId 
      }}
    >
      {children}
    </FlowProvider>
  );
}
```

### 4. Use Generated Components

```tsx
import { FlowPostForm, PostFormField, FlowPostFormSubmit } from '@/lib/flow/post/client';

function CreatePost() {
  return (
    <FlowPostForm 
      mode="create" 
      onSuccess={(post) => router.push(`/posts/${post.id}`)}
    >
      <PostFormField
        name="title"
        render={({ field }) => (
          <input {...field} placeholder="Post title" />
        )}
      />
      <PostFormField
        name="content"
        render={({ field }) => (
          <textarea {...field} placeholder="Write your post..." />
        )}
      />
      <FlowPostFormSubmit>Create Post</FlowPostFormSubmit>
    </FlowPostForm>
  );
}
```

## 📚 Usage Guide

### Forms

The generator creates a complete form system for each model with `FlowModelForm` as the main component:

#### Basic Form

```tsx
import { FlowPostForm, PostFormField, FlowPostFormSubmit } from '@/lib/flow/post/client';

function PostForm() {
  return (
    <FlowPostForm mode="create" onSuccess={handleSuccess}>
      <PostFormField
        name="title"
        render={({ field, fieldState }) => (
          <>
            <input {...field} />
            {fieldState.error && <span>{fieldState.error.message}</span>}
          </>
        )}
      />
      <FlowPostFormSubmit>Submit</FlowPostFormSubmit>
    </FlowPostForm>
  );
}
```

#### Update Form with Autosave

```tsx
function EditPost({ id }: { id: string }) {
  return (
    <FlowPostForm 
      mode="update" 
      id={id}
      features={{
        autosave: {
          enabled: true,
          debounceMs: 500,
          onFieldSave: (field, value) => toast.success(`Saved ${field}`)
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
  );
}
```

#### Integration with shadcn/ui

```tsx
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

function ShadcnForm() {
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
  );
}
```

### Server Operations

All server methods include automatic policy checks and validation:

```typescript
import { 
  // Direct Prisma methods with policies
  findMany, findUnique, create, update,
  // High-level actions with validation
  createPost, updatePost, deletePost,
  // Cached queries
  getPostById, listPosts
} from '@/lib/flow/post/server';

// In Server Components or API Routes
export default async function PostPage({ params }) {
  const ctx = { userId: session.userId, tenantId: session.tenantId };
  
  // Cached single fetch
  const post = await getPostById(params.id, ctx);
  
  // Paginated list with filters
  const posts = await listPosts({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  }, ctx);
  
  return <PostList posts={posts.items} />;
}

// Server Actions
async function publishPost(id: string) {
  'use server';
  const ctx = await getContext();
  return updatePost(id, { published: true }, ctx);
}
```

### Client Hooks

React Query powered hooks for client-side data fetching:

```typescript
import { usePost, usePostList, useCreatePost } from '@/lib/flow/post/client';

function PostManager() {
  // Single item
  const { data: post, isLoading } = usePost(postId);
  
  // Paginated list
  const { 
    data, 
    params, 
    setParams, 
    nextPage,
    previousPage 
  } = usePostList({
    where: { published: true },
    take: 20
  });
  
  // Mutations with optimistic updates
  const createPost = useCreatePost({
    onSuccess: (post) => {
      toast.success('Post created!');
      router.push(`/posts/${post.id}`);
    }
  });
  
  return (
    <button onClick={() => createPost.mutate({ title, content })}>
      Create
    </button>
  );
}
```

### Types and Validation

All operations are fully typed with Zod validation:

```typescript
import { 
  // TypeScript types
  type FlowPost, 
  type FlowPostCreate,
  // Zod schemas
  PostCreateSchema,
  PostUpdateSchema,
  // Transform utilities
  transformPostCreate
} from '@/lib/flow/post/types';

// Validate input
const validated = PostCreateSchema.parse(formData);

// Transform for Prisma (handles null conversions)
const prismaData = transformPostCreate(validated);

// Or let actions handle it automatically
await createPost(formData, ctx); // Auto-validated
```

## 🏗️ Generated Structure

```
lib/flow/
├── /[model]/                    # Per-model directories
│   ├── /server/                 # Server-side code
│   │   ├── methods.ts          # Prisma methods with policies
│   │   ├── actions.ts          # High-level CRUD operations  
│   │   ├── queries.ts          # Cached read operations
│   │   ├── selects.ts          # Optimized field selections
│   │   └── index.ts            # Barrel export
│   ├── /client/                 # Client-side code
│   │   ├── provider.tsx        # FlowModelForm component
│   │   ├── field.tsx           # ModelFormField component
│   │   ├── hooks.ts            # React Query hooks
│   │   ├── forms.ts            # Legacy form hooks
│   │   ├── composables.ts      # Reusable features
│   │   └── index.ts            # Barrel export
│   └── /types/                  # Shared types
│       ├── schemas.ts          # Zod schemas
│       ├── transforms.ts       # Data transformers
│       ├── types.ts            # TypeScript types
│       └── index.ts            # Barrel export
├── /core/                       # Framework utilities
│   ├── form-provider.tsx       # Base form provider
│   ├── field-wrapper.tsx       # Field wrapper base
│   ├── field-registry.tsx      # Component registry
│   ├── provider.tsx            # Context provider
│   ├── errors.ts               # Error classes
│   └── ...
├── policies.ts                  # Authorization rules
└── prisma.ts                   # Prisma client export
```

## ⚙️ Configuration

### Generator Options

```prisma
generator flow {
  provider = "next-prisma-flow-state-engine"
  
  // Output directory (relative to schema)
  output = "../lib/flow"
  
  // Multi-tenancy configuration
  tenantField = "companyId"  // Foreign key field in your models
  tenantModel = "Company"     // The model that represents tenants
  
  // Filter models to generate
  models = ["Post", "User", "Comment"]  # or "all" (default)
  
  // Custom field selections
  postSelect = ["id", "title", "content", "author", "comments"]
  
  // Relation configuration
  postCommentsSelect = ["id", "content", "author"]
  postCommentsLimit = 50
  postCommentsOrder = "{ createdAt: 'desc' }"
  
  // Prisma client import path
  prismaImport = "../prisma"
}
```

### Authorization Policies

Implement row-level security in `lib/flow/policies.ts`:

```typescript
import type { FlowCtx, PolicyResult } from './core';

export async function canPost(
  action: 'list' | 'read' | 'create' | 'update' | 'delete',
  ctx: FlowCtx,
  id?: string
): Promise<PolicyResult> {
  // Require authentication
  if (!ctx.userId) {
    return { ok: false, message: 'Login required' };
  }
  
  // Role-based access
  if (action === 'delete' && ctx.role !== 'admin') {
    return { ok: false, message: 'Admin only' };
  }
  
  // Add query filters
  if (action === 'list') {
    return {
      ok: true,
      where: { 
        OR: [
          { published: true },
          { authorId: ctx.userId }
        ]
      }
    };
  }
  
  // Inject data for create/update
  if (action === 'create') {
    return {
      ok: true,
      data: { authorId: ctx.userId }
    };
  }
  
  return { ok: true };
}
```

## 🎯 Advanced Features

### Field Transforms

Transform data between form and database:

```tsx
<PostFormField
  name="price"
  transform={{
    input: (value) => value / 100,   // cents to dollars for display
    output: (value) => value * 100   // dollars to cents for storage
  }}
  render={({ field }) => (
    <input type="number" {...field} step="0.01" />
  )}
/>
```

### Custom Validation

Add field-level validation:

```tsx
<PostFormField
  name="slug"
  rules={{
    validate: async (value) => {
      const exists = await checkSlugExists(value);
      return !exists || 'Slug already taken';
    }
  }}
  render={({ field, fieldState }) => (
    <>
      <input {...field} />
      {fieldState.error && <span>{fieldState.error.message}</span>}
    </>
  )}
/>
```

### Legacy Form Hooks

The original form hooks are still available for custom implementations:

```typescript
import { useUpdatePostForm } from '@/lib/flow/post/client';

function CustomForm({ postId }: { postId: string }) {
  const { 
    form, 
    submit,
    isSubmitting,
    autosave,
    tracking,
    history
  } = useUpdatePostForm(postId, {
    features: {
      autosave: {
        enabled: true,
        debounceMs: 1000
      },
      tracking: true,
      history: {
        enabled: true,
        maxHistorySize: 20
      }
    }
  });
  
  return (
    <form onSubmit={submit}>
      <input {...form.register('title')} />
      {autosave?.fieldSaveStates.title === 'saving' && <Spinner />}
      
      {history && (
        <>
          <button onClick={history.undo} disabled={!history.canUndo}>
            Undo
          </button>
          <button onClick={history.redo} disabled={!history.canRedo}>
            Redo
          </button>
        </>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

### Optimistic Updates

Mutations automatically handle optimistic updates:

```typescript
const updatePost = useUpdatePost(postId, {
  // UI updates immediately
  onMutate: async (newData) => {
    // Automatic cache update
  },
  // Automatic rollback on error
  onError: (error, newData, context) => {
    // Cache reverted
  }
});
```

### Deep Relations

Configure nested selections with limits:

```prisma
generator flow {
  postSelect = ["id", "title", "author", "comments"]
  postCommentsSelect = ["id", "content", "author", "replies"]
  postCommentsRepliesSelect = ["id", "content", "author"]
  postCommentsLimit = 50
  postCommentsRepliesLimit = 10
}
```

## 🔍 API Reference

### Components

#### `FlowModelForm`
Main form component that handles data fetching, validation, and submission.

```tsx
<FlowPostForm
  mode="create" | "update"      // Form mode
  id={string}                    // Required for update
  defaultValues={object}         // Initial values
  onSuccess={(data) => void}     // Success callback
  onError={(error) => void}      // Error callback
  features={{                    // Optional features
    autosave: {
      enabled: boolean,
      debounceMs: number,
      onFieldSave: (field, value) => void
    }
  }}
/>
```

#### `ModelFormField`
Type-safe field component with render prop pattern.

```tsx
<PostFormField
  name={string}                  // Field name (typed)
  render={(props) => ReactNode}  // Render function
  transform={{                   // Optional transforms
    input: (value) => any,
    output: (value) => any
  }}
  rules={object}                 // Validation rules
/>
```

### Hooks

#### Data Fetching
- `useModel(id, options?)` - Fetch single item
- `useModelList(params?, options?)` - Fetch paginated list
- `useCreateModel(options?)` - Create mutation
- `useUpdateModel(id, options?)` - Update mutation  
- `useDeleteModel(options?)` - Delete mutation

#### Form Hooks
- `useCreateModelForm(options?)` - Create form with validation
- `useUpdateModelForm(id, options?)` - Update form with features
- `useModelFieldValue(name)` - Get/set field value

### Server Functions

#### Methods (with policies)
- `findUnique(args, ctx)` - Find single record
- `findMany(args, ctx)` - Find multiple records
- `create(args, ctx)` - Create record
- `update(args, ctx)` - Update record
- `delete(args, ctx)` - Delete record

#### Actions (with validation)
- `createModel(data, ctx)` - Create with validation
- `updateModel(id, data, ctx)` - Update with validation
- `deleteModel(id, ctx)` - Delete with policies

#### Queries (cached)
- `getModelById(id, ctx)` - Cached single fetch
- `listModels(params, ctx)` - Cached list with pagination

## 🐛 Troubleshooting

### Common Issues

**Autosave not triggering**
- Ensure `features.autosave.enabled` is true
- Check that form has valid `onSave` handler
- Verify debounce timing isn't too long

**Type errors in forms**
- Run `npx prisma generate` after schema changes
- Restart TypeScript server in VS Code
- Check that imports use correct barrel exports

**Policy errors**
- Verify `FlowCtx` has required fields
- Check policy function returns `PolicyResult`
- Ensure policies handle all actions

**Circular dependency warnings**
- Normal for deep relations - generator prevents infinite loops
- Adjust relation limits if needed

## 📄 License

MIT