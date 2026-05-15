"use client";

import { useState } from "react";
import {
	Header,
	HeaderContainer,
	HeaderGlobalAction,
	HeaderGlobalBar,
	HeaderMenuButton,
	HeaderName,
	HeaderPanel,
	SideNav,
	SideNavItems,
	SideNavLink,
} from "@carbon/react";
import {
	Home,
	Course,
	Book,
	IbmKnowledgeCatalog,
	EventSchedule,
	UserProfile,
	Certificate,
	Notification,
	Search,
	Logout,
} from "@carbon/icons-react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./StudentDashboardShell.module.scss";

const navItems = [
	{ href: "/dashboard-student", label: "Dashboard", icon: Home, exact: true },
	{
		href: "/dashboard-student/courses",
		label: "My Courses",
		icon: Course,
		exact: false,
	},
	{
		href: "/dashboard-student/assignments",
		label: "Assignments",
		icon: IbmKnowledgeCatalog,
		exact: false,
	},
	{
		href: "/dashboard-student/class-sessions",
		label: "Class Sessions",
		icon: EventSchedule,
		exact: false,
	},
	{
		href: "/dashboard-student/learning-material",
		label: "Learning Material",
		icon: Book,
		exact: false,
	},
	{
		href: "/dashboard-student/profile",
		label: "My Profile",
		icon: UserProfile,
		exact: false,
	},
	{
		href: "/dashboard-student/certificates",
		label: "My Certificates",
		icon: Certificate,
		exact: false,
	},
];

export default function StudentDashboardShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

	const handleLogout = () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		router.push("/login");
	};

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
							<HeaderName href="/dashboard-student" prefix="">
								CRACK
							</HeaderName>

							<HeaderGlobalBar>
								<HeaderGlobalAction
									aria-label="Search"
									tooltipAlignment="center"
								>
									<Search size={20} />
								</HeaderGlobalAction>

								<HeaderGlobalAction
									aria-label="Notifications"
									tooltipAlignment="center"
									isActive={isNotificationPanelOpen}
									onClick={() => setIsNotificationPanelOpen((prev) => !prev)}
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

							<HeaderPanel expanded={isNotificationPanelOpen}>
								<p className={styles.panelEmpty}>No new notifications</p>
							</HeaderPanel>
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
	);
}
