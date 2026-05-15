const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface LoginPayload {
	email: string;
	password: string;
}

interface LoginResponse {
	accessToken: string;
	refreshToken: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
	const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		const err = (await res.json()) as { message?: string };
		throw new Error(err.message ?? "Login failed");
	}

	const json = (await res.json()) as { data: LoginResponse };
	return json.data;
}
