# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **next-prisma-flow-state-engine**, a Prisma generator that creates type-safe database operations, React hooks, and server actions for Next.js applications. The project consists of:
- **Generator** (`/`) - Core Prisma generator that analyzes schemas and generates code
- **Example Apps** (`/examples/`) - Demo applications showcasing the generated code:
  - `todo` - Full-featured todo app with multi-tenancy
  - `basic` - Minimal blog example (to be implemented)

## Development Commands

### Generator Development
```bash
# Build the generator TypeScript code (required before using locally)
npm run build

# Watch mode for generator development (if needed)
tsc -p tsconfig.json --watch

# Build bundle version
npm run build:bundle
```

### Example Applications
```bash
# Navigate to example directory
cd examples/todo  # or examples/basic

# Install dependencies
npm install

# Generate Prisma client + Flow code after schema changes
npm run generate  # or: npx prisma generate

# Push schema changes to database
npm run db:push  # or: npx prisma db push

# Seed database with sample data
bun run seed.ts

# Start development server
npm run dev

# Type check the example app
npm run typecheck

# Test generated output
bun run test.ts
```

## Architecture

### Code Generation Flow
1. **Schema Analysis**: Generator reads Prisma schema via DMMF (Data Model Meta Format)
2. **Configuration Parsing**: Reads generator config from schema.prisma `generator flow` block
3. **Code Emission**: Generates type-safe operations for each model in organized structure:

#### Generated Directory Structure
```
lib/flow/
├── /[model]/               # Per-model directories (e.g., todo, user, company, todolisttemplate)
│   ├── /server/           # Server-only code
│   │   ├── methods.ts     # All Prisma methods with policies (findUnique, create, etc.) - "use server"
│   │   ├── actions.ts     # High-level CRUD actions with validation - "use server"
│   │   ├── queries.ts     # Cached read operations - "use server"
│   │   ├── selects.ts     # Server-only Prisma select objects with relation configs - import "server-only"
│   │   └── index.ts       # Server barrel export
│   ├── /client/           # Client-side code ("use client" directive)
│   │   ├── hooks.ts       # React Query hooks (useModel, useModelList, mutations)
│   │   ├── forms.ts       # Form hooks with autosave and field-level save states
│   │   └── index.ts       # Client barrel export
│   └── /types/            # Shared types and schemas (no directive)
│       ├── schemas.ts     # Zod schemas (scalar, relations, create/update/filter)
│       ├── transforms.ts  # Data transformation utilities (null -> undefined for relations)
│       ├── types.ts       # TypeScript type exports
│       └── index.ts       # Types barrel export
├── /core/                  # Core runtime utilities
│   ├── provider.tsx       # FlowProvider with QueryClient integration - "use client"
│   ├── ctx.ts            # FlowCtx type definition
│   ├── cache.ts          # Next.js cache helpers
│   ├── errors.ts         # Custom error classes (FlowPolicyError, FlowValidationError)
│   ├── keys.ts           # Query key management utilities
│   ├── http.ts           # HTTP utilities for server actions
│   ├── utils.ts          # General utility functions
│   ├── index.ts          # Server exports
│   └── index.client.ts   # Client-only exports
├── policies.ts            # Authorization policies (canModel functions)
└── prisma.ts             # Prisma client re-export wrapper
```

### Key Generator Files
- `src/index.ts` - Main generator entry point
- `src/config.ts` - Configuration parsing from generator block
- `src/dmmf.ts` - DMMF utilities for schema analysis
- `src/emit/runtime.ts` - Core runtime generation (FlowCtx, cache, policies, errors)
- `src/emit/model/index.ts` - Main model emitter orchestrator
- `src/emit/model/server/*.ts` - Server-side generators
- `src/emit/model/client/*.ts` - Client-side generators
- `src/emit/model/types/*.ts` - Type and schema generators

### Generator Configuration
Configure in `schema.prisma`:
```prisma
generator flow {
  // For npm package:
  provider = "next-prisma-flow-state-engine"
  // For local development:
  provider = "node ../../dist/index.js"  # Relative to schema.prisma
  
  // Output directory for generated code
  output = "../lib/flow"
  
  // Path to Prisma client (relative to output directory)
  prismaImport = "../prisma"
  
  // Model filtering (optional, defaults to "all")
  models = "all"  # or specific: ["User", "Post", "Comment"]
  
  // Multi-tenancy configuration
  tenantField = "companyId"  # Field name for tenant isolation (foreign key)
  tenantModel = "Company"     # Model name that represents tenants
  
  // Custom selects per model (fields + relations)
  userSelect = ["id", "email", "name", "avatar", "role", "companyId", "company", "lists", "todos"]
  postSelect = ["id", "title", "content", "author", "comments", "tags"]
  
  // Relation limits and ordering
  postCommentsLimit = 100
  postCommentsOrder = "{ createdAt: 'desc' }"
  userTodosLimit = 50
  userTodosOrder = "{ orderIndex: 'asc' }"
}
```

