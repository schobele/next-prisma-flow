"use client";

import { format } from "date-fns";
import {
	AlertCircleIcon,
	CalendarIcon,
	CheckIcon,
	ClockIcon,
	EditIcon,
	PlusIcon,
	Trash2Icon,
	XIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useFlowCtx } from "@/lib/flow/core/provider";
import { useListList } from "@/lib/flow/list/client/hooks";
import { useTagList } from "@/lib/flow/tag/client/hooks";
import { useTodoForm } from "@/lib/flow/todo/client/forms";
import {
	useCreateTodo,
	useDeleteTodo,
	useTodoList,
	useUpdateTodo,
} from "@/lib/flow/todo/client/hooks";
import type { TodoListParams } from "@/lib/flow/todo/server/queries";
import type { FlowTodo } from "@/lib/flow/todo/types/schemas";
import { cn } from "@/lib/utils";

// Constants for status and priority
const TodoStatus = {
	TODO: "TODO",
	IN_PROGRESS: "IN_PROGRESS",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
} as const;

const TodoPriority = {
	LOW: "LOW",
	MEDIUM: "MEDIUM",
	HIGH: "HIGH",
	URGENT: "URGENT",
} as const;

const priorityColors: Record<string, string> = {
	LOW: "bg-gray-500",
	MEDIUM: "bg-blue-500",
	HIGH: "bg-orange-500",
	URGENT: "bg-red-500",
};

const statusIcons: Record<string, JSX.Element> = {
	TODO: <ClockIcon className="w-4 h-4" />,
	IN_PROGRESS: <AlertCircleIcon className="w-4 h-4" />,
	COMPLETED: <CheckIcon className="w-4 h-4" />,
	CANCELLED: <XIcon className="w-4 h-4" />,
};

