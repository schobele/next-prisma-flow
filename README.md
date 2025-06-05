# Next Prisma Flow Generator

A powerful Prisma generator that scaffolds a full stack of typed code for Next.js applications with a modern, intuitive developer experience. Automatically generates API routes, server actions, Jotai state management, enhanced React hooks, and smart form integration - all fully type-safe and derived from your Prisma schema.

## 🚀 What's New in v0.2.0

- **Model-specific namespace exports** - Import everything you need with `import { todos, categories } from './generated/flow'`
- **Unified smart hooks** - One hook with all CRUD operations: `todos.hooks.useTodos()`
- **Zero-config form integration** - Automatic validation and submission with `todos.hooks.useForm()`
- **Enhanced developer experience** - Intuitive API that works out of the box
- **Backward compatibility** - All v0.1.x APIs still work

## Features

- 🚀 **Zero Boilerplate**: Eliminates manual wiring between database and UI
- 🔒 **Type-Safe**: End-to-end type safety from Prisma schema to React components
- ⚡ **Optimistic UI**: Built-in optimistic updates with automatic rollback
- 🎯 **Modern Stack**: Next.js App Router, Server Actions, Jotai state management
- 🔄 **Cache Invalidation**: Automatic Next.js cache tag invalidation
- 📦 **Batch Operations**: Generated batch create/delete operations
- 🛡️ **Input Validation**: Zod schema validation for all mutations
- 📊 **Selective Fields**: Control which fields are exposed via configuration
- 🎨 **Smart Forms**: Zero-config form hooks with automatic validation
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
  postSelect     = ["id", "title", "content", "published", "authorId"]
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
│   ├── hooks.ts          # Enhanced React hooks with unified API
│   ├── routes.ts         # API route handlers
│   ├── types.ts          # TypeScript types
│   ├── form-provider.tsx # Form context providers
│   ├── smart-form.ts     # Smart form utilities
│   └── namespace.ts      # Model-specific organized exports
├── post/
│   ├── actions.ts
│   ├── atoms.ts
│   ├── hooks.ts
│   ├── routes.ts
│   ├── types.ts
│   ├── form-provider.tsx
│   ├── smart-form.ts
│   └── namespace.ts
├── actions.ts            # Legacy barrel exports for actions
├── atoms.ts              # Legacy barrel exports for atoms
├── hooks.ts              # Legacy barrel exports for hooks
├── types.ts              # Legacy barrel exports for types
├── store.ts              # Central store setup
├── zod/                  # Zod schema exports
│   └── index.ts
└── index.ts              # Enhanced main export with namespaces
```

#### Modern v0.2.0 Import Structure

```typescript
import { users, posts } from '@/generated/flow';

// Everything organized under model namespaces:
users.hooks.useUsers()         // Unified CRUD hook
users.hooks.useUser(id)        // Individual item hook
users.hooks.useCreateUserForm() // Smart form hook
users.actions.create()         // Server actions
users.atoms.usersAtom          // Jotai atoms
users.types.User               // TypeScript types
users.schemas.create           // Zod schemas
```

### 3. Set up your Next.js API routes

Copy the generated route handlers to your API routes:

```typescript
// app/api/user/route.ts
export { GET, POST, PATCH, DELETE } from '@/generated/flow/user/routes';

// app/api/post/route.ts  
export { GET, POST, PATCH, DELETE } from '@/generated/flow/post/routes';
```

### 4. Use in your React components

#### 🎯 Modern API (v0.2.0+) - Recommended

```typescript
'use client';

import { users, posts } from '@/generated/flow';

