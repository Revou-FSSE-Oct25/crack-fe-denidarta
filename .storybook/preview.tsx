import type { Preview } from "@storybook/nextjs-vite";
import "@carbon/styles/css/styles.css";

const preview: Preview = {
	parameters: {
		nextjs: {
			image: {
				unoptimized: true,
			},
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
};

export default preview;
