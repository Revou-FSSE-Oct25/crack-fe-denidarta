const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

// Prevents multiple concurrent refresh calls — all waiters share one in-flight promise.
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		const refreshToken = localStorage.getItem("refreshToken");
		if (!refreshToken) return null;

		const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		if (!res.ok) {
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			return null;
		}

		const { data } = (await res.json()) as { data: { accessToken: string } };
		localStorage.setItem("accessToken", data.accessToken);
		return data.accessToken;
	})().finally(() => {
		refreshPromise = null;
	});

	return refreshPromise;
}

function buildHeaders(token: string | null, extra?: HeadersInit): HeadersInit {
	return {
		"Content-Type": "application/json",
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		...extra,
	};
}

export async function apiFetch(
	path: string,
	options: RequestInit = {},
): Promise<Response> {
	const token = localStorage.getItem("accessToken");
	const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
		...options,
		headers: buildHeaders(token, options.headers),
	});

	if (res.status !== 401) return res;

	// Token expired — attempt refresh then retry once.
	const newToken = await tryRefresh();
	if (!newToken) {
		window.location.href = "/login";
		return res;
	}

	return fetch(`${BACKEND_URL}/api/v1${path}`, {
		...options,
		headers: buildHeaders(newToken, options.headers),
	});
}
