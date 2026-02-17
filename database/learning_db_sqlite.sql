-- SQLite Compatible Learning Management System Database
-- Converted from MySQL syntax

-- Users table for students, instructors, and admins
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'instructor', 'admin'))
);

-- Course catalog
CREATE TABLE course (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  description TEXT,
  instructor_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'archived', 'completed')),
  FOREIGN KEY (instructor_id) REFERENCES users(id)
);

-- Store enrollment records
CREATE TABLE course_enrollment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK(status IN ('enrolled', 'completed', 'dropped', 'pending')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(course_id, user_id)
);

-- Course learning materials and resources
CREATE TABLE learning_material (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  material_type TEXT NOT NULL CHECK(material_type IN ('video', 'pdf', 'article', 'slides', 'other')),
  order_index INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES course(id)
);

-- Scheduled class sessions
CREATE TABLE class_session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  session_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  meeting_url TEXT,
  FOREIGN KEY (course_id) REFERENCES course(id)
);

-- Track student attendance for each session
CREATE TABLE class_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK(status IN ('present', 'absent', 'late', 'excused')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_session_id) REFERENCES class_session(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(class_session_id, user_id)
);

-- Course assignments
CREATE TABLE assignment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  course_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT NOT NULL,
  max_points REAL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'closed')),
  FOREIGN KEY (course_id) REFERENCES course(id)
);

-- Student assignment submissions
CREATE TABLE assignment_submission (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assignment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  submission_text TEXT,
  file_url TEXT,
  submitted_at TEXT,
  grade REAL,
  passed INTEGER DEFAULT 1,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'graded', 'returned')),
  FOREIGN KEY (assignment_id) REFERENCES assignment(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(assignment_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_course_instructor ON course(instructor_id);
CREATE INDEX idx_enrollment_course ON course_enrollment(course_id);
CREATE INDEX idx_enrollment_user ON course_enrollment(user_id);
CREATE INDEX idx_material_course ON learning_material(course_id);
CREATE INDEX idx_session_course ON class_session(course_id);
CREATE INDEX idx_attendance_session ON class_attendance(class_session_id);
CREATE INDEX idx_attendance_user ON class_attendance(user_id);
CREATE INDEX idx_assignment_course ON assignment(course_id);
CREATE INDEX idx_submission_assignment ON assignment_submission(assignment_id);
CREATE INDEX idx_submission_user ON assignment_submission(user_id);
