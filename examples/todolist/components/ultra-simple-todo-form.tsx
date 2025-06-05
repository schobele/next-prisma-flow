"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { todo, category, type Todo } from "@/generated/flow";
import { useTodoSmartForm } from "@/generated/flow/todo";
import { X, Loader2 } from "lucide-react";

// ============================================================================
// ULTRA SIMPLE FORM - Uses Smart Form Hook (No useMemo, no conditional hooks!)
// ============================================================================

interface UltraSimpleTodoFormProps {
	initialData?: Partial<Todo> | Todo;
	onClose: () => void;
}

export function UltraSimpleTodoForm({ initialData, onClose }: UltraSimpleTodoFormProps) {
	const { data: categoryData } = category.hooks.useCategories();
	
	// 🎯 ONE HOOK REPLACES ALL THE COMPLEXITY!
	// No useMemo, no conditional hooks, no filtering data, no mode detection!
	const form = useTodoSmartForm({ initialData });
	
	// Fields are automatically memoized internally - no more useMemo needed!
	const titleField = form.field('title');
	const descriptionField = form.field('description');
	const categoryField = form.field('categoryId');
	const priorityField = form.field('priority');
	const statusField = form.field('status');
	const userField = form.field('userId');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await form.submit();
		if (result) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-lg font-semibold">
						{form.isCreateMode ? "Create New Todo" : "Edit Todo"}
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="h-6 w-6 p-0"
					>
						<X className="h-4 w-4" />
					</Button>
				</CardHeader>
				
				<CardContent className="space-y-6">
					{/* Mode Indicator */}
					<div className="bg-gray-50 p-3 rounded-lg">
						<div className="flex items-center justify-between text-sm">
							<span className="font-medium">Mode:</span>
							<span className={`px-2 py-1 rounded text-xs font-medium ${
								form.isCreateMode 
									? "bg-green-100 text-green-700" 
									: "bg-blue-100 text-blue-700"
							}`}>
								{form.isCreateMode ? "Create" : "Update"}
							</span>
						</div>
						{form.isDirty && (
							<div className="mt-1 text-xs text-orange-600">
								Form has unsaved changes
							</div>
						)}
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Title Field */}
						<div className="space-y-2">
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								{...titleField}
								className={titleField.error ? "border-red-500" : ""}
								placeholder="Enter todo title..."
							/>
							{titleField.error && (
								<p className="text-sm text-red-500">{titleField.error}</p>
							)}
						</div>

						{/* Description Field */}
						<div className="space-y-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								{...descriptionField}
								className={descriptionField.error ? "border-red-500" : ""}
								placeholder="Enter description..."
								rows={3}
							/>
							{descriptionField.error && (
								<p className="text-sm text-red-500">{descriptionField.error}</p>
							)}
						</div>

						{/* Category Field */}
						<div className="space-y-2">
							<Label htmlFor="category">Category</Label>
							<Select
								value={categoryField.value || "none"}
								onValueChange={(value) => categoryField.onChange(value === "none" ? null : value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No category</SelectItem>
									{categoryData?.map((cat) => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Priority Field */}
						<div className="space-y-2">
							<Label htmlFor="priority">Priority</Label>
							<Select
								value={priorityField.value || "MEDIUM"}
								onValueChange={priorityField.onChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="LOW">Low</SelectItem>
									<SelectItem value="MEDIUM">Medium</SelectItem>
									<SelectItem value="HIGH">High</SelectItem>
									<SelectItem value="URGENT">Urgent</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Status Field */}
						<div className="space-y-2">
							<Label htmlFor="status">Status</Label>
							<Select
								value={statusField.value || "PENDING"}
								onValueChange={statusField.onChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="PENDING">Pending</SelectItem>
									<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
									<SelectItem value="COMPLETED">Completed</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* User ID Field */}
						<div className="space-y-2">
							<Label htmlFor="userId">User ID</Label>
							<Input
								id="userId"
								{...userField}
								className={userField.error ? "border-red-500" : ""}
								placeholder="Enter user ID..."
							/>
							{userField.error && (
								<p className="text-sm text-red-500">{userField.error}</p>
							)}
						</div>

						{/* Actions */}
						<div className="flex justify-end space-x-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={form.loading}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={!form.isValid || form.loading}
								className={form.isCreateMode ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
							>
								{form.loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
								{form.isCreateMode ? "Create Todo" : "Update Todo"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}