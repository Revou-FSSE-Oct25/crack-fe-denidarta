import {
	Home,
	UserMultiple,
	Course,
	Education,
	Book,
	IbmKnowledgeCatalog,
	EventSchedule,
	UserProfile,
	Certificate,
} from "@carbon/icons-react";
import type { CarbonIconType } from "@carbon/icons-react";

export interface NavItem {
	href: string;
	label: string;
	icon: CarbonIconType;
	exact: boolean;
}

export const adminNavItems: NavItem[] = [
	{ href: "/dashboard-admin", label: "Dashboard", icon: Home, exact: true },
	{
		href: "/dashboard-admin/students",
		label: "Students",
		icon: UserMultiple,
		exact: false,
	},
	{
		href: "/dashboard-admin/programs",
		label: "Programs",
		icon: Education,
		exact: false,
	},
	{
		href: "/dashboard-admin/courses",
		label: "Courses",
		icon: Course,
		exact: false,
	},
	{
		href: "/dashboard-admin/class-sessions",
		label: "Class Sessions",
		icon: EventSchedule,
		exact: false,
	},
	{
		href: "/dashboard-admin/learning-material",
		label: "Learning Material",
		icon: Book,
		exact: false,
	},
	{
		href: "/dashboard-admin/assignments",
		label: "Assignments",
		icon: IbmKnowledgeCatalog,
		exact: false,
	},
];

export const studentNavItems: NavItem[] = [
	{ href: "/dashboard-student", label: "Dashboard", icon: Home, exact: true },
	{
		href: "/dashboard-student/programs",
		label: "My Programs",
		icon: Education,
		exact: false,
	},
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
