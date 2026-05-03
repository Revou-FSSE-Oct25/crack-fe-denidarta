import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Navbar } from "@/components/Navbar";

const meta = {
	title: "Components/Navbar",
	component: Navbar,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultLinks = [
	{ label: "Dashboard", href: "/" },
	{ label: "Courses", href: "/courses" },
	{ label: "Progress", href: "/progress" },
];

export const Default: Story = {
	render: () => (
		<Navbar>
			<Navbar.Logo />
			<Navbar.Links links={defaultLinks} />
			<Navbar.Actions>
				<a
					href="/login"
					style={{
						padding: "0 1rem",
						fontFamily: "IBM Plex Mono, monospace",
						fontSize: "0.875rem",
						color: "var(--cds-text-secondary)",
						textDecoration: "none",
					}}
				>
					Log in
				</a>
			</Navbar.Actions>
		</Navbar>
	),
};

export const LogoOnly: Story = {
	render: () => (
		<Navbar>
			<Navbar.Logo />
		</Navbar>
	),
};

export const CustomLogo: Story = {
	render: () => (
		<Navbar>
			<Navbar.Logo text="CrackOS" href="/home" />
			<Navbar.Links links={defaultLinks} />
		</Navbar>
	),
};

export const NoActions: Story = {
	render: () => (
		<Navbar>
			<Navbar.Logo />
			<Navbar.Links links={defaultLinks} />
		</Navbar>
	),
};

export const ManyLinks: Story = {
	render: () => (
		<Navbar>
			<Navbar.Logo />
			<Navbar.Links
				links={[
					{ label: "Dashboard", href: "/" },
					{ label: "Courses", href: "/courses" },
					{ label: "Progress", href: "/progress" },
					{ label: "Community", href: "/community" },
					{ label: "Resources", href: "/resources" },
					{ label: "Settings", href: "/settings" },
				]}
			/>
			<Navbar.Actions>
				<a
					href="/logout"
					style={{
						padding: "0 1rem",
						fontFamily: "IBM Plex Mono, monospace",
						fontSize: "0.875rem",
						color: "var(--cds-text-secondary)",
						textDecoration: "none",
					}}
				>
					Log out
				</a>
			</Navbar.Actions>
		</Navbar>
	),
};
