import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { withI18n, i18nGlobalTypes } from './decorators/withI18n';

// Import theme CSS files
import '../themes/index.css';
import '../index.css';
// React Flow CSS for AVL FlowCanvas
import '@xyflow/react/dist/style.css';

/**
 * Theme toolbar items.
 * Each entry maps a display label to a data-theme attribute value.
 */
const THEME_ITEMS = [
    { value: 'minimalist-light', title: 'Minimalist Light' },
    { value: 'minimalist-dark', title: 'Minimalist Dark' },
    { value: 'almadar-light', title: 'Almadar Light' },
    { value: 'almadar-dark', title: 'Almadar Dark' },
    { value: 'wireframe-light', title: 'Wireframe Light' },
    { value: 'wireframe-dark', title: 'Wireframe Dark' },
    { value: 'ocean-light', title: 'Ocean Light' },
    { value: 'ocean-dark', title: 'Ocean Dark' },
    { value: 'forest-light', title: 'Forest Light' },
    { value: 'forest-dark', title: 'Forest Dark' },
    { value: 'sunset-light', title: 'Sunset Light' },
    { value: 'sunset-dark', title: 'Sunset Dark' },
    { value: 'lavender-light', title: 'Lavender Light' },
    { value: 'lavender-dark', title: 'Lavender Dark' },
    { value: 'rose-light', title: 'Rose Light' },
    { value: 'rose-dark', title: 'Rose Dark' },
    { value: 'slate-light', title: 'Slate Light' },
    { value: 'slate-dark', title: 'Slate Dark' },
    { value: 'ember-light', title: 'Ember Light' },
    { value: 'ember-dark', title: 'Ember Dark' },
    { value: 'midnight-light', title: 'Midnight Light' },
    { value: 'midnight-dark', title: 'Midnight Dark' },
    { value: 'sand-light', title: 'Sand Light' },
    { value: 'sand-dark', title: 'Sand Dark' },
    { value: 'neon-light', title: 'Neon Light' },
    { value: 'neon-dark', title: 'Neon Dark' },
    { value: 'arctic-light', title: 'Arctic Light' },
    { value: 'arctic-dark', title: 'Arctic Dark' },
    { value: 'copper-light', title: 'Copper Light' },
    { value: 'copper-dark', title: 'Copper Dark' },
    { value: 'trait-wars-dark', title: 'Trait Wars' },
];

/**
 * Decorator that reads the "theme" global and applies it as a
 * data-theme attribute on a wrapper div. This replaces the
 * @storybook/addon-themes withThemeByDataAttribute approach
 * which stopped rendering a toolbar dropdown in Storybook 10.
 */
function withTheme(
    Story: React.ComponentType,
    context: { globals: { theme?: string } },
) {
    const theme = context.globals.theme || 'minimalist-light';

    // Also set on documentElement so CSS variables cascade globally
    // (useful for portals and position:fixed elements)
    React.useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div
            data-theme={theme}
            style={{
                padding: '1rem',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-foreground)',
                minHeight: '100vh',
            }}
        >
            <Story />
        </div>
    );
}

const preview: Preview = {
    globalTypes: {
        ...i18nGlobalTypes,
        theme: {
            name: 'Theme',
            description: 'Design theme for components',
            toolbar: {
                icon: 'paintbrush',
                items: THEME_ITEMS,
                dynamicTitle: true,
            },
        },
    },

    initialGlobals: {
        theme: 'minimalist-light',
    },

    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
    },

    decorators: [
        withI18n,
        withTheme,
    ],
};

export default preview;
