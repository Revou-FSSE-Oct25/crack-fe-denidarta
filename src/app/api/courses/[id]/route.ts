import { NextRequest, NextResponse } from 'next/server';
import { courses, users, enrollments, learningMaterials, classSessions, assignments } from '@/src/lib/mock-data';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = courses.find(c => c.id === Number(id));

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const instructor = users.find(u => u.id === course.instructor_id);
  const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
  const materials = learningMaterials.filter(m => m.course_id === course.id);
  const sessions = classSessions.filter(s => s.course_id === course.id);
  const courseAssignments = assignments.filter(a => a.course_id === course.id);

  return NextResponse.json({
    ...course,
    instructor: instructor ? { id: instructor.id, username: instructor.username, email: instructor.email } : null,
    enrollments: courseEnrollments,
    materials,
    sessions,
    assignments: courseAssignments,
  });
}
