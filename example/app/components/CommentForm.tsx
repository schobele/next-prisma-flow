"use client";

import { useRouter } from "next/navigation";
import { useAuthorList } from "../../generated/flow/author/client/hooks";
import { useCommentForm } from "../../generated/flow/comment/client/forms";

export default function CommentForm({ postId }: { postId: string }) {
	const router = useRouter();
	const { data: authorsData } = useAuthorList();
	
	console.log('[CommentForm] Initializing for post:', postId);
	
	const { form, submit, isSubmitting, error } = useCommentForm({
		defaultValues: {
			content: '',
			postId: postId,
			authorId: ''
		},
		onSuccess: (data) => {
			console.log('[CommentForm] ✅ Comment created:', {
				id: data.id,
				postId: data.postId,
				authorId: data.authorId
			});
			form.reset();
			router.refresh();
		},
		onError: (err) => {
			console.error('[CommentForm] ❌ Error creating comment:', {
				message: err.message,
				details: err
			});
		}
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formValues = form.getValues();
		console.log('[CommentForm] 💬 Submitting comment:', {
			values: formValues,
			validation: {
				isValid: form.formState.isValid,
				errors: form.formState.errors
			}
		});
		submit(e);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-gray-50 rounded-lg p-4"
		>
			<input type="hidden" {...form.register("postId")} value={postId} />
			<h4 className="font-medium mb-3">Add a comment</h4>

			<div className="space-y-3">
				<div>
					<textarea
						{...form.register("content")}
						placeholder="Write your comment..."
						rows={3}
						className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					{form.formState.errors.content && (
						<p className="text-red-500 text-sm mt-1">
							{form.formState.errors.content.message}
						</p>
					)}
				</div>

				<div className="flex gap-3">
					<select
						{...form.register("authorId")}
						className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Select commenter</option>
						{authorsData?.items.map((author) => (
							<option key={author.id} value={author.id}>
								{author.name || author.email}
							</option>
						))}
					</select>

					<button
						type="submit"
						disabled={isSubmitting}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
					>
						{isSubmitting ? "Posting..." : "Post Comment"}
					</button>
				</div>

				{form.formState.errors.authorId && (
					<p className="text-red-500 text-sm">
						{form.formState.errors.authorId.message}
					</p>
				)}

				{error && (
					<div className="text-red-600 text-sm bg-red-50 p-2 rounded">
						{error.message}
					</div>
				)}
			</div>
		</form>
	);
}