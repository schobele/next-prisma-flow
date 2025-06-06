# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **next-prisma-flow** v0.2.1, a Prisma generator that scaffolds full-stack typed code for Next.js applications with a modern, intuitive developer experience. It generates API routes, server actions, Jotai state management, enhanced React hooks, and smart form integration from Prisma schemas.

### 🚀 What's New in v0.2.1

- **Model-specific namespace exports** - Import everything you need with `import { todos, categories } from './generated/flow'`
- **Unified smart hooks** - One hook with all CRUD operations: `todos.hooks.useTodos()`
- **Specialized form hooks** - Dedicated create and update form hooks with proper type safety
- **Enhanced developer experience** - Intuitive API that works out of the box
- **Backward compatibility** - All v0.1.x APIs still work

### Core Architecture

- **Generator Entry Point**: `index.ts` - Main Prisma generator that reads schema and config
- **Code Generation**: `src/templates/` - Template files for generated code (actions, atoms, hooks, routes, types)
- **Configuration**: `src/config.ts` - Parses generator config from Prisma schema
- **Example Implementation**: `examples/todolist/` - Complete working example with Todo app

### Generated Code Structure

For each model, the generator creates:
- `actions.ts` - Server actions with business logic
- `atoms.ts` - Jotai atoms for state management with optimistic updates
- `hooks.ts` - Enhanced React hooks with unified CRUD operations and form integration
- `routes.ts` - Next.js API route handlers
- `types.ts` - TypeScript type definitions
- `namespace.ts` - Model-specific organized exports

**Enhanced Main Export Structure:**
```typescript
// Modern API - model-specific namespace imports
import { todos, categories } from './generated/flow'

const todos = {
  hooks: {
    useTodos,      // Unified hook with all CRUD operations
    useTodo,       // Individual item hook with form integration
    useCreateTodoForm,  // Specialized create form hook
    useUpdateTodoForm,  // Specialized update form hook
    // ... other utility hooks
  },
  actions: {
    create, update, delete, getAll, getById,
    createMany, deleteMany,
    // ... smart relationship actions
  },
  atoms: {
    todosAtom, todosLoadingAtom, todosErrorAtom,
    // ... all atoms for custom derived state
  },
  types: { Todo, TodoCreateInput, TodoUpdateInput, ... },
  schemas: { create: TodoCreateInputSchema, update: TodoUpdateInputSchema }
}
```

## Development Commands

```bash
# Build the generator (copies to examples/todolist/generator.js)
bun run build

# Run generator directly for testing
bun run dev

# Test the generator
bun test

# Lint and format code
bun run lint
bun run lint:fix

# Test with example project
cd examples/todolist
bun install
bun run generate  # or npx prisma generate
bun run dev       # Start Next.js dev server
```

### Example Project Commands

The todolist example uses these additional commands:

```bash
# Database operations
bun run db:generate  # Generate Prisma client
bun run db:push      # Push schema to database
bun run db:studio    # Open Prisma Studio
bun run db:seed      # Seed database with sample data

# Development
bun run dev          # Next.js with Turbopack
bun run build        # Production build
bun run start        # Production server
```

## Configuration System

The generator uses a flat configuration format in `prisma/schema.prisma`:

```prisma
generator flow {
  provider = "next-prisma-flow"
  output   = "./generated/flow"
  models   = ["User", "Todo", "Category"]
  
  # Model-specific config (lowercase model name + property)
  userSelect     = ["id", "name", "email"]
  userOptimistic = "merge"
  
  todoSelect     = ["id", "title", "status", "userId"]
  todoOptimistic = "overwrite"
  todoPagination = "true"
}
```

### Key Configuration Options

- **select**: Array of fields to expose in API responses (security whitelist)
- **optimistic**: Strategy for optimistic updates ("merge", "overwrite", "manual")
- **pagination**: Enable pagination utilities ("true"/"false")
- **zodPrismaImport**: Path to zod-prisma-types generated schemas (auto-resolved from schema location)
- **prismaImport**: Path to Prisma client instance (auto-resolved from schema location)

