// hooks.ts
import { useAtomValue, useSetAtom } from "jotai";
import { entityAtomFamily, errorAtom, pendingPatchesAtom } from "./atoms";
import {
	countAtom,
	countByFieldAtomFamily,
	entityBusyFamily,
	entityLoadableFamily,
	hasAnyAtom,
	listByFieldAtomFamily,
	listLoadable,
	loadingAtom,
	pagedAtom,
	searchAtom,
	selectedAtom,
	selectedIdAtom,
} from "./derived";

import { makeRelationHelpers } from "../shared/hooks/relation-helper";
import { createFormActions, makeUseFormHook, type UseFormOptions } from "../shared/hooks/use-form-factory";
import { useAutoload } from "../shared/hooks/useAutoload";
import { createAtom, deleteAtom, loadEntityAtom, loadsListAtom, updateAtom, upsertAtom } from "./fx";
import { schemas } from "./schemas";
import type { CreateInput, ModelType, Relationships, UpdateInput } from "./types";

/**
 * Hook for managing the complete posts collection with comprehensive state management.
 *
 * Provides access to the full posts list along with loading states, error handling,
 * and all necessary CRUD operations. This hook manages the global state for posts
 * and automatically handles loading indicators and error states.
 *
 * @param {Object} opts - Configuration options
 * @param {boolean} [opts.autoLoad=true] - Whether to automatically load data when component mounts
 *
 * @returns {Object} Complete posts management interface
 * @returns {Array} data - Array of posts (empty array when loading or on error)
 * @returns {number} count - Total number of posts available
 * @returns {boolean} hasAny - Quick check if any posts exist
 * @returns {boolean} loading - True when fetching data or performing operations
 * @returns {Error|null} error - Last error that occurred, null if no errors
 * @returns {Function} createPost - Creates a new post
 * @returns {Function} updatePost - Updates an existing post
 * @returns {Function} upsertPost - Upserts a post
 * @returns {Function} deletePost - Deletes a post by ID
 * @returns {Function} fetchAll - Refreshes the entire posts list
 *
 * @example
 * ```tsx
 * function PostsList() {
 *   const { data, loading, error, createPost, updatePost, deletePost } = usePosts();
 *
 *   if (loading) return <div>Loading posts...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data.map(post => (
 *         <PostItem key={post.id} post={post} onUpdate={updatePost} onDelete={deletePost} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePosts(opts: { autoLoad?: boolean } = { autoLoad: true }) {
	const loadable = useAtomValue(listLoadable);
	const busy = useAtomValue(loadingAtom);
	const count = useAtomValue(countAtom);
	const hasAny = useAtomValue(hasAnyAtom);
	const lastError = useAtomValue(errorAtom);

	const createPost = useSetAtom(createAtom);
	const updatePost = useSetAtom(updateAtom);
	const deletePost = useSetAtom(deleteAtom);
	const upsertPost = useSetAtom(upsertAtom);
	const fetchAll = useSetAtom(loadsListAtom);
	const fetchById = useSetAtom(loadEntityAtom);

	useAutoload(
		() => opts.autoLoad !== false && !busy && !hasAny,
		() => fetchAll({}, {}),
	);

	return {
		/* data */
		data: loadable.state === "hasData" ? loadable.data : [],
		count,
		hasAny,

		/* meta */
		loading: busy || loadable.state === "loading",
		error: loadable.state === "hasError" ? loadable.error : lastError,

		/* actions */
		createPost,
		updatePost,
		deletePost,
		upsertPost,
		fetchAll,
		fetchById,
	};
}