export default function TodoApp() {
	const [selectedListId, setSelectedListId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [editingTodo, setEditingTodo] = useState<FlowTodo | null>(null);

	// Get user context
	const flowCtx = useFlowCtx();
	const userId = flowCtx.user?.id || "";

	// Debounce search query
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	// Fetch data
	const { data: listsData } = useListList({ orderBy: { createdAt: "desc" } });
	const { data: tagsData } = useTagList();

	// Build todo filters
	const todoFilters = {
		orderBy: { createdAt: "desc" },
		where: {},
	} as TodoListParams;

	if (selectedListId) {
		todoFilters.where = {
			listId: selectedListId,
		};
	}

	if (debouncedSearchQuery) {
		todoFilters.where = {
			...todoFilters.where,
			OR: [
				{
					title: { contains: debouncedSearchQuery },
				},
				{
					description: { contains: debouncedSearchQuery },
				},
				{
					tags: {
						some: {
							name: {
								contains: debouncedSearchQuery,
							},
						},
					},
				},
			],
		};
	}

	if (statusFilter !== "all") {
		todoFilters.where = {
			...todoFilters.where,
			status: statusFilter,
		};
	}

	const { data: todosData, refetch: refetchTodos } = useTodoList(todoFilters);

	// Auto-refresh when filters change
	useEffect(() => {
		refetchTodos();
	}, [selectedListId, statusFilter, debouncedSearchQuery, refetchTodos]);

	// Mutations
	const createTodoMutation = useCreateTodo({
		onSuccess: () => {
			toast.success("Task created successfully");
			setIsCreateDialogOpen(false);
			refetchTodos();
		},
		onError: () => {
			toast.error("Failed to create task");
		},
	});

	const updateTodoMutation = useUpdateTodo(editingTodo?.id || "", {
		onSuccess: () => {
			toast.success("Task updated successfully");
			setEditingTodo(null);
			refetchTodos();
		},
		onError: (error) => {
			if (error.message?.includes("not found")) {
				toast.error("Task no longer exists");
				setEditingTodo(null);
			} else {
				toast.error("Failed to update task");
			}
			refetchTodos();
		},
	});

	const deleteTodoMutation = useDeleteTodo({
		onSuccess: (_, variables) => {
			toast.success("Task deleted successfully");
			// Close edit dialog if we're deleting the todo being edited
			if (editingTodo?.id === variables) {
				setEditingTodo(null);
			}
			refetchTodos();
		},
		onError: () => {
			toast.error("Failed to delete task");
		},
	});

	// Get default list
	const defaultList =
		listsData?.items.find((list) => list.isDefault) || listsData?.items[0];
	const activeListId = selectedListId || defaultList?.id;
	const activeList = listsData?.items.find((list) => list.id === activeListId);

	// Form for creating/editing todos
	const { form: createForm, reset: resetCreate } = useTodoForm({
		onSuccess: () => {
			setIsCreateDialogOpen(false);
			resetCreate();
			refetchTodos();
		},
	});

	// Only create edit form when we have a todo to edit
	const { form: editForm, reset: resetEditForm } = useTodoForm(
		editingTodo ? {
			id: editingTodo.id,
			autosave: {
				enabled: true,
				debounceMs: 1000,
				fields: ["title", "description", "status", "priority"],
				onFieldSave: (field) => {
					toast.success(`${field} saved`);
					refetchTodos();
				},
				onFieldError: (field, error) => {
					if (error.message?.includes("not found")) {
						toast.error("Task no longer exists");
						setEditingTodo(null);
					} else {
						toast.error(`Failed to save ${field}`);
					}
				},
			},
		} : {
			// Provide a dummy config when not editing to avoid hook issues
			id: undefined,
			autosave: undefined,
		}
	);

	// Reset edit form when switching to a different todo
	useEffect(() => {
		if (editingTodo) {
			resetEditForm();
		}
	}, [editingTodo?.id, resetEditForm]);

	const handleToggleComplete = async (todo: FlowTodo) => {
		const newStatus =
			todo.status === TodoStatus.COMPLETED
				? TodoStatus.TODO
				: TodoStatus.COMPLETED;
		await updateTodoMutation.mutateAsync({
			status: newStatus,
			completedAt: newStatus === TodoStatus.COMPLETED ? new Date() : null,
		});
	};

	const handleCreateTodo = async (e: React.FormEvent) => {
		e.preventDefault();
		const formData = createForm.getValues();

		if (!activeListId && !defaultList?.id) {
			toast.error("No list selected");
			return;
		}

		await createTodoMutation.mutateAsync({
			title: formData.title || "",
			description: formData.description || undefined,
			priority: formData.priority || TodoPriority.MEDIUM,
			status: TodoStatus.TODO,
			listId: activeListId || defaultList?.id || "",
			userId: userId,
		});
	};

	const stats = {
		total: todosData?.items.length || 0,
		todo:
			todosData?.items.filter((t) => t.status === TodoStatus.TODO).length || 0,
		inProgress:
			todosData?.items.filter((t) => t.status === TodoStatus.IN_PROGRESS)
				.length || 0,
		completed:
			todosData?.items.filter((t) => t.status === TodoStatus.COMPLETED)
				.length || 0,
	};

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-2">Todo App</h1>
				<p className="text-muted-foreground">
					Built with Next.js, Prisma, and next-prisma-flow generator
				</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Total Tasks</CardDescription>
						<CardTitle className="text-3xl">{stats.total}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>To Do</CardDescription>
						<CardTitle className="text-3xl text-blue-600">
							{stats.todo}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>In Progress</CardDescription>
						<CardTitle className="text-3xl text-yellow-600">
							{stats.inProgress}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription>Completed</CardDescription>
						<CardTitle className="text-3xl text-green-600">
							{stats.completed}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Sidebar - Lists */}
				<div className="lg:col-span-1">
					<Card>
						<CardHeader>
							<CardTitle>Lists</CardTitle>
							<CardDescription>Organize your tasks</CardDescription>
						</CardHeader>
						<CardContent className="space-y-2">
							<Button
								variant={!selectedListId ? "default" : "ghost"}
								className="w-full justify-start"
								onClick={() => setSelectedListId(null)}
							>
								All Tasks
							</Button>
							{listsData?.items.map((list) => (
								<Button
									key={list.id}
									variant={selectedListId === list.id ? "default" : "ghost"}
									className="w-full justify-start"
									onClick={() => setSelectedListId(list.id)}
								>
									<span className="mr-2">{list.icon}</span>
									{list.name}
									{list.isDefault && (
										<Badge variant="secondary" className="ml-auto">
											Default
										</Badge>
									)}
								</Button>
							))}
						</CardContent>
					</Card>

					{/* Tags */}
					<Card className="mt-4">
						<CardHeader>
							<CardTitle>Tags</CardTitle>
							<CardDescription>Filter by tags</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-wrap gap-2">
							{tagsData?.items.map((tag) => (
								<Badge
									key={tag.id}
									variant="outline"
									style={{ borderColor: tag.color, color: tag.color }}
								>
									{tag.name}
								</Badge>
							))}
						</CardContent>
					</Card>
				</div>

				{/* Main Area - Todos */}
				<div className="lg:col-span-3">
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										{activeList && (
											<>
												<span>{activeList.icon}</span>
												{activeList.name}
											</>
										)}
										{!activeList && "All Tasks"}
									</CardTitle>
									{activeList?.description && (
										<CardDescription>{activeList.description}</CardDescription>
									)}
								</div>
								<Dialog
									open={isCreateDialogOpen}
									onOpenChange={setIsCreateDialogOpen}
								>
									<DialogTrigger asChild>
										<Button>
											<PlusIcon className="w-4 h-4 mr-2" />
											Add Task
										</Button>
									</DialogTrigger>
									<DialogContent>
										<form onSubmit={handleCreateTodo}>
											<DialogHeader>
												<DialogTitle>Create New Task</DialogTitle>
												<DialogDescription>
													Add a new task to your list
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-4 py-4">
												<div>
													<Label htmlFor="title">Title</Label>
													<Input
														id="title"
														{...createForm.register("title")}
														placeholder="Enter task title"
													/>
												</div>
												<div>
													<Label htmlFor="description">Description</Label>
													<Textarea
														id="description"
														{...createForm.register("description")}
														placeholder="Enter task description"
													/>
												</div>
												<div>
													<Label htmlFor="priority">Priority</Label>
													<Select
														value={
															createForm.watch("priority") ||
															TodoPriority.MEDIUM
														}
														onValueChange={(value) =>
															createForm.setValue("priority", value)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															{Object.entries(TodoPriority).map(
																([key, value]) => (
																	<SelectItem key={value} value={value}>
																		<div className="flex items-center gap-2">
																			<div
																				className={cn(
																					"w-2 h-2 rounded-full",
																					priorityColors[value],
																				)}
																			/>
																			{key}
																		</div>
																	</SelectItem>
																),
															)}
														</SelectContent>
													</Select>
												</div>
											</div>
											<DialogFooter>
												<Button
													type="submit"
													disabled={createTodoMutation.isPending}
												>
													{createTodoMutation.isPending
														? "Creating..."
														: "Create Task"}
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							</div>
						</CardHeader>
						<CardContent>
							{/* Filters */}
							<div className="flex gap-4 mb-4">
								<Input
									placeholder="Search tasks..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="flex-1"
								/>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-40">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										{Object.entries(TodoStatus).map(([key, value]) => (
											<SelectItem key={value} value={value}>
												{key.replace(/_/g, " ")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Todo List */}
							<div className="space-y-2">
								{!todosData?.items.length && (
									<div className="text-center py-8 text-muted-foreground">
										No tasks found. Create your first task!
									</div>
								)}
								{todosData?.items.map((todo) => (
									<div
										key={todo.id}
										className={cn(
											"flex items-center gap-3 p-3 rounded-lg border",
											todo.status === TodoStatus.COMPLETED && "opacity-60",
										)}
									>
										<Checkbox
											checked={todo.status === TodoStatus.COMPLETED}
											onCheckedChange={() => handleToggleComplete(todo)}
										/>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<span
													className={cn(
														"font-medium",
														todo.status === TodoStatus.COMPLETED &&
															"line-through",
													)}
												>
													{todo.title}
												</span>
												<Badge
													variant="outline"
													className={cn(
														"text-xs",
														priorityColors[todo.priority],
													)}
												>
													{todo.priority}
												</Badge>
												<span className="text-xs text-muted-foreground">
													{statusIcons[todo.status]}
												</span>
											</div>
											{todo.description && (
												<p className="text-sm text-muted-foreground mt-1">
													{todo.description}
												</p>
											)}
											{todo.dueDate && (
												<div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
													<CalendarIcon className="w-3 h-3" />
													{format(new Date(todo.dueDate), "MMM dd, yyyy")}
												</div>
											)}
											{todo.tags && todo.tags.length > 0 && (
												<div className="flex gap-1 mt-2">
													{todo.tags.map((tag) => (
														<Badge
															key={tag.id}
															variant="outline"
															className="text-xs"
															style={{
																borderColor: tag.color,
																color: tag.color,
															}}
														>
															{tag.name}
														</Badge>
													))}
												</div>
											)}
										</div>
										<div className="flex gap-1">
											<Button
												size="icon"
												variant="ghost"
												onClick={() => {
													// Reset form and set the new todo
													setEditingTodo(todo);
												}}
											>
												<EditIcon className="w-4 h-4" />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												onClick={() => deleteTodoMutation.mutate(todo.id)}
											>
												<Trash2Icon className="w-4 h-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Edit Dialog with Autosave */}
			<Dialog 
				open={!!editingTodo} 
				onOpenChange={(open) => {
					if (!open) {
						setEditingTodo(null);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Task (Autosave Enabled)</DialogTitle>
						<DialogDescription>
							Changes are saved automatically as you type
						</DialogDescription>
					</DialogHeader>
					{editingTodo && (
						<div className="space-y-4 py-4">
							<div>
								<Label htmlFor="edit-title">Title</Label>
								<Input
									id="edit-title"
									{...editForm.register("title")}
									placeholder="Enter task title"
								/>
							</div>
							<div>
								<Label htmlFor="edit-description">Description</Label>
								<Textarea
									id="edit-description"
									{...editForm.register("description")}
									placeholder="Enter task description"
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Status</Label>
									<Select
										value={editForm.watch("status")}
										onValueChange={(value) =>
											editForm.setValue("status", value)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(TodoStatus).map(([key, value]) => (
												<SelectItem key={value} value={value}>
													{key.replace(/_/g, " ")}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Priority</Label>
									<Select
										value={editForm.watch("priority")}
										onValueChange={(value) =>
											editForm.setValue("priority", value)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(TodoPriority).map(([key, value]) => (
												<SelectItem key={value} value={value}>
													<div className="flex items-center gap-2">
														<div
															className={cn(
																"w-2 h-2 rounded-full",
																priorityColors[value],
															)}
														/>
														{key}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingTodo(null)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
