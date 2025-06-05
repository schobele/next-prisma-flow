# TodoList - Next Prisma Flow v0.2.0 Example

This example demonstrates the enhanced Next Prisma Flow v0.2.0 API with model-specific namespaces, unified hooks, and smart form integration.

## 🚀 New Features Showcased

### Model-Specific Namespace Imports
```typescript
import { todo, category } from './generated/flow'
```

### Unified Smart Hooks
```typescript
// Everything you need in one hook
const { 
  data: todoData, 
  loading, 
  updateTodo, 
  deleteTodo 
} = todo.hooks.useTodos();

const { data: categoryData } = category.hooks.useCategories();
```

### Zero-Config Smart Forms
```typescript
// Auto-validation, error handling, and submission
const form = todo.hooks.useTodoForm(initialData);

// Field helpers with built-in validation
<input {...form.field('title')} placeholder="Todo title" />

// Smart submission
await form.submit();
```

### Direct Action Access
```typescript
// Programmatic use
await todo.actions.create({ title: 'New Todo' });
await todo.actions.update(id, { completed: true });
```

### Custom Derived State
```typescript
// Direct atom access for advanced use cases
const { todosAtom } = todo.atoms;
const myTodos = atom((get) => {
  const allTodos = get(todosAtom);
  return Object.values(allTodos).filter(t => t.userId === myId);
});
```

## 🎯 Key Components

- **`app/page.tsx`** - Main todo list with enhanced hooks
- **`components/enhanced-todo-form.tsx`** - Smart form with auto-validation
- **`generated/flow/`** - Generated code with namespace exports

## 🏃‍♂️ Running the Example

```bash
# Install dependencies
bun install

# Generate Prisma client and Flow code
bun run generate

# Start development server
bun run dev
```

Visit http://localhost:3000 to see the enhanced API in action!

## 📚 Generated API Structure

```typescript
const todo = {
  hooks: {
    useTodos(),       // Unified hook with all CRUD
    useTodo(id),      // Individual item with form
    useTodoForm(),    // Zero-config smart form
    useTodoExists(id) // Utility hook
  },
  actions: {
    create, update, delete, getAll, getById,
    createMany, deleteMany
  },
  atoms: {
    todosAtom, todosLoadingAtom, todosErrorAtom,
    // ... all atoms for custom state
  },
  types: { Todo, TodoCreateInput, TodoUpdateInput, ... },
  schemas: { create: TodoCreateInputSchema, update: TodoUpdateInputSchema }
}
```