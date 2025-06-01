# Next Prisma Flow Generator

A powerful Prisma generator that scaffolds a full stack of typed code for Next.js applications. Automatically generates API routes, server actions, Jotai state management, and React hooks - all fully type-safe and derived from your Prisma schema.

## Features

- 🚀 **Zero Boilerplate**: Eliminates manual wiring between database and UI
- 🔒 **Type-Safe**: End-to-end type safety from Prisma schema to React components
- ⚡ **Optimistic UI**: Built-in optimistic updates with automatic rollback
- 🎯 **Modern Stack**: Next.js App Router, Server Actions, Jotai state management
- 🔄 **Cache Invalidation**: Automatic Next.js cache tag invalidation
- 📦 **Batch Operations**: Generated batch create/delete operations
- 🛡️ **Input Validation**: Zod schema validation for all mutations
- 📊 **Selective Fields**: Control which fields are exposed via configuration

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
│   ├── actions.ts    # Server actions
│   ├── atoms.ts      # Jotai atoms
│   ├── hooks.ts      # React hooks
│   ├── routes.ts     # API route handlers
│   └── types.ts      # TypeScript types
├── post/
│   ├── actions.ts
│   ├── atoms.ts
│   ├── hooks.ts
│   ├── routes.ts
│   └── types.ts
├── actions.ts        # Barrel exports for actions
├── atoms.ts          # Barrel exports for atoms
├── hooks.ts          # Barrel exports for hooks
├── types.ts          # Barrel exports for types
├── store.ts          # Central store setup
└── index.ts          # Main barrel export
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

```typescript
'use client';

import { useUsers, useCreateUser, useUserMutations } from '@/generated/flow/hooks';

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

### Custom Error Handling

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

### Optimistic Updates

All mutations include built-in optimistic updates:

```typescript
const { updateUser } = useUpdateUser();

// UI updates immediately, then syncs with server
await updateUser(userId, { name: 'New Name' });
```

### Batch Operations

```typescript
import { useBatchUserOperations } from '@/generated/flow/hooks';

function BatchUserActions() {
  const { createManyUsers, deleteManyUsers } = useBatchUserOperations();
  
  const handleBatchCreate = () => {
    createManyUsers([
      { name: 'User 1', email: 'user1@example.com' },
      { name: 'User 2', email: 'user2@example.com' },
    ]);
  };
  
  return <button onClick={handleBatchCreate}>Create Multiple Users</button>;
}
```

### Direct Server Action Usage

Skip HTTP overhead by importing server actions directly:

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

## Best Practices

### 1. Security First
Always configure `select` to exclude sensitive fields:

```prisma
user = {
  select = ["id", "name", "email"]  # Excludes password, internal fields
}
```

### 2. Use Type Imports
Import types separately to avoid bundle bloat:

```typescript
import type { User, UserCreateInput } from '@/generated/flow/types';
import { useUsers } from '@/generated/flow/hooks';
```

### 3. Error Boundaries
Wrap components using hooks in error boundaries:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <UsersComponent />
</ErrorBoundary>
```

### 4. Cache Invalidation
The generator automatically handles cache invalidation, but you can manually refresh:

```typescript
const { refresh } = useUsers();

// Refresh after external data changes
useEffect(() => {
  const handleFocus = () => refresh();
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [refresh]);
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