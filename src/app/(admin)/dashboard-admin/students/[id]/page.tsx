"use client";

import { use } from "react";
import {
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Tag,
	Grid,
	Column,
	Stack,
	Loading,
} from "@carbon/react";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "@/services/users.service";
import { fetchUserEnrollments } from "@/services/enrollments.service";
import { fetchUserSubmissions } from "@/services/submissions.service";
import { getProfileByUserId } from "@/services/profile.service";
import { fetchAttendanceByStudentId } from "@/services/class-sessions.service";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection from "@/components/ResourceTableSection";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import styles from "./students-detail.module.scss";
import {
	studentProfileContents,
	studentProfileAssignments,
	studentProfileAttendances,
} from "@/constants";

export default function StudentsDetailPage({
	params: paramsPromise,
}: {
	params: Promise<{ id: string }>;
}) {
	const params = use(paramsPromise);
	const { id } = params;

	const { data: user, isLoading: userLoading } = useQuery({
		queryKey: ["user", id],
		queryFn: () => fetchUser(id),
	});

	const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
		queryKey: ["user-enrollments", id],
		queryFn: () => fetchUserEnrollments(id),
	});

	const { data: submissions, isLoading: submissionsLoading } = useQuery({
		queryKey: ["user-submissions", id],
		queryFn: () => fetchUserSubmissions(id),
	});

	const { data: profiles, isLoading: profileLoading } = useQuery({
		queryKey: ["profile", id],
		queryFn: () => getProfileByUserId(id),
	});
	const { data: attendance, isLoading: attendanceLoading } = useQuery({
		queryKey: ["user-attendance", id],
		queryFn: () => fetchAttendanceByStudentId(id),
	});

	if (userLoading || profileLoading) return <Loading />;
	if (!user) return <div>User not found</div>;

	const fullName = user?.profile?.fullName;
	return (
		<PageLayout>
			<PageHeader
				title={fullName ?? ""}
				subtitle={user?.email}
				actions={
					<Tag type={statusTagType(user?.status ?? "")}>
						{user?.status?.toUpperCase()}
					</Tag>
				}
			/>

			<div className={styles.content}>
				<Tabs>
					<TabList aria-label="Student details tabs">
						<Tab>Overview</Tab>
						<Tab>Enrollments ({enrollments?.length ?? 0})</Tab>
						<Tab>Assignments ({submissions?.data?.length ?? 0})</Tab>
						<Tab>Attendance ({attendance?.data?.length ?? 0})</Tab>
					</TabList>
					<TabPanels>
						<TabPanel>
							<Grid className={styles.tabContent}>
								<Column lg={8} md={8} sm={4}>
									<Stack gap={6}>
										<section>
											<h4 className={styles.sectionTitle}>Profile Info</h4>
											<div className={styles.infoGrid}>
												<div className={styles.infoItem}>
													<span className={styles.label}>Username</span>
													<span className={styles.value}>{user?.username}</span>
												</div>
												<div className={styles.infoItem}>
													<span className={styles.label}>Email Address</span>
													<span className={styles.value}>{user?.email}</span>
												</div>
												<div className={styles.infoItem}>
													<span className={styles.label}>Joined Date</span>
													<span className={styles.value}>
														{user?.createdAt
															? new Date(user.createdAt).toLocaleDateString(
																	DATE_LOCALE,
																)
															: "-"}
													</span>
												</div>
											</div>
										</section>

										<section>
											<h4 className={styles.sectionTitle}>Academic Info</h4>
											<div className={styles.infoGrid}>
												<div className={styles.infoItem}>
													<span className={styles.label}>NIM</span>
													<span className={styles.value}>
														{user?.studentProfile?.nim ?? "-"}
													</span>
												</div>
												<div className={styles.infoItem}>
													<span className={styles.label}>Major</span>
													<span className={styles.value}>
														{user?.studentProfile?.major ?? "-"}
													</span>
												</div>
												<div className={styles.infoItem}>
													<span className={styles.label}>GPA</span>
													<span className={styles.value}>
														{user?.studentProfile?.gpa
															? String(user.studentProfile.gpa)
															: "0.00"}
													</span>
												</div>
												<div className={styles.infoItem}>
													<span className={styles.label}>Status</span>
													<span className={styles.value}>
														{user?.studentProfile?.academicStatus ?? "-"}
													</span>
												</div>
											</div>
										</section>
									</Stack>
								</Column>
							</Grid>
						</TabPanel>

						<TabPanel>
							<div className={styles.tabContent}>
								<ResourceTableSection
									loading={enrollmentsLoading}
									error={null}
									headers={studentProfileContents}
									rows={
										enrollments?.map((e) => ({
											id: e.id,
											programName: e.program.name,
											status: e.status,
											enrolledAt: e.createdAt
												? new Date(e.createdAt).toLocaleDateString(DATE_LOCALE)
												: "-",
										})) ?? []
									}
									renderCell={(cell) => {
										if (cell.info.header === "status") {
											return (
												<Tag type={statusTagType(String(cell.value))} size="sm">
													{String(cell.value).toUpperCase()}
												</Tag>
											);
										}
										return null;
									}}
								/>
							</div>
						</TabPanel>

						<TabPanel>
							<div className={styles.tabContent}>
								<ResourceTableSection
									loading={submissionsLoading}
									error={null}
									headers={studentProfileAssignments}
									rows={
										submissions?.data.map((s) => ({
											id: s.id,
											assignmentTitle: s.assignment?.title ?? "Unknown",
											status: s.status,
											grade: s.grade,
											submittedAt: s.submittedAt
												? new Date(s.submittedAt).toLocaleDateString(
														DATE_LOCALE,
													)
												: "-",
										})) ?? []
									}
									renderCell={(cell) => {
										if (cell.info.header === "status") {
											return (
												<Tag type={statusTagType(String(cell.value))} size="sm">
													{String(cell.value).toUpperCase()}
												</Tag>
											);
										}
										if (cell.info.header === "grade") {
											if (
												cell.value === null ||
												cell.value === undefined ||
												cell.value === "-"
											) {
												return "-";
											}
											// Handle Decimal object or string/number
											const grade =
												typeof cell.value === "object"
													? Number(cell.value)
													: Number(cell.value);

											return isNaN(grade) ? (
												"-"
											) : (
												<span
													style={{
														fontWeight: "bold",
														color: grade >= 70 ? "#24a148" : "#da1e28",
													}}
												>
													{grade}
												</span>
											);
										}
										return null;
									}}
								/>
							</div>
						</TabPanel>
						<TabPanel>
							<div className={styles.tabContent}>
								<ResourceTableSection
									loading={attendanceLoading}
									error={null}
									title="Attendance History"
									description="View student's attendance records across all sessions."
									headers={studentProfileAttendances}
									rows={
										attendance?.data?.map((a) => ({
											id: a.id,
											session: a.classSession?.title ?? "Unknown Session",
											date: a.classSession?.sessionDate
												? new Date(
														a.classSession.sessionDate,
													).toLocaleDateString(DATE_LOCALE)
												: "—",
											status: a.status,
											verified: a.isVerified ? "Verified" : "Pending",
										})) ?? []
									}
									renderCell={(cell) => {
										if (cell.info.header === "status") {
											return (
												<Tag type={statusTagType(String(cell.value))} size="sm">
													{String(cell.value).toUpperCase()}
												</Tag>
											);
										}
										if (cell.info.header === "verified") {
											return (
												<Tag
													type={
														cell.value === "Verified" ? "green" : "cool-gray"
													}
													size="sm"
												>
													{String(cell.value)}
												</Tag>
											);
										}
										return null;
									}}
								/>
							</div>
						</TabPanel>
					</TabPanels>
				</Tabs>
			</div>
		</PageLayout>
	);
}
