"use client";

import { Provider as JotaiProvider } from "jotai";
import "./globals.css";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<title>TodoList - Prisma StateX Generator Example</title>
				<meta name="description" content="Simple todo list demonstrating Prisma StateX Generator capabilities" />
			</head>
			<body>
				<JotaiProvider>{children}</JotaiProvider>
			</body>
		</html>
	);
}
