"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthorList } from "../../generated/flow/author/hooks";
import { usePostForm } from "../../generated/flow/post/forms";
import { usePost, useUpdatePost } from "../../generated/flow/post/hooks";
import type { FlowPostWrite } from "../../generated/flow/post/zod";

export default function EditPostPage({
  postId,
}: {
  postId: string;
}) {
	
  

	// Fallback: allow id to be injected via search params or a controlled parent in the future
  const { data, isLoading } = usePost(postId);
	const { data: authorsData } = useAuthorList();

	const post = data
  const update = useUpdatePost(postId);

	const { form, onSubmit, isSubmitting } = usePostForm({
    id: postId,
		mode: "update",
		defaultValues: post ?? undefined,
		form: { mode: "all" },
	});

	// Custom autosave
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const handleAutosave = useCallback(
		(values: FlowPostWrite) => {
			if (!postId) return;
			if (debounceRef.current) clearTimeout(debounceRef.current);
			debounceRef.current = setTimeout(async () => {
				try {
					if (!form.formState.isValid) return;
					await update.mutateAsync(values);
				} catch (e) {
					console.error("Autosave failed", e);
				}
			}, 800);
		},
		[postId, update, form.formState.isValid],
	);

	useEffect(() => {
		const sub = form.watch((_values, { name, type }) => {
			const values = form.getValues();
			handleAutosave(values as any);
		});
		return () => (sub as any)?.unsubscribe?.();
	}, [form, handleAutosave]);

	if (!postId) return <div className="p-6">Missing post id</div>;
	if (isLoading) return <div className="p-6">Loading…</div>;
	if (!post) return <div className="p-6">Post not found</div>;

	return (
		<div className="max-w-2xl mx-auto p-6 space-y-6">
			<h1 className="text-2xl font-semibold">Edit Post</h1>

			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div>
					<label className="block text-sm font-medium mb-1">Title</label>
					<input
						{...form.register("title")}
						className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Enter post title"
					/>
					{form.formState.errors.title && (
						<p className="text-red-500 text-sm mt-1">
							{form.formState.errors.title.message as any}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Content</label>
					<textarea
						{...form.register("content")}
						rows={6}
						className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="Write your post content..."
					/>
					{form.formState.errors.content && (
						<p className="text-red-500 text-sm mt-1">
							{form.formState.errors.content.message as any}
						</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium mb-1">Author</label>
					<select
						onChange={(e) => {
							if (e.target.value)
								form.setValue("author", { id: e.target.value } as any);
							else form.setValue("author", undefined);
						}}
						className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						defaultValue={post.author?.id ?? ""}
					>
						<option value="">Keep current</option>
						{authorsData?.items.map((author) => (
							<option key={author.id} value={author.id}>
								{author.name || author.email}
							</option>
						))}
					</select>
				</div>

				<div className="flex gap-3 pt-2">
					<button
						type="submit"
						disabled={isSubmitting}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
					>
						{isSubmitting ? "Saving..." : "Save"}
					</button>
				</div>
			</form>
		</div>
	);
}
