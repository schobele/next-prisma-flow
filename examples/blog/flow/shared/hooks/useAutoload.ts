import { useEffect, useRef, startTransition } from "react";

/**
 * Fire `action()` exactly once per component when `shouldLoad()` is true.
 * 
 * This hook provides automatic data loading with the following guarantees:
 * - Only fires once per component instance lifecycle
 * - Respects concurrent mode with startTransition for smoother UX
 * - Prevents loading loops and duplicate requests
 * 
 * @param shouldLoad - Function that returns true when loading should occur
 * @param action - Action to execute (can be sync/async)
 */
export function useAutoload(
	shouldLoad: () => boolean,
	action: () => void | Promise<unknown>,
) {
	const fired = useRef(false);

	useEffect(() => {
		if (!fired.current && shouldLoad()) {
			fired.current = true;
			// Keep UI responsive; polyfills to direct call in non-concurrent envs
			startTransition(() => {
				action();
			});
		}
	}, [shouldLoad, action]);
}