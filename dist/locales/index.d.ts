/**
 * Core locale loader for @almadar/ui.
 *
 * Exports message maps for en/ar/sl and a helper to merge
 * project-specific messages on top of core.
 */
export type SupportedLocale = 'en' | 'ar' | 'sl';
export interface LocaleMeta {
    locale: string;
    direction: 'ltr' | 'rtl';
}
/** Core messages keyed by locale */
export declare const coreMessages: Record<SupportedLocale, Record<string, string>>;
/** Locale metadata */
export declare const localeMeta: Record<SupportedLocale, LocaleMeta>;
/**
 * Merge core messages with project-specific messages.
 * Project keys override core keys.
 */
export declare function mergeMessages(locale: SupportedLocale, projectMessages: Record<string, string>): Record<string, string>;
