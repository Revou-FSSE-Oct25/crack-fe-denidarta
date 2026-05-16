"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  DataTableSkeleton,
  InlineNotification,
  Loading,
  Tag,
  DataTable,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import { Launch } from "@carbon/icons-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseById } from "@/services/courses.service";
import { fetchMyLearningMaterials } from "@/services/learning-materials.service";
import { fetchMySessionsWithAttendance } from "@/services/class-sessions.service";
import { fetchMyAssignments } from "@/services/assignments.service";
import StatTile from "@/components/StatTile";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import styles from "./page.module.scss";

export default function StudentCourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ["course", id],
    queryFn: () => fetchCourseById(id),
    enabled: !!id,
  });

  const { data: allMaterials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["my-learning-materials"],
    queryFn: fetchMyLearningMaterials,
  });

  const { data: allSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: fetchMySessionsWithAttendance,
  });

  const { data: allAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["my-assignments"],
    queryFn: fetchMyAssignments,
  });

  const materials = useMemo(
    () => allMaterials.filter((m) => m.courseName === course?.name),
    [allMaterials, course]
  );

  const sessions = useMemo(
    () => allSessions.filter((s) => s.courseName === course?.name),
    [allSessions, course]
  );

  const assignments = useMemo(
    () => allAssignments.filter((a) => a.course?.name === course?.name),
    [allAssignments, course]
  );

  const progress = useMemo(() => {
    const submitted = assignments.filter(
      (a) => a.submissions?.[0]?.status === "submitted" || a.submissions?.[0]?.status === "graded"
    ).length;
    const passed = assignments.filter((a) => a.submissions?.[0]?.passed === true).length;
    const attended = sessions.filter((s) => s.attendanceStatus === "present").length;
    const totalSessions = sessions.filter((s) => s.status !== "cancelled").length;
    return { submitted, total: assignments.length, passed, attended, totalSessions };
  }, [assignments, sessions]);

  if (courseLoading) return <Loading withOverlay={false} description="Loading course..." />;
  if (courseError || !course) {
    return (
      <InlineNotification
        kind="error"
        title="Error"
        subtitle={courseError instanceof Error ? courseError.message : "Course not found"}
        lowContrast
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{course.name}</h1>
        <div className={styles.meta}>
          <span>{course.program?.name ?? "—"}</span>
          <span>·</span>
          <span>{course.instructor?.profile?.fullName ?? "—"}</span>
          <span>·</span>
          <span>
            {course.startedAt ? new Date(course.startedAt).toLocaleDateString(DATE_LOCALE) : "—"}
            {" – "}
            {course.endedAt ? new Date(course.endedAt).toLocaleDateString(DATE_LOCALE) : "—"}
          </span>
          <Tag type={statusTagType(course.status)} size="sm">{course.status}</Tag>
        </div>
      </div>

      {/* Progress strip */}
      <div className={styles.progressStrip}>
        <StatTile
          label="Assignments"
          value={`${progress.submitted} / ${progress.total}`}
          subtitle="submitted"
        />
        <StatTile
          label="Graded & Passed"
          value={progress.passed}
          subtitle="assignments"
        />
        <StatTile
          label="Attendance"
          value={`${progress.attended} / ${progress.totalSessions}`}
          subtitle="sessions"
        />
      </div>

      {/* Sessions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Class Sessions</h2>
        {sessionsLoading ? (
          <DataTableSkeleton rowCount={3} headers={[]} />
        ) : sessions.length === 0 ? (
          <p className={styles.empty}>No sessions for this course yet.</p>
        ) : (
          <DataTable
            rows={sessions.map((s) => ({
              id: s.id,
              title: s.title,
              sessionDate: s.sessionDate,
              time: s.time,
              location: s.location,
              status: s.status,
              attendance: s.attendanceStatus ?? "—",
            }))}
            headers={[
              { key: "title", header: "Title" },
              { key: "sessionDate", header: "Date" },
              { key: "time", header: "Time" },
              { key: "location", header: "Location" },
              { key: "status", header: "Status" },
              { key: "attendance", header: "Attendance" },
            ]}
            isSortable
          >
            {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
              <TableContainer {...getTableContainerProps()}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((h) => (
                        <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableRows.map((row) => {
                      const raw = sessions.find((s) => s.id === row.id)!;
                      return (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => {
                            if (cell.info.header === "status" || cell.info.header === "attendance") {
                              const val = String(cell.value);
                              return (
                                <TableCell key={cell.id}>
                                  <Tag type={statusTagType(val)} size="sm">{val}</Tag>
                                </TableCell>
                              );
                            }
                            if (cell.info.header === "location") {
                              const isUrl = String(cell.value).startsWith("http");
                              return (
                                <TableCell key={cell.id}>
                                  {isUrl ? (
                                    <a href={String(cell.value)} target="_blank" rel="noopener noreferrer">Join</a>
                                  ) : (
                                    cell.value as string
                                  )}
                                </TableCell>
                              );
                            }
                            return <TableCell key={cell.id}>{cell.value as string}</TableCell>;
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )}
      </section>

      {/* Learning Materials */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Learning Materials</h2>
        {materialsLoading ? (
          <DataTableSkeleton rowCount={3} headers={[]} />
        ) : materials.length === 0 ? (
          <p className={styles.empty}>No materials for this course yet.</p>
        ) : (
          <DataTable
            rows={materials.map((m) => ({
              id: m.id,
              title: m.title,
              materialType: m.materialType,
              content: m.content ?? "—",
              fileUrl: m.fileUrl ?? "",
            }))}
            headers={[
              { key: "title", header: "Title" },
              { key: "materialType", header: "Type" },
              { key: "content", header: "Description" },
              { key: "fileUrl", header: "Open" },
            ]}
            isSortable
          >
            {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
              <TableContainer {...getTableContainerProps()}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((h) => (
                        <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableRows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => {
                          if (cell.info.header === "materialType") {
                            return (
                              <TableCell key={cell.id}>
                                <Tag type="blue" size="sm">{String(cell.value)}</Tag>
                              </TableCell>
                            );
                          }
                          if (cell.info.header === "fileUrl") {
                            const url = String(cell.value);
                            return (
                              <TableCell key={cell.id}>
                                {url ? (
                                  <Button
                                    kind="ghost"
                                    size="sm"
                                    renderIcon={Launch}
                                    iconDescription="Open"
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Open
                                  </Button>
                                ) : (
                                  <span>—</span>
                                )}
                              </TableCell>
                            );
                          }
                          return <TableCell key={cell.id}>{cell.value as string}</TableCell>;
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )}
      </section>

      {/* Assignments */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Assignments</h2>
        {assignmentsLoading ? (
          <DataTableSkeleton rowCount={3} headers={[]} />
        ) : assignments.length === 0 ? (
          <p className={styles.empty}>No assignments for this course yet.</p>
        ) : (
          <DataTable
            rows={assignments.map((a) => {
              const sub = a.submissions?.[0];
              const submissionStatus = !sub ? "Not Submitted"
                : sub.status === "graded" ? (sub.passed ? "Graded — Passed" : "Graded — Failed")
                : sub.status === "submitted" ? "Submitted" : "Draft";
              return {
                id: a.id,
                title: a.title,
                dueDate: new Date(a.dueDate).toLocaleDateString(DATE_LOCALE),
                status: a.status,
                submissionStatus,
              };
            })}
            headers={[
              { key: "title", header: "Title" },
              { key: "dueDate", header: "Due Date" },
              { key: "status", header: "Status" },
              { key: "submissionStatus", header: "My Submission" },
            ]}
            isSortable
          >
            {({ rows: tableRows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps, getTableContainerProps }) => (
              <TableContainer {...getTableContainerProps()}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {tableHeaders.map((h) => (
                        <TableHeader {...getHeaderProps({ header: h })} key={h.key}>{h.header}</TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableRows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => {
                          if (cell.info.header === "title") {
                            return (
                              <TableCell key={cell.id}>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard-student/assignments/${row.id}`)}
                                  style={{ paddingInline: 0 }}
                                >
                                  {String(cell.value)}
                                </Button>
                              </TableCell>
                            );
                          }
                          if (cell.info.header === "status" || cell.info.header === "submissionStatus") {
                            return (
                              <TableCell key={cell.id}>
                                <Tag type={statusTagType(String(cell.value))} size="sm">
                                  {String(cell.value)}
                                </Tag>
                              </TableCell>
                            );
                          }
                          return <TableCell key={cell.id}>{cell.value as string}</TableCell>;
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        )}
      </section>
    </div>
  );
}
