interface ImageCacheResult {
    /** Get a cached image by URL. Returns undefined if not yet loaded. */
    getImage: (url: string) => HTMLImageElement | undefined;
    /** Whether all requested images have loaded */
    isLoaded: boolean;
    /** Number of images currently loading */
    pendingCount: number;
}
/**
 * Preload and cache images for canvas rendering.
 *
 * @param urls - Array of image URLs to preload
 * @returns Cache getter, loading state, and pending count
 */
export declare function useImageCache(urls: string[]): ImageCacheResult;
export {};
