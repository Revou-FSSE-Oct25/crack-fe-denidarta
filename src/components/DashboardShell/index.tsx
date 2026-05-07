"use client";

import {
	Header,
	HeaderContainer,
	HeaderMenuButton,
	HeaderName,
	SideNav,
	SideNavItems,
	SideNavLink,
} from "@carbon/react";
import { Home, UserMultiple, Course, Education, Book } from "@carbon/icons-react";
import { usePathname } from "next/navigation";
import styles from "./DashboardShell.module.scss";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: Home, exact: true },
	{
		href: "/dashboard/students",
		label: "Students",
		icon: UserMultiple,
		exact: false,
	},
	{
		href: "/dashboard/courses",
		label: "Courses",
		icon: Course,
		exact: false,
	},
	{
		href: "/dashboard/programs",
		label: "Programs",
		icon: Education,
		exact: false,
	},
	{
		href: "/dashboard/learning-material",
		label: "Learning Material",
		icon: Book,
		exact: false,
	},
];

export default function DashboardShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<div className={styles.shell}>
			<HeaderContainer
				render={({ isSideNavExpanded, onClickSideNavExpand }) => (
					<>
						<Header aria-label="CRACK">
							<HeaderMenuButton
								aria-label={isSideNavExpanded ? "Close menu" : "Open menu"}
								onClick={onClickSideNavExpand}
								isActive={isSideNavExpanded}
							/>
							<HeaderName href="/dashboard" prefix="">
								CRACK
							</HeaderName>
						</Header>
						<SideNav
							aria-label="Side navigation"
							expanded={isSideNavExpanded}
							onOverlayClick={onClickSideNavExpand}
							isPersistent
						>
							<SideNavItems>
								{navItems.map(({ href, label, icon: Icon, exact }) => (
									<SideNavLink
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
	);
}
