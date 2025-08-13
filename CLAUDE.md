# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **next-prisma-flow-state-engine**, a Prisma generator that creates type-safe database operations, React hooks, and server actions for Next.js applications. The project consists of:
- **Generator** (`/`) - Core Prisma generator that analyzes schemas and generates code
- **Example App** (`/example/`) - Demo blog application showcasing the generated code

## Development Commands

### Generator Development
```bash
# Build the generator TypeScript code
npm run build

# Watch mode for generator development (if needed)
tsc -p tsconfig.json --watch
```

### Example Application
```bash
# Start development server
cd example && npm run dev

# Generate Prisma client + Flow code after schema changes
cd example && npm run generate

# Push schema changes to database
cd example && npm run db:push

# Seed database with sample data
cd example && bun run seed.ts

# Type check the example app
cd example && npm run typecheck

# Test generated output
cd example && bun run test.ts
```

## Architecture

### Code Generation Flow
1. **Schema Analysis**: Generator reads Prisma schema via DMMF (Data Model Meta Format)
2. **Configuration Parsing**: Reads generator config from schema.prisma `generator flow` block
3. **Code Emission**: Generates type-safe operations for each model in organized structure:

#### Generated Directory Structure (per model)
```
/post/
  ├── /server/           # Server-only code
  │   ├── methods.ts     # All Prisma methods (findUnique, create, etc.)
  │   ├── actions.ts     # High-level CRUD actions with validation
  │   ├── queries.ts     # Read queries with caching
  │   ├── selects.ts     # Server-only Prisma select objects
  │   └── index.ts       # Server barrel export
  ├── /client/           # Client-side code
  │   ├── hooks.ts       # React Query hooks with error handling
  │   ├── forms.ts       # Simplified form hooks
  │   └── index.ts       # Client barrel export
  ├── /types/            # Shared types and schemas
  │   ├── schemas.ts     # Zod schemas (create/update/filter)
  │   ├── transforms.ts  # Data transformation utilities
  │   ├── types.ts       # TypeScript type exports
  │   └── index.ts       # Types barrel export
  └── index.ts           # Main barrel with tree-shakeable exports
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
  provider = "node /path/to/generator"
  output = "../generated/flow"
  prismaImport = "../../../lib/prisma"
  
  // Custom selects per model (fields + relations)
  postSelect = ["id","title","content","author","comments"]
  
  // Relation limits and ordering
  postCommentsLimit = 100
  postCommentsOrder = "{ createdAt: 'desc' }"
  
  // Multi-tenancy
  tenantField = "organizationId"
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
- Server-only code: In `server/` directory with `"server-only"` directive
- Client components: In `client/` directory
- Types and schemas: In `types/` directory
- Generated code: Always in `generated/flow/` directory with organized subdirectories

### Type Safety Patterns
- Import from main barrel exports for tree-shaking: `import { usePost } from '@/generated/flow/post'`
- Use server methods for direct Prisma access: `import { PostServer } from '@/generated/flow/post'`
- Types are separated from runtime code for optimal bundle size
- Error handling uses standard exceptions that React Query handles naturally

### Caching Strategy
- Server: Next.js cache tags with automatic invalidation
- Client: TanStack Query with optimistic updates
- Cache keys follow pattern: `['model', filters]`

## Common Tasks

### Using Generated Code

#### Basic Usage
```typescript
// Import from main barrel for tree-shaking
import { usePost, useCreatePost, PostCreateSchema } from '@/generated/flow/post';

// Or import namespaced for clarity
import { PostServer, PostClient, PostTypes } from '@/generated/flow/post';

// Server-side: Use methods for all Prisma operations
const posts = await PostServer.findMany({ where: { published: true } });
const post = await PostServer.findUnique({ where: { id } });

// Client-side: Use hooks for data fetching and mutations
const { data: post } = usePost(id);
const createMutation = useCreatePost();
```

#### Form Handling
```typescript
import { usePostForm } from '@/generated/flow/post';

function EditPost({ id }: { id: string }) {
  const { form, submit, isSubmitting } = usePostForm({ id });
  
  return (
    <form onSubmit={submit}>
      {/* Form fields using form.register() */}
    </form>
  );
}
```

#### Error Handling
```typescript
// Errors are thrown as standard exceptions
try {
  const post = await PostServer.create({ data });
} catch (error) {
  if (error instanceof FlowPolicyError) {
    // Handle permission denied
  } else if (error instanceof FlowValidationError) {
    // Handle validation errors
  }
}
```

### Adding a New Model
1. Add model to `prisma/schema.prisma`
2. Configure selects/limits in generator block if needed
3. Run `npm run generate` to regenerate code
4. Implement policies in `generated/flow/policies.ts`

### Customizing Generated Selects
Add to generator config:
```prisma
[modelName]Select = ["field1", "field2", "relation1"]
[modelName][RelationName]Limit = 50
[modelName][RelationName]Order = "{ createdAt: 'desc' }"
```

### Debugging Generation
- Generated files are in `example/generated/flow/`
- Check console output during `prisma generate` for errors
- Verify DMMF structure with `prisma format --schema=...`

## Important Considerations

### Circular Reference Prevention
The generator automatically prevents circular references in selects by:
- Tracking visited models during select generation
- Setting circular relations to `false`
- Configurable depth limits per relation

### Performance Optimization
- Server-only selects marked with `"server-only"` to prevent client bundle bloat
- Tree-shakeable exports allow importing only what you need
- Generated selects are optimized to prevent N+1 queries
- Relation limits prevent over-fetching
- Optimistic updates built into mutation hooks

### Authorization
All mutations go through the policy layer (`policies.ts`):
- `canList` - List filtering
- `canRead` - Single item access
- `canCreate/Update/Delete` - Mutation permissions
- Policies receive `FlowCtx` with user/tenant context