import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import React from 'react';

// Import theme CSS files
import '../themes/index.css';
import '../index.css';

// Import TraitWarsAssetProvider for Trait Wars stories
import { TraitWarsAssetProvider, TraitWarsAssetManifest } from '../clients/trait-wars/assets';

// Asset manifest for Storybook - assets are served at root via staticDirs
const STORYBOOK_ASSET_MANIFEST: TraitWarsAssetManifest = {
    baseUrl: '', // Assets served at root in Storybook
    units: {
        hero: 'game-sprites/robots/04_hero_isometric.png',
        caregiver: 'game-sprites/robots/03_caregiver_isometric.png',
        explorer: 'game-sprites/robots/05_explorer_isometric.png',
        sage: 'game-sprites/robots/10_sage_isometric.png',
        shadowLegion: 'game-sprites/robots/iram_shadow_isometric.png',
        emperor: 'game-sprites/robots/12_emperor_isometric.png',
    },
    terrain: {
        plains: 'game-sprites/terrain/manuscript_plains.png',
        forest: 'game-sprites/terrain/illuminated_forest.png',
        mountain: 'game-sprites/terrain/scripture_mountains.png',
        water: 'game-sprites/terrain/ink_water.png',
        fortress: 'game-sprites/terrain/bone_castle.png',
        castle: 'game-sprites/terrain/bone_castle.png',
    },
    ui: {
        healthBar: 'game-sprites/ui/health_bar.png',
        traitFrame: 'game-sprites/ui/trait_frame.png',
        button: 'game-sprites/ui/button.png',
        panelBg: 'game-sprites/ui/panel_bg.png',
    },
    spriteSheets: {
        pixelTilemap: 'pixel-platformer/tilemap.png',
        pixelCharacters: 'pixel-platformer/tilemap-characters.png',
        dungeonTilemap: 'tiles/dungeon/roguelikeDungeon_transparent.png',
    },
    effects: {
        attack: 'game-sprites/effects/attack.png',
        heal: 'game-sprites/effects/heal.png',
        defend: 'game-sprites/effects/defend.png',
        death: 'game-sprites/effects/death.png',
    },
};

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
        // Wrap all stories with TraitWarsAssetProvider for sprite loading
        (Story) => (
            <TraitWarsAssetProvider manifest={STORYBOOK_ASSET_MANIFEST}>
                <div style={{ padding: '1rem' }}>
                    <Story />
                </div>
            </TraitWarsAssetProvider>
        ),
    ],

    initialGlobals: {
        backgrounds: {
            value: 'light'
        }
    }
};

export default preview;