export default function UsersList() {
  // One hook, everything you need
  const { 
    data: userList, 
    createUser, 
    updateUser, 
    deleteUser,
    loading, 
    error 
  } = users.hooks.useUsers();
  
  // Zero-config form with auto-validation
  const form = users.hooks.useCreateUserForm();
  
  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <form onSubmit={form.submit}>
        <input {...form.field('name')} placeholder="Name" />
        <input {...form.field('email')} placeholder="Email" />
        <button type="submit" disabled={!form.isValid || form.loading}>
          {form.loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
      
      <ul>
        {userList.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Individual Item Management

```typescript
import { users } from '@/generated/flow';

function UserProfile({ id }: { id: string }) {
  // Individual item with form integration
  const { data: user, form, update, delete: deleteUser } = users.hooks.useUser(id);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <form onSubmit={form.submit}>
        <input {...form.field('name')} />
        <input {...form.field('email')} />
        <button type="submit">Update</button>
      </form>
      <button onClick={() => deleteUser()}>Delete</button>
    </div>
  );
}
```

#### Legacy API (v0.1.x) - Still Supported

```typescript
'use client';

import { useUsers, useCreateUser } from '@/generated/flow/hooks';

export default function UsersList() {
  const { users, loading, error, refresh } = useUsers();
  const { createUser, creating } = useCreateUser();

  const handleCreateUser = async () => {
    try {
      await createUser({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secure123'
      });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={handleCreateUser} disabled={creating}>
        {creating ? 'Creating...' : 'Create User'}
      </button>
      
      <button onClick={refresh}>Refresh</button>
      
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
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
  
  postSelect     = ["id", "title", "content"]
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
postSelect = ["id", "title", "content", "published"]
```

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
export function useUsers(): UseUsersResult
export function useUser(id: string): UseUserResult
export function useCreateUser(): UseCreateUserResult
export function useUpdateUser(): UseUpdateUserResult
export function useDeleteUser(): UseDeleteUserResult
export function useUserMutations(): UseUserMutationsResult
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

### API Routes
RESTful API route handlers for external consumption:

```typescript
// Generated in user/routes.ts
export async function GET(request: NextRequest): Promise<NextResponse>
export async function POST(request: NextRequest): Promise<NextResponse>
export async function PATCH(request: NextRequest): Promise<NextResponse>
export async function DELETE(request: NextRequest): Promise<NextResponse>
```

## Advanced Usage

### 🎯 Modern API (v0.2.0+)

#### Smart Form Integration

```typescript
import { todos } from '@/generated/flow';

function TodoForm() {
  const form = todos.hooks.useCreateTodoForm({
    title: '',
    priority: 'MEDIUM'
  });
  
  // Auto-save functionality
  form.enableAutoSave(1000); // Save every 1 second
  
  return (
    <form onSubmit={form.submit}>
      <input 
        {...form.field('title')}
        placeholder="Todo title"
      />
      <select {...form.field('priority')}>
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      <button type="submit" disabled={!form.isValid}>
        {form.loading ? 'Creating...' : 'Create Todo'}
      </button>
      {form.error && <div className="error">{form.error.message}</div>}
    </form>
  );
}
```

#### Advanced Custom State

```typescript
import { atom } from 'jotai';
import { todos } from '@/generated/flow';

// Direct atom access for custom derived state
const { todosAtom } = todos.atoms;

export const myTodosAtom = atom((get) => {
  const allTodos = get(todosAtom);
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
  const { createMany, deleteMany } = users.hooks.useUsers();
  
  const handleBatchCreate = async () => {
    await createMany([
      { name: 'User 1', email: 'user1@example.com' },
      { name: 'User 2', email: 'user2@example.com' },
    ]);
  };
  
  return <button onClick={handleBatchCreate}>Create Multiple Users</button>;
}
```

### Legacy API (v0.1.x)

#### Custom Error Handling

```typescript
import { useUsers } from '@/generated/flow/hooks';

function UsersWithErrorBoundary() {
  const { users, error } = useUsers();
  
  if (error) {
    return <div className="error">Failed to load users: {error}</div>;
  }
  
  return <UsersList users={users} />;
}
```

#### Direct Server Action Usage

```typescript
import { createUser } from '@/generated/flow/user/actions';

// In a server component or server action
async function handleServerSideUserCreation() {
  const user = await createUser({
    name: 'Server User',
    email: 'server@example.com'
  });
  
  return user;
}
```

## Migration from v0.1.x to v0.2.0

### No Breaking Changes 🎉

All v0.1.x APIs continue to work exactly as before. You can upgrade to v0.2.0 and migrate gradually.

### Recommended Migration Path

#### 1. Import Style (Optional but Recommended)

**Before (v0.1.x):**
```typescript
import { useUsers, useCreateUser } from '@/generated/flow/hooks';
import { createUser } from '@/generated/flow/user/actions';
```

**After (v0.2.0+):**
```typescript
import { users } from '@/generated/flow';
// Everything is available under users.hooks, users.actions, etc.
```

#### 2. Hook Consolidation (Optional)

**Before (v0.1.x):**
```typescript
const { users, loading, error } = useUsers();
const { createUser } = useCreateUser();
const { updateUser } = useUpdateUser();
const { deleteUser } = useDeleteUser();
```

**After (v0.2.0+):**
```typescript
const { 
  data: users, 
  loading, 
  error,
  createUser, 
  updateUser, 
  deleteUser 
} = users.hooks.useUsers();
```

#### 3. Form Integration (New Feature)

**Enhanced with v0.2.0:**
```typescript
// Zero-config forms with validation
const form = users.hooks.useCreateUserForm();

return (
  <form onSubmit={form.submit}>
    <input {...form.field('name')} />
    <input {...form.field('email')} />
    <button type="submit" disabled={!form.isValid}>
      Create User
    </button>
  </form>
);
```

### Key Benefits of Migrating

1. **Cleaner Imports** - Single namespace import instead of multiple
2. **Unified Hooks** - One hook with all CRUD operations
3. **Smart Forms** - Zero-config form integration with validation
4. **Better DX** - More intuitive and discoverable API
5. **Future-Ready** - Built for upcoming features

### Migration Timeline

- **Immediate**: Upgrade to v0.2.0 (no code changes needed)
- **Gradual**: Migrate components one at a time using new APIs
- **Optional**: Old APIs will be supported indefinitely

## Best Practices

### 1. Use Modern API (v0.2.0+)
Prefer the new namespace imports for better DX:

```typescript
// ✅ Good - Modern namespace import
import { users, todos } from '@/generated/flow';

// ❌ Avoid - Legacy multiple imports (still works)
import { useUsers, useCreateUser } from '@/generated/flow/hooks';
```

### 2. Security First
Always configure `select` to exclude sensitive fields:

```prisma
userSelect = ["id", "name", "email"]  # Excludes password, internal fields
```

### 3. Leverage Smart Forms
Use the new form hooks for better UX:

```typescript
// ✅ Good - Smart form with validation
const form = users.hooks.useCreateUserForm();
return <form onSubmit={form.submit}>...</form>;

// ❌ Avoid - Manual form handling
const { createUser } = users.hooks.useUsers();
const handleSubmit = async (e) => { /* manual validation */ };
```

### 4. Use Type Imports
Import types separately to avoid bundle bloat:

```typescript
import type { User, UserCreateInput } from '@/generated/flow/types';
import { users } from '@/generated/flow';
```

### 5. Error Boundaries
Wrap components using hooks in error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <UsersComponent />
</ErrorBoundary>
```

### 6. Optimistic Updates
Take advantage of built-in optimistic updates:

```typescript
const { updateUser } = users.hooks.useUsers();

// UI updates immediately, then syncs with server
await updateUser(userId, { name: 'New Name' });
```

### 7. Custom State Derivation
Use direct atom access for complex state logic:

```typescript
import { atom } from 'jotai';
import { users } from '@/generated/flow';

const activeUsersAtom = atom((get) => {
  const allUsers = get(users.atoms.usersAtom);
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
npm install prisma @prisma/client jotai jotai-immer next react zod
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

### Debug Mode

Enable detailed logging:

```bash
DEBUG=prisma:generator npx prisma generate
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## License

MIT License - see LICENSE file for details.