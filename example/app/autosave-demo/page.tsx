"use client";

import { useState } from "react";
import { usePostList } from "../../generated/flow/post/client/hooks";
import type { FlowPost } from "../../generated/flow/post/types/schemas";
import AutoSaveEditPostForm from "../components/AutoSaveEditPostForm";
import EditPostForm from "../components/EditPostForm";

export default function AutosaveDemoPage() {
	const { data } = usePostList({ take: 10 });
	const [editingPost, setEditingPost] = useState<FlowPost | null>(null);
	const [useAutosave, setUseAutosave] = useState(true);

	return (
		<div className="container mx-auto p-8">
			<h1 className="text-3xl font-bold mb-6">Autosave Demo</h1>

			<div className="mb-6 p-4 bg-gray-50 rounded-lg">
				<h2 className="text-xl font-semibold mb-3">Demo Instructions</h2>
				<ol className="list-decimal list-inside space-y-2 text-gray-700">
					<li>
						Toggle between autosave and manual save modes using the switch below
					</li>
					<li>
						Click "Edit with Autosave" or "Edit (Manual Save)" on any post
					</li>
					<li>
						In autosave mode, changes are saved automatically after you stop
						typing
					</li>
					<li>
						Watch the field indicators change: Yellow (saving) → Green (saved)
					</li>
					<li>
						In manual mode, you must click "Save Changes" to persist updates
					</li>
				</ol>
			</div>

			<div className="mb-6 flex items-center gap-4">
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={useAutosave}
						onChange={(e) => setUseAutosave(e.target.checked)}
						className="w-4 h-4"
					/>
					<span className="font-medium">Enable Autosave Mode</span>
				</label>
				{useAutosave ? (
					<span className="text-green-600 text-sm">
						✓ Changes will save automatically
					</span>
				) : (
					<span className="text-gray-600 text-sm">Manual save required</span>
				)}
			</div>

			<div className="grid gap-4">
				<h2 className="text-xl font-semibold">Posts</h2>
				{data?.items.map((post) => (
					<div
						key={post.id}
						className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-semibold text-lg">{post.title}</h3>
								<p className="text-gray-600">{post.content || "No content"}</p>
								<p className="text-sm text-gray-500 mt-2">
									By: {post.author?.name || post.author?.email || "Unknown"}
								</p>
							</div>
							<button
								onClick={() => setEditingPost(post)}
								className={`px-4 py-2 rounded-lg text-white transition-colors ${
									useAutosave
										? "bg-green-600 hover:bg-green-700"
										: "bg-blue-600 hover:bg-blue-700"
								}`}
							>
								{useAutosave ? "Edit with Autosave" : "Edit (Manual Save)"}
							</button>
						</div>
					</div>
				))}
			</div>

			{editingPost && (
				<>
					{useAutosave ? (
						<AutoSaveEditPostForm
							post={editingPost}
							onClose={() => setEditingPost(null)}
						/>
					) : (
						<EditPostForm
							post={editingPost}
							onClose={() => setEditingPost(null)}
						/>
					)}
				</>
			)}
		</div>
	);
}
