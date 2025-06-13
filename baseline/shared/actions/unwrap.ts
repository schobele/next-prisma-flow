import type { ActionResult } from "./factory";

export const unwrap = <T>(res: ActionResult<T>): T => {
	if (res.success) return res.data;
	throw res.error;
};
