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
};

export function statusTagType(status: string): TagType {
	return STATUS_TAG_TYPE[status.toLowerCase()] ?? "gray";
}
