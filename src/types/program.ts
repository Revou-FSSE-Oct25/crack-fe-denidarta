export interface ProgramEnrollment {
	id: string;
	programId: string;
	userId: string;
	status: "pending" | "enrolled" | "completed" | "dropped";
	user: {
		id: string;
		username: string;
		profile: { fullName: string | null } | null;
	};
}

export interface Program {
	programId: string;
	name: string;
	createdAt: string;
	createdBy: {
		userId: string;
		username: string;
		fullName: string | null;
	};
	headOfProgram: {
		userId: string;
		fullName: string | null;
	} | null;
	courses: {
		courseId: string;
		courseTitle: string;
		instructor: {
			userId: string;
			profile: { fullName: string | null };
		};
	}[];
	students: {
		userId: string;
		fullName: string | null;
	}[];
}
