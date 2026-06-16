/**
 * Layout Pattern Components
 *
 * Pattern wrappers for layout components that support recursive rendering
 * of nested patterns via the `children` prop.
 *
 * These components bridge the shell's layout primitives (Stack, Box, Grid, etc.)
 * with the pattern system's recursive rendering capability.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { UiError } from '../atoms/types';
import { Box, type BoxPadding, type BoxBg, type BoxRounded, type BoxShadow } from '../atoms/Box';
import { Spacer } from '../atoms/Spacer';
import { Divider, type DividerVariant, type DividerOrientation } from '../atoms/Divider';

// ============================================================================
// Pattern Props Interface
// ============================================================================

/**
 * Base props for all layout patterns with children support.
 */
export interface LayoutPatternProps {
  /** Nested pattern configurations - rendered recursively */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
  /** Entity name */
  entity?: string;
}


// ============================================================================
// Box Pattern
// ============================================================================

export interface BoxPatternProps extends LayoutPatternProps {
  /** Padding shorthand */
  p?: BoxPadding;
  /** Margin shorthand */
  m?: BoxPadding;
  /** Background color token */
  bg?: BoxBg;
  /** Show border */
  border?: boolean;
  /** Border radius */
  radius?: BoxRounded;
  /** Shadow level */
  shadow?: BoxShadow;
}

/**
 * Box pattern component.
 *
 * Generic styled container with theming support.
 */
export function BoxPattern({
  p,
  m,
  bg = 'transparent',
  border = false,
  radius = 'none',
  shadow = 'none',
  className,
  style,
  children,
}: BoxPatternProps): React.ReactElement {
  return (
    <Box
      padding={p}
      margin={m as BoxPadding | undefined}
      bg={bg}
      border={border}
      rounded={radius}
      shadow={shadow}
      className={className}
      style={style}
    >
      {children}
    </Box>
  );
}

BoxPattern.displayName = 'BoxPattern';


// ============================================================================
// Spacer Pattern
// ============================================================================

export interface SpacerPatternProps {
  /** Size or 'flex' for flexible */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'flex';
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
  /** Entity name */
  entity?: string;
}

/**
 * Spacer pattern component.
 *
 * Flexible space that expands or has fixed size.
 */
export function SpacerPattern({ size = 'flex' }: SpacerPatternProps): React.ReactElement {
  if (size === 'flex') {
    return <Spacer />;
  }

  const sizeMap: Record<string, string> = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  };

  return <Box style={{ width: sizeMap[size], height: sizeMap[size], flexShrink: 0 }} />;
}

SpacerPattern.displayName = 'SpacerPattern';

// ============================================================================
// Divider Pattern
// ============================================================================

export interface DividerPatternProps {
  /** Orientation */
  orientation?: DividerOrientation;
  /** Line style */
  variant?: DividerVariant;
  /** Color token */
  color?: string;
  /** Spacing around divider */
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
  /** Entity name */
  entity?: string;
}

/**
 * Divider pattern component.
 *
 * Visual separator between sections.
 */
export function DividerPattern({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
}: DividerPatternProps): React.ReactElement {
  const spacingMap: Record<string, string> = {
    xs: 'my-1',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6',
  };

  const verticalSpacingMap: Record<string, string> = {
    xs: 'mx-1',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6',
  };

  return (
    <Divider
      orientation={orientation}
      variant={variant}
      className={orientation === 'horizontal' ? spacingMap[spacing] : verticalSpacingMap[spacing]}
    />
  );
}

DividerPattern.displayName = 'DividerPattern';

// ============================================================================
// Exports
// ============================================================================


export const LAYOUT_PATTERNS = {
  'box': BoxPattern,
  'spacer': SpacerPattern,
  'divider': DividerPattern,
} as const;