### Multi-Tenant Architecture
- Configure tenant field via `tenantField` in generator config
- All queries automatically filter by tenant context
- Context flows through `FlowCtx` from server to client

### Testing Generated Code
The example includes `test.ts` that validates:
- Select object structures and relation handling
- Circular reference prevention
- Zod schema validation
- Configuration application (limits, ordering)

## Code Conventions

### File Organization
- Server methods/actions/queries: In `server/` directory with `"use server"` directive
- Server selects: In `server/selects.ts` with `import "server-only"` (prevents client bundling)
- Client components: In `client/` directory with `"use client"` directive  
- Types and schemas: In `types/` directory (no directive, shared between client/server)
- Generated code: Always in configured output directory (e.g., `lib/flow/`)
- All generated files include header: `// @generated by next-prisma-flow-state-engine`

### Type Safety Patterns
- Import from barrel exports: `import { useTodo, useTodoForm } from '@/lib/flow/todo/client'`
- Import server code: `import { findMany, create, createTodo, getTodoById } from '@/lib/flow/todo/server'`
- Import types: `import { TodoCreateSchema, transformTodoCreate } from '@/lib/flow/todo/types'`
- Alternative: Import from specific files if needed: `import { useTodo } from '@/lib/flow/todo/client/hooks'`
- Types are separated from runtime code for optimal bundle size
- Error handling uses custom exceptions (FlowPolicyError, FlowValidationError)
- Transform functions handle null -> undefined conversions for relations

### Caching Strategy
- Server: Next.js cache tags with automatic invalidation
- Client: TanStack Query with optimistic updates
- Cache keys follow pattern: `['model', filters]`

## Common Tasks

### Using Generated Code

#### Basic Usage
```typescript
// Server-side: Import from barrel exports
import { 
  findMany, create, update,                    // Methods
  createPost, updatePost, deletePost,          // Actions
  getPostById, listPosts                       // Queries
} from '@/lib/flow/post/server';

// Client-side: Import from barrel exports
import { 
  usePost, usePostList, useCreatePost,         // Hooks
  usePostForm                                  // Forms
} from '@/lib/flow/post/client';

// Types: Import from barrel exports
import { 
  PostCreateSchema, PostUpdateSchema,          // Schemas
  type FlowPost, type FlowPostCreate, type FlowPostUpdate,  // Types
  transformPostCreate, transformPostUpdate     // Transforms
} from '@/lib/flow/post/types';

// Server-side usage with automatic policy checks
const posts = await findMany({ 
  where: { published: true },
  orderBy: { createdAt: 'desc' }
}, ctx);  // FlowCtx passed as second parameter

const post = await create({
  data: { title, content, authorId }
}, ctx);

// Client-side usage with React Query
function PostComponent({ id }: { id: string }) {
  const { data: post, isLoading } = usePost(id);
  const createPost = useCreatePost({
    onSuccess: (post) => console.log('Created:', post)
  });
  
  return <div>{post?.title}</div>;
}
```

#### Form Handling
```typescript
import { usePostForm } from '@/lib/flow/post/client';

function EditPost({ id }: { id: string }) {
  const { 
    form, 
    submit, 
    isSubmitting,
    fieldSaveStates,  // Track autosave status per field ('idle' | 'saving' | 'saved' | 'error')
    isAutosaving 
  } = usePostForm({ 
    id,
    autosave: {
      enabled: true,
      debounceMs: 1000,
      fields: ['title', 'content'],  // Optional: specify fields to autosave
      onFieldSave: (field, value) => console.log(`Saved ${field}:`, value),
      onFieldError: (field, error) => console.error(`Error saving ${field}:`, error)
    }
  });
  
  return (
    <form onSubmit={submit}>
      <input {...form.register('title')} />
      {fieldSaveStates.title === 'saving' && <span>Saving...</span>}
      {fieldSaveStates.title === 'saved' && <span>✓</span>}
      {fieldSaveStates.title === 'error' && <span>Failed to save</span>}
      
      <textarea {...form.register('content')} />
      
      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

#### Error Handling
```typescript
import { FlowPolicyError, FlowValidationError } from '@/lib/flow/core';
import { create, createPost } from '@/lib/flow/post/server';