/**
 * Hook for managing a specific post by ID with optimistic updates and error handling.
 *
 * Provides granular control over individual posts, including fetching, updating, and deleting.
 * The hook automatically manages loading states and errors specific to this post instance.
 * Actions are pre-bound with the post ID for convenience.
 *
 * @param {string} id - The unique identifier of the post to manage
 * @param {Object} opts - Configuration options
 * @param {boolean} [opts.autoLoad=true] - Whether to automatically load data when component mounts
 *
 * @returns {Object} Single post management interface
 * @returns {Object|null} data - The post data object, null if not found or loading
 * @returns {boolean} loading - True when fetching or performing operations on this post
 * @returns {Error|null} error - Last error related to operations on this post
 * @returns {Function} updatePost - Updates this specific post with provided data
 * @returns {Function} deletePost - Deletes this specific post
 * @returns {Function} fetch - Fetches/refreshes this specific post from the server
 * @returns {Object} relations - relationship helpers
 *
 * @example
 * ```tsx
 * function PostDetail({ postId }: { postId: string }) {
 *   const { data, loading, error, updatePost, deletePost } = usePost(postId);
 *
 *   if (loading) return <div>Loading post...</div>;
 *   if (error) return <div>Error loading post: {error.message}</div>;
 *   if (!data) return <div>Post not found</div>;
 *
 *   const handleSave = (formData) => {
 *     updatePost(formData); // ID is automatically included
 *   };
 *
 *   return (
 *     <div>
 *       <h1>{data.title}</h1>
 *       <p>{data.content}</p>
 *       <button onClick={() => deletePost()}>Delete</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePost(id: string, opts: { autoLoad?: boolean } = { autoLoad: true }) {
	const post = useAtomValue(entityAtomFamily(id));
	const loadable = useAtomValue(entityLoadableFamily(id));
	const busyItem = useAtomValue(entityBusyFamily(id));
	const lastError = useAtomValue(errorAtom);
	const pendingPatches = useAtomValue(pendingPatchesAtom);

	const updatePost = useSetAtom(updateAtom);
	const deletePost = useSetAtom(deleteAtom);
	const fetch = useSetAtom(loadEntityAtom);

	const relations = makeRelationHelpers<Relationships>(id, updatePost);

	useAutoload(
		() => opts.autoLoad !== false && !busyItem && !post && !pendingPatches[id],
		() => fetch({ id }),
	);

	return {
		/* data */
		data: post,

		/* meta */
		loading: busyItem || loadable.state === "loading",
		error: lastError,

		/* actions */
		updatePost: (data: UpdateInput) => updatePost({ id, data }),
		deletePost: () => deletePost(id),
		fetch: () => fetch({ id }),

		/* relations */
		relations,
	};
}

/**
 * Enhanced form hook with integrated CRUD operations and optimistic updates.
 *
 * Automatically detects create vs update mode based on whether an instance is provided.
 * Integrates directly with the post atoms for seamless state management.
 *
 * @param {ModelType} [instance] - Post instance for update mode, undefined for create mode
 * @param {Object} [options] - Form options and callbacks
 * @param {Function} [options.onSuccess] - Callback fired on successful submission
 * @param {Function} [options.onError] - Callback fired on submission error
 * @param {boolean} [options.resetOnSuccess=true] - Whether to reset form after successful creation
 * @param {Object} [options.transform] - Data transformation functions
 *
 * @returns {Object} Enhanced form interface with submission handling
 * @returns {Function} handleSubmit - Form submission handler
 * @returns {boolean} isSubmitting - Whether form is currently submitting
 * @returns {boolean} isCreating - Whether form is in create mode and submitting
 * @returns {boolean} isUpdating - Whether form is in update mode and submitting
 * @returns {string} mode - Current form mode: 'create' | 'update'
 * @returns {any} submitError - Last submission error, if any
 * @returns {*} ...formMethods - All react-hook-form methods and state
 *
 * @example
 * ```tsx
 * function PostForm({ post, onClose }) {
 *   const form = usePostForm(post, {
 *     onSuccess: () => onClose(),
 *     onError: (error) => toast.error(error.message),
 *     transform: {
 *       toCreateInput: (data) => ({
 *         ...data,
 *         authorId: data.author?.id || data.authorId,
 *         categoryId: data.category?.id || data.categoryId,
 *       }),
 *     },
 *   });
 *
 *   return (
 *     <form onSubmit={form.handleSubmit}>
 *       <input {...form.register('title')} placeholder="Title" />
 *       <textarea {...form.register('description')} placeholder="Description" />
 *       <button type="submit" disabled={form.isSubmitting}>
 *         {form.isSubmitting
 *           ? (form.mode === 'create' ? 'Creating...' : 'Updating...')
 *           : (form.mode === 'create' ? 'Create Post' : 'Update Post')
 *         }
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function usePostForm(instance?: ModelType, options: UseFormOptions<ModelType> = {}) {
	const createPostAction = useSetAtom(createAtom);
	const updatePostAction = useSetAtom(updateAtom);

	const formActions = createFormActions(createPostAction, updatePostAction);

	return makeUseFormHook<ModelType, CreateInput, UpdateInput>(
		{
			create: schemas.createInput,
			update: schemas.updateInput,
		},
		formActions,
	)(instance, options);
}

export const useSelectedId = () => useAtomValue(selectedIdAtom);
export const useSelected = () => useAtomValue(selectedAtom);
export const useSetSelectedId = () => useSetAtom(selectedIdAtom);

export function useListByFieldValue<K extends keyof ModelType>(field: K, value: ModelType[K]) {
	const fam = listByFieldAtomFamily(field);
	return useAtomValue(fam(value));
}

export function usePagedList(page: number, pageSize = 10) {
	return useAtomValue(pagedAtom({ page, pageSize }));
}

export function useSearch(query: string) {
	return useAtomValue(searchAtom(query));
}

export function useCountByFieldValue<K extends keyof ModelType>(field: K, value: ModelType[K]) {
	const fam = countByFieldAtomFamily(field);
	return useAtomValue(fam(value));
}
