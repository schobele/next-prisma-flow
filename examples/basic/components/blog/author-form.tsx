"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import {
	FlowAuthorForm,
	FlowAuthorFormSubmit,
	AuthorFormField,
} from "@/lib/flow/author/client";

interface AuthorFormProps {
	authorId?: string;
}

interface ExtendedAuthorFormProps extends AuthorFormProps {
	onSuccess?: () => void;
}

// Simple author form using the new streamlined API
export function AuthorForm({ authorId, onSuccess }: ExtendedAuthorFormProps) {
	const router = useRouter();
	const isEdit = !!authorId;

	return (
		<>
			<FlowAuthorForm
				mode={authorId ? "update" : "create"}
				id={authorId}
				defaultValues={
					!authorId
						? {
								name: "",
								email: "",
								bio: "",
							}
						: undefined
				}
				onSuccess={(author) => {
					toast.success(
						authorId ? "Author updated successfully!" : "Author created successfully!"
					);
					if (onSuccess) {
						onSuccess();
					} else {
						router.push("/admin");
					}
				}}
				onError={(error) => {
					toast.error(
						authorId ? "Failed to update author" : "Failed to create author",
						{
							description: error.message,
						}
					);
				}}
				features={{
					autosave: authorId
						? {
								enabled: true,
								debounceMs: 2000,
								onError: (error) => {
									console.error("Autosave failed:", error);
								},
						}
						: false,
				}}
			>
				<Card>
					<CardHeader>
						<CardTitle>{isEdit ? "Edit Author" : "Create New Author"}</CardTitle>
						<CardDescription>
							{isEdit
								? "Update author information"
								: "Add a new author to your blog"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Name field */}
						<AuthorFormField
							name="name"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										Name <span className="text-red-500">*</span>
									</Label>
									<Input
										{...field}
										placeholder="Enter author name"
										className={fieldState.error ? "border-red-500" : ""}
									/>
									{fieldState.error && (
										<p className="text-sm text-red-500">{fieldState.error.message}</p>
									)}
								</div>
							)}
						/>
						
						{/* Email field */}
						<AuthorFormField
							name="email"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>
										Email <span className="text-red-500">*</span>
									</Label>
									<Input
										{...field}
										type="email"
										placeholder="author@example.com"
										disabled={isEdit} // Can't change email after creation
										className={fieldState.error ? "border-red-500" : ""}
									/>
									{fieldState.error && (
										<p className="text-sm text-red-500">{fieldState.error.message}</p>
									)}
									{isEdit && (
										<p className="text-sm text-muted-foreground">
											Email cannot be changed after creation
										</p>
									)}
								</div>
							)}
						/>
						
						{/* Bio field */}
						<AuthorFormField
							name="bio"
							render={({ field, fieldState }) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Bio</Label>
									<Textarea
										{...field}
										placeholder="Write a short bio..."
										rows={4}
										className={fieldState.error ? "border-red-500" : ""}
									/>
									{fieldState.error && (
										<p className="text-sm text-red-500">{fieldState.error.message}</p>
									)}
									{isEdit && fieldState.isDirty && (
										<p className="text-sm text-muted-foreground">
											Changes will be auto-saved
										</p>
									)}
								</div>
							)}
						/>

						<div className="flex justify-between">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.back()}
							>
								Cancel
							</Button>
							
							<FlowAuthorFormSubmit>
								{isEdit ? "Update Author" : "Create Author"}
							</FlowAuthorFormSubmit>
						</div>
					</CardContent>
				</Card>
			</FlowAuthorForm>

			<Toaster position="top-right" />
		</>
	);
}