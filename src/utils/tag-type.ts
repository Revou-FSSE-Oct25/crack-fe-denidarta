type TagType =
	| "red"
	| "magenta"
	| "purple"
	| "blue"
	| "cyan"
	| "teal"
	| "green"
	| "gray"
	| "cool-gray"
	| "warm-gray"
	| "high-contrast"
	| "outline";

const STATUS_TAG_TYPE: Record<string, TagType> = {
	active: "green",
	draft: "blue",
	invited: "blue",
	done: "green",
	open: "blue",
	"in progress": "teal",
	blocked: "red",
	archived: "gray",
	completed: "gray",
	inactive: "gray",
	published: "green",
	closed: "gray",
	scheduled: "blue",
	ongoing: "teal",
	cancelled: "red",
};

export function statusTagType(status: string | undefined | null): TagType {
	if (!status) return "gray";
	return STATUS_TAG_TYPE[status.toLowerCase()] ?? "gray";
}

const ROLE_TAG_TYPE: Record<string, TagType> = {
	admin: "purple",
	instructor: "teal",
	student: "blue",
};

export function roleTagType(role: string | undefined | null): TagType {
	if (!role) return "gray";
	return ROLE_TAG_TYPE[role.toLowerCase()] ?? "gray";
}
