"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { category, todo } from "@/generated/flow";
import { X } from "lucide-react";
import { useCallback, useMemo } from "react";

interface EnhancedTodoFormProps {
	onClose?: () => void;
	initialData?: any;
}

export function EnhancedTodoForm({ onClose, initialData }: EnhancedTodoFormProps) {
	// Enhanced form hook with automatic validation and submission
	// Filter initialData to only include fields that are valid for update/create
	const filteredInitialData = useMemo(() => {
		if (!initialData) return initialData;

		// For update mode, we need to keep the id to determine mode, but filter out read-only fields
		const { createdAt, updatedAt, user, category, ...updateableFields } = initialData;
		return updateableFields;
	}, [initialData]);

	// Determine mode
	const isUpdateMode = !!(initialData && initialData.id);

	// Always call both hooks (required by Rules of Hooks) but only use one
	const createForm = todo.hooks.useCreateTodoForm(!isUpdateMode ? filteredInitialData : undefined);
	const updateForm = todo.hooks.useUpdateTodoForm(
		isUpdateMode ? initialData.id : "temp-id",
		isUpdateMode ? filteredInitialData : undefined,
	);

	// Use the appropriate form based on mode
	const form = isUpdateMode ? updateForm : createForm;
	const { data: categoryData } = category.hooks.useCategories();

	// Memoize field handlers to prevent infinite re-renders
	const titleField = useMemo(() => form.field("title"), [form.data.title, form.errors.title]);
	const descriptionField = useMemo(() => form.field("description"), [form.data.description, form.errors.description]);
	const categoryField = useMemo(() => form.field("categoryId"), [form.data.categoryId, form.errors.categoryId]);
	const priorityField = useMemo(() => form.field("priority"), [form.data.priority, form.errors.priority]);
	const statusField = useMemo(() => form.field("status"), [form.data.status, form.errors.status]);
	const userField = useMemo(() => form.field("userId"), [form.data.userId, form.errors.userId]);

	// Custom onChange handler for category to handle null values
	const handleCategoryChange = useCallback(
		(value: string) => {
			categoryField.onChange(value === "none" ? null : value);
		},
		[categoryField.onChange],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await form.submit();
		if (result && onClose) {
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>{initialData ? "Edit Todo" : "Create New Todo"}</CardTitle>
					{onClose && (
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					)}
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Title Field */}
						<div>
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								name={titleField.name}
								value={titleField.value}
								onChange={(e) => titleField.onChange(e.target.value)}
								onBlur={titleField.onBlur}
								placeholder="Enter todo title"
							/>
							{titleField.error && <p className="text-sm text-red-500 mt-1">{titleField.error}</p>}
						</div>

						{/* Description Field */}
						<div>
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name={descriptionField.name}
								value={descriptionField.value}
								onChange={(e) => descriptionField.onChange(e.target.value)}
								onBlur={descriptionField.onBlur}
								placeholder="Enter todo description (optional)"
								rows={3}
							/>
							{descriptionField.error && <p className="text-sm text-red-500 mt-1">{descriptionField.error}</p>}
						</div>

						{/* Category Field */}
						<div>
							<Label htmlFor="categoryId">Category</Label>
							<Select value={categoryField.value || "none"} onValueChange={handleCategoryChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select a category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No Category</SelectItem>
									{categoryData?.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{categoryField.error && <p className="text-sm text-red-500 mt-1">{categoryField.error}</p>}
						</div>

						{/* Priority Field */}
						<div>
							<Label htmlFor="priority">Priority</Label>
							<Select value={priorityField.value || "MEDIUM"} onValueChange={priorityField.onChange}>
								<SelectTrigger>
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="LOW">Low</SelectItem>
									<SelectItem value="MEDIUM">Medium</SelectItem>
									<SelectItem value="HIGH">High</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Status Field (for editing) */}
						{initialData && (
							<div>
								<Label htmlFor="status">Status</Label>
								<Select value={statusField.value || "PENDING"} onValueChange={statusField.onChange}>
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
						)}

						{/* User ID (hidden, auto-filled) */}
						<input
							type="hidden"
							name={userField.name}
							value={userField.value || "user-1"} // Default user for demo
							onChange={(e) => userField.onChange(e.target.value)}
						/>

						{/* Form Status */}
						{form.error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-sm text-red-600">{form.error.message}</p>
							</div>
						)}

						{/* Form Actions */}
						<div className="flex gap-2 pt-4">
							<Button
								type="submit"
								disabled={!form.isValid || form.loading}
								className="flex-1"
								title={`Valid: ${form.isValid}, Loading: ${form.loading}, Errors: ${Object.keys(form.errors).join(", ")}`}
							>
								{form.loading ? "Saving..." : initialData ? "Update Todo" : "Create Todo"}
							</Button>

							{onClose && (
								<Button type="button" variant="outline" onClick={onClose}>
									Cancel
								</Button>
							)}

							{form.isDirty && (
								<Button type="button" variant="ghost" onClick={form.reset} size="sm">
									Reset
								</Button>
							)}
						</div>

						{/* Form Debug Info (in development) */}
						{/* {process.env.NODE_ENV === 'development' && (
							<details className="mt-4">
								<summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
								<pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
									{JSON.stringify(form, null, 2)}
								</pre>
							</details>
						)} */}
					</form>

					{/* Auto-save Feature Demo */}
					<div className="mt-4 pt-4 border-t">
						<div className="flex items-center justify-between">
							<Label className="text-sm">Auto-save</Label>
							<Button variant="outline" size="sm" onClick={() => form.enableAutoSave(2000)}>
								Enable Auto-save
							</Button>
						</div>
						<p className="text-xs text-gray-500 mt-1">Automatically saves changes after 2 seconds of inactivity</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
