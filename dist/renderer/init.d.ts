/**
 * Pattern Resolver Initialization
 *
 * Loads pattern registry and component mapping from orbital-shared/patterns/
 * and initializes the pattern resolver at app startup.
 *
 * @packageDocumentation
 */
/**
 * Initialize the pattern resolver with shared pattern data.
 * Must be called once at app startup before any pattern rendering.
 * @returns The number of patterns initialized
 */
export declare function initializePatterns(): number;
