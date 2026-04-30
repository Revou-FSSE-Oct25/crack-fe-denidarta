"use client";

import "@carbon/styles/css/styles.css";
import { Theme } from "@carbon/react";

export default function CarbonProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return <Theme theme="g100">{children}</Theme>;
}
