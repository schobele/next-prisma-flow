# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.6] - 2025-08-02 🔍 Fuzzy Search & Enhanced Configuration

### ✨ Major New Features

#### Fuzzy Search with Fuse.js Integration
- **Type-Safe Search**: Built-in fuzzy search with full TypeScript support for property paths
- **Smart Auto-complete**: TypeScript knows all valid search paths including nested relationships
- **Flexible Configuration**: Support for all Fuse.js options (threshold, keys, includeScore, etc.)
- **Performance Optimized**: Automatic caching of Fuse instances for efficiency
- **Intuitive API**: Clean destructured return: `const { search, results, query } = posts.hooks.useSearch()`

#### Enhanced Model Configuration
- **"All" Models Option**: Set `models = "all"` to generate code for every model in your schema
- **Improved Defaults**: Smart defaults for search keys based on model's string fields
- **Security First**: Sensitive fields like 'password', 'hash', 'token' automatically excluded from search

### 🔧 Technical Improvements
- **Recursive Type Helpers**: `PathsToStringProps` type extracts all valid nested paths from ModelType
- **Atom Family Optimization**: Custom equality function prevents infinite render loops
- **Enhanced Templates**: Improved code generation with proper template literal escaping
- **Better Error Handling**: More informative error messages for search operations

### 📚 Documentation Updates
- **Search Examples**: Comprehensive documentation of search API with TypeScript examples
- **Configuration Guide**: Updated README with "all" models option
- **Best Practices**: Guidelines for search configuration and performance optimization

### 🎯 Usage Examples

```typescript
// Basic search with smart defaults
const { search, results, query } = posts.hooks.useSearch();

// Advanced search with type-safe configuration
const { search, results, query } = posts.hooks.useSearch({
  keys: [
    "title",           // Direct fields
    "author.name",     // ✅ Nested paths - TypeScript knows these!
    "category.name",   // ✅ Relationship fields
    // "author.invalid" // ❌ TypeScript error
  ],
  threshold: 0.3,      // Fuzzy tolerance
  includeScore: true,  // Include match scores
});

// Use in your component
<input value={query} onChange={(e) => search(e.target.value)} />
{results.map(post => <PostCard key={post.id} post={post} />)}
```

### 🔄 Backward Compatibility
- **Fully Backward Compatible**: All existing hooks and APIs continue to work
- **Legacy Search Support**: String parameter still supported: `searchAtom("query")`
- **Gradual Adoption**: New search features are opt-in

---

## [0.2.4] - 2024-12-01 🎯 Enhanced Form System

### ✨ Major Form Enhancements

#### Smart ModelType Transformation System
- **Automatic Mode Detection**: Forms now auto-detect create vs update mode based on whether an instance is provided
- **Smart Data Transformation**: Nested objects like `author: { id, name }` are automatically transformed to `authorId` for form inputs
- **Enhanced Transform Options**: New `fromModelType` transform function for custom ModelType → form input conversion
- **Type-Safe Transformations**: Full TypeScript support throughout the form transformation pipeline

#### Improved Edit Form Handling
- **Pre-populated Forms**: Edit forms now properly extract and pre-populate relationship IDs from nested objects
- **Seamless Data Flow**: Automatic conversion between rich ModelType (with nested objects) and flat form input schemas
- **Array Handling**: Arrays like `comments` are automatically skipped for form inputs
- **Flexible Customization**: Custom transformation functions override defaults when needed

#### Enhanced Form Factory System
- **`defaultModelTypeTransform`**: Built-in function handles common transformation patterns
- **Flexible Options**: `fromModelType`, `toCreateInput`, and `toUpdateInput` transform functions
- **Better Error Handling**: Improved error messages and linter compliance
- **Template Literals**: Updated to use template literals instead of string concatenation

### 🔧 Technical Improvements
- **Linter Compliance**: Fixed template literal and unnecessary continue statement issues
- **Code Quality**: Improved readability and maintainability of transformation logic
- **TypeScript Safety**: Enhanced type inference for transformation functions
- **Consistent API**: Unified transformation approach across baseline and generator templates

### 📚 Documentation Updates
- **Enhanced Examples**: Updated CLAUDE.md with comprehensive form transformation examples
- **README Improvements**: Added detailed documentation of new form features and transformation patterns
- **Best Practices**: New recommendations for relationship handling and form configuration

### 🎯 Usage Examples

```typescript
// Enhanced form with automatic transformation
const form = posts.hooks.usePostForm(postInstance, {
  transform: {
    // Automatic transformation handles common patterns:
    // - author: { id, name } → authorId
    // - category: { id, name } → categoryId
    // - Arrays are automatically skipped
    fromModelType: (post) => ({
      title: post.title,
      description: post.description,
      authorId: post.author?.id || post.authorId,
      categoryId: post.category?.id || post.categoryId,
    }),
  },
});

// Form automatically detects mode and handles data appropriately
<form onSubmit={form.handleSubmit}>
  <input {...form.register('title')} />
  <select {...form.register('authorId')}>
    {/* Pre-populated with current author in edit mode */}
  </select>
  <button type="submit">
    {form.mode === 'create' ? 'Create Post' : 'Update Post'}
  </button>
</form>
```

