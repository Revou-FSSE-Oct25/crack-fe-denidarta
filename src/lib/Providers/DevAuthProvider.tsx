"use client";

import { useEffect } from "react";
import { login } from "@/lib/login";

export default function DevAuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		if (process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN !== "true") return;
		if (localStorage.getItem("accessToken")) return;

		const email = process.env.NEXT_PUBLIC_DEV_EMAIL!;
		const password = process.env.NEXT_PUBLIC_DEV_PASSWORD!;

		login({ email, password }).then(({ accessToken, refreshToken }) => {
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", refreshToken);
		});
	}, []);

	return <>{children}</>;
}
