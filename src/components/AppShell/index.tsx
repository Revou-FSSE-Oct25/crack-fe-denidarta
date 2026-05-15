"use client";

import { useEffect, useState } from "react";
import {
	Header,
	HeaderContainer,
	HeaderGlobalAction,
	HeaderGlobalBar,
	HeaderMenuButton,
	HeaderPanel,
	SideNav,
	SideNavItems,
	SideNavLink,
	Theme,
} from "@carbon/react";
import { Notification, Search, Logout } from "@carbon/icons-react";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { adminNavItems, studentNavItems } from "./nav-config";
import styles from "./AppShell.module.scss";

type AppRole = "admin" | "student";
type AppTheme = "g10" | "g90";

interface AppShellProps {
	role: AppRole;
	children: React.ReactNode;
}

const homeHref: Record<AppRole, string> = {
	admin: "/dashboard-admin",
	student: "/dashboard-student",
};

export default function AppShell({ role, children }: AppShellProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
	const [theme, setTheme] = useState<AppTheme>("g10");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const saved = localStorage.getItem("crack-theme");
		if (saved === "g10" || saved === "g90") setTheme(saved);

		queueMicrotask(() => {
			setMounted(true);
		});
	}, []);

	const toggleTheme = () => {
		setTheme((prev) => {
			const next: AppTheme = prev === "g10" ? "g90" : "g10";
			localStorage.setItem("crack-theme", next);
			return next;
		});
	};

	const handleLogout = () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		router.push("/login");
	};

	const navItems = role === "admin" ? adminNavItems : studentNavItems;

	return (
		<Theme theme={theme}>
			<div className={styles.shell}>
				<HeaderContainer
					render={({ isSideNavExpanded, onClickSideNavExpand }) => (
						<>
							<Header
								aria-label="CRACK"
								className={
									theme === "g10" ? styles.headerLight : styles.headerDark
								}
							>
								<HeaderMenuButton
									aria-label={isSideNavExpanded ? "Close menu" : "Open menu"}
									onClick={onClickSideNavExpand}
									isActive={isSideNavExpanded}
								/>
								{theme === "g10" ? (
									// Light theme, use Light Logo
									<img
										src="/logo_light.svg"
										alt="CRACK Logo"
										style={{ height: "40px", margin: "0 16px" }}
									/>
								) : (
									// Dark theme, use Dark Logo
									<img
										src="/logo_dark.svg"
										alt="CRACK Logo"
										style={{ height: "40px", margin: "0 16px" }}
									/>
								)}
								{mounted && (
									<HeaderGlobalBar>
										<HeaderGlobalAction
											aria-label="Search"
											tooltipAlignment="center"
										>
											<Search size={20} />
										</HeaderGlobalAction>

										<ThemeToggle theme={theme} onToggle={toggleTheme} />

										<HeaderGlobalAction
											aria-label="Notifications"
											tooltipAlignment="center"
											isActive={isNotificationPanelOpen}
											onClick={() =>
												setIsNotificationPanelOpen((prev) => !prev)
											}
										>
											<Notification size={20} />
										</HeaderGlobalAction>

										<HeaderGlobalAction
											aria-label="Logout"
											tooltipAlignment="end"
											onClick={handleLogout}
										>
											<Logout size={20} />
										</HeaderGlobalAction>
									</HeaderGlobalBar>
								)}

								{mounted && (
									<HeaderPanel expanded={isNotificationPanelOpen}>
										<p className={styles.panelEmpty}>No new notifications</p>
									</HeaderPanel>
								)}
							</Header>

							<SideNav
								aria-label="Side navigation"
								expanded={isSideNavExpanded}
								onOverlayClick={onClickSideNavExpand}
								isPersistent
								className={
									theme === "g10" ? styles.sideNavLight : styles.sideNavDark
								}
							>
								<SideNavItems>
									{navItems.map(({ href, label, icon: Icon, exact }) => (
										<SideNavLink
											large
											key={href}
											href={href}
											renderIcon={Icon}
											isActive={
												exact ? pathname === href : pathname.startsWith(href)
											}
										>
											{label}
										</SideNavLink>
									))}
								</SideNavItems>
							</SideNav>
						</>
					)}
				/>
				<div className={styles.layout}>
					<div className={styles.navSpacer} />
					<main className={styles.main}>{children}</main>
				</div>
			</div>
		</Theme>
	);
}
