export interface User {
	id: string;
	username: string;
	email: string;
	role: string;
	status: string;
	createdAt: string;
}

export interface LoginFormValues {
	email: string;
	password: string;
}
