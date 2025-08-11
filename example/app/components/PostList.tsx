"use client";

import Link from "next/link";
import { useState } from "react";
import type { FlowPost } from "../../generated/flow/post/zod";
import AuthorModal from "./AuthorModal";
import CommentForm from "./CommentForm";
// EditPostForm modal removed; navigate to edit page instead

export default function PostList({
	initialPosts,
}: {
	initialPosts: FlowPost[];
}) {
	const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
	const [expandedPost, setExpandedPost] = useState<string | null>(null);
  // Navigate to edit page instead of opening inline modal

	return (
		<>
			<div className="space-y-6">
				{initialPosts.map((post) => (
					<article key={post.id} className="bg-white rounded-lg shadow p-6">
						<div className="mb-4">
							<h3 className="text-xl font-semibold mb-2">{post.title}</h3>
							{post.content && (
								<p className="text-gray-700 mb-4">{post.content}</p>
							)}
							<div className="flex items-center gap-4 text-sm text-gray-500">
								<button
									onClick={() => setSelectedAuthorId(post.author.id)}
									className="hover:text-blue-600 font-medium"
								>
									By {post.author.name || post.author.email}
								</button>
								<span>•</span>
								<time>{new Date(post.createdAt).toLocaleDateString()}</time>
								<span>•</span>
								<span>{post.comments.length} comments</span>
								<span>•</span>
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="text-gray-500 hover:text-blue-600 flex items-center gap-1"
                  title="Edit post"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M15.58 3.92a1.5 1.5 0 0 1 2.12 2.12l-9.193 9.193a4.5 4.5 0 0 1-1.79 1.094l-3.08.88a.75.75 0 0 1-.92-.92l.88-3.08a6 6 0 0 1 1.46-2.387L12.105 3.324Z" />
                  </svg>
                  Edit
                </Link>
							</div>
						</div>

						{post.tags.length > 0 && (
							<div className="flex gap-2 mb-4">
								{post.tags.map((tag) => (
									<span
										key={tag.id}
										className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
									>
										{tag.name}
									</span>
								))}
							</div>
						)}

						<div className="border-t pt-4">
							<button
								onClick={() =>
									setExpandedPost(expandedPost === post.id ? null : post.id)
								}
								className="text-blue-600 hover:text-blue-700 text-sm font-medium"
							>
								{expandedPost === post.id ? "Hide" : "Show"} Comments & Add New
							</button>

							{expandedPost === post.id && (
								<div className="mt-4 space-y-4">
									<div className="pl-4 border-l-2 border-gray-200 space-y-3">
										{post.comments.map((comment) => (
											<div key={comment.id} className="text-sm">
												<div className="font-medium text-gray-900">
													{comment.author.name || comment.author.email}
												</div>
												<div className="text-gray-700">{comment.content}</div>
												<div className="text-gray-500 text-xs mt-1">
													{new Date(comment.createdAt).toLocaleString()}
												</div>
											</div>
										))}
										{post.comments.length === 0 && (
											<p className="text-gray-500 text-sm">No comments yet</p>
										)}
									</div>

									<CommentForm postId={post.id} />
								</div>
							)}
						</div>
					</article>
				))}
			</div>

			{selectedAuthorId && (
				<AuthorModal
					authorId={selectedAuthorId}
					onClose={() => setSelectedAuthorId(null)}
				/>
			)}
      {/* Edit modal removed. Use the edit page instead. */}
		</>
	);
}
