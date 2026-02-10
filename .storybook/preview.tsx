import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import React from 'react';

// Import theme CSS files
import '../themes/index.css';
import '../index.css';

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        backgrounds: {
            options: {
                light: { name: 'light', value: '#ffffff' },
                dark: { name: 'dark', value: '#09090b' },
                "garden-light": { name: 'garden-light', value: '#f0fdf4' },
                "garden-dark": { name: 'garden-dark', value: '#14532d' }
            }
        },
    },

    decorators: [
        withThemeByDataAttribute({
            themes: {
                wireframe: 'wireframe',
                minimalist: 'minimalist',
                almadar: 'almadar',
                'winning-11': 'winning-11',
            },
            defaultTheme: 'minimalist',
            attributeName: 'data-design-theme',
        }),
        (Story) => (
            <div style={{ padding: '1rem' }}>
                <Story />
            </div>
        ),
    ],

    initialGlobals: {
        backgrounds: {
            value: 'light'
        }
    }
};

export default preview;
