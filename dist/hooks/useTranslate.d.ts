export type TranslateFunction = (key: string, params?: Record<string, string | number>) => string;
export interface I18nContextValue {
    /** Current locale code (e.g. 'en', 'ar', 'sl') */
    locale: string;
    /** Text direction for the current locale */
    direction: 'ltr' | 'rtl';
    /** Translate a key, with optional interpolation params */
    t: TranslateFunction;
}
/**
 * Provider component — wrap your app or Storybook decorator with this.
 *
 * ```tsx
 * <I18nProvider value={{ locale: 'ar', direction: 'rtl', t: createTranslate(arMessages) }}>
 *   <App />
 * </I18nProvider>
 * ```
 */
export declare const I18nProvider: import("react").Provider<I18nContextValue>;
/**
 * Hook to access the current locale and translate function.
 * Safe to call without a provider — returns passthrough t().
 */
export declare function useTranslate(): I18nContextValue;
/**
 * Create a translate function from a flat messages object.
 *
 * ```ts
 * const t = createTranslate({ 'common.save': 'Save', 'table.showing': 'Showing {{count}} of {{total}}' });
 * t('common.save') // → 'Save'
 * t('table.showing', { count: 5, total: 20 }) // → 'Showing 5 of 20'
 * t('missing.key') // → 'missing.key' (fallback)
 * ```
 */
export declare function createTranslate(messages: Record<string, string>): TranslateFunction;
