"use client";

import { AddTodoForm } from "@/components/add-todo-form";
import { CategoryFilter } from "@/components/category-filter";
import { TodoItem } from "@/components/todo-item";
import { TodoStats } from "@/components/todo-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories, useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo, type Todo } from "@/generated/flow";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

type TodoStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export default function TodoListPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("__all__");
	const [selectedStatus, setSelectedStatus] = useState<string>("__all__");
	const [showAddForm, setShowAddForm] = useState(false);

	// Generated StateX hooks
	const { todos, loading: todosLoading } = useTodos(); // Auto-fetch enabled with loop protection
	const { categories } = useCategories();
	const { createTodo, creating } = useCreateTodo();
	const { updateTodo } = useUpdateTodo();
	const { deleteTodo } = useDeleteTodo();

	// Filter and search todos
	const filteredTodos = useMemo(() => {
		if (!todos) return [];

		return todos.filter((todo) => {
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
	}, [todos, searchQuery, selectedCategory, selectedStatus]);

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

	// Handlers
	const handleCreateTodo = async (data: any) => {
		console.log(data);
		await createTodo(data);
		setShowAddForm(false);
	};

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

	// Calculate statistics
	const stats = {
		total: todos?.length || 0,
		completed: todos?.filter((t) => t.status === "COMPLETED").length || 0,
		pending: todos?.filter((t) => t.status === "PENDING").length || 0,
		inProgress: todos?.filter((t) => t.status === "IN_PROGRESS").length || 0,
		overdue: todos?.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED").length || 0,
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">TodoList</h1>
							<p className="text-gray-600 dark:text-gray-300">Simple example demonstrating Prisma StateX Generator</p>
						</div>
						<Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
							<Plus className="h-4 w-4 mr-2" />
							Add Todo
						</Button>
					</div>

					{/* Statistics */}
					<TodoStats stats={stats} />
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
								categories={categories || []}
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
										/>
									))
							) : (
								<Card className="py-12">
									<CardContent className="text-center">
										<p className="text-gray-500 dark:text-gray-400 mb-4">
											No todos found. Create your first todo to get started!
										</p>
										<Button onClick={() => setShowAddForm(true)}>
											<Plus className="h-4 w-4 mr-2" />
											Add Todo
										</Button>
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

				{/* Add Todo Form Modal */}
				{showAddForm && (
					<AddTodoForm
						categories={categories || []}
						onSubmit={handleCreateTodo}
						onClose={() => setShowAddForm(false)}
						isSubmitting={creating}
					/>
				)}
			</div>
		</div>
	);
}
