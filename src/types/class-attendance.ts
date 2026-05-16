export interface AttendanceRecord {
	id: string;
	classSessionId: string;
	status: string;
	createdAt: string;
	isVerified: boolean;
	verifiedBy: string | null;
	verifiedAt: string | null;
	user: {
		username: string;
		profile: { fullName: string | null } | null;
	};
}