### Path Resolution System

The generator automatically resolves relative paths in `prismaImport` and `zodPrismaImport` based on:
- Schema file location (from `options.schemaPath`)
- Generated file nesting level (model files are 1 level deep)
- Absolute imports (starting with @/ or not starting with ./) are preserved as-is

Example path resolution:
```
Schema: prisma/schema.prisma
Config: prismaImport = "../src/client"
Generated: generated/flow/user/actions.ts -> import from "../../src/client"
```

## Template System

Templates in `src/templates/` use string interpolation for code generation:
- Each template exports a function that takes model data and returns generated code
- Templates handle imports, type definitions, and business logic patterns
- Generated code follows Next.js App Router conventions

## State Management Architecture

The generated code uses Jotai for state management with:
- **Base atoms**: Hold entity maps (Record<id, Entity>)
- **Derived atoms**: Computed views (lists, loading states)
- **Action atoms**: Write-only atoms for mutations
- **Optimistic updates**: Immediate UI updates with server sync

## Usage Examples

### 🎯 Modern API (v0.2.x)

```typescript
// app/page.tsx
import { todos, categories } from './generated/flow'

export default function TodoApp() {
  // One hook, everything you need
  const { 
    data: todoList, 
    createTodo, 
    updateTodo, 
    deleteTodo,
    loading, 
    error 
  } = todos.hooks.useTodos()
  
  const { data: categoryList } = categories.hooks.useCategories()
  
  // Specialized form hooks with auto-validation
  const createForm = todos.hooks.useCreateTodoForm()
  const updateForm = todos.hooks.useUpdateTodoForm(id, todoData)
  
  return (
    <div>
      <form onSubmit={createForm.submit}>
        <input {...createForm.field('title')} placeholder="Todo title" />
        <button type="submit" disabled={!form.isValid || form.loading}>
          Add Todo
        </button>
      </form>
      
      {todoList.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  )
}
```

### Individual Item Management

```typescript
// components/TodoItem.tsx
import { todos } from './generated/flow'

function TodoItem({ id }: { id: string }) {
  // Individual item with form integration
  const { data: todo, form, update, delete: deleteTodo } = todos.hooks.useTodo(id)
  
  if (!todo) return <div>Loading...</div>
  
  return (
    <div>
      <form onSubmit={updateForm.submit}>
        <input {...updateForm.field('title')} />
        <button type="submit">Update</button>
      </form>
      <button onClick={() => deleteTodo()}>Delete</button>
    </div>
  )
}
```

### Advanced Custom State

```typescript
// hooks/useMyTodos.ts
import { atom } from 'jotai'
import { todos } from './generated/flow'

// Direct atom access for custom derived state
const { todosAtom } = todos.atoms

export const myTodosAtom = atom((get) => {
  const allTodos = get(todosAtom)
  return Object.values(allTodos).filter(t => t.userId === currentUserId)
})

export const urgentTodosAtom = atom((get) => {
  const myTodos = get(myTodosAtom)
  return myTodos.filter(t => t.priority === 'HIGH' && t.status !== 'COMPLETED')
})
```

### Programmatic Actions

```typescript
// utils/todoHelpers.ts
import { todos } from './generated/flow'

// Direct action access for programmatic use
export async function bulkMarkComplete(todoIds: string[]) {
  await Promise.all(
    todoIds.map(id => 
      todos.actions.update(id, { status: 'COMPLETED' })
    )
  )
}

export async function createTodoFromTemplate(template: TodoTemplate) {
  return await todos.actions.create({
    title: template.title,
    description: template.description,
    priority: template.priority,
    userId: getCurrentUserId()
  })
}
```

## Important Development Notes

- Always run `bun run build` after template changes to update the example
- The generator copies itself to `examples/todolist/generator.js` for local testing
- Use the todolist example to validate changes before publishing
- Generated code should follow the existing patterns for consistency
- Security: Always configure `select` arrays to exclude sensitive fields
- Clean, modern API focused on v0.2.x patterns