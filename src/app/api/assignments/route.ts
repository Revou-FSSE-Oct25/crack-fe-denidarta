import { NextRequest, NextResponse } from 'next/server';
import { assignments, courses, submissions } from '@/src/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('course_id');
  const status = searchParams.get('status');

  let filtered = assignments;
  if (courseId) filtered = filtered.filter(a => a.course_id === Number(courseId));
  if (status) filtered = filtered.filter(a => a.status === status);

  const result = filtered.map(assignment => {
    const course = courses.find(c => c.id === assignment.course_id);
    const submissionCount = submissions.filter(s => s.assignment_id === assignment.id).length;
    return {
      ...assignment,
      course: course ? { id: course.id, name: course.name } : null,
      submission_count: submissionCount,
    };
  });

  return NextResponse.json(result);
}
