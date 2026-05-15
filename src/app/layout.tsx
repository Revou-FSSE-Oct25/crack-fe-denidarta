import type { Metadata } from "next";
import "./globals.scss";
import DevAuthProvider from "@/providers/DevAuthProvider";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
	title: "Rapor Biru",
	description: "Learning OS",
	icons: {
		icon: "/favicon.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>
				<QueryProvider>
					<DevAuthProvider>{children}</DevAuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
