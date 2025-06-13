import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Todo } from "@/generated/flow";
import { format } from "date-fns";
import { AlertTriangle, Calendar, CheckCircle, Circle, Clock, Edit, Tag, Trash2, User } from "lucide-react";

interface TodoItemProps {
	todo: Todo;
	onToggleComplete: () => void;
	onUpdate: (updates: Partial<Todo>) => void;
	onDelete: () => void;
	onEdit?: () => void;
}

export function TodoItem({ todo, onToggleComplete, onUpdate, onDelete, onEdit }: TodoItemProps) {
	const isCompleted = todo.status === "COMPLETED";
	const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isCompleted;

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "HIGH":
				return "bg-red-100 text-red-800 border-red-200";
			case "MEDIUM":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "LOW":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return "bg-green-100 text-green-800 border-green-200";
			case "IN_PROGRESS":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "PENDING":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<Card
			className={`transition-all hover:shadow-md ${isCompleted ? "opacity-75" : ""} ${isOverdue ? "border-red-200 bg-red-50/50" : ""}`}
		>
			<CardContent className="p-4">
				<div className="flex items-start gap-4">
					{/* Checkbox */}
					<div className="flex-shrink-0 mt-1">
						<Checkbox
							checked={isCompleted}
							onCheckedChange={onToggleComplete}
							className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
						/>
					</div>

					{/* Main Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<h3
									className={`font-semibold text-lg ${isCompleted ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}
								>
									{todo.title}
								</h3>
								{todo.description && (
									<p
										className={`mt-1 text-sm ${isCompleted ? "line-through text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
									>
										{todo.description}
									</p>
								)}
							</div>

							{/* Actions */}
							<div className="flex items-center gap-2 ml-4">
								<Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0" title="Edit todo">
									<Edit className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={onDelete}
									className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Metadata */}
						<div className="flex flex-wrap items-center gap-3 mt-3">
							{/* Status */}
							<Badge variant="outline" className={getStatusColor(todo.status)}>
								{todo.status === "COMPLETED" && <CheckCircle className="h-3 w-3 mr-1" />}
								{todo.status === "IN_PROGRESS" && <Clock className="h-3 w-3 mr-1" />}
								{todo.status === "PENDING" && <Circle className="h-3 w-3 mr-1" />}
								{todo.status?.replace("_", " ")}
							</Badge>

							{/* Priority */}
							<Badge variant="outline" className={getPriorityColor(todo.priority)}>
								{todo.priority} PRIORITY
							</Badge>

							{/* Category */}
							{todo.category && (
								<Badge variant="outline" className="border-gray-200">
									<div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: todo.category.color }} />
									<Tag className="h-3 w-3 mr-1" />
									{todo.category.name}
								</Badge>
							)}

							{/* Due Date */}
							{todo.dueDate && (
								<Badge variant="outline" className={isOverdue ? "border-red-300 bg-red-50 text-red-700" : "border-gray-200"}>
									<Calendar className="h-3 w-3 mr-1" />
									{format(new Date(todo.dueDate), "MMM d, yyyy")}
									{isOverdue && <AlertTriangle className="h-3 w-3 ml-1" />}
								</Badge>
							)}

							{/* Assignee */}
							{todo.user && (
								<Badge variant="outline" className="border-gray-200">
									<User className="h-3 w-3 mr-1" />
									{todo.user.name}
								</Badge>
							)}
						</div>

						{/* Completion Info */}
						{isCompleted && todo.completedAt && (
							<p className="text-xs text-green-600 mt-2">✓ Completed on {format(new Date(todo.completedAt), "MMM d, yyyy")}</p>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
