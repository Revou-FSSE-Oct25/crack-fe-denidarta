export const truncateText = (text: string, length: number): string => {
	return text.length > length ? `${text.slice(0, length)}...` : text;
};

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export function apiFetch(
	path: string,
	options: RequestInit = {},
): Promise<Response> {
	const token = localStorage.getItem("accessToken");
	return fetch(`${BACKEND_URL}/api/v1${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...options.headers,
		},
	});
}
