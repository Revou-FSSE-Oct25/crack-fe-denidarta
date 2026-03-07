import { NextRequest, NextResponse } from 'next/server';
import { enrollments, users, courses } from '@/src/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('course_id');
  const userId = searchParams.get('user_id');
  const status = searchParams.get('status');

  let filtered = enrollments;
  if (courseId) filtered = filtered.filter(e => e.course_id === Number(courseId));
  if (userId) filtered = filtered.filter(e => e.user_id === Number(userId));
  if (status) filtered = filtered.filter(e => e.status === status);

  const result = filtered.map(enrollment => {
    const user = users.find(u => u.id === enrollment.user_id);
    const course = courses.find(c => c.id === enrollment.course_id);
    return {
      ...enrollment,
      user: user ? { id: user.id, username: user.username, email: user.email, role: user.role } : null,
      course: course ? { id: course.id, name: course.name, status: course.status } : null,
    };
  });

  return NextResponse.json(result);
}
