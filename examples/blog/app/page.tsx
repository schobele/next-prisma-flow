"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authors, categories, posts, type Post } from "@/flow";
import type { Prisma } from "@prisma/client";
import { Calendar, Eye, Plus, Search, Tag, User } from "lucide-react";
import { useMemo, useState } from "react";

// Enhanced Form Components using the new usePostForm hook
function CreatePostForm({
	onSuccess,
	onCancel,
	authors,
	categories,
}: {
	onSuccess: () => void;
	onCancel: () => void;
	authors: any[];
	categories: any[];
}) {
	const form = posts.hooks.usePostForm(undefined, {
		onSuccess,
		onError: (error) => {
			console.error("Create post error:", error);
		},
		resetOnSuccess: true,
	}) as any; // Type assertion to work around interface issues

	return (
		<form onSubmit={form.handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Input
					{...form.register("title")}
					placeholder="Post title"
					className={form.formState.errors.title ? "border-red-500" : ""}
				/>
				{form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
			</div>

			<div className="space-y-2">
				<Input {...form.register("description")} placeholder="Description" />
				{form.formState.errors.description && (
					<p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Select value={form.watch("authorId") || ""} onValueChange={(value) => form.setValue("authorId", value)}>
					<SelectTrigger className={form.formState.errors.authorId ? "border-red-500" : ""}>
						<SelectValue placeholder="Select author" />
					</SelectTrigger>
					<SelectContent>
						{authors?.map((author) => (
							<SelectItem key={author.id} value={author.id}>
								{author.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{form.formState.errors.authorId && <p className="text-red-500 text-sm">{form.formState.errors.authorId.message}</p>}
			</div>

			<div className="space-y-2">
				<Select
					value={form.watch("categoryId") || ""}
					onValueChange={(value) => form.setValue("categoryId", value || undefined)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select category (optional)" />
					</SelectTrigger>
					<SelectContent>
						{categories?.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Select value={form.watch("status") || "DRAFT"} onValueChange={(value) => form.setValue("status", value)}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="DRAFT">Draft</SelectItem>
						<SelectItem value="PUBLISHED">Published</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-2 pt-4">
				<Button type="submit" className="flex-1" disabled={form.isSubmitting}>
					{form.isCreating ? "Creating..." : "Create Post"}
				</Button>
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
			</div>

			{form.submitError && (
				<div className="p-3 bg-red-50 border border-red-200 rounded">
					<p className="text-red-600 text-sm">Error: {form.submitError.message || "Failed to create post"}</p>
				</div>
			)}
		</form>
	);
}

// Edit Form Component
function EditPostForm({
	post,
	onSuccess,
	onCancel,
	authors,
	categories,
}: {
	post: Post;
	onSuccess: () => void;
	onCancel: () => void;
	authors: any[];
	categories: any[];
}) {
	const form = posts.hooks.usePostForm(post, {
		onSuccess,
		onError: (error) => {
			console.error("Update post error:", error);
		},
	}) as any; // Type assertion to work around interface issues

	return (
		<form onSubmit={form.handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Input
					{...form.register("title")}
					placeholder="Post title"
					className={form.formState.errors.title ? "border-red-500" : ""}
				/>
				{form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
			</div>

			<div className="space-y-2">
				<Input {...form.register("description")} placeholder="Description" />
				{form.formState.errors.description && (
					<p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<Select value={form.watch("authorId") || ""} onValueChange={(value) => form.setValue("authorId", value)}>
					<SelectTrigger>
						<SelectValue placeholder="Select author" />
					</SelectTrigger>
					<SelectContent>
						{authors?.map((author) => (
							<SelectItem key={author.id} value={author.id}>
								{author.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Select
					value={form.watch("categoryId") || ""}
					onValueChange={(value) => form.setValue("categoryId", value || undefined)}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select category (optional)" />
					</SelectTrigger>
					<SelectContent>
						{categories?.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Select value={form.watch("status") || "DRAFT"} onValueChange={(value) => form.setValue("status", value)}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="DRAFT">Draft</SelectItem>
						<SelectItem value="PUBLISHED">Published</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex gap-2 pt-4">
				<Button type="submit" className="flex-1" disabled={form.isSubmitting}>
					{form.isUpdating ? "Updating..." : "Update Post"}
				</Button>
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
			</div>

			{form.submitError && (
				<div className="p-3 bg-red-50 border border-red-200 rounded">
					<p className="text-red-600 text-sm">Error: {form.submitError.message || "Failed to update post"}</p>
				</div>
			)}
		</form>
	);
}

export default function BlogPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("__all__");
	const [selectedStatus, setSelectedStatus] = useState<string>("__all__");
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingPost, setEditingPost] = useState<Post | null>(null);

	// Flow hooks - unified API for data fetching and mutations
	const {
		data: postsData,
		loading: postsLoading,
		createPost,
		updatePost,
		deletePost,
		hasAny: hasAnyPosts,
	} = posts.hooks.usePosts();

	const { data: categoriesData } = categories.hooks.useCategories();
	const { data: authorsData } = authors.hooks.useAuthors();

	// Filter and search posts
	const filteredPosts = useMemo(() => {
		if (!postsData) return [];

		return postsData.filter((post) => {
			// Search filter
			if (
				searchQuery &&
				!post.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
				!post.description?.toLowerCase().includes(searchQuery.toLowerCase())
			) {
				return false;
			}

			// Category filter
			if (selectedCategory !== "__all__" && post.category?.id !== selectedCategory) {
				return false;
			}

			// Status filter
			if (selectedStatus !== "__all__" && post.status !== selectedStatus) {
				return false;
			}

			return true;
		});
	}, [postsData, searchQuery, selectedCategory, selectedStatus]);

	// Calculate statistics
	const stats = {
		total: postsData?.length || 0,
		published: postsData?.filter((p) => p.status === "PUBLISHED").length || 0,
		draft: postsData?.filter((p) => p.status === "DRAFT").length || 0,
		categories: categoriesData?.length || 0,
	};

	const handleCreatePost = async (data: Prisma.PostUncheckedCreateInput) => {
		await createPost({
			title: data.title,
			description: data.description,
			status: data.status || "DRAFT",
			authorId: data.authorId,
			...(data.categoryId && {
				categoryId: data.categoryId,
			}),
		});
		setShowCreateForm(false);
	};

	const handleUpdatePost = async (id: string, updates: Prisma.PostUncheckedUpdateInput) => {
		const postUpdate = await updatePost({
			id,
			data: updates,
		});

		console.log("postUpdate", postUpdate);
		setEditingPost(null);
	};

	const handleDeletePost = async (id: string) => {
		await deletePost(id);
	};

	const formatDate = (date: string | Date) => {
		return new Date(date).toLocaleDateString();
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "PUBLISHED":
				return "bg-green-100 text-green-800";
			case "DRAFT":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-4xl font-bold text-gray-900 mb-2">Blog Dashboard</h1>
							<p className="text-gray-600">Powered by Next Prisma Flow Generator - Type-safe, optimistic updates</p>
						</div>
						<Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
							<Plus className="h-4 w-4 mr-2" />
							New Post
						</Button>
					</div>

					{/* Statistics */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Total Posts</p>
										<p className="text-2xl font-bold">{stats.total}</p>
									</div>
									<Eye className="h-8 w-8 text-blue-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Published</p>
										<p className="text-2xl font-bold text-green-600">{stats.published}</p>
									</div>
									<Calendar className="h-8 w-8 text-green-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Drafts</p>
										<p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
									</div>
									<User className="h-8 w-8 text-yellow-500" />
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">Categories</p>
										<p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
									</div>
									<Tag className="h-8 w-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Filters */}
					<Card>
						<CardContent className="p-4">
							<div className="flex flex-wrap gap-4 items-center">
								{/* Search */}
								<div className="relative flex-1 min-w-64">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
									<Input
										placeholder="Search posts..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10"
									/>
								</div>

								{/* Category Filter */}
								<Select value={selectedCategory} onValueChange={setSelectedCategory}>
									<SelectTrigger className="w-48">
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__all__">All Categories</SelectItem>
										{categoriesData?.map((cat) => (
											<SelectItem key={cat.id} value={cat.id}>
												{cat.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>

								{/* Status Filter */}
								<Select value={selectedStatus} onValueChange={setSelectedStatus}>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="__all__">All Status</SelectItem>
										<SelectItem value="PUBLISHED">Published</SelectItem>
										<SelectItem value="DRAFT">Draft</SelectItem>
									</SelectContent>
								</Select>

								{/* Clear Filters */}
								{(searchQuery || selectedCategory !== "__all__" || selectedStatus !== "__all__") && (
									<Button
										variant="outline"
										onClick={() => {
											setSearchQuery("");
											setSelectedCategory("__all__");
											setSelectedStatus("__all__");
										}}
									>
										Clear
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Posts List */}
				<div className="space-y-4">
					{postsLoading && !hasAnyPosts ? (
						<div className="space-y-4">
							{[1, 2, 3].map((i) => (
								<Card key={i} className="h-32">
									<CardContent className="p-6">
										<div className="animate-pulse space-y-3">
											<div className="h-4 bg-gray-200 rounded w-3/4" />
											<div className="h-3 bg-gray-200 rounded w-1/2" />
											<div className="h-3 bg-gray-200 rounded w-1/4" />
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					) : filteredPosts && filteredPosts.length > 0 ? (
						filteredPosts.map((post) => {
							const category = post.category;
							const author = post.author;

							return (
								<Card key={post.id} className="hover:shadow-lg transition-shadow">
									<CardHeader className="pb-3">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<CardTitle className="text-xl mb-2">{post.title}</CardTitle>
												<p className="text-gray-600 text-sm mb-3">{post.description}</p>
												<div className="flex items-center gap-4 text-sm text-gray-500">
													<div className="flex items-center gap-1">
														<User className="h-4 w-4" />
														{author?.name || "Unknown Author"}
													</div>
													<div className="flex items-center gap-1">
														<Calendar className="h-4 w-4" />
														{formatDate(post.createdAt)}
													</div>
													{category && (
														<div className="flex items-center gap-1">
															<Tag className="h-4 w-4" />
															<span
																className="px-2 py-1 rounded text-xs"
																style={{ backgroundColor: `${category.color}20`, color: category.color }}
															>
																{category.name}
															</span>
														</div>
													)}
												</div>
											</div>
											<div className="flex items-start gap-2">
												<Badge className={getStatusColor(post.status)}>{post.status}</Badge>
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-0">
										<div className="flex items-center justify-between">
											<div className="text-sm text-gray-500">
												{post.publishedAt ? (
													<span>Published {formatDate(post.publishedAt)}</span>
												) : (
													<span>Updated {formatDate(post.updatedAt)}</span>
												)}
											</div>
											<div className="flex gap-2">
												<Button variant="outline" size="sm" onClick={() => setEditingPost(post)}>
													Edit
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleUpdatePost(post.id, {
															status: post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
															publishedAt: post.status === "DRAFT" ? new Date() : null,
														})
													}
												>
													{post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
												</Button>
												<Button variant="destructive" size="sm" onClick={() => handleDeletePost(post.id)}>
													Delete
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})
					) : (
						<Card className="py-12">
							<CardContent className="text-center">
								<p className="text-gray-500 mb-4">No posts found</p>
								<Button onClick={() => setShowCreateForm(true)}>
									<Plus className="h-4 w-4 mr-2" />
									Create Your First Post
								</Button>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Enhanced Create Form Modal */}
				{showCreateForm && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
							<CardHeader>
								<CardTitle>Create New Post</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<CreatePostForm
									onSuccess={() => setShowCreateForm(false)}
									onCancel={() => setShowCreateForm(false)}
									authors={authorsData || []}
									categories={categoriesData || []}
								/>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Enhanced Edit Form Modal */}
				{editingPost && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
							<CardHeader>
								<CardTitle>Edit Post</CardTitle>
							</CardHeader>
							<CardContent>
								<EditPostForm
									post={editingPost}
									onSuccess={() => setEditingPost(null)}
									onCancel={() => setEditingPost(null)}
									authors={authorsData || []}
									categories={categoriesData || []}
								/>
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
