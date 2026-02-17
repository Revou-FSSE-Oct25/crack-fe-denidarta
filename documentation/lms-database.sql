CREATE TABLE `users` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `username` varchar(100) UNIQUE NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'student'
);

CREATE TABLE `course` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `name` varchar(255) NOT NULL,
  `description` text,
  `instructor_id` int NOT NULL,
  `status` enum(draft,active,archived,completed) NOT NULL DEFAULT 'draft'
);

CREATE TABLE `course_enrollment` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum(enrolled,completed,dropped,pending) NOT NULL DEFAULT 'enrolled',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `learning_material` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `file_url` varchar(500),
  `material_type` enum(video,pdf,article,slides,other) NOT NULL,
  `order_index` int DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `class_session` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `location` varchar(255),
  `meeting_url` varchar(500)
);

CREATE TABLE `class_attendance` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `class_session_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum(present,absent,late,excused) NOT NULL DEFAULT 'present',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `assignment` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `due_date` timestamp NOT NULL,
  `max_points` decimal(5,2) DEFAULT 100,
  `status` enum(draft,published,closed) NOT NULL DEFAULT 'draft'
);

CREATE TABLE `assignment_submission` (
  `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `assignment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `submission_text` text,
  `file_url` varchar(500),
  `submitted_at` timestamp,
  `grade` decimal(5,2),
  `passed` boolean DEFAULT true,
  `feedback` text,
  `status` enum(draft,submitted,graded,returned) NOT NULL DEFAULT 'draft'
);

CREATE UNIQUE INDEX `course_enrollment_index_0` ON `course_enrollment` (`course_id`, `user_id`);

CREATE UNIQUE INDEX `class_attendance_index_1` ON `class_attendance` (`class_session_id`, `user_id`);

CREATE UNIQUE INDEX `assignment_submission_index_2` ON `assignment_submission` (`assignment_id`, `user_id`);

ALTER TABLE `users` COMMENT = 'Users table for students, instructors, and admins';

ALTER TABLE `course` COMMENT = 'Course catalog';

ALTER TABLE `course_enrollment` COMMENT = 'Store enrollment records';

ALTER TABLE `learning_material` COMMENT = 'Course learning materials and resources';

ALTER TABLE `class_session` COMMENT = 'Scheduled class sessions';

ALTER TABLE `class_attendance` COMMENT = 'Track student attendance for each session';

ALTER TABLE `assignment` COMMENT = 'Course assignments';

ALTER TABLE `assignment_submission` COMMENT = 'Student assignment submissions';

ALTER TABLE `course` ADD FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`);

ALTER TABLE `course_enrollment` ADD FOREIGN KEY (`course_id`) REFERENCES `course` (`id`);

ALTER TABLE `course_enrollment` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `learning_material` ADD FOREIGN KEY (`course_id`) REFERENCES `course` (`id`);

ALTER TABLE `class_session` ADD FOREIGN KEY (`course_id`) REFERENCES `course` (`id`);

ALTER TABLE `class_attendance` ADD FOREIGN KEY (`class_session_id`) REFERENCES `class_session` (`id`);

ALTER TABLE `class_attendance` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `assignment` ADD FOREIGN KEY (`course_id`) REFERENCES `course` (`id`);

ALTER TABLE `assignment_submission` ADD FOREIGN KEY (`assignment_id`) REFERENCES `assignment` (`id`);

ALTER TABLE `assignment_submission` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
