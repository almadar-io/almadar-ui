/**
 * Get Nested Value Utility
 *
 * Safely retrieves nested values from objects using dot-notation paths.
 * Used by display components to support relation field access like "company.name".
 *
 * @packageDocumentation
 */
/**
 * Get a nested value from an object using dot-notation path.
 *
 * @param obj - The object to traverse
 * @param path - Dot-notation path (e.g., "company.name", "address.city")
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * const data = { company: { name: "Acme Corp", address: { city: "NYC" } } };
 * getNestedValue(data, "company.name");         // => "Acme Corp"
 * getNestedValue(data, "company.address.city"); // => "NYC"
 * getNestedValue(data, "company.missing");      // => undefined
 */
export declare function getNestedValue(obj: Record<string, unknown> | null | undefined, path: string): unknown;
/**
 * Format a nested field path as a human-readable label.
 *
 * @param path - Dot-notation path (e.g., "company.name")
 * @returns Formatted label (e.g., "Company Name")
 *
 * @example
 * formatFieldLabel("company.name");    // => "Company Name"
 * formatFieldLabel("address.zipCode"); // => "Address Zip Code"
 */
export declare function formatNestedFieldLabel(path: string): string;
