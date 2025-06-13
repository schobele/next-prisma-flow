"use client";

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
			<body>{children}</body>
		</html>
	);
}