// Server-side error handling
try {
  const post = await create({ data }, ctx);
} catch (error) {
  if (error instanceof FlowPolicyError) {
    // Handle permission denied
    console.error('Access denied:', error.message);
  } else if (error instanceof FlowValidationError) {
    // Handle validation errors with detailed issues
    console.error('Invalid data:', error.issues);
  }
}

// Client-side: React Query handles errors automatically
const createPost = useCreatePost({
  onError: (error) => {
    toast.error(error.message);
  }
});
```

#### Transform Functions
```typescript
// Transform functions handle null -> undefined conversions for relations
import { transformPostCreate, transformPostUpdate } from '@/lib/flow/post/types';

// Transforms are automatically applied in actions
// They convert form data to Prisma-compatible format
const prismaData = transformPostCreate(formData);
```

### Adding a New Model
1. Add model to `prisma/schema.prisma`
2. Configure selects/limits in generator block if needed
3. Build generator if using locally: `npm run build` (in generator root)
4. Run `npx prisma generate` to regenerate code
5. Implement policies in `lib/flow/policies.ts`
6. Push schema changes to database: `npx prisma db push`

### Customizing Generated Selects
Add to generator config:
```prisma
[modelName]Select = ["field1", "field2", "relation1"]
[modelName][RelationName]Limit = 50
[modelName][RelationName]Order = "{ createdAt: 'desc' }"
```

### Debugging Generation
- Generated files are in configured output directory (e.g., `lib/flow/`)
- Check console output during `prisma generate` for errors
- Verify DMMF structure with `prisma format --schema=...`
- Each generated file includes a header comment with the file path
- Use `models` config to generate only specific models during development

## Important Considerations

### Circular Reference Prevention
The generator automatically prevents circular references in selects by:
- Tracking visited models during select generation
- Setting circular relations to `false`
- Configurable depth limits per relation

### Performance Optimization
- Server-only selects use `import "server-only"` to prevent client bundle bloat
- Tree-shakeable exports via separate client/server/types directories
- Generated selects are optimized to prevent N+1 queries with deep nesting support
- Relation limits prevent over-fetching (configurable per relation)
- Optimistic updates built into mutation hooks
- Query key management via `keys` utility for consistent caching
- Transform functions minimize data transfer by handling null conversions

### Authorization
All operations go through the policy layer (`policies.ts`):
- Policy functions follow pattern: `canModelName(action, ctx, id?)`
- Actions: `'list' | 'read' | 'create' | 'update' | 'delete'`
- Policies receive `FlowCtx` with user/tenant context
- Return `PolicyResult` with:
  - `ok: boolean` - Whether operation is allowed
  - `message?: string` - Error message if denied
  - `where?: any` - Additional Prisma where conditions
  - `data?: any` - Additional data to merge on create/update

### Context Management
The `FlowCtx` type includes:
- `userId?: string` - Current user ID
- `tenantId?: string` - Tenant ID for multi-tenancy (maps to configured `tenantField`)
- `role?: string` - User role for RBAC
- Additional custom fields as needed

Context flows through:
1. Set in `FlowProvider` at app root
2. Automatically passed from client hooks to server methods
3. Available in all policy functions

## Common Issues & Solutions

### Generator Not Found
If you see "Generator at ... could not be found":
1. Ensure generator is built: `npm run build` in generator root
2. Check provider path is correct relative to schema.prisma
3. For local development, use: `provider = "node ../../dist/index.js"`

### Missing Dependencies
The generator requires peer dependencies:
```bash
npm install @tanstack/react-query zod react-hook-form @hookform/resolvers
```

### Prisma Client Import Issues
- Ensure `prismaImport` path is relative to the output directory
- Generate Prisma client first: `npx prisma generate`
- Check that Prisma client output matches expected path

### Type Errors in Generated Code
- Rebuild generator after changes: `npm run build`
- Clear generated directory and regenerate
- Ensure Prisma schema is valid: `npx prisma validate`

## DX Improvements Roadmap

### Planned Enhancements
- **CLI Tool**: Interactive setup and scaffolding
- **VS Code Extension**: Snippets and IntelliSense for generated code
- **Debug Mode**: SQL query logging and performance metrics
- **Migration Support**: Automatic policy migration on schema changes
- **Testing Utilities**: Mock generators and test helpers
- **Real-time Subscriptions**: WebSocket support for live updates