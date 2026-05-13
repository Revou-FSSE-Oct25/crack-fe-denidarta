import StudentDashboardShell from "@/components/StudentDashboardShell";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <StudentDashboardShell>{children}</StudentDashboardShell>;
}
