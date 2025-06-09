/**
 * Build a typed relation-helper object
 */
export function makeRelationHelpers<R extends Record<string, { where: any; many: boolean }>>(
	id: string,
	update: (arg: { id: string; data: any }) => Promise<unknown>,
) {
	type Helpers = {
		[K in keyof R]: R[K] extends { where: infer Where; many: infer M }
			? M extends true
				? {
						connect: (where: Where | Where[]) => Promise<void>;
						disconnect: (where: Where | Where[]) => Promise<void>;
						set: (where: Where[]) => Promise<void>;
						clear: () => Promise<void>;
					}
				: {
						connect: (where: Where) => Promise<void>;
						disconnect: () => Promise<void>;
					}
			: never;
	};

	const factory = {} as Helpers;

	for (const key of Object.keys({}) as (keyof R)[]) {
		const relation = key as string;

		(factory as any)[relation] = {
			connect: (where: any) => update({ id, data: { [relation]: { connect: where } } }),
			disconnect: (arg?: any) => {
				const disconnectPayload = Array.isArray(arg) || arg ? { disconnect: arg } : { disconnect: true };
				return update({ id, data: { [relation]: disconnectPayload } });
			},
			set: (whereArr: any[]) => update({ id, data: { [relation]: { set: whereArr } } }),
			clear: () => update({ id, data: { [relation]: { set: [] } } }),
		};
	}

	return factory as Helpers;
}
