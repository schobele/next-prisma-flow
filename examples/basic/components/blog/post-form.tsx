"use client";

import {
	AlertCircle,
	Check,
	History,
	Info,
	Loader2,
	Redo2,
	RotateCcw,
	Save,
	Undo2,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useFlowFormContext } from "@/lib/flow/core/index.client";
import {
	FlowPostForm,
	FlowPostFormSubmit,
	FlowPostFormState,
	PostFormField,
	usePostFieldValue,
	usePostFieldState,
} from "@/lib/flow/post/client";
import { cn } from "@/lib/utils";

interface PostFormProps {
	postId?: string;
	authorId: string;
}

// Custom field component for the title with slug generation
// Must be used within FlowPostForm
function TitleField() {
	const { form, mode } = useFlowFormContext();
	const [title] = usePostFieldValue("title");
	const titleState = usePostFieldState("title");

	// Auto-generate slug from title for new posts
	useEffect(() => {
		if (mode === "create" && title) {
			const slug = title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-+|-+$/g, "");
			form.setValue("slug", slug);
		}
	}, [title, mode, form]);

	return (
		<PostFormField
			name="title"
			render={({ field, fieldState }) => (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor={field.name}>
							Title <span className="text-red-500">*</span>
						</Label>
					</div>
					<div className="relative">
						<Input
							{...field}
							placeholder="Enter post title..."
							className={cn(
								fieldState.error && "border-red-500",
								fieldState.isDirty && mode === "update" && "border-blue-500",
							)}
						/>
						{fieldState.isDirty && mode === "update" && (
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute right-2 top-1/2 -translate-y-1/2"
								onClick={() => form.resetField("title")}
							>
								<RotateCcw className="w-3 h-3" />
							</Button>
						)}
					</div>
					{fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
				</div>
			)}
		/>
	);
}

// Custom content field with character count
// Must be used within FlowPostForm
function ContentField() {
	const [content] = usePostFieldValue("content");
	const charCount = content?.length || 0;
	const maxChars = 5000;

	return (
		<PostFormField
			name="content"
			render={({ field, fieldState }) => (
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor={field.name}>
							Content <span className="text-red-500">*</span>
						</Label>
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">
								{charCount} / {maxChars}
							</span>
						</div>
					</div>
					<Textarea
						{...field}
						placeholder="Write your post content here..."
						rows={12}
						className={cn(
							fieldState.error && "border-red-500",
							fieldState.isDirty && "border-blue-500",
							charCount > maxChars && "border-orange-500",
						)}
					/>
					{fieldState.error && <p className="text-sm text-red-500">{fieldState.error.message}</p>}
					{charCount > maxChars && (
						<p className="text-sm text-orange-500">
							Content exceeds maximum length
						</p>
					)}
				</div>
			)}
		/>
	);
}

// Form completion progress component
function FormProgress() {
	const { form } = useFlowFormContext();
	const values = form.watch();
	const requiredFields = ["title", "slug", "content"];
	const completed = requiredFields.filter(field => values[field]).length;
	const percentage = Math.round((completed / requiredFields.length) * 100);
	
	return (
		<div className="w-32">
			<Progress value={percentage} className="h-2" />
			<span className="text-xs text-muted-foreground">{percentage}% Complete</span>
		</div>
	);
}

// Dirty fields display component
function DirtyFieldsCard() {
	const { form, hasUnsavedChanges } = useFlowFormContext();
	const dirtyFields = Object.keys(form.formState.dirtyFields);

	if (!hasUnsavedChanges) return null;

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-sm font-medium">
						Unsaved Changes ({dirtyFields.length})
					</CardTitle>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => form.reset()}
						>
							Reset All
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-1">
					{dirtyFields.map(fieldName => (
						<div key={fieldName} className="flex items-center justify-between text-sm">
							<span className="text-muted-foreground capitalize">
								{fieldName.replace(/_/g, " ")}
							</span>
							<Badge variant="outline" className="text-xs">
								Modified
							</Badge>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}

export function PostForm({ postId, authorId }: PostFormProps) {
	const router = useRouter();

	return (
		<FlowPostForm
			mode={postId ? "update" : "create"}
			id={postId}
			defaultValues={
				postId
					? undefined
					: {
							title: "",
							slug: "",
							content: "",
							published: false,
							authorId,
					}
			}
			features={{
				autosave: postId
					? {
							enabled: true,
							debounceMs: 2000,
							onError: (error) => {
								toast.error(`Autosave failed: ${error.message}`);
							},
					}
					: false,
			}}
			onSuccess={(post) => {
				toast.success(
					postId
						? "Post updated successfully!"
						: "Post created successfully!",
				);
				router.push(`/posts/${post.id}`);
			}}
			onError={(error) => {
				toast.error(`Error: ${error.message}`);
			}}
		>
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Main content area */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Post Details</CardTitle>
							<CardDescription>
								Fill in the details for your blog post
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<TitleField />

							<PostFormField
								name="slug"
								render={({ field, fieldState }) => (
									<div className="space-y-2">
										<Label htmlFor={field.name}>
											Slug <span className="text-red-500">*</span>
										</Label>
										<Input
											{...field}
											placeholder="post-url-slug"
											className={cn(
												fieldState.error && "border-red-500",
											)}
										/>
										{fieldState.error && (
											<p className="text-sm text-red-500">
												{fieldState.error.message}
											</p>
										)}
									</div>
								)}
							/>

							<ContentField />

							<PostFormField
								name="published"
								render={({ field }) => (
									<div className="flex items-center space-x-2">
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
											id="published"
										/>
										<Label htmlFor="published">
											Publish immediately
										</Label>
									</div>
								)}
							/>

							{/* Hidden author field */}
							<PostFormField
								name="authorId"
								render={({ field }) => (
									<input type="hidden" {...field} />
								)}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Status Card */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Status</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<FormProgress />
							<Separator />
							<FlowPostFormState className="text-sm text-muted-foreground" />
						</CardContent>
					</Card>

					{/* Dirty Fields Card */}
					<DirtyFieldsCard />

					{/* Actions Card */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Actions</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<FlowPostFormSubmit className="w-full">
								{postId ? "Update Post" : "Create Post"}
							</FlowPostFormSubmit>
							<Button
								type="button"
								variant="outline"
								className="w-full"
								onClick={() => router.back()}
							>
								Cancel
							</Button>
						</CardContent>
					</Card>

					{/* Tips Card */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium">Tips</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li className="flex gap-2">
									<Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
									<span>
										{postId
											? "Changes are auto-saved after 2 seconds"
											: "Use a descriptive title for better SEO"}
									</span>
								</li>
								<li className="flex gap-2">
									<Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
									<span>
										The slug will be used in the post URL
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
			</div>
		</FlowPostForm>
	);
}