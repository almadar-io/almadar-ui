/**
 * Storybook decorator that provides i18n context to all stories.
 *
 * Adds a globe icon to the Storybook toolbar for locale switching.
 * Selecting Arabic auto-sets dir="rtl" on the wrapper.
 *
 * Usage in preview.tsx:
 *   import { withI18n, i18nGlobalTypes } from './decorators/withI18n';
 *   export const globalTypes = { ...i18nGlobalTypes };
 *   export const decorators = [withI18n];
 */

import React from 'react';
import { I18nProvider, createTranslate } from '../../hooks/useTranslate';
import {
  coreMessages,
  localeMeta,
  type SupportedLocale,
} from '../../locales/index';

/**
 * Storybook globalTypes config for the locale toolbar.
 * Merge this into your preview.tsx globalTypes.
 */
export const i18nGlobalTypes = {
  locale: {
    name: 'Locale',
    description: 'Locale for translations',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', right: 'LTR', title: 'English' },
        { value: 'ar', right: 'RTL', title: 'العربية' },
        { value: 'sl', right: 'LTR', title: 'Slovenščina' },
      ],
      dynamicTitle: true,
    },
  },
};

/**
 * Create the withI18n decorator.
 *
 * For core @almadar/ui stories, call with no args:
 *   createWithI18n()
 *
 * For project stories, pass project messages to merge on top of core:
 *   createWithI18n({ en: projectEn, ar: projectAr, sl: projectSl })
 */
export function createWithI18n(
  projectMessages?: Partial<Record<SupportedLocale, Record<string, string>>>,
) {
  return function withI18nDecorator(
    Story: React.ComponentType,
    context: { globals: { locale?: string } },
  ) {
    const locale = (context.globals.locale || 'en') as SupportedLocale;
    const meta = localeMeta[locale] || localeMeta.en;

    let messages = coreMessages[locale] || coreMessages.en;
    if (projectMessages?.[locale]) {
      messages = { ...messages, ...projectMessages[locale] };
    }

    const t = createTranslate(messages);

    return (
      <I18nProvider value={{ locale, direction: meta.direction, t }}>
        <div dir={meta.direction}>
          <Story />
        </div>
      </I18nProvider>
    );
  };
}

/**
 * Default withI18n decorator using only core messages.
 * Use this directly in @almadar/ui's preview.tsx.
 */
export const withI18n = createWithI18n();
