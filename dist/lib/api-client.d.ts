/**
 * API Client - HTTP client for backend API calls
 *
 * Provides typed methods for making API requests.
 * All requests go through the backend server, NOT directly to Firestore.
 *
 * @packageDocumentation
 */
/**
 * API Error class for handling HTTP errors
 */
export declare class ApiError extends Error {
    status: number;
    statusText: string;
    constructor(status: number, statusText: string, message?: string);
}
/**
 * API client with typed methods
 */
export declare const apiClient: {
    /**
     * GET request
     */
    get<T>(endpoint: string): Promise<T>;
    /**
     * POST request
     */
    post<T>(endpoint: string, data?: unknown): Promise<T>;
    /**
     * PUT request
     */
    put<T>(endpoint: string, data?: unknown): Promise<T>;
    /**
     * PATCH request
     */
    patch<T>(endpoint: string, data?: unknown): Promise<T>;
    /**
     * DELETE request
     */
    delete<T = void>(endpoint: string): Promise<T>;
};
export default apiClient;
