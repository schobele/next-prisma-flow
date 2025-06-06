"use client";

import { FlowProvider } from "@/generated/flow";
import "./globals.css";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<title>TodoList - Next Prisma Flow v0.2.1 Example</title>
				<meta name="description" content="Todo list demonstrating Next Prisma Flow v0.2.1 with FlowProvider" />
			</head>
			<body>
				<FlowProvider
					config={{
						devTools: true,
						errorBoundary: true,
						autoRefresh: false,
					}}
					onError={(error, context, modelName) => {
						console.error(`[Flow Error] ${context}${modelName ? ` (${modelName})` : ""}:`, error);
						// In production, you might want to send this to an error tracking service
					}}
					onLoading={(isLoading, modelName) => {
						console.log(`[Flow Loading] ${modelName || "Global"}: ${isLoading}`);
					}}
				>
					{children}
				</FlowProvider>
			</body>
		</html>
	);
}
