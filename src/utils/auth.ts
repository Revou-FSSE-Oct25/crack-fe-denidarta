export function getCurrentUserId(): string | null {
	try {
		const token = localStorage.getItem("accessToken");
		if (!token) return null;
		const payload = JSON.parse(atob(token.split(".")[1]));
		return typeof payload.sub === "string" ? payload.sub : null;
	} catch {
		return null;
	}
}
