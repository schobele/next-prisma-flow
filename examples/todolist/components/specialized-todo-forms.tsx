"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { category, todo } from "@/generated/flow";
import { X } from "lucide-react";
import { useState } from "react";

// ============================================================================
// CREATE TODO FORM - Uses dedicated useCreateTodoForm hook
// ============================================================================

interface CreateTodoFormProps {
	onClose?: () => void;
	onSuccess?: (todo: any) => void;
}

export function CreateTodoForm({ onClose, onSuccess }: CreateTodoFormProps) {
	// Specialized create form hook with strict TodoCreateInput types
	const form = todo.hooks.useCreateTodoForm();
	const { data: categoryData } = category.hooks.useCategories();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await form.submit();
		if (result) {
			onSuccess?.(result);
			onClose?.();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Create New Todo</CardTitle>
					{onClose && (
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					)}
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Title Field - Required for create */}
						<div>
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								name={form.field('title').name}
								value={form.field('title').value}
								onChange={(e) => form.field('title').onChange(e.target.value)}
								onBlur={form.field('title').onBlur}
								placeholder="Enter todo title"
								required
							/>
							{form.field('title').error && (
								<p className="text-sm text-red-500 mt-1">{form.field('title').error}</p>
							)}
						</div>

						{/* Description Field */}
						<div>
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name={form.field('description').name}
								value={form.field('description').value}
								onChange={(e) => form.field('description').onChange(e.target.value)}
								onBlur={form.field('description').onBlur}
								placeholder="Enter todo description (optional)"
								rows={3}
							/>
							{form.field('description').error && (
								<p className="text-sm text-red-500 mt-1">{form.field('description').error}</p>
							)}
						</div>

						{/* Category Field */}
						<div>
							<Label htmlFor="categoryId">Category</Label>
							<Select
								value={form.field("categoryId").value || ''}
								onValueChange={form.field('categoryId').onChange}
							>
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
							{form.field('categoryId').error && (
								<p className="text-sm text-red-500 mt-1">{form.field('categoryId').error}</p>
							)}
						</div>

						{/* Priority Field */}
						<div>
							<Label htmlFor="priority">Priority</Label>
							<Select
								value={form.field('priority').value || 'MEDIUM'}
								onValueChange={form.field('priority').onChange}
							>
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

						{/* User ID (hidden, auto-filled) */}
						<input
							type="hidden"
							name={form.field('userId').name}
							value={form.field('userId').value || 'user-1'} // Default user for demo
							onChange={(e) => form.field('userId').onChange(e.target.value)}
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
							>
								{form.loading ? 'Creating...' : 'Create Todo'}
							</Button>
							
							{onClose && (
								<Button type="button" variant="outline" onClick={onClose}>
									Cancel
								</Button>
							)}
							
							{form.isDirty && (
								<Button 
									type="button" 
									variant="ghost" 
									onClick={form.reset}
									size="sm"
								>
									Reset
								</Button>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// UPDATE TODO FORM - Uses dedicated useUpdateTodoForm hook
// ============================================================================

interface UpdateTodoFormProps {
	todoId: string;
	initialData?: any;
	onClose?: () => void;
	onSuccess?: (todo: any) => void;
}

export function UpdateTodoForm({ todoId, initialData, onClose, onSuccess }: UpdateTodoFormProps) {
	// Specialized update form hook with strict TodoUpdateInput types
	const form = todo.hooks.useUpdateTodoForm(todoId, initialData);
	const { data: categoryData } = category.hooks.useCategories();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const result = await form.submit();
		if (result) {
			onSuccess?.(result);
			onClose?.();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
			<Card className="w-full max-w-md">
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Update Todo</CardTitle>
					{onClose && (
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="h-4 w-4" />
						</Button>
					)}
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{/* Title Field - Optional for update */}
						<div>
							<Label htmlFor="title">Title</Label>
							<Input
								id="title"
								name={form.field('title').name}
								value={form.field('title').value}
								onChange={(e) => form.field('title').onChange(e.target.value)}
								onBlur={form.field('title').onBlur}
								placeholder="Enter todo title"
							/>
							{form.field('title').error && (
								<p className="text-sm text-red-500 mt-1">{form.field('title').error}</p>
							)}
						</div>

						{/* Description Field */}
						<div>
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name={form.field('description').name}
								value={form.field('description').value}
								onChange={(e) => form.field('description').onChange(e.target.value)}
								onBlur={form.field('description').onBlur}
								placeholder="Enter todo description (optional)"
								rows={3}
							/>
							{form.field('description').error && (
								<p className="text-sm text-red-500 mt-1">{form.field('description').error}</p>
							)}
						</div>

						{/* Category Field */}
						<div>
							<Label htmlFor="categoryId">Category</Label>
							<Select
								value={form.field("categoryId").value || ''}
								onValueChange={form.field('categoryId').onChange}
							>
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
							{form.field('categoryId').error && (
								<p className="text-sm text-red-500 mt-1">{form.field('categoryId').error}</p>
							)}
						</div>

						{/* Priority Field */}
						<div>
							<Label htmlFor="priority">Priority</Label>
							<Select
								value={form.field('priority').value || ''}
								onValueChange={form.field('priority').onChange}
							>
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

						{/* Status Field */}
						<div>
							<Label htmlFor="status">Status</Label>
							<Select
								value={form.field('status').value || ''}
								onValueChange={form.field('status').onChange}
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

						{/* Form Status */}
						{form.error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-sm text-red-600">{form.error.message}</p>
							</div>
						)}

						{/* Form Info */}
						<div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
							<p>Updating Todo ID: {form.id}</p>
							<p>Form Dirty: {form.isDirty ? 'Yes' : 'No'}</p>
							<p>Form Valid: {form.isValid ? 'Yes' : 'No'}</p>
						</div>

						{/* Form Actions */}
						<div className="flex gap-2 pt-4">
							<Button
								type="submit"
								disabled={!form.isValid || form.loading}
								className="flex-1"
							>
								{form.loading ? 'Updating...' : 'Update Todo'}
							</Button>
							
							{onClose && (
								<Button type="button" variant="outline" onClick={onClose}>
									Cancel
								</Button>
							)}
							
							{form.isDirty && (
								<Button 
									type="button" 
									variant="ghost" 
									onClick={form.reset}
									size="sm"
								>
									Reset
								</Button>
							)}
						</div>

						{/* Auto-save Feature Demo */}
						<div className="mt-4 pt-4 border-t">
							<div className="flex items-center justify-between">
								<Label className="text-sm">Auto-save</Label>
								<Button
									variant="outline"
									size="sm"
									onClick={() => form.enableAutoSave(2000)}
								>
									Enable Auto-save
								</Button>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								Automatically saves changes after 2 seconds of inactivity
							</p>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// FEATURE SHOWCASE - Demonstrates all form hook capabilities
// ============================================================================

function FeatureShowcase() {
	const [hookType, setHookType] = useState<'create' | 'update'>('create');
	const { data: todoData } = todo.hooks.useTodos();
	const firstTodo = todoData?.[0];

	// Switch between create and update hooks for demo
	const createForm = todo.hooks.useCreateTodoForm({ 
		title: 'Demo Todo',
		priority: 'HIGH' as any
	});
	
	const updateForm = todo.hooks.useUpdateTodoForm(
		firstTodo?.id || 'demo-id', 
		firstTodo || { title: 'Demo Update' }
	);

	const activeForm = hookType === 'create' ? createForm : updateForm;

	return (
		<div className="space-y-6">
			{/* Hook Type Selector */}
			<div className="flex gap-2">
				<Button
					size="sm"
					variant={hookType === 'create' ? 'default' : 'outline'}
					onClick={() => setHookType('create')}
					className={hookType === 'create' ? 'bg-green-600' : ''}
				>
					Create Hook
				</Button>
				<Button
					size="sm"
					variant={hookType === 'update' ? 'default' : 'outline'}
					onClick={() => setHookType('update')}
					className={hookType === 'update' ? 'bg-blue-600' : ''}
				>
					Update Hook
				</Button>
			</div>

			{/* Live Form State */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="text-sm">Live Form State</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-xs">
						<div className="grid grid-cols-2 gap-2">
							<div className="bg-gray-50 p-2 rounded">
								<strong>Valid:</strong> {activeForm.isValid ? '✅' : '❌'}
							</div>
							<div className="bg-gray-50 p-2 rounded">
								<strong>Dirty:</strong> {activeForm.isDirty ? '✅' : '❌'}
							</div>
							<div className="bg-gray-50 p-2 rounded">
								<strong>Loading:</strong> {activeForm.loading ? '⏳' : '✅'}
							</div>
							<div className="bg-gray-50 p-2 rounded">
								<strong>Errors:</strong> {Object.keys(activeForm.errors).length}
							</div>
						</div>
						{hookType === 'update' && 'id' in activeForm && (
							<div className="bg-blue-50 p-2 rounded">
								<strong>ID:</strong> {activeForm.id}
							</div>
						)}
					</CardContent>
				</Card>

				<Card className="border-gray-200">
					<CardHeader>
						<CardTitle className="text-sm">Form Data</CardTitle>
					</CardHeader>
					<CardContent>
						<pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
							{JSON.stringify(activeForm.data, null, 2)}
						</pre>
					</CardContent>
				</Card>
			</div>

			{/* Interactive Field Demo */}
			<Card className="border-orange-200 bg-orange-50/50">
				<CardHeader>
					<CardTitle className="text-sm text-orange-800">Interactive Field Demo</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div>
						<Label htmlFor="demo-title">Title Field</Label>
						<Input
							id="demo-title"
							name={activeForm.field('title').name}
							value={activeForm.field('title').value}
							onChange={(e) => activeForm.field('title').onChange(e.target.value)}
							onBlur={activeForm.field('title').onBlur}
							placeholder="Type to see live validation..."
						/>
						{activeForm.field('title').error && (
							<p className="text-xs text-red-500 mt-1">{activeForm.field('title').error}</p>
						)}
						<p className="text-xs text-gray-500 mt-1">
							Required: {activeForm.field('title').required ? 'Yes' : 'No'} 
							| Value: "{activeForm.field('title').value}"
						</p>
					</div>

					<div className="flex gap-2">
						<Button 
							size="sm" 
							onClick={() => activeForm.reset()}
							variant="outline"
						>
							Reset Form
						</Button>
						<Button 
							size="sm" 
							onClick={() => activeForm.validate()}
							variant="outline"
						>
							Validate
						</Button>
						<Button 
							size="sm" 
							onClick={() => activeForm.enableAutoSave(1000)}
							variant="outline"
						>
							Enable Auto-save
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* API Surface Demo */}
			<Card className="border-indigo-200 bg-indigo-50/50">
				<CardHeader>
					<CardTitle className="text-sm text-indigo-800">Hook API Surface</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
						<div>
							<h4 className="font-semibold mb-2">State Properties</h4>
							<ul className="space-y-1 text-gray-600">
								<li>• data</li>
								<li>• isValid</li>
								<li>• isDirty</li>
								<li>• errors</li>
								<li>• loading</li>
								<li>• error</li>
								{hookType === 'update' && <li>• id</li>}
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Form Methods</h4>
							<ul className="space-y-1 text-gray-600">
								<li>• field(name)</li>
								<li>• submit()</li>
								<li>• reset()</li>
								<li>• setData(data)</li>
								<li>• validate()</li>
								<li>• validateField(field)</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold mb-2">Auto-save</h4>
							<ul className="space-y-1 text-gray-600">
								<li>• enableAutoSave(ms)</li>
								<li>• disableAutoSave()</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ============================================================================
// DEMO COMPONENT - Shows both specialized forms
// ============================================================================

export function SpecializedFormsDemo() {
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showUpdateForm, setShowUpdateForm] = useState(false);
	const [selectedTodoForEdit, setSelectedTodoForEdit] = useState<any>(null);
	const [showFeatureDemo, setShowFeatureDemo] = useState(false);

	const { data: todoData } = todo.hooks.useTodos();

	return (
		<div className="space-y-6">
			{/* Main Demo Buttons */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Button 
					onClick={() => setShowCreateForm(true)}
					className="bg-green-600 hover:bg-green-700 text-white"
				>
					🆕 Create Form Demo
				</Button>
				<Button 
					onClick={() => {
						const firstTodo = todoData?.[0];
						if (firstTodo) {
							setSelectedTodoForEdit(firstTodo);
							setShowUpdateForm(true);
						}
					}}
					disabled={!todoData?.length}
					className="bg-blue-600 hover:bg-blue-700 text-white"
				>
					✏️ Update Form Demo
				</Button>
				<Button 
					onClick={() => setShowFeatureDemo(!showFeatureDemo)}
					variant="outline"
					className="border-purple-300 text-purple-700 hover:bg-purple-50"
				>
					⚡ Features Showcase
				</Button>
			</div>

			{/* Features Showcase */}
			{showFeatureDemo && (
				<Card className="border-purple-200 bg-purple-50/50">
					<CardHeader>
						<CardTitle className="text-lg text-purple-800">Form Hook Features</CardTitle>
					</CardHeader>
					<CardContent>
						<FeatureShowcase />
					</CardContent>
				</Card>
			)}

			{/* Specialized Create Form */}
			{showCreateForm && (
				<CreateTodoForm
					onClose={() => setShowCreateForm(false)}
					onSuccess={(newTodo) => {
						console.log('✅ Created todo with useCreateTodoForm:', newTodo);
						alert(`✅ Todo "${newTodo.title}" created successfully using useCreateTodoForm!`);
					}}
				/>
			)}

			{/* Specialized Update Form */}
			{showUpdateForm && selectedTodoForEdit && (
				<UpdateTodoForm
					todoId={selectedTodoForEdit.id}
					initialData={selectedTodoForEdit}
					onClose={() => {
						setShowUpdateForm(false);
						setSelectedTodoForEdit(null);
					}}
					onSuccess={(updatedTodo) => {
						console.log('✅ Updated todo with useUpdateTodoForm:', updatedTodo);
						alert(`✅ Todo "${updatedTodo.title}" updated successfully using useUpdateTodoForm!`);
					}}
				/>
			)}
		</div>
	);
}