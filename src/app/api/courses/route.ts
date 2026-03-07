import { NextRequest, NextResponse } from 'next/server';
import { courses, users, enrollments } from '@/src/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const instructorId = searchParams.get('instructor_id');

  let filtered = courses;
  if (status) filtered = filtered.filter(c => c.status === status);
  if (instructorId) filtered = filtered.filter(c => c.instructor_id === Number(instructorId));

  const result = filtered.map(course => {
    const instructor = users.find(u => u.id === course.instructor_id);
    const enrollmentCount = enrollments.filter(e => e.course_id === course.id).length;
    return {
      ...course,
      instructor: instructor ? { id: instructor.id, username: instructor.username, email: instructor.email } : null,
      enrollment_count: enrollmentCount,
    };
  });

  return NextResponse.json(result);
}
