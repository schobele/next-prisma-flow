// Mock types for baseline validation - these would normally come from Next.js

export interface Request {
	nextUrl: {
		searchParams: URLSearchParams;
	};
	json(): Promise<any>;
}

export interface Response {
	json(data: any, options?: { status?: number }): Response;
}

export const Response = {
	json: (data: any, options?: { status?: number }): Response => {
		return {
			json: (data: any, options?: { status?: number }) => Response.json(data, options),
		} as Response;
	},
};
