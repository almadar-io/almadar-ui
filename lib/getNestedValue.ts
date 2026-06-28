import type { EventPayload, FieldValue } from '@almadar/core';

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
export function getNestedValue(
  obj: EventPayload | Record<string, FieldValue | undefined> | null | undefined,
  path: string
): FieldValue | undefined {
  if (obj === null || obj === undefined || !path) {
    return undefined;
  }

  // Fast path: no dots means simple property access
  if (!path.includes('.')) {
    return (obj as Record<string, FieldValue | undefined>)[path];
  }

  const parts = path.split('.');
  let value: Record<string, FieldValue> | FieldValue = obj as Record<string, FieldValue>;

  for (const part of parts) {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }
    value = (value as Record<string, FieldValue>)[part];
  }

  return value as FieldValue | undefined;
}

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
export function formatNestedFieldLabel(path: string): string {
  // Take the last part of the path for the label
  const lastPart = path.includes('.') ? path.split('.').pop()! : path;

  // Convert camelCase to Title Case
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Id$/, '')
    .trim();
}
