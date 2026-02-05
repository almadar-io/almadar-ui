import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import React from 'react';

// Import theme CSS files
import '../themes/index.css';
import '../index.css';

// Import TraitWarsAssetProvider for Trait Wars stories
import { TraitWarsAssetProvider, TraitWarsAssetManifest } from '../clients/trait-wars/assets';

// Asset manifest for Storybook - uses Kenney Isometric Miniature Dungeon assets
// Assets are served at root via staticDirs pointing to projects/trait-wars/assets
const STORYBOOK_ASSET_MANIFEST: TraitWarsAssetManifest = {
    baseUrl: '', // Assets served at root in Storybook
    units: {
        hero: 'isometric-dungeon/Characters/Male/Male_3_Idle0.png',
        caregiver: 'isometric-dungeon/Characters/Male/Male_1_Idle0.png',
        explorer: 'isometric-dungeon/Characters/Male/Male_0_Idle0.png',
        sage: 'isometric-dungeon/Characters/Male/Male_2_Idle0.png',
        shadowLegion: 'isometric-dungeon/Characters/Male/Male_4_Idle0.png',
        emperor: 'isometric-dungeon/Characters/Male/Male_3_Idle0.png',
    },
    terrain: {
        plains: 'isometric-dungeon/Isometric/stoneTile_E.png',
        forest: 'isometric-dungeon/Isometric/planks_E.png',
        mountain: 'isometric-dungeon/Isometric/stoneColumn_E.png',
        water: 'isometric-dungeon/Isometric/dirt_E.png',
        fortress: 'isometric-dungeon/Isometric/stoneWallColumn_E.png',
        castle: 'isometric-dungeon/Isometric/stoneWallColumn_E.png',
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
