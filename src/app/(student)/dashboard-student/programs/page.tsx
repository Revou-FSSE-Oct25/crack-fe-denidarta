"use client";

import { useRouter } from "next/navigation";
import { Button, Tag } from "@carbon/react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyEnrollments } from "@/services/enrollments.service";
import { statusTagType } from "@/utils/tag-type";
import { DATE_LOCALE } from "@/constants";
import PageLayout, { PageHeader } from "@/components/PageLayout";
import ResourceTableSection from "@/components/ResourceTableSection";
import EmptyState from "@/components/EmptyState";

const headers = [
  { key: "programName", header: "Program" },
  { key: "headOfProgram", header: "Head of Program" },
  { key: "status", header: "Enrollment Status" },
  { key: "enrolledSince", header: "Enrolled Since" },
] as const;

export default function StudentProgramsPage() {
  const router = useRouter();

  const { data: enrollments = [], isLoading, error } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: fetchMyEnrollments,
  });

  const rows = enrollments.map((e) => ({
    id: e.id,
    programId: e.programId,
    programName: e.program?.name ?? "—",
    headOfProgram: e.program?.headOfProgram?.fullName ?? "—",
    status: e.status,
    enrolledSince: e.createdAt
      ? new Date(e.createdAt).toLocaleDateString(DATE_LOCALE)
      : "—",
  }));

  return (
    <PageLayout>
      <PageHeader
        title="My Programs"
        subtitle={isLoading ? "..." : `${rows.length} program${rows.length !== 1 ? "s" : ""}`}
      />
      {!isLoading && rows.length === 0 && !error ? (
        <EmptyState
          title="No programs yet"
          description="You haven't been enrolled in any programs yet."
        />
      ) : (
        <ResourceTableSection
          loading={isLoading}
          error={error ? error.message : null}
          headers={headers}
          rows={rows}
          renderCell={(cell, row) => {
            if (cell.info.header === "programName") {
              const rowData = rows.find((r) => r.id === row.id);
              return (
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() =>
                    router.push(`/dashboard-student/programs/${rowData?.programId ?? row.id}`)
                  }
                  style={{ paddingInline: 0 }}
                >
                  {String(cell.value)}
                </Button>
              );
            }
            if (cell.info.header === "status") {
              return (
                <Tag type={statusTagType(String(cell.value))} size="sm">
                  {String(cell.value)}
                </Tag>
              );
            }
            return null;
          }}
        />
      )}
    </PageLayout>
  );
}
