import type { Preview } from '@storybook/react';
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
            default: 'light',
            values: [
                { name: 'light', value: '#ffffff' },
                { name: 'dark', value: '#09090b' },
                { name: 'garden-light', value: '#f0fdf4' },
                { name: 'garden-dark', value: '#14532d' },
            ],
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
};

export default preview;
