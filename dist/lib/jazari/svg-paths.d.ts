/**
 * SVG path generators for the Al-Jazari state machine visualization.
 * Pure TypeScript — zero React/DOM dependencies.
 *
 * Generates paths for gear teeth, arabesque borders, pipe shapes, and lock icons.
 */
/**
 * Generate an SVG path for gear teeth around a circle.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param innerRadius - Inner radius (base circle)
 * @param outerRadius - Outer radius (tip of teeth)
 * @param numTeeth - Number of teeth around the gear
 * @returns SVG path d attribute string
 */
export declare function gearTeethPath(cx: number, cy: number, innerRadius: number, outerRadius: number, numTeeth: number): string;
/**
 * Generate an SVG path for a small gear-shaped lock icon.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param size - Overall size of the lock icon
 * @returns SVG path d attribute for the lock body + shackle
 */
export declare function lockIconPath(cx: number, cy: number, size: number): string;
/**
 * Generate a simple brain-like icon path.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param size - Overall size
 * @returns SVG path d attribute
 */
export declare function brainIconPath(cx: number, cy: number, size: number): string;
/**
 * Generate a simple pipe/tube icon path.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param size - Overall size
 * @returns SVG path d attribute
 */
export declare function pipeIconPath(cx: number, cy: number, size: number): string;
/**
 * Generate a single 8-pointed star path for the arabesque border pattern.
 *
 * @param cx - Center X
 * @param cy - Center Y
 * @param outerR - Outer radius (star tips)
 * @param innerR - Inner radius (star valleys)
 * @returns SVG path d attribute
 */
export declare function eightPointedStarPath(cx: number, cy: number, outerR: number, innerR: number): string;
/**
 * Generate a simple arrowhead path for transition arm endpoints.
 *
 * @param size - Arrow size
 * @returns SVG path d attribute
 */
export declare function arrowheadPath(size: number): string;
