"use client";

import { EnhancedTodoForm } from "@/components/enhanced-todo-form";
import { SpecializedFormsDemo } from "@/components/specialized-todo-forms";
import { CodeExamplesSection } from "@/components/code-examples";
import { HookComparisonSection } from "@/components/hook-comparison";
import { CategoryFilter } from "@/components/category-filter";
import { TodoItem } from "@/components/todo-item";
import { TodoStats } from "@/components/todo-stats";
import { FlowProviderDemo } from "@/components/flow-provider-demo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { todo, category, type Todo } from "@/generated/flow";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

type TodoStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export default function TodoListPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("__all__");
	const [selectedStatus, setSelectedStatus] = useState<string>("__all__");
	const [showAddForm, setShowAddForm] = useState(false);
	const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

	// Enhanced unified hooks - everything you need in one place
	const { data: todoData, loading: todosLoading, updateTodo, deleteTodo } = todo.hooks.useTodos();

	const { data: categoryData } = category.hooks.useCategories();

	// Filter and search todos
	const filteredTodos = useMemo(() => {
		if (!todoData) return [];

		return todoData.filter((todo) => {
			// Search filter
			if (
				searchQuery &&
				!todo.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!todo.description?.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}

			// Category filter
			if (selectedCategory !== "__all__" && todo.categoryId !== selectedCategory) {
				return false;
			}

			// Status filter
			if (selectedStatus !== "__all__" && todo.status !== selectedStatus) {
				return false;
			}

			return true;
		});
	}, [todoData, searchQuery, selectedCategory, selectedStatus]);

	// Group todos by status
	const todosByStatus = useMemo(() => {
		const grouped: Record<TodoStatus, Todo[]> = {
			PENDING: [],
			IN_PROGRESS: [],
			COMPLETED: [],
		};

		for (const todo of filteredTodos) {
			if (grouped[todo.status as TodoStatus]) {
				grouped[todo.status as TodoStatus].push(todo);
			}
		}

		return grouped;
	}, [filteredTodos]);

	// Handlers - simplified with the enhanced unified API
	const handleUpdateTodo = async (id: string, updates: any) => {
		await updateTodo(id, updates);
	};

	const handleDeleteTodo = async (id: string) => {
		await deleteTodo(id);
	};

	const handleToggleComplete = async (todo: Todo) => {
		const newStatus: TodoStatus = todo.status === "COMPLETED" ? "PENDING" : "COMPLETED";
		await updateTodo(todo.id, { status: newStatus });
	};

	const handleEditTodo = (todo: Todo) => {
		setEditingTodo(todo);
		setShowAddForm(false); // Ensure add form is closed
	};

	const handleCloseEditForm = () => {
		setEditingTodo(null);
	};

	// Calculate statistics
	const stats = {
		total: todoData?.length || 0,
		completed: todoData?.filter((t) => t.status === "COMPLETED").length || 0,
		pending: todoData?.filter((t) => t.status === "PENDING").length || 0,
		inProgress: todoData?.filter((t) => t.status === "IN_PROGRESS").length || 0,
		overdue:
			todoData?.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED").length || 0,
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">TodoList v0.2.1</h1>
							<p className="text-gray-600 dark:text-gray-300">
								Enhanced API with FlowProvider, specialized form hooks & type safety
							</p>
						</div>
						<div className="flex gap-2">
							<Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700 text-white">
								<Plus className="h-4 w-4 mr-2" />
								Create Todo
							</Button>
							<Button
								onClick={() => {
									const firstTodo = todoData?.[0];
									if (firstTodo) {
										setEditingTodo(firstTodo);
									}
								}}
								disabled={!todoData?.length}
								variant="outline"
								className="border-blue-300 text-blue-700 hover:bg-blue-50"
							>
								Edit First Todo
							</Button>
						</div>
					</div>

					{/* Statistics */}
					<TodoStats stats={stats} />

					{/* FlowProvider Demo */}
					<FlowProviderDemo />

					{/* Documentation and Examples Accordion */}
					<Card className="mt-6 border-2 border-blue-200 bg-blue-50/50">
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								📚 Next Prisma Flow v0.2.1 Documentation
							</CardTitle>
							<p className="text-sm text-gray-600">Explore specialized form hooks, code examples, and usage patterns</p>
						</CardHeader>
						<CardContent className="p-0">
							<Accordion type="single" collapsible className="w-full">
								{/* Quick Start Guide */}
								<AccordionItem value="quick-start" className="border-b-0">
									<AccordionTrigger className="px-6 py-4 hover:bg-blue-50/50">
										<div className="flex items-center gap-2">
											🚀 <span className="font-semibold">Quick Start: Specialized Form Hooks</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-6 pb-4">
										<div className="space-y-4">
											<p className="text-sm text-gray-600">
												Experience the new type-safe form hooks with dedicated create and update patterns:
											</p>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="bg-white p-4 rounded border border-green-200">
													<code className="text-green-600 font-semibold text-sm">useCreateTodoForm()</code>
													<ul className="text-xs mt-2 space-y-1 text-gray-600">
														<li>✅ Strict validation with TodoCreateInputSchema</li>
														<li>✅ Required fields enforced</li>
														<li>✅ Auto-reset after successful creation</li>
														<li>✅ Perfect type inference</li>
													</ul>
												</div>
												<div className="bg-white p-4 rounded border border-blue-200">
													<code className="text-blue-600 font-semibold text-sm">useUpdateTodoForm(id, data)</code>
													<ul className="text-xs mt-2 space-y-1 text-gray-600">
														<li>✅ Partial updates with TodoUpdateInputSchema</li>
														<li>✅ All fields optional</li>
														<li>✅ ID management included</li>
														<li>✅ Smart data filtering</li>
													</ul>
												</div>
											</div>
											<div className="mt-4">
												<SpecializedFormsDemo />
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>

								{/* Code Examples */}
								<AccordionItem value="code-examples" className="border-b-0">
									<AccordionTrigger className="px-6 py-4 hover:bg-blue-50/50">
										<div className="flex items-center gap-2">
											💻 <span className="font-semibold">Code Examples & Usage Patterns</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-6 pb-4">
										<CodeExamplesSection />
									</AccordionContent>
								</AccordionItem>

								{/* Architecture Guide */}
								<AccordionItem value="architecture" className="border-b-0">
									<AccordionTrigger className="px-6 py-4 hover:bg-blue-50/50">
										<div className="flex items-center gap-2">
											🏗️ <span className="font-semibold">Architecture: Specialized vs Universal Hooks</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-6 pb-4">
										<HookComparisonSection />
									</AccordionContent>
								</AccordionItem>

								{/* API Reference */}
								<AccordionItem value="api-reference" className="border-b-0">
									<AccordionTrigger className="px-6 py-4 hover:bg-blue-50/50">
										<div className="flex items-center gap-2">
											⚡ <span className="font-semibold">API Reference & Generated Hooks</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-6 pb-4">
										<div className="space-y-6">
											{/* Namespace Exports */}
											<div>
												<h4 className="font-semibold text-sm mb-3 text-gray-700">Namespace Exports</h4>
												<div className="bg-gray-50 p-4 rounded-lg">
													<pre className="text-xs text-gray-700">
														{`import { todo } from '@/generated/flow';

// Unified hooks for todo management
const todos = todo.hooks.useTodos();
const todoItem = todo.hooks.useTodo(id);

// Specialized form hooks
const createForm = todo.hooks.useCreateTodoForm();
const updateForm = todo.hooks.useUpdateTodoForm(id, data);

// Server actions
await todo.actions.createTodo(data);
await todo.actions.updateTodo(id, updates);

// Types and schemas
const schema = todo.types.TodoCreateInputSchema;
type TodoType = todo.types.Todo;`}
													</pre>
												</div>
											</div>

											{/* Hook Signatures */}
											<div>
												<h4 className="font-semibold text-sm mb-3 text-gray-700">Hook Signatures</h4>
												<div className="space-y-3">
													<div className="bg-green-50 p-3 rounded border border-green-200">
														<div className="text-xs font-mono text-green-700 mb-1">
															useCreateTodoForm(initialData?: Partial&lt;TodoCreateInput&gt;)
														</div>
														<div className="text-xs text-gray-600">
															{"Returns: { data, isValid, isDirty, errors, field, submit, reset, loading }"}
														</div>
													</div>
													<div className="bg-blue-50 p-3 rounded border border-blue-200">
														<div className="text-xs font-mono text-blue-700 mb-1">
															useUpdateTodoForm(id: string, initialData?: Partial&lt;TodoUpdateInput&gt;)
														</div>
														<div className="text-xs text-gray-600">
															{"Returns: { data, isValid, isDirty, errors, field, submit, reset, loading, id }"}
														</div>
													</div>
												</div>
											</div>

											{/* Field Helper */}
											<div>
												<h4 className="font-semibold text-sm mb-3 text-gray-700">Field Helper Pattern</h4>
												<div className="bg-purple-50 p-4 rounded-lg">
													<pre className="text-xs text-purple-700">
														{`const form = useCreateTodoForm();

// Auto-wired field helper
const titleField = form.field('title');
// Returns: { name, value, onChange, onBlur, error, required }

// Use with any input component
<input {...titleField} />
<TextField {...titleField} />
<MyCustomInput {...titleField} />`}
													</pre>
												</div>
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							</Accordion>
						</CardContent>
					</Card>
				</div>

				{/* Filters */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-lg">Filters</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-wrap gap-4 items-center">
							{/* Search */}
							<div className="relative flex-1 min-w-64">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
								<Input
									placeholder="Search todos..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>

							{/* Category Filter */}
							<CategoryFilter
								categories={categoryData || []}
								selectedCategory={selectedCategory}
								onCategoryChange={setSelectedCategory}
							/>

							{/* Status Filter */}
							<Select value={selectedStatus} onValueChange={setSelectedStatus}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__all__">All Status</SelectItem>
									<SelectItem value="PENDING">Pending</SelectItem>
									<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
									<SelectItem value="COMPLETED">Completed</SelectItem>
								</SelectContent>
							</Select>

							{/* Clear Filters */}
							{(searchQuery || selectedCategory !== "__all__" || selectedStatus !== "__all__") && (
								<Button
									variant="outline"
									onClick={() => {
										setSearchQuery("");
										setSelectedCategory("__all__");
										setSelectedStatus("__all__");
									}}
								>
									Clear Filters
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Todo Lists */}
				<Tabs defaultValue="all" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="all">All Todos</TabsTrigger>
						<TabsTrigger value="pending">Pending</TabsTrigger>
						<TabsTrigger value="progress">In Progress</TabsTrigger>
						<TabsTrigger value="completed">Completed</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="mt-6">
						<div className="space-y-4">
							{todosLoading ? (
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
									))}
								</div>
							) : filteredTodos && filteredTodos.length > 0 ? (
								filteredTodos
									.filter((todo) => Boolean(todo))
									.map((todo) => (
										<TodoItem
											key={todo.id}
											todo={todo}
											onToggleComplete={() => handleToggleComplete(todo)}
											onUpdate={(updates) => handleUpdateTodo(todo.id, updates)}
											onDelete={() => handleDeleteTodo(todo.id)}
											onEdit={() => handleEditTodo(todo)}
										/>
									))
							) : (
								<Card className="py-12 border-2 border-dashed border-gray-300">
									<CardContent className="text-center">
										<p className="text-gray-500 dark:text-gray-400 mb-4">
											No todos found. Try the new specialized form hooks!
										</p>
										<div className="flex gap-2 justify-center">
											<Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
												<Plus className="h-4 w-4 mr-2" />
												useCreateTodoForm()
											</Button>
										</div>
										<p className="text-xs text-gray-400 mt-2">Type-safe • Auto-validation • Auto-save</p>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>

					<TabsContent value="pending" className="mt-6">
						<div className="space-y-4">
							{todosByStatus.PENDING?.map((todo) => (
								<TodoItem
									key={todo.id}
									todo={todo}
									onToggleComplete={() => handleToggleComplete(todo)}
									onUpdate={(updates) => handleUpdateTodo(todo.id, updates)}
									onDelete={() => handleDeleteTodo(todo.id)}
									onEdit={() => handleEditTodo(todo)}
								/>
							)) || (
								<Card className="py-8">
									<CardContent className="text-center">
										<p className="text-gray-500">No pending todos</p>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>

					<TabsContent value="progress" className="mt-6">
						<div className="space-y-4">
							{todosByStatus.IN_PROGRESS?.map((todo) => (
								<TodoItem
									key={todo.id}
									todo={todo}
									onToggleComplete={() => handleToggleComplete(todo)}
									onUpdate={(updates) => handleUpdateTodo(todo.id, updates)}
									onDelete={() => handleDeleteTodo(todo.id)}
									onEdit={() => handleEditTodo(todo)}
								/>
							)) || (
								<Card className="py-8">
									<CardContent className="text-center">
										<p className="text-gray-500">No todos in progress</p>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>

					<TabsContent value="completed" className="mt-6">
						<div className="space-y-4">
							{todosByStatus.COMPLETED?.map((todo) => (
								<TodoItem
									key={todo.id}
									todo={todo}
									onToggleComplete={() => handleToggleComplete(todo)}
									onUpdate={(updates) => handleUpdateTodo(todo.id, updates)}
									onDelete={() => handleDeleteTodo(todo.id)}
									onEdit={() => handleEditTodo(todo)}
								/>
							)) || (
								<Card className="py-8">
									<CardContent className="text-center">
										<p className="text-gray-500">No completed todos</p>
									</CardContent>
								</Card>
							)}
						</div>
					</TabsContent>
				</Tabs>

				{/* Enhanced Smart Form Modal - Create */}
				{showAddForm && <EnhancedTodoForm onClose={() => setShowAddForm(false)} />}

				{/* Enhanced Smart Form Modal - Edit */}
				{editingTodo && <EnhancedTodoForm initialData={editingTodo} onClose={handleCloseEditForm} />}
			</div>
		</div>
	);
}
