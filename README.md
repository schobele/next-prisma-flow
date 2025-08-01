# Next Prisma Flow Generator

[![npm version](https://badge.fury.io/js/next-prisma-flow.svg)](https://www.npmjs.com/package/next-prisma-flow)
[![Documentation](https://img.shields.io/badge/docs-live-brightgreen.svg)](https://schobele.github.io/next-prisma-flow)
[![GitHub](https://img.shields.io/badge/GitHub-repository-blue.svg)](https://github.com/schobele/next-prisma-flow)

> **📖 [View Full Documentation](https://schobele.github.io/next-prisma-flow)** - Complete guides, examples, and API reference

A powerful Prisma generator that scaffolds a full stack of typed code for Next.js applications with a modern, intuitive developer experience. Automatically generates API routes, server actions, Jotai state management, enhanced React hooks, and smart form integration - all fully type-safe and derived from your Prisma schema.

## 🚀 What's New in v0.2.6

- **Fixed Naming Conflicts** - List hooks now use `useModelsList()` pattern to avoid conflicts with plural model names
- **Improved DX** - List hook parameters are now optional, eliminating the need for empty objects
- **Fixed Model Naming** - Properly handles multi-word models like `TodoList` with correct camelCase
- **Updated Documentation** - README now accurately reflects the current implementation and file structure
- **React 19 Compatibility** - Fixed TypeScript issues with latest React version

## Features

- 🚀 **Zero Boilerplate**: Eliminates manual wiring between database and UI
- 🔒 **Type-Safe**: End-to-end type safety from Prisma schema to React components
- ⚡ **Optimistic UI**: Built-in optimistic updates with automatic rollback
- 🎯 **Modern Stack**: Next.js App Router, Server Actions, Jotai state management
- 🔄 **Cache Invalidation**: Automatic Next.js cache tag invalidation
- 📦 **Batch Operations**: Generated batch create/delete operations
- 🛡️ **Input Validation**: Zod schema validation for all mutations
- 📊 **Selective Fields**: Control which fields are exposed via configuration
- 🎨 **Smart Forms**: Enhanced form hooks with automatic data transformation
- 🔀 **Auto Transformations**: Seamless conversion between ModelType and form schemas
- 🏗️ **Namespace Exports**: Organized, intuitive API structure

## Installation

```bash
npm install next-prisma-flow
# or
yarn add next-prisma-flow
# or
pnpm add next-prisma-flow
```

## Quick Start

### 1. Configure your Prisma schema

Add the generator to your `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

generator zod {
  provider = "zod-prisma-types"
  output   = "./generated/zod"
}

generator flow {
  provider = "next-prisma-flow"
  output   = "./generated/flow"
  zodPrismaImport = "./generated/zod"
  prismaImport = "@/lib/prisma"
  models   = ["User", "Post"]
  
  // User configuration  
  userSelect     = ["id", "name", "email", "posts"]
  userOptimistic = "merge"
  
  // Post configuration
  postSelect     = ["id", "title", "content", "published", "authorId", "author"]
  postOptimistic = "overwrite"
  postPagination = "true"
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // This won't be exposed due to select config
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(uuid())
  title     String
  content   String
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. Generate the code

```bash
npx prisma generate
```

This creates the following structure:

```
generated/flow/
├── user/
│   ├── actions.ts        # Server actions
│   ├── atoms.ts          # Jotai atoms
│   ├── config.ts         # Model configuration
│   ├── derived.ts        # Derived state and selectors
│   ├── fx.ts             # Side effects and async operations
│   ├── hooks.ts          # Enhanced React hooks with unified API
│   ├── index.ts          # Model-specific organized exports
│   ├── schemas.ts        # Zod validation schemas
│   └── types.ts          # TypeScript types
├── post/
│   ├── actions.ts
│   ├── atoms.ts
│   ├── config.ts
│   ├── derived.ts
│   ├── fx.ts
│   ├── hooks.ts
│   ├── index.ts
│   ├── schemas.ts
│   └── types.ts
├── shared/
│   ├── actions/
│   │   ├── factory.ts
│   │   └── unwrap.ts
│   └── hooks/
│       ├── relation-helper.ts
│       ├── use-form-factory.ts    # Enhanced form factory with smart transformations
│       └── useAutoload.ts
├── index.ts              # Enhanced main export with namespaces
├── prisma.ts             # Re-exported Prisma client
└── zod/                  # Zod schema exports
    └── index.ts
```

#### Modern v0.2.0+ Import Structure

```typescript
import { users, posts } from '@/generated/flow';

// Everything organized under model namespaces:
users.hooks.useUsersList()     // Unified CRUD hook
users.hooks.useUser(id)        // Individual item hook
users.hooks.useUserForm()      // Enhanced form hook with smart transformations
users.actions.create()         // Server actions
users.atoms.usersAtom          // Jotai atoms
users.types.User               // TypeScript types
users.schemas.create           // Zod schemas
```

### 3. Use in your React components

The generator creates a complete state management system without requiring additional API routes. All operations work through server actions integrated with the generated hooks.

### 4. Example Usage

#### 🎯 Enhanced Form System (v0.2.4+)

```typescript
'use client';

import { posts, users } from '@/generated/flow';

export default function CreatePostForm() {
  const { data: userList } = users.hooks.useUsersList();
  
  // Enhanced form with automatic transformation
  const form = posts.hooks.usePostForm(undefined, {
    onSuccess: (result) => console.log('Post created:', result),
    onError: (error) => console.error('Creation failed:', error),
    transform: {
      // Custom transformation for create (optional - smart defaults provided)
      toCreateInput: (formData) => ({
        ...formData,
        published: formData.status === 'PUBLISHED',
        publishedAt: formData.status === 'PUBLISHED' ? new Date() : null,
      }),
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <input 
        {...form.register('title')} 
        placeholder="Post title"
        className="w-full p-2 border rounded"
      />
      
      <textarea 
        {...form.register('content')} 
        placeholder="Post content"
        className="w-full p-2 border rounded h-32"
      />
      
      <select {...form.register('authorId')} className="w-full p-2 border rounded">
        <option value="">Select author</option>
        {userList.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
      
      <select {...form.register('status')} className="w-full p-2 border rounded">
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
      </select>
      
      <button 
        type="submit" 
        disabled={form.isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {form.isCreating ? 'Creating Post...' : 'Create Post'}
      </button>
      
      {form.submitError && (
        <div className="text-red-500">Error: {form.submitError.message}</div>
      )}
    </form>
  );
}

// Edit form with automatic data transformation
export function EditPostForm({ postId }: { postId: string }) {
  const { data: post } = posts.hooks.usePost(postId);
  const { data: userList } = users.hooks.useUsersList();
  
  // Form automatically detects update mode and transforms ModelType data
  const form = posts.hooks.usePostForm(post, {
    onSuccess: () => console.log('Post updated!'),
    transform: {
      // Automatic transformation handles:
      // - author: { id, name, email } → authorId
      // - Nested objects → flat IDs
      // - Arrays are skipped for form inputs
      fromModelType: (post) => ({
        title: post.title,
        content: post.content,
        authorId: post.author?.id || post.authorId,
        status: post.published ? 'PUBLISHED' : 'DRAFT',
      }),
      toUpdateInput: (formData) => ({
        title: formData.title,
        content: formData.content,
        authorId: formData.authorId,
        published: formData.status === 'PUBLISHED',
      }),
    },
  });
  
  if (!post) return <div>Loading post...</div>;
  
  return (
    <form onSubmit={form.handleSubmit} className="space-y-4">
      <input 
        {...form.register('title')} 
        placeholder="Post title"
        className="w-full p-2 border rounded"
      />
      
      <textarea 
        {...form.register('content')} 
        placeholder="Post content"
        className="w-full p-2 border rounded h-32"
      />
      
      <select {...form.register('authorId')} className="w-full p-2 border rounded">
        {userList.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
      
      <select {...form.register('status')} className="w-full p-2 border rounded">
        <option value="DRAFT">Draft</option>
        <option value="PUBLISHED">Published</option>
      </select>
      
      <button 
        type="submit" 
        disabled={form.isSubmitting}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {form.isUpdating ? 'Updating Post...' : 'Update Post'}
      </button>
      
      {form.submitError && (
        <div className="text-red-500">Error: {form.submitError.message}</div>
      )}
    </form>
  );
}
```

#### List and CRUD Operations

```typescript
import { posts } from '@/generated/flow';

function PostsList() {
  const { 
    data: postList, 
    createPost, 
    updatePost, 
    deletePost,
    loading, 
    error 
  } = posts.hooks.usePostsList();
  
  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Posts ({postList.length})</h1>
      
      <ul>
        {postList.map(post => (
          <li key={post.id} className="border p-4 mb-2">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <p>By: {post.author?.name || 'Unknown'}</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => updatePost({ published: !post.published })}
                className="px-2 py-1 bg-blue-500 text-white rounded"
              >
                {post.published ? 'Unpublish' : 'Publish'}
              </button>
              <button 
                onClick={() => deletePost()}
                className="px-2 py-1 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Configuration Options

### Generator Configuration

```prisma
generator flow {
  provider = "next-prisma-flow"
  output   = "./generated/flow"           # Output directory
  zodPrismaImport = "./generated/zod"       # Path to zod-prisma-types
  prismaImport = "@/lib/prisma"             # Path to your Prisma client instance
  models   = ["User", "Post"]               # Models to generate for
  
  # Model-specific configuration (flat format)
  userSelect     = ["id", "name", "email"] # Fields to include in responses
  userOptimistic = "merge"                 # Optimistic update strategy
  userPagination = "true"                  # Enable pagination helpers
  
  postSelect     = ["id", "title", "content", "author"]  # Include relationships
  postOptimistic = "overwrite"
}
```

### Core Configuration Options

#### `output`
Directory where generated files will be placed. Default: `"./generated/flow"`

#### `zodPrismaImport` 
Path to your zod-prisma-types generated schemas. The generator will automatically calculate the correct relative path from each model subdirectory. Default: `"./generated/zod"`

**Note**: Relative paths are automatically adjusted for the nested model structure. For example, if you specify `"./generated/zod"`, the generator will use `"../../generated/zod"` in the model files since they're in subdirectories.

#### `prismaImport`
Path to your Prisma client instance. This allows you to customize where the generator imports the `prisma` client from. Default: `"@/lib/prisma"`

Common examples:
```prisma
prismaImport = "@/lib/prisma"          # Next.js with path alias
prismaImport = "../lib/db"             # Relative path
prismaImport = "@prisma/client"        # Direct from package
prismaImport = "~/utils/database"      # Custom path alias
```

#### `models`
Array of model names to generate code for.

### Model Configuration Options

Configuration uses a flat format where each option is prefixed with the lowercase model name.

#### `{modelName}Select`
Array of field names to include in API responses. This acts as a whitelist for security.

```prisma
userSelect = ["id", "name", "email", "posts"]
postSelect = ["id", "title", "content", "published", "author"]  # Include relationships
```

**Smart Form Integration**: When relationships are included in select (like `"author"`), the form system automatically:
- Extracts IDs for form inputs (`author: { id, name }` → `authorId`)
- Pre-populates edit forms with correct relationship data
- Handles nested object transformation seamlessly

#### `{modelName}Optimistic` 
Strategy for handling optimistic update conflicts:
- `"merge"`: Merge changes when conflicts occur
- `"overwrite"`: Last write wins (default)
- `"manual"`: Throw error and let developer handle

```prisma
userOptimistic = "merge"
postOptimistic = "overwrite"
```

#### `{modelName}Pagination`
Enable pagination utilities for large datasets:

```prisma
postPagination = "true"
userPagination = "false"  # or omit entirely
```

## Generated Code Overview

### Enhanced Form Hooks
Form hooks provide automatic data transformation and mode detection:

```typescript
// Generated in post/hooks.ts
export function usePostForm(
  instance?: ModelType, 
  options: UseFormOptions<ModelType> = {}
): UseModelFormReturn<CreateInput, UpdateInput>

// Automatic features:
// - Mode detection: create vs update based on instance presence
// - Data transformation: ModelType ↔ CreateInput/UpdateInput
// - Nested object handling: author.id → authorId
// - Validation: Integrated Zod schema validation
// - Loading states: isSubmitting, isCreating, isUpdating
// - Error handling: submitError with detailed error info
```

### Server Actions
Server actions provide the business logic layer:

```typescript
// Generated in user/actions.ts
export async function getAllUsers(): Promise<User[]>
export async function getUser(id: string): Promise<User | null>
export async function createUser(input: UserCreateInput): Promise<User>
export async function updateUser(id: string, input: UserUpdateInput): Promise<User>
export async function deleteUser(id: string): Promise<void>
```

### React Hooks
Hooks provide a React-Query-like experience:

```typescript
// Generated in user/hooks.ts
export function useUsersList(): UseUsersListResult
export function useUser(id: string): UseUserResult
export function useUserForm(instance?: ModelType, options?: UseFormOptions): UseModelFormReturn
// Additional utility hooks available for advanced usage
```

### Jotai Atoms
Atoms manage global state with optimistic updates:

```typescript
// Generated in user/atoms.ts
export const baseUsersAtom: Atom<Record<string, User>>
export const userListAtom: Atom<User[]>
export const usersLoadingAtom: Atom<boolean>
export const refreshUsersAtom: WriteOnlyAtom<null, void>
```

### Server Actions
All operations are handled through server actions integrated with the state management system. No separate API routes are needed for basic CRUD operations.

## Advanced Usage

### 🎯 Enhanced Form Transformations (v0.2.4+)

#### Custom Data Transformations

```typescript
import { posts, categories } from '@/generated/flow';

function AdvancedPostForm() {
  const form = posts.hooks.usePostForm(postInstance, {
    transform: {
      // Transform ModelType to form format (handles complex relationships)
      fromModelType: (post) => ({
        title: post.title,
        content: post.content,
        authorId: post.author?.id || post.authorId,
        categoryIds: post.categories?.map(cat => cat.id) || [],
        tags: post.tags?.join(', ') || '',
        published: post.status === 'PUBLISHED',
      }),
      
      // Transform form data for creation
      toCreateInput: (formData) => ({
        title: formData.title,
        content: formData.content,
        authorId: formData.authorId,
        status: formData.published ? 'PUBLISHED' : 'DRAFT',
        publishedAt: formData.published ? new Date() : null,
        // Handle complex relationships
        categories: {
          connect: formData.categoryIds.map(id => ({ id }))
        },
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      }),
      
      // Transform form data for updates
      toUpdateInput: (formData) => ({
        title: formData.title,
        content: formData.content,
        authorId: formData.authorId,
        status: formData.published ? 'PUBLISHED' : 'DRAFT',
        // Only update publishedAt if changing to published
        ...(formData.published && { publishedAt: new Date() }),
      }),
    },
    
    // Callbacks for success/error handling
    onSuccess: (result) => {
      toast.success(result ? 'Post updated!' : 'Post created!');
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit}>
      {/* Form fields automatically pre-populated for edit mode */}
      <input {...form.register('title')} />
      <textarea {...form.register('content')} />
      
      {/* Multi-select handled via transformation */}
      <select multiple {...form.register('categoryIds')}>
        {/* Options */}
      </select>
      
      <input {...form.register('tags')} placeholder="Comma-separated tags" />
      
      <label>
        <input 
          type="checkbox" 
          {...form.register('published')} 
        />
        Published
      </label>
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.mode === 'create' 
          ? (form.isCreating ? 'Creating...' : 'Create Post')
          : (form.isUpdating ? 'Updating...' : 'Update Post')
        }
      </button>
    </form>
  );
}
```

#### Automatic Relationship Handling

The enhanced form system automatically handles common relationship patterns:

```typescript
// Input ModelType with nested relationships:
const post = {
  id: "123",
  title: "My Post",
  author: { id: "456", name: "John Doe", email: "john@example.com" },
  category: { id: "789", name: "Technology" },
  tags: [
    { id: "1", name: "React" },
    { id: "2", name: "TypeScript" }
  ],
  comments: [...] // Arrays are automatically skipped
}

// Automatically transformed to form input:
const formData = {
  title: "My Post",
  authorId: "456",    // Extracted from author.id
  categoryId: "789",  // Extracted from category.id
  // tags array skipped (not a simple relationship)
  // comments array skipped
}
```

#### Advanced Custom State

```typescript
import { atom } from 'jotai';
import { todos } from '@/generated/flow';

// Direct atom access for custom derived state
const { entitiesAtom } = todos.atoms;

export const myTodosAtom = atom((get) => {
  const allTodos = get(entitiesAtom);
  return Object.values(allTodos).filter(t => t.userId === currentUserId);
});

export const urgentTodosAtom = atom((get) => {
  const myTodos = get(myTodosAtom);
  return myTodos.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED');
});
```

#### Programmatic Actions

```typescript
import { todos } from '@/generated/flow';

// Direct action access for programmatic use
export async function bulkMarkComplete(todoIds: string[]) {
  await Promise.all(
    todoIds.map(id => 
      todos.actions.update(id, { status: 'COMPLETED' })
    )
  );
}

export async function createTodoFromTemplate(template: TodoTemplate) {
  return await todos.actions.create({
    title: template.title,
    description: template.description,
    priority: template.priority,
    userId: getCurrentUserId()
  });
}
```

#### Batch Operations

```typescript
import { users } from '@/generated/flow';

function BatchUserActions() {
  const { createMany, deleteMany } = users.hooks.useUsersList();
  
  const handleBatchCreate = async () => {
    await createMany([
      { name: 'User 1', email: 'user1@example.com' },
      { name: 'User 2', email: 'user2@example.com' },
    ]);
  };
  
  return <button onClick={handleBatchCreate}>Create Multiple Users</button>;
}
```

### Server-Side Usage

#### Direct Server Action Usage

```typescript
import { users } from '@/generated/flow';

// In a server component or server action
async function handleServerSideUserCreation() {
  const user = await users.actions.create({
    name: 'Server User',
    email: 'server@example.com'
  });
  
  return user;
}
```


## Best Practices

### 1. Use Modern API (v0.2.x)
Always use the new namespace imports for better DX:

```typescript
// ✅ Good - Modern namespace import
import { users, todos } from '@/generated/flow';

// Access everything through the namespace
const { data, createUser } = users.hooks.useUsersList();
const form = users.hooks.useUserForm();
```

### 2. Security First
Always configure `select` to exclude sensitive fields:

```prisma
userSelect = ["id", "name", "email"]  # Excludes password, internal fields
```

### 3. Leverage Enhanced Form System
Use the improved form hooks for automatic data transformation:

```typescript
// ✅ Good - Enhanced form with automatic transformation
const form = users.hooks.useUserForm(userInstance, {
  onSuccess: (result) => toast.success('User saved!'),
  transform: {
    // Custom transformation only when needed
    // Automatic handling includes ID extraction from nested objects
  },
});

return <form onSubmit={form.handleSubmit}>...</form>;
```

### 4. Include Relationships in Select
For forms that need relationship data, include them in select:

```prisma
postSelect = ["id", "title", "content", "author", "category"]  # Include relationships
```

This enables automatic form pre-population with relationship IDs.

### 5. Use Type Imports
Import types separately to avoid bundle bloat:

```typescript
import type { User, UserCreateInput } from '@/generated/flow/types';
import { users } from '@/generated/flow';
```

### 6. Error Boundaries
Wrap components using hooks in error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <UsersComponent />
</ErrorBoundary>
```

### 7. Optimistic Updates
Take advantage of built-in optimistic updates:

```typescript
const { updateUser } = users.hooks.useUsersList();

// UI updates immediately, then syncs with server
await updateUser(userId, { name: 'New Name' });
```

### 8. Custom State Derivation
Use direct atom access for complex state logic:

```typescript
import { atom } from 'jotai';
import { users } from '@/generated/flow';

const activeUsersAtom = atom((get) => {
  const allUsers = get(users.atoms.entitiesAtom);
  return Object.values(allUsers).filter(u => u.status === 'ACTIVE');
});
```

## Requirements

- **Next.js**: 13.4+ (App Router)
- **React**: 18+
- **Prisma**: 5.0+
- **TypeScript**: 5.0+
- **zod-prisma-types**: For input validation

## Peer Dependencies

Make sure to install these in your project:

```bash
npm install prisma @prisma/client jotai jotai-immer next react zod react-hook-form @hookform/resolvers
```

## Development

To develop this generator:

```bash
# Clone the repository
git clone https://github.com/your-org/next-prisma-flow

# Install dependencies
bun install

# Build the generator
bun run build

# Test with a sample project
cd examples/blog
npm install
npx prisma generate
```

## Troubleshooting

### Common Issues

1. **"Model not found" error**: Ensure model names in config match your Prisma schema exactly
2. **Type errors**: Run `npm run build` to ensure all generated types are compiled
3. **Import errors**: Check that your `zodPrismaImport` path is correct
4. **Cache issues**: Clear Next.js cache with `rm -rf .next`
5. **Form not pre-populated**: Ensure relationships are included in model select configuration

### Debug Mode

Enable detailed logging:

```bash
DEBUG=prisma:generator npx prisma generate
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

MIT License - see LICENSE file for details.