"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Code } from "lucide-react";

const codeExamples = {
	createHook: `// ✅ Specialized Create Hook
import { todo } from "@/generated/flow";

function CreateTodoForm() {
  // Type-safe create form with TodoCreateInput validation
  const form = todo.hooks.useCreateTodoForm({
    priority: 'MEDIUM',
    userId: 'user-1'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newTodo = await form.submit();
    if (newTodo) {
      // Form auto-resets after successful creation
      alert(\`Created: \${newTodo.title}\`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        {...form.field('title')}
        placeholder="Todo title (required)"
      />
      {form.field('title').error && (
        <span className="error">{form.field('title').error}</span>
      )}
      
      <button 
        type="submit" 
        disabled={!form.isValid || form.loading}
      >
        {form.loading ? 'Creating...' : 'Create Todo'}
      </button>
    </form>
  );
}`,

	updateHook: `// ✅ Specialized Update Hook
import { todo } from "@/generated/flow";

function UpdateTodoForm({ todoId, initialData }) {
  // Type-safe update form with TodoUpdateInput validation
  const form = todo.hooks.useUpdateTodoForm(todoId, initialData);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const updatedTodo = await form.submit();
    if (updatedTodo) {
      alert(\`Updated: \${updatedTodo.title}\`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        {...form.field('title')}
        placeholder="Todo title (optional for updates)"
      />
      
      <select {...form.field('status')}>
        <option value="PENDING">Pending</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
      
      <button 
        type="submit" 
        disabled={!form.isValid || form.loading}
      >
        {form.loading ? 'Updating...' : 'Update Todo'}
      </button>
      
      {/* Update hook provides the ID */}
      <small>Updating todo: {form.id}</small>
    </form>
  );
}`,

	autoSave: `// ⚡ Auto-save Feature
import { todo } from "@/generated/flow";

function AutoSaveForm() {
  const form = todo.hooks.useCreateTodoForm();

  // Enable auto-save with 2 second debounce
  useEffect(() => {
    form.enableAutoSave(2000);
    return () => form.disableAutoSave();
  }, []);

  return (
    <form>
      <input
        {...form.field('title')}
        placeholder="Type and watch auto-save in action"
      />
      <p>Form will auto-save 2 seconds after you stop typing</p>
    </form>
  );
}`,

	validation: `// 🔒 Real-time Validation
import { todo } from "@/generated/flow";

function ValidatedForm() {
  const form = todo.hooks.useCreateTodoForm();

  return (
    <form>
      <input {...form.field('title')} />
      
      {/* Real-time validation feedback */}
      <div className="validation-info">
        <Badge variant={form.isValid ? "success" : "destructive"}>
          {form.isValid ? 'Valid' : 'Invalid'}
        </Badge>
        <Badge variant={form.isDirty ? "secondary" : "outline"}>
          {form.isDirty ? 'Modified' : 'Clean'}
        </Badge>
      </div>

      {/* Field-level validation */}
      {form.field('title').error && (
        <p className="error">{form.field('title').error}</p>
      )}

      {/* Manual validation */}
      <button 
        type="button" 
        onClick={() => form.validate()}
      >
        Validate Form
      </button>
    </form>
  );
}`,

	namespace: `// 🎯 Namespace Import Style
import { todo, category, user } from "@/generated/flow";

function TodoApp() {
  // All hooks are organized by model
  const todoForm = todo.hooks.useCreateTodoForm();
  const todos = todo.hooks.useTodos();
  const categories = category.hooks.useCategories();
  const users = user.hooks.useUsers();

  // Access schemas and types
  const createSchema = todo.schemas.create;
  const updateSchema = todo.schemas.update;

  // Access actions directly
  const deleteTodo = todo.actions.deleteTodo;

  return (
    <div>
      {/* Your component */}
    </div>
  );
}`,

	typescript: `// 🔷 Full TypeScript Support
import { 
  todo, 
  type Todo, 
  type TodoCreateInput, 
  type TodoUpdateInput 
} from "@/generated/flow";

function TypeSafeComponent() {
  const createForm = todo.hooks.useCreateTodoForm();
  const updateForm = todo.hooks.useUpdateTodoForm('todo-id');

  // Type-safe field access
  const titleField: string = createForm.field('title').value;
  const priority: 'LOW' | 'MEDIUM' | 'HIGH' = createForm.field('priority').value;

  // Type-safe data access
  const formData: Partial<TodoCreateInput> = createForm.data;
  const updateData: Partial<TodoUpdateInput> = updateForm.data;

  // Type-safe submission
  const handleCreate = async () => {
    const todo: Todo | null = await createForm.submit();
    if (todo) {
      console.log('Created todo:', todo.title);
    }
  };

  return <div>Fully type-safe!</div>;
}`
};

export function CodeExamplesSection() {
	const [selectedExample, setSelectedExample] = useState('createHook');
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async (text: string) => {
		await navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Card className="border-2 border-emerald-200 bg-emerald-50/50">
			<CardHeader>
				<CardTitle className="text-lg flex items-center gap-2 text-emerald-800">
					<Code className="h-5 w-5" />
					Code Examples & Usage Patterns
				</CardTitle>
				<p className="text-sm text-emerald-700">
					Copy-paste ready examples showing how to use the specialized form hooks
				</p>
			</CardHeader>
			<CardContent>
				<Tabs value={selectedExample} onValueChange={setSelectedExample} className="w-full">
					<TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
						<TabsTrigger value="createHook" className="text-xs">Create Hook</TabsTrigger>
						<TabsTrigger value="updateHook" className="text-xs">Update Hook</TabsTrigger>
						<TabsTrigger value="autoSave" className="text-xs">Auto-save</TabsTrigger>
						<TabsTrigger value="validation" className="text-xs">Validation</TabsTrigger>
						<TabsTrigger value="namespace" className="text-xs">Namespace</TabsTrigger>
						<TabsTrigger value="typescript" className="text-xs">TypeScript</TabsTrigger>
					</TabsList>

					{Object.entries(codeExamples).map(([key, code]) => (
						<TabsContent key={key} value={key} className="mt-4">
							<div className="relative">
								<Button
									size="sm"
									variant="outline"
									className="absolute top-2 right-2 z-10"
									onClick={() => copyToClipboard(code)}
								>
									<Copy className="h-3 w-3 mr-1" />
									{copied ? 'Copied!' : 'Copy'}
								</Button>
								<pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm">
									<code>{code}</code>
								</pre>
							</div>
						</TabsContent>
					))}
				</Tabs>

				{/* Quick Reference */}
				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card className="border-green-200 bg-green-50">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm text-green-800">useCreateTodoForm()</CardTitle>
						</CardHeader>
						<CardContent className="text-xs space-y-1">
							<p>• Uses <code>TodoCreateInputSchema</code></p>
							<p>• Fields marked as required</p>
							<p>• Auto-resets after successful creation</p>
							<p>• Strict validation for new entities</p>
						</CardContent>
					</Card>

					<Card className="border-blue-200 bg-blue-50">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm text-blue-800">useUpdateTodoForm(id, data)</CardTitle>
						</CardHeader>
						<CardContent className="text-xs space-y-1">
							<p>• Uses <code>TodoUpdateInputSchema</code></p>
							<p>• Fields marked as optional</p>
							<p>• Includes ID for update operations</p>
							<p>• Allows partial updates</p>
						</CardContent>
					</Card>
				</div>
			</CardContent>
		</Card>
	);
}