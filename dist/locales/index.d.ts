/**
 * Core locale loader for @almadar/ui.
 *
 * Exports message maps for en/ar/sl and a helper to merge
 * project-specific messages on top of core.
 */
type SupportedLocale = 'en' | 'ar' | 'sl';
interface LocaleMeta {
    locale: string;
    direction: 'ltr' | 'rtl';
}
/** Core messages keyed by locale */
declare const coreMessages: Record<SupportedLocale, Record<string, string>>;
/** Locale metadata */
declare const localeMeta: Record<SupportedLocale, LocaleMeta>;
/**
 * Merge core messages with project-specific messages.
 * Project keys override core keys.
 */
declare function mergeMessages(locale: SupportedLocale, projectMessages: Record<string, string>): Record<string, string>;

export { type LocaleMeta, type SupportedLocale, coreMessages, localeMeta, mergeMessages };
