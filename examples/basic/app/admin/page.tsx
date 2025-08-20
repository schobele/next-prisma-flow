"use client";

import { Eye, EyeOff, FileText, PlusCircle, User, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PostList } from "@/components/blog/post-list";
import { AuthorForm } from "@/components/blog/author-form";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { usePostList } from "@/lib/flow/post/client";
import { useAuthorList, useDeleteAuthor } from "@/lib/flow/author/client";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export default function AdminPage() {
	const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
	const [showAuthorDialog, setShowAuthorDialog] = useState(false);

	// Using Flow hooks to get stats
	const { data: allPosts } = usePostList({});
	const { data: publishedPosts } = usePostList({ where: { published: true } });
	const { data: draftPosts } = usePostList({ where: { published: false } });
	
	// Author management
	const { data: authors, refetch: refetchAuthors } = useAuthorList({});
	const deleteAuthor = useDeleteAuthor({
		onSuccess: () => {
			toast.success("Author deleted successfully");
			refetchAuthors();
		},
		onError: (error) => {
			toast.error("Failed to delete author", {
				description: error.message,
			});
		},
	});

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						Manage your blog with Flow's FormProvider system
					</p>
				</div>
				<div className="flex gap-2">
					<Dialog open={showAuthorDialog} onOpenChange={setShowAuthorDialog}>
						<DialogTrigger asChild>
							<Button variant="outline" onClick={() => setEditingAuthorId(null)}>
								<User className="mr-2 h-4 w-4" />
								New Author
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl">
							<DialogHeader>
								<DialogTitle>
									{editingAuthorId ? "Edit Author" : "Create Author"}
								</DialogTitle>
								<DialogDescription>
									Manage author information for your blog
								</DialogDescription>
							</DialogHeader>
							<AuthorForm 
								authorId={editingAuthorId || undefined}
								onSuccess={() => {
									setShowAuthorDialog(false);
									refetchAuthors();
								}}
							/>
						</DialogContent>
					</Dialog>
					
					<Button asChild>
						<Link href="/posts/new">
							<PlusCircle className="mr-2 h-4 w-4" />
							New Post
						</Link>
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Posts</CardTitle>
						<FileText className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{allPosts?.total || 0}</div>
						<p className="text-xs text-muted-foreground">
							All posts in the system
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Published</CardTitle>
						<Eye className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{publishedPosts?.total || 0}
						</div>
						<p className="text-xs text-muted-foreground">Live on the blog</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Drafts</CardTitle>
						<EyeOff className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{draftPosts?.total || 0}</div>
						<p className="text-xs text-muted-foreground">Unpublished posts</p>
					</CardContent>
				</Card>
				
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Authors</CardTitle>
						<User className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{authors?.total || 0}</div>
						<p className="text-xs text-muted-foreground">Content creators</p>
					</CardContent>
				</Card>
			</div>

			{/* Content Management Tabs */}
			<Tabs defaultValue="posts" className="space-y-4">
				<TabsList>
					<TabsTrigger value="posts">Posts</TabsTrigger>
					<TabsTrigger value="authors">Authors</TabsTrigger>
					<TabsTrigger value="published">Published</TabsTrigger>
					<TabsTrigger value="drafts">Drafts</TabsTrigger>
				</TabsList>

				<TabsContent value="posts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Posts</CardTitle>
							<CardDescription>
								View and manage all blog posts with autosave and field tracking
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PostList showDrafts={true} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="authors" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Authors</CardTitle>
							<CardDescription>
								Manage blog authors using the FormProvider system
							</CardDescription>
						</CardHeader>
						<CardContent>
							{authors?.items && authors.items.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Name</TableHead>
											<TableHead>Email</TableHead>
											<TableHead>Posts</TableHead>
											<TableHead>Bio</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{authors.items.map((author) => (
											<TableRow key={author.id}>
												<TableCell className="font-medium">{author.name}</TableCell>
												<TableCell>{author.email}</TableCell>
												<TableCell>{author.posts?.length || 0}</TableCell>
												<TableCell className="max-w-xs truncate">
													{author.bio || "No bio"}
												</TableCell>
												<TableCell className="text-right">
													<div className="flex justify-end gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setEditingAuthorId(author.id);
																setShowAuthorDialog(true);
															}}
														>
															<Edit className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																if (confirm("Are you sure you want to delete this author?")) {
																	deleteAuthor.mutate(author.id);
																}
															}}
															disabled={author.posts && author.posts.length > 0}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									No authors yet. Create your first author to get started.
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="published" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Published Posts</CardTitle>
							<CardDescription>Posts that are live on the blog</CardDescription>
						</CardHeader>
						<CardContent>
							<PostList showDrafts={false} />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="drafts" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>Draft Posts</CardTitle>
							<CardDescription>Unpublished posts in progress</CardDescription>
						</CardHeader>
						<CardContent>
							<PostList showDrafts={true} onlyDrafts={true} />
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<Toaster position="top-right" />
		</div>
	);
}