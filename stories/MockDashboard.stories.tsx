import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MockDashboard from "@/components/MockDashboard";

const meta = {
	title: "Pages/Mock Dashboard (Carbon)",
	component: MockDashboard,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
} satisfies Meta<typeof MockDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
