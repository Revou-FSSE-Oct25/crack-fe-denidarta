"use client";

import { HeaderGlobalAction } from "@carbon/react";
import { Sun, Moon } from "@carbon/icons-react";

interface ThemeToggleProps {
	theme: "g10" | "g90";
	onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
	const isDark = theme === "g90";
	return (
		<HeaderGlobalAction
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			tooltipAlignment="center"
			onClick={onToggle}
		>
			{isDark ? <Sun size={20} /> : <Moon size={20} />}
		</HeaderGlobalAction>
	);
}
