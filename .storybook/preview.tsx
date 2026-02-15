import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import * as NextImage from 'next/image';
import '@carbon/styles/css/styles.css';


Object.defineProperty(NextImage, 'default', {
    configurable: true,
    value: (props: any) => {
      return React.createElement('img', props);
    },
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
};

export default preview;