import { NextRequest, NextResponse } from 'next/server';
import { classSessions, courses } from '@/src/lib/mock-data';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get('course_id');

  let filtered = classSessions;
  if (courseId) filtered = filtered.filter(s => s.course_id === Number(courseId));

  const result = filtered.map(session => {
    const course = courses.find(c => c.id === session.course_id);
    return {
      ...session,
      course: course ? { id: course.id, name: course.name } : null,
    };
  });

  return NextResponse.json(result);
}
