export interface Certificate {
	id: string;
	userId: string;
	programId: string;
	certNumber: string;
	studentNameSnapshot: string;
	programNameSnapshot: string;
	issuedAt: string;
	deletedAt: string | null;
	user: {
		id: string;
		username: string;
		email: string;
		profile: { fullName: string | null } | null;
	};
	program: {
		id: string;
		name: string;
	};
}
