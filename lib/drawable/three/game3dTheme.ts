/**
 * game3dTheme — DEFAULT palette constants for the 3D draw-host (`Canvas3DHost`).
 * No React deps — pure constants. Only the grid + background defaults remain live;
 * every per-item color/size comes from the drawable descriptors that `.lolo` computes.
 *
 * @packageDocumentation
 */

/** Grid line colors for the drei `<Grid>`. */
export const GRID_COLORS_3D = {
    cell: '#444444',
    section: '#666666',
};

/** Default scene background (Canvas3DHostProps.backgroundColor default). */
export const DEFAULT_BACKGROUND_3D = '#1a1a2e';
