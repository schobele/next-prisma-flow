import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUsers, type Category, type TodoCreateInput } from "@/generated/flow";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface AddTodoFormProps {
	categories: Category[];
	onSubmit: (data: TodoCreateInput) => void;
	onClose: () => void;
	isSubmitting: boolean;
}

export function AddTodoForm({ categories, onSubmit, onClose, isSubmitting }: AddTodoFormProps) {
	const [formData, setFormData] = useState({
		title: "",
		description: undefined,
		priority: "MEDIUM" as const,
		categoryId: undefined,
		dueDate: undefined,
	});
	const { users } = useUsers();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.title.trim()) return;

		onSubmit({
			user: {
				connect: {
					id: users[0].id,
				},
			},
			title: formData.title.trim(),
			description: formData.description,
			priority: formData.priority,
			...(formData.categoryId
				? {
						category: {
							connect: {
								id: formData.categoryId,
							},
						},
					}
				: {}),
			dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
		});
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>Add New Todo</CardTitle>
						<Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Title */}
						<div>
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								placeholder="What needs to be done?"
								value={formData.title}
								onChange={(e) => handleChange("title", e.target.value)}
								required
							/>
						</div>

						{/* Description */}
						<div>
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								placeholder="Add more details (optional)"
								value={formData.description}
								onChange={(e) => handleChange("description", e.target.value)}
								rows={3}
							/>
						</div>

						{/* Priority */}
						<div>
							<Label htmlFor="priority">Priority</Label>
							<Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="LOW">Low Priority</SelectItem>
									<SelectItem value="MEDIUM">Medium Priority</SelectItem>
									<SelectItem value="HIGH">High Priority</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Category */}
						<div>
							<Label htmlFor="category">Category</Label>
							<Select value={formData.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
								<SelectTrigger>
									<SelectValue placeholder="Select category (optional)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="none">No category</SelectItem>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											<div className="flex items-center gap-2">
												<div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
												{category.name}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Due Date */}
						<div>
							<Label htmlFor="dueDate">Due Date</Label>
							<Input
								id="dueDate"
								type="date"
								value={formData.dueDate}
								onChange={(e) => handleChange("dueDate", e.target.value)}
							/>
						</div>

						{/* Submit Buttons */}
						<div className="flex gap-2 pt-4">
							<Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
								Cancel
							</Button>
							<Button type="submit" className="flex-1" disabled={isSubmitting || !formData.title.trim()}>
								{isSubmitting ? (
									"Creating..."
								) : (
									<>
										<Plus className="h-4 w-4 mr-2" />
										Add Todo
									</>
								)}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
