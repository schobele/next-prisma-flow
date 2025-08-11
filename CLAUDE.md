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
3. **Code Emission**: Generates type-safe operations for each model:
   - `actions.server.ts` - Server actions for mutations
   - `hooks.ts` - React Query hooks
   - `queries.server.ts` - Server-side queries
   - `selects.ts` - Prisma select objects with circular reference prevention
   - `writes.ts` - Write/mutation schemas
   - `zod.ts` - Zod validation schemas
   - `forms.ts` - React Hook Form components

### Key Generator Files
- `src/index.ts` - Main generator entry point
- `src/config.ts` - Configuration parsing from generator block
- `src/dmmf.ts` - DMMF utilities for schema analysis
- `src/emit/runtime.ts` - Core runtime generation (FlowCtx, cache, policies)
- `src/emit/model/*.ts` - Per-model code generators

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
- Server-only code: `.server.ts` extension
- Client components: Regular `.ts`/`.tsx`
- Generated code: Always in `generated/flow/` directory

### Type Safety Patterns
- Use generated types from `selects.ts` for Prisma queries
- Use Zod schemas from `zod.ts` for validation
- Never bypass the generated policy layer for mutations

### Caching Strategy
- Server: Next.js cache tags with automatic invalidation
- Client: TanStack Query with optimistic updates
- Cache keys follow pattern: `['model', filters]`

## Common Tasks

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
- Generated selects are optimized to prevent N+1 queries
- Relation limits prevent over-fetching
- Use `[Model]ListSelect` for lists, `[Model]DeepSelect` for single items

### Authorization
All mutations go through the policy layer (`policies.ts`):
- `canList` - List filtering
- `canRead` - Single item access
- `canCreate/Update/Delete` - Mutation permissions
- Policies receive `FlowCtx` with user/tenant context