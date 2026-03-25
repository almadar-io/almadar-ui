/**
 * @almadar/ui Tailwind Preset
 *
 * Provides the complete Almadar design token system as a Tailwind preset.
 * Includes a safelist for CSS-variable-based arbitrary classes that use
 * bracket notation (Tailwind can't extract these from source scanning).
 *
 * Note: @almadar/ui dist content scanning is handled by tailwind.config.js
 * in the shell template, not here. The config resolves the dist path via
 * require.resolve('@almadar/ui') which works regardless of hoisting.
 *
 * Usage in tailwind.config.js:
 *   presets: [require('@almadar/ui/tailwind-preset')]
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  safelist: [
  // Standard utilities used via dynamic className from .orb schemas
  'p-4', 'p-6', 'p-8',
  'px-4', 'px-6', 'py-4', 'py-6',
  'mx-auto',
  'w-full',
  'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-3xl', 'max-w-4xl', 'max-w-5xl', 'max-w-6xl', 'max-w-7xl',
  'min-h-screen',
  'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
  'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4',
  'sm:grid-cols-2', 'md:grid-cols-2', 'md:grid-cols-3', 'lg:grid-cols-3', 'lg:grid-cols-4',
  'text-center', 'text-left', 'text-right',
  // Non-theme CSS variable classes (no semantic equivalent in theme config)
  'active:scale-[var(--active-scale)]',
  'border-b-[length:var(--border-width)]',
  'border-[length:var(--border-width)]',
  'border-[length:var(--border-width-thin)]',
  'border-l-[length:var(--border-width)]',
  'border-r-[length:var(--border-width)]',
  'border-t-[length:var(--border-width)]',
  'border-x-[length:var(--border-width)]',
  'duration-[var(--transition-fast)]',
  'duration-[var(--transition-normal)]',
  'focus:ring-[length:var(--focus-ring-width)]',
  'focus:ring-offset-[length:var(--focus-ring-offset)]',
  'font-[var(--font-weight-bold)]',
  'font-[var(--font-weight-medium)]',
  'text-[var(--icon-color,currentColor)]',
  'placeholder:text-[var(--color-placeholder)]',
  // Table-specific tokens
  'bg-[var(--color-table-header)]',
  'border-[var(--color-table-border)]',
  'hover:bg-[var(--color-table-row-hover)]',
  'hover:bg-[var(--color-surface-hover)]',
  'hover:border-[var(--color-border-hover)]',
  'hover:border-l-[var(--color-muted)]',
  // Gradient partials with opacity
  'from-[var(--color-primary)]/5',
  'to-[var(--color-secondary)]/5',
  // Opacity variants on semantic colors (used in components)
  'bg-primary/10', 'bg-primary/8', 'bg-accent/10',
  'bg-muted/20', 'bg-muted/30', 'bg-muted/50', 'bg-muted/60',
  'bg-surface/60', 'bg-surface/80',
  'bg-background/10', 'bg-background/80',
  'bg-card/80', 'bg-foreground/0', 'bg-foreground/50',
  'bg-error/10', 'bg-info/10', 'bg-success/10', 'bg-warning/10',
  'border-accent/30', 'border-border/40',
  'border-error/30', 'border-error/50',
  'border-info/30', 'border-success/30', 'border-warning/30',
  'ring-accent/20', 'ring-error/20', 'ring-info/20',
  'ring-muted-foreground/20', 'ring-primary/30',
  'ring-success/20', 'ring-warning/20',
  'text-foreground/30', 'text-foreground/60',
  'text-muted-foreground/50',
  'hover:bg-error/10', 'hover:bg-muted/50', 'hover:bg-muted/80',
  'hover:bg-muted-foreground/15', 'hover:bg-primary/10',
  'dark:bg-foreground/70', 'dark:hover:bg-error/20',
  'group-hover:bg-foreground/20', 'group-hover:text-primary',
  'peer-focus:ring-error/20', 'peer-focus:ring-ring/20',
  // Hover elevation & micro-interactions
  'hover:-translate-y-0.5',
  'hover:-translate-y-1',
  'hover:scale-105',
  'scale-[1.05]',
  'transition-all',
  'duration-200',
  'ring-2',
  'ring-primary',
  ],
  theme: {
    fontFamily: {
      sans: ['var(--font-family)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['var(--font-family-mono, ui-monospace)', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          foreground: 'var(--color-primary-foreground)',
          hover: 'var(--color-primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          foreground: 'var(--color-secondary-foreground)',
          hover: 'var(--color-secondary-hover)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          foreground: 'var(--color-accent-foreground)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        card: {
          DEFAULT: 'var(--color-card)',
          foreground: 'var(--color-card-foreground)',
        },
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        error: {
          DEFAULT: 'var(--color-error)',
          foreground: 'var(--color-error-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          foreground: 'var(--color-info-foreground)',
        },
      },
      borderRadius: {
        none: 'var(--radius-none, 0)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-main)',
        lg: 'var(--shadow-lg)',
        inner: 'var(--shadow-inner)',
      },
      fontWeight: {
        normal: 'var(--font-weight-normal, 400)',
        medium: 'var(--font-weight-medium, 500)',
        bold: 'var(--font-weight-bold, 600)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast, 150ms)',
        normal: 'var(--transition-normal, 250ms)',
        slow: 'var(--transition-slow, 400ms)',
      },
    },
  },
};