### 🔄 Backward Compatibility
- **Fully Backward Compatible**: All existing form usage continues to work without changes
- **Optional Enhancements**: New transformation features are opt-in via the `transform` options
- **Default Behavior**: Smart defaults handle common patterns automatically

---

## [0.2.0] - 2025-06-03 🚀 Major Release

### ✨ Major New Features

#### Model-Specific Namespace Exports
- **Enhanced API**: New modern API with organized namespace imports
- Import everything you need: `import { todos, categories } from './generated/flow'`
- Organized access: `todos.hooks.useTodos()`, `todos.actions.create()`, `todos.atoms.todosAtom`

#### Enhanced Unified Hooks
- **`useTodos()`** - One hook with all CRUD operations, loading states, and error handling
- **`useTodo(id)`** - Individual item management with integrated form functionality
- **`useForm()`** - Zero-config smart form with automatic validation and submission

#### Smart Form Integration
- Automatic field validation using Zod schemas
- Built-in error handling and display
- Auto-save capabilities with debouncing
- Form state management (isDirty, isValid, loading)
- Field helpers with onChange, onBlur, and error handling

#### Enhanced Developer Experience
- Works immediately without providers or configuration
- Comprehensive TypeScript inference and safety
- Maintains all existing optimistic updates and error handling
- Development-friendly debugging tools and state inspection

### 🔄 Backward Compatibility
- **All v0.1.x APIs remain fully supported**
- Legacy hooks available as `useUserV1`, `useCreateUser`, etc.
- Gradual migration path - no breaking changes for existing code
- Direct imports still work: `import { useTodos, createTodo } from './generated/flow'`

### 🏗️ Technical Improvements
- Enhanced template system with namespace organization
- Improved state management with better derived atoms
- Enhanced store utilities and debugging capabilities
- Better error handling and loading state management

### 📚 Documentation & Examples
- Complete API documentation with usage examples
- Enhanced todolist example showcasing new features
- Comprehensive type definitions and IntelliSense support

### 🎯 Usage Examples

```typescript
// 🆕 Modern API (v0.2.0+)
import { todos, categories } from './generated/flow'

// Everything in one hook
const { data, createTodo, updateTodo, deleteTodo, loading, error } = todos.hooks.useTodos()

// Zero-config forms
const form = todos.hooks.useForm()
await form.submit()

// 📦 Legacy API (v0.1.x) - Still supported
import { useTodos, createTodo } from './generated/flow'
const { todos, loading } = useTodos()
```

---

## [0.1.51] - 2024-12-01

### Added
- 🚀 Initial release of Next Prisma Flow Generator
- ⚡ Full-stack code generation from Prisma schema
- 🔒 End-to-end type safety with TypeScript and Zod validation
- 🎯 Smart relationship handling with circular reference prevention
- 📦 Server actions with automatic cache invalidation
- 🌊 Jotai atoms for reactive state management
- 🎣 React hooks with optimistic updates
- 🛤️ API route handlers for RESTful endpoints
- 📝 Comprehensive type definitions
- 🔄 Batch operations with proper CreateManyInput schemas
- 🎨 Barrel exports for clean imports
- 📚 TodoList example application

### Features
- **Type-Safe Code Generation**: Generates fully typed server actions, hooks, atoms, and types
- **Smart Select Objects**: Configurable field selection with relationship filtering
- **Circular Reference Prevention**: Intelligent handling of model relationships to prevent infinite loops
- **Optimistic Updates**: Built-in optimistic UI updates with automatic rollback on errors
- **Cache Invalidation**: Automatic Next.js cache tag invalidation on mutations
- **Zod Validation**: Input validation using Zod schemas with proper type inference
- **Batch Operations**: Efficient `createMany` and `deleteMany` operations
- **Flexible Configuration**: Model-specific configuration for select fields, optimistic strategies, and more

### Configuration
```prisma
generator flow {
  provider = "next-prisma-flow"
  output   = "./generated/flow"
  models   = ["User", "Post", "Category"]
  
  # Model-specific configuration
  userSelect = ["id", "name", "email"]
  postSelect = ["id", "title", "content", "author"]
}
```

### Generated Code Structure
```
generated/flow/
├── index.ts              # Main exports
├── store.ts              # Central Jotai store
├── actions.ts            # Barrel exports for actions
├── atoms.ts              # Barrel exports for atoms
├── hooks.ts              # Barrel exports for hooks
├── types.ts              # Barrel exports for types
└── [model]/
    ├── actions.ts        # Server actions
    ├── atoms.ts          # Jotai atoms
    ├── hooks.ts          # React hooks
    ├── routes.ts         # API routes
    └── types.ts          # TypeScript types
```

### Requirements
- Node.js >= 18.0.0
- TypeScript >= 5.0.0
- Prisma >= 5.0.0
- Next.js 13.4+ (App Router)
- React 18+
- Jotai
- Zod
