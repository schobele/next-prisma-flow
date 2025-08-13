"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthorList } from "../../generated/flow/author/client/hooks";
import { usePostForm } from "../../generated/flow/post/client/forms";
import TagInput from "./TagInput";

export default function PostForm() {
	const [isOpen, setIsOpen] = useState(false);
	const router = useRouter();
	const { data: authorsData } = useAuthorList();
	
	console.log('[PostForm] Available authors:', authorsData?.items?.length || 0);
	
	const { form, submit, isSubmitting, error } = usePostForm({
		defaultValues: { 
			title: '',
			content: '',
			published: false, 
			views: 0,
			authorId: '',
			tags: undefined
		},
		onSuccess: (data) => {
			console.log('[PostForm] ✅ Post created successfully:', {
				id: data.id,
				title: data.title,
				authorId: data.authorId,
				tags: data.tags?.length || 0
			});
			setIsOpen(false);
			router.refresh();
		},
		onError: (err) => {
			console.error('[PostForm] ❌ Error creating post:', {
				message: err.message,
				details: err
			});
		}
	});

	// Enhanced debug logging
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formValues = form.getValues();
		console.log('[PostForm] 📝 Submitting new post:', {
			values: formValues,
			validation: {
				isValid: form.formState.isValid,
				errors: form.formState.errors,
				touchedFields: form.formState.touchedFields
			}
		});
		submit(e);
	};

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
				New Post
			</button>
		);
	}

	return (
		<div className="fixed inset-0 z-50">
			<div className="modal-backdrop" onClick={() => setIsOpen(false)} />
			<div className="modal-content">
				<h2 className="text-2xl font-bold mb-4">Create New Post</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Title</label>
						<input
							{...form.register("title")}
							className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Enter post title"
						/>
						{form.formState.errors.title && (
							<p className="text-red-500 text-sm mt-1">
								{form.formState.errors.title.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Content</label>
						<textarea
							{...form.register("content")}
							rows={4}
							className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Write your post content..."
						/>
						{form.formState.errors.content && (
							<p className="text-red-500 text-sm mt-1">
								{form.formState.errors.content.message}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium mb-1">Author</label>
						<select
							{...form.register("authorId")}
							className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Select an author</option>
							{authorsData?.items.map((author) => (
								<option key={author.id} value={author.id}>
									{author.name || author.email}
								</option>
							))}
						</select>
						{form.formState.errors.authorId && (
							<p className="text-red-500 text-sm mt-1">
								{form.formState.errors.authorId.message}
							</p>
						)}
					</div>

					{/* Tag Input */}
					<div>
						<TagInput 
							value={form.watch('tags')}
							onChange={(value) => form.setValue('tags', value)}
							mode="create"
						/>
						{form.formState.errors.tags && (
							<p className="text-red-500 text-sm mt-1">
								{String(form.formState.errors.tags.message)}
							</p>
						)}
					</div>

					<div className="flex gap-3 pt-4">
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
						>
							{isSubmitting ? "Creating..." : "Create Post"}
						</button>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
						>
							Cancel
						</button>
					</div>

					{error && (
						<div className="text-red-600 text-sm bg-red-50 p-2 rounded">
							{error.message}
						</div>
					)}
				</form>
			</div>
		</div>
	);
}