import type { ActionResult } from "./factory";

export function unwrap<T>(result: ActionResult<T>): T {
	if (result.success) {
		return result.data;
	}

	const error = new Error(result.error.message);
	(error as any).code = result.error.code;
	(error as any).details = result.error.details;

	throw error;
}
