"use client";

import { useAuthorList } from "../../generated/flow/author/hooks";
import { useCommentForm } from "../../generated/flow/comment/forms";

export default function CommentForm({ postId }: { postId: string }) {
	const { form, onSubmit, isSubmitting } = useCommentForm({ mode: "create" });
	const { data: authorsData } = useAuthorList();

	const handleInvalid = (errors: any) => {
		console.error("Comment form validation errors:", errors);
	};

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit, handleInvalid)}
			className="bg-gray-50 rounded-lg p-4"
		>
			<input type="hidden" {...form.register("post.id")} value={postId} />
			<h4 className="font-medium mb-3">Add a comment</h4>

			<div className="space-y-3">
				<div>
					<textarea
						{...form.register("content")}
						placeholder="Write your comment..."
						rows={3}
						className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div className="flex gap-3">
					<select
						{...form.register("author.id")}
						className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="">Select commenter</option>
						{authorsData?.items.map((author) => (
							<option key={author.id} value={author.id}>
								{author.name || author.email}
							</option>
						))}
						{form.formState.errors.author && (
							<pre className="text-xs text-red-600 bg-red-50 p-2 rounded">
								{JSON.stringify(form.formState.errors.author, null, 2)}
							</pre>
						)}
					</select>

					<button
						type="submit"
						disabled={isSubmitting}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
					>
						{isSubmitting ? "Posting..." : "Post Comment"}
					</button>
				</div>

				{form.formState.errors && (
					<p className="text-red-500 text-sm">
						Error posting comment. Please try again.
					</p>
				)}
			</div>
		</form>
	);
}
