# 🚀 Multi-Tenant Todo App - Flow Demo

A production-ready demonstration of the next-prisma-flow generator showcasing type-safe, multi-tenant database operations with automatic tenant isolation.

## 🎯 What This Demo Shows

### 1. **Multi-Tenant Architecture**
- **3 Demo Companies**: Acme Corp (Pro), StartupFlow (Free), TechSolutions (Enterprise)
- **4 Demo Users**: Different roles (admin, member, viewer) across companies
- **Complete Data Isolation**: Each company's data is automatically filtered by `companyId`
- **Plan-Based Features**: Different capabilities based on subscription plans

### 2. **Flow Generator Features**

#### **Type-Safe Database Operations**
```typescript
// All operations are automatically tenant-filtered
const todos = await TodoServer.findMany({
  where: { status: 'TODO' }
  // companyId filter added automatically by Flow!
});

// Client hooks with React Query integration
const { data } = useTodoList({
  where: { status: 'IN_PROGRESS' }
  // Uses companyId from FlowCtx automatically
});
```

#### **Automatic Tenant Filtering**
- **Transparent**: No manual `companyId` filters needed
- **Secure**: Impossible to access other company's data
- **Configurable**: Set via `tenantField = "companyId"` in generator config

#### **Smart Form Management**
```typescript
// Auto-detecting create vs update modes
const { form, submit, isSubmitting } = useTodoForm({ 
  id: editingTodo?.id,
  autosave: {
    enabled: true,
    debounceMs: 1000,
    fields: ['title', 'description', 'status'],
    onFieldSave: (field) => toast.success(`${field} saved`),
  }
});
```

#### **Policy-Based Authorization**
```typescript
// Policies enforce tenant boundaries + role permissions
export async function canTodo(action, ctx, id) {
  if (ctx.user.role === 'viewer' && action !== 'read') {
    return { ok: false, message: 'Viewers can only read' };
  }
  return { ok: true, where: { companyId: ctx.tenantId } };
}
```

## 🧪 How to Test Multi-Tenancy

### Step 1: Access the Demo
1. Visit `http://localhost:3000`
2. You'll see a login screen with 4 demo users from 3 companies

### Step 2: Test Data Isolation
1. **Login as John Doe (Acme Corp Admin)**
   - See Acme Corp's todos, lists, and tags
   - Note the tenant ID in debug panel (bottom-right)

2. **Switch to Alice Johnson (StartupFlow Admin)**
   - Click the user dropdown in top-right
   - Select Alice Johnson
   - Observe completely different data set
   - Different company plan and limits

3. **Try Bob Wilson (TechSolutions Viewer)**
   - Limited permissions (viewer role)
   - Can see data but cannot create/edit

### Step 3: Test Flow Features
1. **Create a Todo** - Watch console logs showing Flow operations
2. **Edit with Autosave** - Edit todo title/description, see real-time saves
3. **Search & Filter** - Test real-time search with tenant isolation
4. **Role Permissions** - Try operations with different user roles

### Step 4: Developer Experience
1. **Check Browser Console** - Detailed Flow operation logs
2. **Debug Panel** - Bottom-right shows current tenant context
3. **Network Tab** - See optimistic updates and cache invalidation

## 🏗️ Architecture Highlights

### Database Schema
```prisma
model Company {
  id       String @id @default(cuid())
  name     String
  plan     String @default("free") // free, pro, enterprise
  
  users    User[]
  todos    Todo[]
  lists    List[]
  tags     Tag[]
}

model Todo {
  id        String  @id @default(cuid())
  title     String
  companyId String  // 🔑 Tenant key
  company   Company @relation(fields: [companyId], references: [id])
  // ... other fields
}
```

### Flow Generator Config
```prisma
generator flow {
  provider = "node ../../dist/index.js"
  output   = "../lib/flow"
  tenantField = "companyId"  // 🎯 Enables multi-tenancy
  
  // Smart select configurations
  todoSelect = ["id", "title", "status", "company", "list", "tags"]
  
  // Relation limits and ordering
  listTodosLimit = 100
  listTodosOrder = "{ orderIndex: 'asc' }"
}
```

### Auth Integration
```typescript
// FlowCtx automatically passed to all operations
const flowCtx: FlowCtx = {
  user: { id: session.user.id, roles: [session.user.role] },
  tenantId: session.company.id, // 🔑 Key for tenant filtering
};

// Wrap app with FlowProvider
<FlowProvider ctx={flowCtx}>
  <App />
</FlowProvider>
```

## 📋 Generated Code Structure

```
lib/flow/
├── core/           # Flow runtime (ctx, cache, errors)
├── policies.ts     # Authorization rules
├── todo/          # Todo model operations
│   ├── client/    # React hooks, forms
│   ├── server/    # Prisma methods, actions, queries
│   └── types/     # Zod schemas, TypeScript types
├── list/          # List model operations
├── tag/           # Tag model operations
└── company/       # Company model operations (multi-tenant root)
```

## 🚀 Key Benefits Demonstrated

### For Developers
- **Zero Configuration**: Multi-tenancy works automatically
- **Type Safety**: Full TypeScript support across stack
- **Developer Experience**: Rich debugging and logging
- **Performance**: Automatic caching and optimistic updates

### For Applications
- **Security**: Impossible to leak cross-tenant data
- **Scalability**: Efficient queries with built-in limits
- **Maintainability**: Generated code stays in sync with schema
- **Feature Complete**: CRUD, search, filters, real-time updates

### For SaaS Products
- **Multi-Tenancy**: Production-ready tenant isolation
- **Role-Based Access**: Flexible permission system
- **Plan Enforcement**: Feature gates based on subscription
- **Audit Ready**: Built-in logging and operation tracking

## 🔍 What to Look For

1. **Automatic Filtering**: Notice queries never manually add `companyId`
2. **Type Safety**: IntelliSense and compile-time errors prevent mistakes
3. **Performance**: Watch optimistic updates and smart caching
4. **Security**: Try to access other company data (you can't!)
5. **DX**: Rich error messages and debugging information

## 🎨 Customization Examples

The demo shows how to:
- Integrate with authentication systems
- Customize generated selects and relations
- Implement complex policies with role/plan checks
- Add real-time features with React Query
- Build production-ready UIs with generated hooks

---

**💡 Pro Tip**: Open browser DevTools console to see detailed Flow operation logs and understand how tenant filtering works under the hood!