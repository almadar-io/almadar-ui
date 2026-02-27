import * as React$1 from 'react';
import React__default, { ReactNode, ErrorInfo } from 'react';
import { LucideIcon } from 'lucide-react';
import { SExpr } from '@almadar/evaluator';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { b as DomLayoutData, d as DomStateNode, V as VisualizerConfig, e as DomTransitionLabel, C as ContentSegment } from '../cn-BoBXsxuX.js';
export { h as cn } from '../cn-BoBXsxuX.js';
import { I as IsometricTile, a as IsometricUnit, b as IsometricFeature, C as CameraState } from '../isometric-ynNHVPZx.js';
export { AuthContextValue, AuthUser, ChangeSummary, CompileResult, CompileStage, ENTITY_EVENTS, EntityDataAdapter, EntityDataProvider, EntityDataRecord, EntityMutationResult, Extension, ExtensionManifest, FileSystemFile, FileSystemStatus, GitHubRepo, GitHubStatus, HistoryTimelineItem, I18nContextValue, I18nProvider, OpenFile, OrbitalEventPayload, OrbitalEventResponse, QuerySingletonEntity, QuerySingletonResult, QuerySingletonState, QueryState, ResolvedEntity, RevertResult, SelectedFile, TranslateFunction, UseCompileResult, UseEntityDetailResult, UseEntityListOptions, UseEntityListResult, UseEntityMutationsOptions, UseExtensionsOptions, UseExtensionsResult, UseFileEditorOptions, UseFileEditorResult, UseFileSystemResult, UseOrbitalHistoryOptions, UseOrbitalHistoryResult, createTranslate, entityDataKeys, parseQueryBinding, useAgentChat, useAuthContext, useCompile, useConnectGitHub, useCreateEntity, useDeepAgentGeneration, useDeleteEntity, useDisconnectGitHub, useEmitEvent, useEntities, useEntitiesByType, useEntity, useEntityById, useEntityDataAdapter, useEntityDetail, useEntityList, useEntityListSuspense, useEntityMutations, useEntitySuspense, useEventBus, useEventListener, useExtensions, useFileEditor, useFileSystem, useGitHubBranches, useGitHubRepo, useGitHubRepos, useGitHubStatus, useInput, useOrbitalHistory, useOrbitalMutations, usePhysics, usePlayer, usePreview, useQuerySingleton, useResolvedEntity, useSelectedEntity, useSendOrbitalEvent, useSingletonEntity, useTranslate, useUIEvents, useUpdateEntity, useValidation } from '../hooks/index.js';
import { E as EventBusContextType } from '../event-bus-types-CjJduURa.js';
export { a as EventListener, K as KFlowEvent, U as Unsubscribe } from '../event-bus-types-CjJduURa.js';
import { S as SlotContent, a as UISlot } from '../useUISlots-D0mttBSP.js';
export { D as DEFAULT_SLOTS, R as RenderUIConfig, b as SlotAnimation, c as SlotChangeCallback, U as UISlotManager, u as useUISlotManager } from '../useUISlots-D0mttBSP.js';
export { Entity, clearEntities, getAllEntities, getByType, getEntity, getSingleton, removeEntity, spawnEntity, updateEntity, updateSingleton } from '../stores/index.js';
import 'clsx';
import '@almadar/core';
import '@tanstack/react-query';

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "warning" | "default";
type ButtonSize = "sm" | "md" | "lg";
interface ButtonProps extends React__default.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    /** Left icon as ReactNode (preferred) */
    leftIcon?: React__default.ReactNode;
    /** Right icon as ReactNode (preferred) */
    rightIcon?: React__default.ReactNode;
    /** Left icon as Lucide icon component (convenience prop, renders with default size) */
    icon?: LucideIcon;
    /** Right icon as Lucide icon component (convenience prop) */
    iconRight?: LucideIcon;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
    /** Button label text (alternative to children for schema-driven rendering) */
    label?: string;
}
declare const Button: React__default.ForwardRefExoticComponent<ButtonProps & React__default.RefAttributes<HTMLButtonElement>>;

interface SelectOption$1 {
    value: string;
    label: string;
}
interface InputProps extends Omit<React__default.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    /** Input type - supports 'select' and 'textarea' in addition to standard types */
    inputType?: "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "date" | "datetime-local" | "time" | "checkbox" | "select" | "textarea";
    error?: string;
    leftIcon?: React__default.ReactNode;
    rightIcon?: React__default.ReactNode;
    /** Lucide icon component for left side (convenience prop) */
    icon?: LucideIcon;
    /** Show clear button when input has value */
    clearable?: boolean;
    /** Callback when clear button is clicked */
    onClear?: () => void;
    /** Options for select type */
    options?: SelectOption$1[];
    /** Rows for textarea type */
    rows?: number;
    /** onChange handler - accepts events from input, select, or textarea */
    onChange?: React__default.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
}
declare const Input: React__default.ForwardRefExoticComponent<InputProps & React__default.RefAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>>;

interface LabelProps extends React__default.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}
declare const Label: React__default.ForwardRefExoticComponent<LabelProps & React__default.RefAttributes<HTMLLabelElement>>;

interface TextareaProps extends React__default.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
}
declare const Textarea: React__default.ForwardRefExoticComponent<TextareaProps & React__default.RefAttributes<HTMLTextAreaElement>>;

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
interface SelectProps extends Omit<React__default.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
    options: SelectOption[];
    placeholder?: string;
    error?: string;
}
declare const Select: React__default.ForwardRefExoticComponent<SelectProps & React__default.RefAttributes<HTMLSelectElement>>;

interface CheckboxProps extends Omit<React__default.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
}
declare const Checkbox: React__default.ForwardRefExoticComponent<CheckboxProps & React__default.RefAttributes<HTMLInputElement>>;

type CardShadow = "none" | "sm" | "md" | "lg";
interface CardProps$1 extends React__default.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "bordered" | "elevated" | "interactive";
    padding?: "none" | "sm" | "md" | "lg";
    /** Card title - renders in header if provided */
    title?: string;
    /** Card subtitle - renders below title */
    subtitle?: string;
    /** Shadow size override */
    shadow?: CardShadow;
}
declare const Card$1: React__default.ForwardRefExoticComponent<CardProps$1 & React__default.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLHeadingElement> & React__default.RefAttributes<HTMLHeadingElement>>;
declare const CardContent: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardBody: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;

type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "error" | "info" | "neutral";
type BadgeSize = "sm" | "md" | "lg";
interface BadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
}
declare const Badge: React__default.ForwardRefExoticComponent<BadgeProps & React__default.RefAttributes<HTMLSpanElement>>;

type SpinnerSize = "xs" | "sm" | "md" | "lg";
interface SpinnerProps extends React__default.HTMLAttributes<HTMLDivElement> {
    size?: SpinnerSize;
}
declare const Spinner: React__default.ForwardRefExoticComponent<SpinnerProps & React__default.RefAttributes<HTMLDivElement>>;

/**
 * Avatar Atom Component
 *
 * A versatile avatar component supporting images, initials, icons, and status indicators.
 */

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarStatus = "online" | "offline" | "away" | "busy";
interface AvatarProps {
    /**
     * Image source URL
     */
    src?: string;
    /**
     * Alt text for the image
     */
    alt?: string;
    /**
     * Full name - initials will be generated automatically
     */
    name?: string;
    /**
     * Initials to display (e.g., "JD" for John Doe)
     * If not provided but name is, initials will be auto-generated
     */
    initials?: string;
    /**
     * Icon to display when no image or initials
     */
    icon?: LucideIcon;
    /**
     * Size of the avatar
     * @default 'md'
     */
    size?: AvatarSize;
    /**
     * Status indicator
     */
    status?: AvatarStatus;
    /**
     * Badge content (e.g., notification count)
     */
    badge?: string | number;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Click handler
     */
    onClick?: () => void;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
}
declare const Avatar: React__default.FC<AvatarProps>;

/**
 * Box Component
 *
 * A versatile layout primitive that provides spacing, background, border, and shadow controls.
 * Think of it as a styled div with consistent design tokens.
 */

type BoxPadding = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type BoxMargin = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "auto";
type BoxBg = "transparent" | "primary" | "secondary" | "muted" | "accent" | "surface" | "overlay";
type BoxRounded = "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
type BoxShadow = "none" | "sm" | "md" | "lg" | "xl";
interface BoxProps extends React__default.HTMLAttributes<HTMLDivElement> {
    /** Padding on all sides */
    padding?: BoxPadding;
    /** Horizontal padding (overrides padding for x-axis) */
    paddingX?: BoxPadding;
    /** Vertical padding (overrides padding for y-axis) */
    paddingY?: BoxPadding;
    /** Margin on all sides */
    margin?: BoxMargin;
    /** Horizontal margin */
    marginX?: BoxMargin;
    /** Vertical margin */
    marginY?: BoxMargin;
    /** Background color */
    bg?: BoxBg;
    /** Show border */
    border?: boolean;
    /** Border radius */
    rounded?: BoxRounded;
    /** Box shadow */
    shadow?: BoxShadow;
    /** Display type */
    display?: "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid";
    /** Fill available width */
    fullWidth?: boolean;
    /** Fill available height */
    fullHeight?: boolean;
    /** Overflow behavior */
    overflow?: "auto" | "hidden" | "visible" | "scroll";
    /** Position */
    position?: "relative" | "absolute" | "fixed" | "sticky";
    /** HTML element to render as */
    as?: React__default.ElementType;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
    /** Declarative hover event — emits UI:{hoverEvent} with { hovered: true/false } on mouseEnter/mouseLeave */
    hoverEvent?: string;
}
/**
 * Box - Versatile container component with design tokens
 */
declare const Box: React__default.ForwardRefExoticComponent<BoxProps & React__default.RefAttributes<HTMLDivElement>>;

/**
 * Center Component
 *
 * A layout utility that centers its children horizontally and/or vertically.
 */

interface CenterProps {
    /** Center inline (width fits content) vs block (full width) */
    inline?: boolean;
    /** Center only horizontally */
    horizontal?: boolean;
    /** Center only vertically */
    vertical?: boolean;
    /** Minimum height (useful for vertical centering) */
    minHeight?: string | number;
    /** Fill available height */
    fullHeight?: boolean;
    /** Fill available width */
    fullWidth?: boolean;
    /** Custom class name */
    className?: string;
    /** Inline styles */
    style?: React__default.CSSProperties;
    /** Children elements */
    children: React__default.ReactNode;
    /** HTML element to render as */
    as?: React__default.ElementType;
}
/**
 * Center - Centers content horizontally and/or vertically
 */
declare const Center: React__default.FC<CenterProps>;

/**
 * Divider Atom Component
 *
 * A divider component for separating content sections.
 */

type DividerOrientation = "horizontal" | "vertical";
type DividerVariant = "solid" | "dashed" | "dotted";
interface DividerProps {
    /**
     * Orientation of the divider
     * @default 'horizontal'
     */
    orientation?: DividerOrientation;
    /**
     * Text label to display in the divider
     */
    label?: string;
    /**
     * Line style variant
     * @default 'solid'
     */
    variant?: DividerVariant;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const Divider: React__default.FC<DividerProps>;

/**
 * Icon Atom Component
 *
 * A wrapper component for Lucide icons with consistent sizing and styling.
 * Uses theme-aware CSS variables for stroke width and color.
 *
 * Supports two APIs:
 * - `icon` prop: Pass a LucideIcon component directly
 * - `name` prop: Pass a string icon name (resolved from iconMap)
 */

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type IconAnimation = 'spin' | 'pulse' | 'none';
interface IconProps {
    /** Lucide icon component (preferred for type-safe usage) */
    icon?: LucideIcon;
    /** Icon name as string (resolved from iconMap) */
    name?: string;
    /** Size of the icon */
    size?: IconSize;
    /** Color class (Tailwind color class) or 'inherit' for theme default */
    color?: string;
    /** Animation type */
    animation?: IconAnimation;
    /** Additional CSS classes */
    className?: string;
    /** Icon stroke width - uses theme default if not specified */
    strokeWidth?: number;
    /** Inline style */
    style?: React__default.CSSProperties;
}
declare const Icon: React__default.FC<IconProps>;

/**
 * ProgressBar Atom Component
 *
 * A progress bar component with linear, circular, and stepped variants.
 */

type ProgressBarType = "linear" | "circular" | "stepped";
type ProgressBarVariant = "default" | "primary" | "success" | "warning" | "danger";
type ProgressBarColor = ProgressBarVariant;
interface ProgressBarProps {
    /**
     * Progress value (0-100)
     */
    value: number;
    /**
     * Maximum value (for calculating percentage)
     * @default 100
     */
    max?: number;
    /**
     * Type of the progress bar (linear, circular, stepped)
     * @default 'linear'
     */
    progressType?: ProgressBarType;
    /**
     * Variant/color of the progress bar
     * @default 'primary'
     */
    variant?: ProgressBarVariant;
    /**
     * Color variant (alias for variant)
     * @default 'primary'
     */
    color?: ProgressBarColor;
    /**
     * Show percentage text
     * @default false
     */
    showPercentage?: boolean;
    /**
     * Alias for showPercentage (pattern compatibility)
     */
    showLabel?: boolean;
    /**
     * Label text
     */
    label?: string;
    /**
     * Size (for circular variant)
     * @default 'md'
     */
    size?: "sm" | "md" | "lg";
    /**
     * Number of steps (for stepped variant)
     * @default 5
     */
    steps?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const ProgressBar: React__default.FC<ProgressBarProps>;

/**
 * Radio Atom Component
 *
 * A radio button component with label support and accessibility.
 */

interface RadioProps extends Omit<React__default.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    /**
     * Label text displayed next to the radio button
     */
    label?: string;
    /**
     * Helper text displayed below the radio button
     */
    helperText?: string;
    /**
     * Error message displayed below the radio button
     */
    error?: string;
    /**
     * Size of the radio button
     * @default 'md'
     */
    size?: "sm" | "md" | "lg";
}
declare const Radio: React__default.ForwardRefExoticComponent<RadioProps & React__default.RefAttributes<HTMLInputElement>>;

interface SwitchProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    id?: string;
    name?: string;
    className?: string;
}
declare const Switch: React$1.ForwardRefExoticComponent<SwitchProps & React$1.RefAttributes<HTMLButtonElement>>;

/**
 * Spacer Component
 *
 * A flexible spacer that expands to fill available space in a flex container.
 * Useful for pushing elements apart or creating consistent spacing.
 */

type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'auto';
interface SpacerProps {
    /** Fixed size (auto = flex grow) */
    size?: SpacerSize;
    /** Orientation (for fixed sizes) */
    axis?: 'horizontal' | 'vertical';
    /** Custom class name */
    className?: string;
}
/**
 * Spacer - Flexible spacing element for flex layouts
 *
 * Usage:
 * - size="auto" (default): Expands to fill available space (flex: 1)
 * - size="md": Fixed size spacing
 */
declare const Spacer: React__default.FC<SpacerProps>;

/**
 * Stack Component
 *
 * A layout primitive for arranging children in a vertical or horizontal stack with consistent spacing.
 * Includes convenience exports VStack and HStack for common use cases.
 */

type StackDirection = "horizontal" | "vertical";
type StackGap = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";
interface StackProps {
    /** Stack direction */
    direction?: StackDirection;
    /** Gap between children */
    gap?: StackGap;
    /** Align items on the cross axis */
    align?: StackAlign;
    /** Justify items on the main axis */
    justify?: StackJustify;
    /** Allow items to wrap */
    wrap?: boolean;
    /** Reverse the order of children */
    reverse?: boolean;
    /** Fill available space (flex: 1) */
    flex?: boolean;
    /** Custom class name */
    className?: string;
    /** Inline styles */
    style?: React__default.CSSProperties;
    /** Children elements */
    children?: React__default.ReactNode;
    /** HTML element to render as */
    as?: React__default.ElementType;
    /** Click handler */
    onClick?: (e: React__default.MouseEvent) => void;
    /** Keyboard handler */
    onKeyDown?: (e: React__default.KeyboardEvent) => void;
    /** Role for accessibility */
    role?: string;
    /** Tab index for focus management */
    tabIndex?: number;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Payload to include with the action event */
    actionPayload?: Record<string, unknown>;
}
/**
 * Stack - Flexible layout component for arranging children
 */
declare const Stack: React__default.FC<StackProps>;
/**
 * VStack - Vertical stack shorthand
 */
interface VStackProps extends Omit<StackProps, "direction"> {
}
declare const VStack: React__default.FC<VStackProps>;
/**
 * HStack - Horizontal stack shorthand
 */
interface HStackProps extends Omit<StackProps, "direction"> {
}
declare const HStack: React__default.FC<HStackProps>;

/**
 * TextHighlight Atom Component
 *
 * A styled span component for highlighting text with annotations (questions or notes).
 * Uses different colors for different annotation types:
 * - Questions: Blue highlight
 * - Notes: Yellow highlight
 */

type HighlightType = "question" | "note";
interface TextHighlightProps {
    /**
     * Type of highlight (determines color)
     */
    highlightType: HighlightType;
    /**
     * Whether the highlight is currently active/focused
     * @default false
     */
    isActive?: boolean;
    /**
     * Callback when highlight is clicked
     */
    onClick?: () => void;
    /**
     * Callback when highlight is hovered
     */
    onMouseEnter?: () => void;
    /**
     * Callback when hover ends
     */
    onMouseLeave?: () => void;
    /**
     * Unique ID for the annotation
     */
    annotationId?: string;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Highlighted text content
     */
    children: React__default.ReactNode;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
    /** Declarative hover event — emits UI:{hoverEvent} with { hovered: true/false } */
    hoverEvent?: string;
}
/**
 * TextHighlight component for rendering highlighted text annotations
 */
declare const TextHighlight: React__default.FC<TextHighlightProps>;

/**
 * Typography Atom Component
 *
 * Text elements following the KFlow design system with theme-aware styling.
 */

type TypographyVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2" | "body" | "caption" | "overline" | "small" | "large" | "label";
type TypographySize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
interface TypographyProps {
    /** Typography variant */
    variant?: TypographyVariant;
    /** Heading level (1-6) - alternative to variant for headings */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Text color */
    color?: "primary" | "secondary" | "muted" | "error" | "success" | "warning" | "inherit";
    /** Text alignment */
    align?: "left" | "center" | "right";
    /** Font weight override */
    weight?: "light" | "normal" | "medium" | "semibold" | "bold";
    /** Font size override */
    size?: TypographySize;
    /** Truncate with ellipsis (single line) */
    truncate?: boolean;
    /** Overflow handling mode */
    overflow?: "visible" | "hidden" | "wrap" | "clamp-2" | "clamp-3";
    /** Custom HTML element */
    as?: keyof React__default.JSX.IntrinsicElements;
    /** HTML id attribute */
    id?: string;
    /** Additional class names */
    className?: string;
    /** Inline style */
    style?: React__default.CSSProperties;
    /** Text content (alternative to children) */
    content?: React__default.ReactNode;
    /** Children elements */
    children?: React__default.ReactNode;
}
declare const Typography: React__default.FC<TypographyProps>;
/**
 * Heading component - convenience wrapper for Typography heading variants
 */
interface HeadingProps extends Omit<TypographyProps, "variant"> {
    /** Heading level (1-6) */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Override font size */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}
declare const Heading: React__default.FC<HeadingProps>;
/**
 * Text component - convenience wrapper for Typography body/caption variants
 */
interface TextProps extends Omit<TypographyProps, "level"> {
    /** Text variant */
    variant?: "body" | "body1" | "body2" | "caption" | "small" | "large" | "label" | "overline";
}
declare const Text: React__default.FC<TextProps>;

/**
 * ThemeToggle Atom Component
 *
 * A button that toggles between light and dark themes.
 * Uses Sun and Moon icons to indicate current/target theme.
 *
 * @packageDocumentation
 */

interface ThemeToggleProps {
    /** Additional CSS classes */
    className?: string;
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Show label text */
    showLabel?: boolean;
}
/**
 * ThemeToggle component for switching between light and dark modes
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ThemeToggle />
 *
 * // With label
 * <ThemeToggle showLabel />
 *
 * // Custom size
 * <ThemeToggle size="lg" />
 * ```
 */
declare const ThemeToggle: React__default.FC<ThemeToggleProps>;

/**
 * ThemeSelector - Design theme selector component
 *
 * A dropdown/toggle component for switching between design themes.
 *
 * @packageDocumentation
 */

interface ThemeSelectorProps {
    /** Optional className */
    className?: string;
    /** Show as dropdown or buttons */
    variant?: "dropdown" | "buttons";
    /** Show labels */
    showLabels?: boolean;
}
/**
 * ThemeSelector component for switching design themes
 */
declare const ThemeSelector: React__default.FC<ThemeSelectorProps>;

/**
 * Overlay Atom Component
 *
 * A fixed backdrop for modals and drawers.
 */

interface OverlayProps {
    isVisible?: boolean;
    onClick?: (e: React__default.MouseEvent) => void;
    className?: string;
    blur?: boolean;
    /** Declarative event name — emits UI:{action} via eventBus on click */
    action?: string;
}
declare const Overlay: React__default.FC<OverlayProps>;

/**
 * ConditionalWrapper Atom Component
 *
 * A wrapper component that conditionally renders its children based on
 * S-expression evaluation. Used for dynamic field visibility in inspection forms.
 */

/**
 * Context for conditional evaluation
 */
interface ConditionalContext {
    formValues: Record<string, unknown>;
    globalVariables: Record<string, unknown>;
    localVariables?: Record<string, unknown>;
    entity?: Record<string, unknown>;
}
interface ConditionalWrapperProps {
    /** The S-expression condition to evaluate */
    condition?: SExpr;
    /** Context for evaluating the condition */
    context: ConditionalContext;
    /** Children to render when condition is true (or when no condition is provided) */
    children: React__default.ReactNode;
    /** Optional fallback to render when condition is false */
    fallback?: React__default.ReactNode;
    /** Whether to animate the transition (uses CSS transitions) */
    animate?: boolean;
}
/**
 * ConditionalWrapper conditionally renders children based on S-expression evaluation.
 *
 * Supported bindings:
 * - @entity.formValues.fieldId - Access form field values
 * - @entity.globalVariables.HG_VAR - Access global inspection variables
 * - @entity.localVariables.H_VAR - Access document-local variables
 * - @state - Current state machine state
 * - @now - Current timestamp
 *
 * @example
 * // Simple condition - show field when another field equals a value
 * <ConditionalWrapper
 *   condition={["=", "@entity.formValues.vehicleType", "commercial"]}
 *   context={{ formValues: { vehicleType: "commercial" }, globalVariables: {} }}
 * >
 *   <Input name="commercialLicenseNumber" />
 * </ConditionalWrapper>
 *
 * @example
 * // With fallback - show message when condition not met
 * <ConditionalWrapper
 *   condition={[">=", "@entity.formValues.loadWeight", 3500]}
 *   context={formContext}
 *   fallback={<Typography variant="small">Load weight must be at least 3500kg</Typography>}
 * >
 *   <HeavyVehicleFields />
 * </ConditionalWrapper>
 *
 * @example
 * // Using global variables for cross-form conditions
 * <ConditionalWrapper
 *   condition={["=", "@entity.globalVariables.HG_POTROSNIKI", "DA"]}
 *   context={{ formValues: {}, globalVariables: { HG_POTROSNIKI: "DA" } }}
 * >
 *   <PriceMarkingSection />
 * </ConditionalWrapper>
 */
declare const ConditionalWrapper: React__default.FC<ConditionalWrapperProps>;

/**
 * LawReferenceTooltip Atom Component
 *
 * A specialized tooltip for displaying law references in inspection forms.
 * Shows law name, article number, and relevant clause text.
 */

/**
 * Law reference definition
 */
interface LawReference {
    /** Law identifier (e.g., "VVO", "TPED") */
    law: string;
    /** Full name of the law */
    lawName?: string;
    /** Article number (e.g., "§8", "Artikel 5") */
    article: string;
    /** Clause or paragraph text */
    clause?: string;
    /** Optional link to full law text */
    link?: string;
}
interface LawReferenceTooltipProps {
    /** The law reference to display */
    reference: LawReference;
    /** Children element that triggers the tooltip */
    children: React__default.ReactNode;
    /** Tooltip position */
    position?: "top" | "bottom" | "left" | "right";
    /** Additional CSS classes */
    className?: string;
}
/**
 * LawReferenceTooltip displays legal references with structured formatting.
 *
 * @example
 * <LawReferenceTooltip
 *   reference={{
 *     law: "VVO",
 *     lawName: "Verkehrsverordnung",
 *     article: "§8 Abs. 3",
 *     clause: "Die zulässige Gesamtmasse darf 3500 kg nicht überschreiten."
 *   }}
 * >
 *   <Typography variant="small" className="text-blue-600 underline cursor-help">VVO §8</Typography>
 * </LawReferenceTooltip>
 */
declare const LawReferenceTooltip: React__default.FC<LawReferenceTooltipProps>;

interface HealthBarProps {
    /** Current health value */
    current: number;
    /** Maximum health value */
    max: number;
    /** Display format */
    format?: 'hearts' | 'bar' | 'numeric';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Animation on change */
    animated?: boolean;
}
declare function HealthBar({ current, max, format, size, className, animated, }: HealthBarProps): react_jsx_runtime.JSX.Element;
declare namespace HealthBar {
    var displayName: string;
}

interface ScoreDisplayProps {
    /** Current score value */
    value: number;
    /** Label to display before score */
    label?: string;
    /** Icon component or emoji */
    icon?: React$1.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Additional CSS classes */
    className?: string;
    /** Animation on value change */
    animated?: boolean;
    /** Number formatting locale */
    locale?: string;
}
declare function ScoreDisplay({ value, label, icon, size, className, animated, locale, }: ScoreDisplayProps): react_jsx_runtime.JSX.Element;
declare namespace ScoreDisplay {
    var displayName: string;
}

interface ControlButtonProps {
    /** Button label text */
    label?: string;
    /** Icon component or emoji */
    icon?: React$1.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl' | string;
    /** Shape variant */
    shape?: 'circle' | 'rounded' | 'square' | string;
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'ghost' | string;
    /** Called when button is pressed */
    onPress?: () => void;
    /** Called when button is released */
    onRelease?: () => void;
    /** Declarative event name emitted on press via useEventBus */
    pressEvent?: string;
    /** Declarative event name emitted on release via useEventBus */
    releaseEvent?: string;
    /** Whether the button is currently pressed */
    pressed?: boolean;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}
declare function ControlButton({ label, icon, size, shape, variant, onPress, onRelease, pressEvent, releaseEvent, pressed, disabled, className, }: ControlButtonProps): react_jsx_runtime.JSX.Element;
declare namespace ControlButton {
    var displayName: string;
}

/**
 * Sprite Component
 *
 * Renders a single frame from a spritesheet with transform support.
 */

interface SpriteProps {
    /** Spritesheet image URL */
    spritesheet: string;
    /** Width of each frame in pixels */
    frameWidth: number;
    /** Height of each frame in pixels */
    frameHeight: number;
    /** Frame index to display (0-based, left-to-right, top-to-bottom) */
    frame: number;
    /** X position in pixels */
    x: number;
    /** Y position in pixels */
    y: number;
    /** Scale factor (default: 1) */
    scale?: number;
    /** Flip horizontally */
    flipX?: boolean;
    /** Flip vertically */
    flipY?: boolean;
    /** Rotation in degrees */
    rotation?: number;
    /** Opacity (0-1) */
    opacity?: number;
    /** Z-index for layering */
    zIndex?: number;
    /** Number of columns in spritesheet (for frame calculation) */
    columns?: number;
    /** Optional className */
    className?: string;
    /** Optional onClick handler */
    onClick?: () => void;
    /** Declarative event name emitted on click via useEventBus */
    action?: string;
}
/**
 * Sprite component for rendering spritesheet frames
 *
 * @example
 * ```tsx
 * <Sprite
 *   spritesheet="/sprites/player.png"
 *   frameWidth={32}
 *   frameHeight={32}
 *   frame={currentFrame}
 *   x={player.x}
 *   y={player.y}
 *   flipX={player.facingLeft}
 *   scale={2}
 * />
 * ```
 */
declare function Sprite({ spritesheet, frameWidth, frameHeight, frame, x, y, scale, flipX, flipY, rotation, opacity, zIndex, columns, className, onClick, action, }: SpriteProps): React__default.JSX.Element;
/**
 * Canvas-based sprite renderer for better performance in game loops
 */
declare function drawSprite(ctx: CanvasRenderingContext2D, image: HTMLImageElement, props: Omit<SpriteProps, 'spritesheet' | 'className' | 'onClick'>): void;

/**
 * StateIndicator Component
 *
 * Displays a visual indicator for a game entity's current state.
 * Generic — not tied to any specific game. Projects can extend
 * the state styles via the `stateStyles` prop.
 */

interface StateStyle {
    icon: string;
    bgClass: string;
}
interface StateIndicatorProps {
    /** The current state name */
    state: string;
    /** Optional label override (defaults to capitalized state name) */
    label?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show pulse animation on non-idle states */
    animated?: boolean;
    /** Custom state styles to extend/override defaults */
    stateStyles?: Record<string, StateStyle>;
    /** Additional CSS classes */
    className?: string;
}
declare function StateIndicator({ state, label, size, animated, stateStyles, className, }: StateIndicatorProps): React__default.JSX.Element;
declare namespace StateIndicator {
    var displayName: string;
}

interface ErrorBoundaryProps {
    /** Content to render when no error */
    children: ReactNode;
    /** Fallback UI when an error is caught — ReactNode or render function */
    fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
    /** Additional CSS classes for the wrapper */
    className?: string;
    /** Called when an error is caught (for logging/telemetry) */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
interface ErrorBoundaryState {
    error: Error | null;
}
/**
 * ErrorBoundary — catches React render errors in child components.
 *
 * Uses `getDerivedStateFromError` and `componentDidCatch` to capture errors
 * and render a fallback UI. Supports both static ReactNode fallbacks and
 * render-function fallbacks that receive the error and a reset function.
 *
 * @example
 * ```tsx
 * // Static fallback
 * <ErrorBoundary fallback={<Alert variant="error">Something broke</Alert>}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Render function fallback with reset
 * <ErrorBoundary fallback={(error, reset) => (
 *   <VStack>
 *     <Typography>Error: {error.message}</Typography>
 *     <Button onClick={reset}>Try Again</Button>
 *   </VStack>
 * )}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // Default fallback (uses ErrorState molecule)
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
declare class ErrorBoundary extends React__default.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static displayName: string;
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    private reset;
    render(): ReactNode;
    private renderFallback;
}

/**
 * FormField Molecule Component
 *
 * A form field wrapper with label, hint, and error message support.
 * **Atomic Design**: Composed using Label and Typography atoms.
 */

interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    children: React__default.ReactNode;
}
declare const FormField: React__default.FC<FormFieldProps>;

interface EmptyStateProps {
    /**
     * Icon to display. Accepts either:
     * - A Lucide icon component (LucideIcon)
     * - A string icon name (e.g., "check-circle", "x-circle")
     */
    icon?: LucideIcon | string;
    /** Primary text to display - use title or message (message is alias for backwards compat) */
    title?: string;
    /** Alias for title - used by schema patterns */
    message?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    /** Destructive styling for confirmation dialogs */
    destructive?: boolean;
    /** Variant for color styling */
    variant?: "default" | "success" | "error" | "warning" | "info";
    /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
    actionEvent?: string;
}
declare const EmptyState: React__default.FC<EmptyStateProps>;

interface LoadingStateProps {
    title?: string;
    message?: string;
    className?: string;
}
declare const LoadingState: React__default.FC<LoadingStateProps>;

interface ErrorStateProps {
    title?: string;
    /** Error message to display */
    message?: string;
    /** Alias for message (schema compatibility) */
    description?: string;
    onRetry?: () => void;
    className?: string;
    /** Declarative retry event — emits UI:{retryEvent} via eventBus when retry button is clicked */
    retryEvent?: string;
}
declare const ErrorState: React__default.FC<ErrorStateProps>;

type SkeletonVariant = 'header' | 'table' | 'form' | 'card' | 'text';
interface SkeletonProps {
    /** The skeleton variant to render */
    variant?: SkeletonVariant;
    /** Number of rows for table/text variants */
    rows?: number;
    /** Number of columns for table variant */
    columns?: number;
    /** Number of fields for form variant */
    fields?: number;
    /** Additional CSS classes */
    className?: string;
}
/**
 * Skeleton — loading placeholder with 5 variants for Suspense fallbacks.
 *
 * Variants: `header`, `table`, `form`, `card`, `text`.
 * Used as fallback content inside `<Suspense>` boundaries.
 *
 * @example
 * ```tsx
 * <Suspense fallback={<Skeleton variant="table" rows={8} columns={5} />}>
 *   <DataTable entity="Task" />
 * </Suspense>
 *
 * <Suspense fallback={<Skeleton variant="form" fields={6} />}>
 *   <Form entity="Task" />
 * </Suspense>
 * ```
 */
declare function Skeleton({ variant, rows, columns, fields, className, }: SkeletonProps): React__default.ReactElement;
declare namespace Skeleton {
    var displayName: string;
}

/**
 * Accordion Molecule Component
 *
 * A collapsible content component with single or multiple open items.
 * Uses Button, Icon, Typography, and Divider atoms.
 */

interface AccordionItem {
    /**
     * Item ID (auto-generated from header/title if not provided)
     */
    id?: string;
    /**
     * Item header/title
     */
    header?: React__default.ReactNode;
    /**
     * Alias for header (pattern compatibility)
     */
    title?: React__default.ReactNode;
    /**
     * Item content
     */
    content: React__default.ReactNode;
    /**
     * Disable item
     */
    disabled?: boolean;
    /**
     * Default open state
     */
    defaultOpen?: boolean;
}
interface AccordionProps {
    /**
     * Accordion items
     */
    items: AccordionItem[];
    /**
     * Allow multiple items open at once
     * @default false
     */
    multiple?: boolean;
    /**
     * Default open items (IDs)
     */
    defaultOpenItems?: string[];
    /**
     * Default open items by index (pattern compatibility)
     */
    defaultOpen?: number[];
    /**
     * Controlled open items (IDs)
     */
    openItems?: string[];
    /**
     * Callback when item opens/closes
     */
    onItemToggle?: (itemId: string, isOpen: boolean) => void;
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Declarative toggle event — emits UI:{toggleEvent} with { itemId, isOpen } */
    toggleEvent?: string;
}
declare const Accordion: React__default.FC<AccordionProps>;

/**
 * Alert Molecule Component
 *
 * A component for displaying alert messages with different variants and actions.
 * Uses theme-aware CSS variables for styling.
 */

type AlertVariant = "info" | "success" | "warning" | "error";
interface AlertProps {
    /** Alert content (children or message) */
    children?: React__default.ReactNode;
    /** Alert message (alias for children) */
    message?: string;
    variant?: AlertVariant;
    title?: string;
    dismissible?: boolean;
    onDismiss?: () => void;
    onClose?: () => void;
    actions?: React__default.ReactNode;
    className?: string;
    /** Declarative dismiss event — emits UI:{dismissEvent} via eventBus when alert is dismissed */
    dismissEvent?: string;
}
declare const Alert: React__default.FC<AlertProps>;

/**
 * Breadcrumb Molecule Component
 *
 * A breadcrumb navigation component with separators and icons.
 * Uses Button, Icon, and Typography atoms.
 */

interface BreadcrumbItem {
    /**
     * Item label
     */
    label: string;
    /**
     * Item href (if provided, renders as link)
     */
    href?: string;
    /**
     * Item path (alias for href, for schema compatibility)
     */
    path?: string;
    /**
     * Item icon
     */
    icon?: LucideIcon;
    /**
     * Click handler (if href not provided)
     */
    onClick?: () => void;
    /**
     * Is current page
     */
    isCurrent?: boolean;
    /** Event name to emit when clicked (for trait state machine integration) */
    event?: string;
}
interface BreadcrumbProps {
    /**
     * Breadcrumb items
     */
    items: BreadcrumbItem[];
    /**
     * Separator icon
     */
    separator?: LucideIcon;
    /**
     * Maximum items to show (truncates with ellipsis)
     */
    maxItems?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const Breadcrumb: React__default.FC<BreadcrumbProps>;

/**
 * ButtonGroup Molecule Component
 *
 * A component for grouping buttons together with connected styling.
 * Supports both children-based and form-actions pattern (primary/secondary) usage.
 * Uses Button atoms.
 */

type ButtonGroupVariant = 'default' | 'segmented' | 'toggle';
/** Action button config for form-actions pattern */
interface ActionButton {
    label: string;
    /** Action type - 'submit' renders as submit button, others render as button */
    actionType?: string;
    event?: string;
    navigatesTo?: string;
    /** Button variant - matches Button component variants. Accepts string for schema compatibility. */
    variant?: string;
}
/** Filter definition for filter-group pattern */
interface FilterDefinition$1 {
    field: string;
    label: string;
    /** Filter type (checkbox, select, etc.) */
    type?: 'checkbox' | 'select' | 'toggle';
    /** Options for select filters */
    options?: readonly string[];
}
interface ButtonGroupProps {
    /**
     * Button group content (Button components) - use this OR primary/secondary
     */
    children?: React__default.ReactNode;
    /**
     * Primary action button config (for form-actions pattern)
     * Accepts Readonly for compatibility with generated const objects
     */
    primary?: Readonly<ActionButton>;
    /**
     * Secondary action buttons config (for form-actions pattern)
     * Accepts readonly array for compatibility with generated const arrays
     */
    secondary?: readonly Readonly<ActionButton>[];
    /**
     * Visual variant
     * @default 'default'
     */
    variant?: ButtonGroupVariant;
    /**
     * Orientation
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Entity type for filter-group pattern (schema metadata)
     */
    entity?: string;
    /**
     * Filter definitions for filter-group pattern
     */
    filters?: readonly FilterDefinition$1[];
}
declare const ButtonGroup: React__default.FC<ButtonGroupProps>;

/**
 * FilterGroup Molecule Component
 *
 * A component for filtering entity data. Composes atoms (Button, Select, Badge, HStack)
 * and follows the design system using CSS variables.
 *
 * Implements the Closed Circuit principle:
 * - FilterGroup updates QuerySingleton filters via query prop
 * - FilterGroup emits UI:FILTER events for trait state machines
 * - entity-list/entity-cards read filtered data via query prop
 *
 * Supports Query Singleton pattern via `query` prop for std/Filter behavior.
 */

/** Filter definition from schema */
interface FilterDefinition {
    field: string;
    label: string;
    /** Filter type - 'date' renders a date picker, 'date-range'/'daterange' renders two date pickers */
    filterType?: "select" | "toggle" | "checkbox" | "date" | "daterange" | "date-range";
    /** Alias for filterType (schema compatibility) */
    type?: "select" | "toggle" | "checkbox" | "date" | "daterange" | "date-range";
    /** Options for select/toggle filters */
    options?: readonly string[];
}
interface FilterGroupProps {
    /** Entity name to filter */
    entity: string;
    /** Filter definitions from schema */
    filters: readonly FilterDefinition[];
    /** Callback when a filter changes - for EntityStore integration */
    onFilterChange?: (field: string, value: string | null) => void;
    /** Callback to clear all filters */
    onClearAll?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Variant style */
    variant?: "default" | "compact" | "pills" | "vertical";
    /** Show filter icon */
    showIcon?: boolean;
    /**
     * Query singleton binding for state management.
     * When provided, syncs filter state with the query singleton.
     * Example: "@TaskQuery"
     */
    query?: string;
    /** Loading state indicator */
    isLoading?: boolean;
}
/**
 * FilterGroup - Renders filter controls for entity data
 * Uses atoms: Button, Select, Badge, HStack
 */
declare const FilterGroup: React__default.FC<FilterGroupProps>;

interface CardAction {
    label: string;
    onClick?: () => void;
    /** Event name to emit when clicked (for trait state machine integration) */
    event?: string;
    variant?: "default" | "primary" | "danger";
    icon?: string;
    disabled?: boolean;
}
interface CardProps {
    /** Card title */
    title?: string;
    /** Card subtitle or description */
    subtitle?: string;
    /** Image URL to display at top of card */
    image?: string;
    /** Action buttons to display in card footer */
    actions?: CardAction[];
    /** Card content */
    children?: React__default.ReactNode;
    /** Click handler for the entire card */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Declarative event name — emits UI:{action} via eventBus on card click */
    action?: string;
}
/**
 * Card component for displaying content in a contained box
 */
declare function Card({ title, subtitle, image, actions, children, onClick, className, action, }: CardProps): react_jsx_runtime.JSX.Element;
declare namespace Card {
    var displayName: string;
}

/**
 * Container Component
 *
 * A max-width wrapper that centers content horizontally.
 * Essential for controlling page width and maintaining consistent margins.
 */

type ContainerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
interface ContainerProps {
    /** Maximum width */
    size?: ContainerSize;
    /** Alias for size (pattern compatibility) */
    maxWidth?: ContainerSize;
    /** Horizontal padding */
    padding?: ContainerPadding;
    /** Center horizontally */
    center?: boolean;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children?: React__default.ReactNode;
    /** HTML element to render as */
    as?: React__default.ElementType;
}
/**
 * Container - Centers and constrains content width
 */
declare const Container: React__default.FC<ContainerProps>;

/**
 * Flex Component
 *
 * A flexbox wrapper with all common flex properties exposed as props.
 * More explicit than Stack for when you need full flex control.
 */

type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse';
type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
type FlexGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
interface FlexProps {
    /** Flex direction */
    direction?: FlexDirection;
    /** Flex wrap */
    wrap?: FlexWrap;
    /** Align items */
    align?: FlexAlign;
    /** Justify content */
    justify?: FlexJustify;
    /** Gap between items */
    gap?: FlexGap;
    /** Inline flex */
    inline?: boolean;
    /** Flex grow */
    grow?: boolean | number;
    /** Flex shrink */
    shrink?: boolean | number;
    /** Flex basis */
    basis?: string | number;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children: React__default.ReactNode;
    /** HTML element to render as */
    as?: React__default.ElementType;
}
/**
 * Flex - Full-featured flexbox container
 */
declare const Flex: React__default.FC<FlexProps>;

/**
 * FloatingActionButton Molecule Component
 *
 * A floating action button that can expand into multiple actions vertically.
 * Uses Button atom.
 */

interface FloatingAction {
    /**
     * Action ID
     */
    id: string;
    /**
     * Action label
     */
    label: string;
    /**
     * Action icon
     */
    icon: LucideIcon;
    /**
     * Action click handler
     */
    onClick?: () => void;
    /** Event name to emit when clicked (for trait state machine integration) */
    event?: string;
    /**
     * Action variant
     */
    variant?: "primary" | "secondary" | "success" | "danger" | "warning";
}
interface FloatingActionButtonProps {
    /**
     * Single action (if only one action, button will directly trigger onClick)
     */
    action?: {
        icon: LucideIcon;
        onClick: () => void;
        label?: string;
        variant?: "primary" | "secondary" | "success" | "danger" | "warning";
    };
    /**
     * Multiple actions (if provided, button will expand to show all actions)
     */
    actions?: FloatingAction[];
    /**
     * Icon name (simplified API for pattern compatibility)
     */
    icon?: string;
    /**
     * Click handler (simplified API for pattern compatibility)
     */
    onClick?: () => void;
    /**
     * Variant (simplified API for pattern compatibility)
     */
    variant?: "primary" | "secondary" | "success" | "danger" | "warning";
    /**
     * Button position
     * @default 'bottom-right'
     */
    position?: "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left" | "top-center" | string;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const FloatingActionButton: React__default.FC<FloatingActionButtonProps>;

/**
 * Grid Component
 *
 * A CSS Grid wrapper with responsive column support.
 * Useful for creating multi-column layouts.
 */

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type GridAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type GridJustify = 'start' | 'center' | 'end' | 'stretch';
interface ResponsiveGridCols {
    /** Base/mobile columns */
    base?: GridCols;
    /** Small screens (640px+) */
    sm?: GridCols;
    /** Medium screens (768px+) */
    md?: GridCols;
    /** Large screens (1024px+) */
    lg?: GridCols;
    /** Extra large screens (1280px+) */
    xl?: GridCols;
}
interface GridProps {
    /** Number of columns (can be responsive object) */
    cols?: GridCols | ResponsiveGridCols;
    /** Number of rows */
    rows?: number;
    /** Gap between items */
    gap?: GridGap;
    /** Row gap (overrides gap for rows) */
    rowGap?: GridGap;
    /** Column gap (overrides gap for columns) */
    colGap?: GridGap;
    /** Align items on block axis */
    alignItems?: GridAlign;
    /** Justify items on inline axis */
    justifyItems?: GridJustify;
    /** Auto-flow direction */
    flow?: 'row' | 'col' | 'row-dense' | 'col-dense';
    /** Custom class name */
    className?: string;
    /** Inline styles */
    style?: React__default.CSSProperties;
    /** Children elements */
    children: React__default.ReactNode;
    /** HTML element to render as */
    as?: React__default.ElementType;
}
/**
 * Grid - CSS Grid layout wrapper
 */
declare const Grid: React__default.FC<GridProps>;

/**
 * InputGroup Molecule Component
 *
 * A component for grouping input with addons (icons, buttons, text).
 * Uses Input, Button, Icon, and Typography atoms.
 */

interface InputGroupProps extends Omit<InputProps, "icon" | "iconRight"> {
    /**
     * Left addon (icon, button, or text)
     */
    leftAddon?: React__default.ReactNode | LucideIcon;
    /**
     * Right addon (icon, button, or text)
     */
    rightAddon?: React__default.ReactNode | LucideIcon;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const InputGroup: React__default.FC<InputGroupProps>;

/**
 * Menu Molecule Component
 *
 * A dropdown menu component with items, icons, dividers, and sub-menus.
 * Uses theme-aware CSS variables for styling.
 */

interface MenuItem {
    /** Item ID (auto-generated from label if not provided) */
    id?: string;
    /** Item label */
    label: string;
    /** Item icon (LucideIcon or string name) */
    icon?: LucideIcon | string;
    /** Item badge */
    badge?: string | number;
    /** Disable item */
    disabled?: boolean;
    /** Item click handler */
    onClick?: () => void;
    /** Event name for pattern compatibility */
    event?: string;
    /** Variant for styling (pattern compatibility) */
    variant?: "default" | "danger";
    /** Sub-menu items */
    subMenu?: MenuItem[];
}
type MenuPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-start" | "top-end" | "bottom-start" | "bottom-end";
interface MenuProps {
    /** Menu trigger element */
    trigger: React__default.ReactNode;
    /** Menu items */
    items: MenuItem[];
    /** Menu position */
    position?: MenuPosition;
    /** Additional CSS classes */
    className?: string;
}
declare const Menu: React__default.FC<MenuProps>;

/**
 * Modal Molecule Component
 *
 * A modal dialog component with overlay, header, content, and footer.
 * Uses theme-aware CSS variables for styling.
 */

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
interface ModalProps {
    /** Whether the modal is open (defaults to true when rendered by slot wrapper) */
    isOpen?: boolean;
    /** Callback when modal should close (injected by slot wrapper) */
    onClose?: () => void;
    title?: string;
    /** Modal content (can be empty if using slot content) */
    children?: React__default.ReactNode;
    footer?: React__default.ReactNode;
    size?: ModalSize;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    className?: string;
    /** Declarative close event — emits UI:{closeEvent} via eventBus when modal should close */
    closeEvent?: string;
}
declare const Modal: React__default.FC<ModalProps>;

/**
 * Pagination Molecule Component
 *
 * A pagination component with page numbers, previous/next buttons, and ellipsis.
 * Uses Button, Icon, Typography, and Input atoms.
 */

interface PaginationProps {
    /**
     * Current page (1-indexed)
     */
    currentPage: number;
    /**
     * Total number of pages
     */
    totalPages: number;
    /**
     * Callback when page changes (optional - can be a no-op if not interactive)
     */
    onPageChange?: (page: number) => void;
    /**
     * Show page size selector
     * @default false
     */
    showPageSize?: boolean;
    /**
     * Page size options
     */
    pageSizeOptions?: number[];
    /**
     * Current page size
     */
    pageSize?: number;
    /**
     * Callback when page size changes
     */
    onPageSizeChange?: (size: number) => void;
    /**
     * Show jump to page input
     * @default false
     */
    showJumpToPage?: boolean;
    /**
     * Show total count
     * @default false
     */
    showTotal?: boolean;
    /**
     * Total items count
     */
    totalItems?: number;
    /**
     * Maximum number of page buttons to show
     * @default 7
     */
    maxVisiblePages?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Declarative page change event — emits UI:{pageChangeEvent} with { page } */
    pageChangeEvent?: string;
    /** Declarative page size change event — emits UI:{pageSizeChangeEvent} with { pageSize } */
    pageSizeChangeEvent?: string;
}
declare const Pagination: React__default.FC<PaginationProps>;

/**
 * Popover Molecule Component
 *
 * A popover component with position variants and click/hover triggers.
 * Uses Button, Typography, and Icon atoms.
 */

type PopoverPosition = "top" | "bottom" | "left" | "right";
type PopoverTrigger = "click" | "hover";
interface PopoverProps {
    /**
     * Popover content
     */
    content: React__default.ReactNode;
    /**
     * Popover trigger element (ReactElement or ReactNode that will be wrapped in span)
     */
    children: React__default.ReactNode;
    /**
     * Popover position
     * @default 'bottom'
     */
    position?: PopoverPosition;
    /**
     * Trigger type
     * @default 'click'
     */
    trigger?: PopoverTrigger;
    /**
     * Show arrow
     * @default true
     */
    showArrow?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
}
declare const Popover: React__default.FC<PopoverProps>;

/**
 * RelationSelect Molecule Component
 *
 * A searchable select component for relation fields.
 * Allows users to search and select from related entities.
 *
 * Composed from: Box, HStack, VStack, Input, Button, Spinner, Typography atoms
 */

interface RelationOption {
    /** The value to store (typically the ID) */
    value: string;
    /** The display label */
    label: string;
    /** Optional description */
    description?: string;
    /** Whether this option is disabled */
    disabled?: boolean;
}
interface RelationSelectProps {
    /** Current value (ID) */
    value?: string;
    /** Callback when value changes */
    onChange?: (value: string | undefined) => void;
    /** Available options - accepts readonly for compatibility with generated const arrays */
    options: readonly RelationOption[];
    /** Placeholder text */
    placeholder?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Whether the field is disabled */
    disabled?: boolean;
    /** Whether data is loading */
    isLoading?: boolean;
    /** Error message */
    error?: string;
    /** Allow clearing the selection */
    clearable?: boolean;
    /** Name attribute for forms */
    name?: string;
    /** Additional CSS classes */
    className?: string;
    /** Search placeholder */
    searchPlaceholder?: string;
    /** Empty state message */
    emptyMessage?: string;
}
declare const RelationSelect: React__default.FC<RelationSelectProps>;

/**
 * SearchInput Molecule Component
 *
 * A search input component with icon, clear button, and loading state.
 * Uses Input, Icon, Button, and Spinner atoms.
 *
 * Supports Query Singleton pattern via `query` prop for std/Search behavior.
 */

interface SearchInputProps extends Omit<React__default.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    /**
     * Search value (controlled mode)
     */
    value?: string;
    /**
     * Callback when search value changes
     */
    onSearch?: (value: string) => void;
    /**
     * Debounce delay in milliseconds
     * @default 300
     */
    debounceMs?: number;
    /**
     * Show loading state
     * @default false
     */
    isLoading?: boolean;
    /**
     * Placeholder text
     * @default 'Search...'
     */
    placeholder?: string;
    /**
     * Show clear button
     * @default true
     */
    clearable?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Event name to dispatch on search (schema metadata, wired by trait)
     * This is metadata used by the trait generator, not by the component.
     */
    event?: string;
    /**
     * Entity type for context-aware search.
     * When provided, search events include entity context.
     */
    entity?: string;
    /**
     * Query singleton binding for state management.
     * When provided, syncs search state with the query singleton.
     * Example: "@TaskQuery"
     */
    query?: string;
}
declare const SearchInput: React__default.FC<SearchInputProps>;

/**
 * SidePanel Molecule Component
 *
 * A side panel that slides in from the right (or left) with header and content.
 * Uses Button, Typography atoms.
 */

interface SidePanelProps {
    /**
     * Panel title
     */
    title: string;
    /**
     * Panel content
     */
    children: React__default.ReactNode;
    /**
     * Is panel open
     */
    isOpen: boolean;
    /**
     * On close handler
     */
    onClose: () => void;
    /**
     * Panel width
     * @default 'w-96'
     */
    width?: string;
    /**
     * Panel position
     * @default 'right'
     */
    position?: "left" | "right";
    /**
     * Show overlay on mobile
     * @default true
     */
    showOverlay?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Declarative close event — emits UI:{closeEvent} via eventBus when panel should close */
    closeEvent?: string;
}
declare const SidePanel: React__default.FC<SidePanelProps>;

/**
 * SimpleGrid Component
 *
 * A simplified grid that automatically adjusts columns based on available space.
 * Perfect for card layouts and item collections.
 */

type SimpleGridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
interface SimpleGridProps {
    /** Minimum width of each child (e.g., 200, "200px", "15rem") */
    minChildWidth?: number | string;
    /** Maximum number of columns */
    maxCols?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Exact number of columns (disables auto-fit) */
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Gap between items */
    gap?: SimpleGridGap;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children: React__default.ReactNode;
}
/**
 * SimpleGrid - Auto-responsive grid layout
 */
declare const SimpleGrid: React__default.FC<SimpleGridProps>;

/**
 * Tabs Molecule Component
 *
 * A tabbed interface component with keyboard navigation and badge support.
 * Uses theme-aware CSS variables for styling.
 */

interface TabItem {
    /** Tab ID */
    id: string;
    /** Tab label */
    label: string;
    /** Tab content - optional for event-driven tabs */
    content?: React__default.ReactNode;
    /** Tab icon */
    icon?: LucideIcon;
    /** Tab badge */
    badge?: string | number;
    /** Disable tab */
    disabled?: boolean;
    /** Event to emit when tab is clicked (for trait state machine integration) */
    event?: string;
    /** Whether this tab is currently active (for controlled tabs) */
    active?: boolean;
}
interface TabsProps {
    /** Tab items */
    items?: TabItem[];
    /** Tab items (alias for items - used by generated code) */
    tabs?: TabItem[];
    /** Default active tab ID */
    defaultActiveTab?: string;
    /** Controlled active tab ID */
    activeTab?: string;
    /** Callback when tab changes */
    onTabChange?: (tabId: string) => void;
    /** Tab variant */
    variant?: 'default' | 'pills' | 'underline';
    /** Tab orientation */
    orientation?: 'horizontal' | 'vertical';
    /** Additional CSS classes */
    className?: string;
}
declare const Tabs: React__default.FC<TabsProps>;

/**
 * Toast Molecule Component
 *
 * A toast notification component with auto-dismiss and action buttons.
 * Uses theme-aware CSS variables for styling.
 */

type ToastVariant = "success" | "error" | "info" | "warning";
interface ToastProps {
    /** Toast variant */
    variant?: ToastVariant;
    /** Toast message */
    message: string;
    /** Toast title (optional) */
    title?: string;
    /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
    duration?: number;
    /** Show dismiss button */
    dismissible?: boolean;
    /** Callback when toast is dismissed */
    onDismiss?: () => void;
    /** Action button label */
    actionLabel?: string;
    /** Action button click handler */
    onAction?: () => void;
    /** Badge count (optional) */
    badge?: string | number;
    /** Additional CSS classes */
    className?: string;
    /** Declarative dismiss event — emits UI:{dismissEvent} via eventBus when toast is dismissed */
    dismissEvent?: string;
    /** Declarative action event — emits UI:{actionEvent} via eventBus when action button is clicked */
    actionEvent?: string;
}
declare const Toast: React__default.FC<ToastProps>;

/**
 * Tooltip Molecule Component
 *
 * A tooltip component with position variants and delay options.
 * Uses theme-aware CSS variables for styling.
 */

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
interface TooltipProps {
    /** Tooltip content */
    content: React__default.ReactNode;
    /** Tooltip trigger element (ReactElement or ReactNode that will be wrapped in span) */
    children: React__default.ReactNode;
    /** Tooltip position */
    position?: TooltipPosition;
    /** Show delay in milliseconds */
    delay?: number;
    /** Hide delay in milliseconds */
    hideDelay?: number;
    /** Show arrow */
    showArrow?: boolean;
    /** Additional CSS classes */
    className?: string;
}
declare const Tooltip: React__default.FC<TooltipProps>;

/**
 * Drawer Molecule Component
 *
 * A slide-in drawer component for displaying secondary content.
 * Used by the UI Slot system for render_ui effects targeting the drawer slot.
 *
 * Features:
 * - Left/right positioning
 * - Configurable width
 * - Overlay backdrop
 * - Click-outside to dismiss
 * - Slide animation
 * - Escape key to close
 *
 * @packageDocumentation
 */

type DrawerPosition = "left" | "right";
type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";
interface DrawerProps {
    /** Whether the drawer is open (defaults to true when rendered by slot wrapper) */
    isOpen?: boolean;
    /** Callback when drawer should close (injected by slot wrapper) */
    onClose?: () => void;
    /** Drawer title */
    title?: string;
    /** Drawer content (can be empty if using slot content) */
    children?: React__default.ReactNode;
    /** Footer content */
    footer?: React__default.ReactNode;
    /** Position (left or right) */
    position?: DrawerPosition;
    /** Width (CSS value or preset size) */
    width?: string | DrawerSize;
    /** Show close button */
    showCloseButton?: boolean;
    /** Close on overlay click */
    closeOnOverlayClick?: boolean;
    /** Close on escape key */
    closeOnEscape?: boolean;
    /** Additional class name */
    className?: string;
    /** Declarative close event — emits UI:{closeEvent} via eventBus when drawer should close */
    closeEvent?: string;
}
declare const Drawer: React__default.FC<DrawerProps>;

/**
 * WizardProgress Component
 *
 * Step progress indicator for multi-step wizards.
 * Shows current step, completed steps, and allows navigation to completed steps.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */

/**
 * Step info needed by WizardProgress.
 * Compatible with WizardContainer's WizardStep (subset of fields).
 */
interface WizardProgressStep {
    /** Step identifier */
    id: string;
    /** Step title */
    title: string;
    /** Step description (optional) */
    description?: string;
}
interface WizardProgressProps {
    /** Step definitions (compatible with WizardContainer's WizardStep) */
    steps: WizardProgressStep[];
    /** Current step index (0-based) */
    currentStep: number;
    /** Callback when a completed step is clicked */
    onStepClick?: (stepIndex: number) => void;
    /** Allow clicking on completed steps to navigate back */
    allowNavigation?: boolean;
    /** Compact mode (smaller, no titles) */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Declarative step click event — emits UI:{stepClickEvent} with { stepIndex } */
    stepClickEvent?: string;
}
/**
 * WizardProgress - Step progress indicator
 */
declare const WizardProgress: React__default.FC<WizardProgressProps>;

/**
 * WizardNavigation Component
 *
 * Navigation buttons for multi-step wizards.
 * Includes Back, Next, and Complete buttons with proper state handling.
 *
 * Emits events via useEventBus for trait integration.
 * Uses wireframe theme styling (high contrast, sharp edges).
 */

interface WizardNavigationProps {
    /** Current step index (0-based) */
    currentStep: number;
    /** Total number of steps */
    totalSteps: number;
    /** Whether the current step is valid (enables Next/Complete) */
    isValid?: boolean;
    /** Show the Back button */
    showBack?: boolean;
    /** Show the Next button */
    showNext?: boolean;
    /** Show the Complete button (on last step) */
    showComplete?: boolean;
    /** Custom label for Back button */
    backLabel?: string;
    /** Custom label for Next button */
    nextLabel?: string;
    /** Custom label for Complete button */
    completeLabel?: string;
    /** Event to emit on Back click */
    onBack?: string;
    /** Event to emit on Next click */
    onNext?: string;
    /** Event to emit on Complete click */
    onComplete?: string;
    /** Direct callback for Back (alternative to event) */
    onBackClick?: () => void;
    /** Direct callback for Next (alternative to event) */
    onNextClick?: () => void;
    /** Direct callback for Complete (alternative to event) */
    onCompleteClick?: () => void;
    /** Compact mode (smaller padding) */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}
/**
 * WizardNavigation - Wizard navigation buttons
 */
declare const WizardNavigation: React__default.FC<WizardNavigationProps>;

/**
 * MarkdownContent Molecule Component
 *
 * Renders markdown content with support for GFM (GitHub Flavored Markdown)
 * and math equations (KaTeX). Handles inline code only — fenced code blocks
 * should be parsed out and rendered with CodeBlock component.
 *
 * Event Contract:
 * - No events emitted (display-only component)
 * - entityAware: false
 *
 * NOTE: react-markdown's `components` override API requires native HTML
 * elements — this is the same library-boundary exception as `<iframe>` in
 * DocumentViewer and `<svg>` in JazariStateMachine/StateMachineView.
 */

interface MarkdownContentProps {
    /** The markdown content to render */
    content: string;
    /** Text direction */
    direction?: 'rtl' | 'ltr';
    /** Additional CSS classes */
    className?: string;
}
declare const MarkdownContent: React__default.NamedExoticComponent<MarkdownContentProps>;

/**
 * CodeBlock Molecule Component
 *
 * A syntax-highlighted code block with copy-to-clipboard functionality.
 * Preserves scroll position during re-renders.
 *
 * Event Contract:
 * - Emits: UI:COPY_CODE { language, success }
 */

interface CodeBlockProps {
    /** The code content to display */
    code: string;
    /** Programming language for syntax highlighting */
    language?: string;
    /** Show the copy button */
    showCopyButton?: boolean;
    /** Show the language badge */
    showLanguageBadge?: boolean;
    /** Maximum height before scrolling */
    maxHeight?: string;
    /** Additional CSS classes */
    className?: string;
}
declare const CodeBlock: React__default.NamedExoticComponent<CodeBlockProps>;

/**
 * QuizBlock Molecule Component
 *
 * A collapsible Q&A block for embedded quiz questions in content.
 * Shows the question with a reveal button for the answer.
 *
 * Event Contract:
 * - No events emitted (self-contained interaction)
 * - entityAware: false
 */

interface QuizBlockProps {
    /** The quiz question */
    question: string;
    /** The quiz answer (revealed on toggle) */
    answer: string;
    /** Additional CSS classes */
    className?: string;
}
declare const QuizBlock: React__default.FC<QuizBlockProps>;

/**
 * ScaledDiagram Molecule
 *
 * Wraps a fixed-size diagram (like JazariStateMachine / StateMachineView)
 * and CSS-scales it to fit the parent container width.
 *
 * The diagram renders at its natural (large) size. We observe the content
 * element and once the diagram is measured we apply transform:scale() with
 * a corrected container height so surrounding layout flows correctly.
 *
 * Event Contract:
 * - No events emitted (layout-only wrapper)
 * - entityAware: false
 */

interface ScaledDiagramProps {
    children: React__default.ReactNode;
    className?: string;
}
declare const ScaledDiagram: React__default.FC<ScaledDiagramProps>;

/**
 * RepeatableFormSection
 *
 * A form section that can be repeated multiple times.
 * Used for collecting multiple entries (participants, findings, etc.)
 *
 * Enhanced with trackAddedInState for inspection audit trails.
 *
 * Event Contract:
 * - Emits: UI:SECTION_ADDED { sectionType, index, addedInState? }
 * - Emits: UI:SECTION_REMOVED { sectionType, index, itemId }
 */

interface RepeatableItem {
    id: string;
    /** State in which this item was added (for audit trails) */
    addedInState?: string;
    /** Timestamp when item was added */
    addedAt?: string;
    [key: string]: unknown;
}
interface RepeatableFormSectionProps {
    /** Section type identifier */
    sectionType: string;
    /** Section title */
    title: string;
    /** Items in the section */
    items: RepeatableItem[];
    /** Render function for each item */
    renderItem: (item: RepeatableItem, index: number) => React__default.ReactNode;
    /** Minimum items required */
    minItems?: number;
    /** Maximum items allowed */
    maxItems?: number;
    /** Allow reordering */
    allowReorder?: boolean;
    /** Add button label */
    addLabel?: string;
    /** Empty state message */
    emptyMessage?: string;
    /** Read-only mode */
    readOnly?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Add handler */
    onAdd?: () => void;
    /** Remove handler */
    onRemove?: (itemId: string, index: number) => void;
    /** Reorder handler */
    onReorder?: (fromIndex: number, toIndex: number) => void;
    /** Track the state in which items are added (for inspection audit) */
    trackAddedInState?: boolean;
    /** Current inspection state (used when trackAddedInState is true) */
    currentState?: string;
    /** Show audit metadata (addedInState, addedAt) */
    showAuditInfo?: boolean;
}
declare const RepeatableFormSection: React__default.FC<RepeatableFormSectionProps>;

/**
 * ViolationAlert
 *
 * Displays inspection violations with law references and action types.
 * Used in inspection forms to show detected compliance violations.
 *
 * Action Types:
 * - measure: Corrective measure required (warning)
 * - admin: Administrative action (error)
 * - penalty: Penalty proceedings (error, severe)
 */

interface ViolationRecord {
    /** Unique violation identifier */
    id: string;
    /** Law reference (e.g., "ZVPOT-1") */
    law: string;
    /** Article reference (e.g., "14/1") */
    article: string;
    /** Violation message */
    message: string;
    /** Action type determines severity */
    actionType: "measure" | "admin" | "penalty";
    /** Administrative action reference (e.g., "ZVPOT-1 234/1-4") */
    adminAction?: string;
    /** Penalty action reference (e.g., "ZVPOT-1 240/1-9") */
    penaltyAction?: string;
    /** Field that triggered this violation */
    fieldId?: string;
    /** Tab/form where violation occurred */
    tabId?: string;
}
interface ViolationAlertProps {
    /** Violation data */
    violation: ViolationRecord;
    /** Visual severity (derived from actionType if not specified) */
    severity?: "warning" | "error";
    /** Dismissible alert */
    dismissible?: boolean;
    /** Dismiss handler */
    onDismiss?: () => void;
    /** Navigate to the field that caused violation */
    onNavigateToField?: (fieldId: string) => void;
    /** Compact display mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}
declare const ViolationAlert: React__default.FC<ViolationAlertProps>;

/**
 * FormSectionHeader
 *
 * Header component for collapsible form sections.
 * Provides consistent styling and interaction for section headers.
 */

interface FormSectionHeaderProps {
    /** Section title */
    title: string;
    /** Section subtitle */
    subtitle?: string;
    /** Whether section is collapsed */
    isCollapsed?: boolean;
    /** Toggle collapse handler (makes header clickable) */
    onToggle?: () => void;
    /** Badge text (e.g., "3 fields", "Required", "Complete") */
    badge?: string;
    /** Badge variant */
    badgeVariant?: "default" | "primary" | "success" | "warning" | "danger";
    /** Icon name to show before title */
    icon?: string;
    /** Whether section has validation errors */
    hasErrors?: boolean;
    /** Whether section is complete */
    isComplete?: boolean;
    /** Additional CSS classes */
    className?: string;
}
declare const FormSectionHeader: React__default.FC<FormSectionHeaderProps>;

/**
 * Shared types for entity-display organisms.
 *
 * All entity-display organisms (DataTable, List, Table, CardGrid, DetailPanel)
 * extend EntityDisplayProps to guarantee a uniform prop contract.
 *
 * Exception: Form manages local `formData` state for field input tracking.
 * This is the ONE allowed exception — documented here.
 */
declare const EntityDisplayEvents: {
    readonly SORT: "SORT";
    readonly PAGINATE: "PAGINATE";
    readonly SEARCH: "SEARCH";
    readonly FILTER: "FILTER";
    readonly CLEAR_FILTERS: "CLEAR_FILTERS";
    readonly SELECT: "SELECT";
    readonly DESELECT: "DESELECT";
};
interface SortPayload {
    field: string;
    direction: 'asc' | 'desc';
}
interface PaginatePayload {
    page: number;
    pageSize?: number;
}
interface SearchPayload {
    query: string;
}
interface FilterPayload {
    field: string;
    operator: string;
    value: unknown;
}
interface SelectPayload {
    ids: (string | number)[];
}
interface EntityDisplayProps<T = unknown> {
    /** Entity name for schema-driven integration */
    entity?: string;
    /** Data array provided by the trait via render-ui */
    data?: readonly T[] | T[];
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Current sort field */
    sortBy?: string;
    /** Current sort direction */
    sortDirection?: 'asc' | 'desc';
    /** Current search query value */
    searchValue?: string;
    /** Current page number (1-indexed) */
    page?: number;
    /** Number of items per page */
    pageSize?: number;
    /** Total number of items (for pagination display) */
    totalCount?: number;
    /** Active filters */
    activeFilters?: Record<string, unknown>;
    /** Currently selected item IDs */
    selectedIds?: readonly (string | number)[];
}

interface Column<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    sortable?: boolean;
    render?: (value: unknown, row: T, index: number) => React__default.ReactNode;
}
interface RowAction<T> {
    label: string;
    icon?: LucideIcon;
    onClick: (row: T) => void;
    variant?: "default" | "danger";
    show?: (row: T) => boolean;
    event?: string;
}
interface DataTableProps<T extends {
    id: string | number;
}> extends EntityDisplayProps<T> {
    /** Fields to display - accepts string[] or Column[] for unified interface. Alias for columns */
    fields?: readonly Column<T>[] | readonly string[];
    /** Columns can be Column objects or simple string field names */
    columns?: readonly Column<T>[] | readonly string[];
    /** Item actions from generated code - maps to rowActions */
    itemActions?: readonly {
        label: string;
        event?: string;
        navigatesTo?: string;
        action?: string;
        placement?: "row" | "bulk" | string;
        icon?: LucideIcon;
        variant?: "default" | "primary" | "secondary" | "ghost" | "danger" | string;
        onClick?: (row: T) => void;
    }[];
    emptyIcon?: LucideIcon;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: {
        label: string;
        event?: string;
    };
    selectable?: boolean;
    searchable?: boolean;
    searchPlaceholder?: string;
    rowActions?: readonly RowAction<T>[];
    bulkActions?: ReadonlyArray<{
        label: string;
        icon?: LucideIcon;
        onClick: (selectedRows: T[]) => void;
        variant?: "default" | "danger";
    }>;
    headerActions?: React__default.ReactNode;
    /** Show total count in pagination */
    showTotal?: boolean;
}
declare function DataTable<T extends {
    id: string | number;
}>({ fields, columns, data, entity, itemActions, isLoading, error, emptyIcon, emptyTitle, emptyDescription, emptyAction, selectable, selectedIds, sortBy, sortDirection, searchable, searchValue, searchPlaceholder, page, pageSize, totalCount, rowActions: externalRowActions, bulkActions, headerActions, showTotal, className, }: DataTableProps<T>): react_jsx_runtime.JSX.Element;
declare namespace DataTable {
    var displayName: string;
}

/**
 * Schema metric definition
 * Supports both computed metrics (with field) and static metrics (with value)
 */
interface MetricDefinition {
    /** Field name for computed metrics (optional if value is provided) */
    field?: string;
    /** Display label */
    label: string;
    /** Static value for display (alternative to field-based computation) */
    value?: string | number;
    /** Icon name for display */
    icon?: string;
    /** Value format (e.g., 'currency', 'percent', 'number') */
    format?: "currency" | "percent" | "number" | string;
}
interface StatCardProps {
    /** Main label */
    label?: string;
    /** Title (alias for label) */
    title?: string;
    /** Primary value - accepts array/unknown from generated code (will use first element or length) */
    value?: string | number | (string | number | undefined)[] | unknown;
    /** Previous value for comparison */
    previousValue?: number;
    /** Current value as number for trend calculation */
    currentValue?: number;
    /** Manual trend percentage (overrides calculation) */
    trend?: number;
    /** Trend direction (overrides calculation) */
    trendDirection?: "up" | "down" | "neutral";
    /** Whether up is good (green) or bad (red) */
    invertTrend?: boolean;
    /** Icon to display */
    icon?: LucideIcon;
    /** Icon background color */
    iconBg?: string;
    /** Icon color */
    iconColor?: string;
    /** Subtitle or description */
    subtitle?: string;
    /** Action button */
    action?: {
        label: string;
        /** Event to dispatch via event bus (for trait state machine integration) */
        event?: string;
        /** Navigation URL - supports template interpolation */
        navigatesTo?: string;
        /** Legacy onClick callback */
        onClick?: () => void;
    };
    className?: string;
    /** Entity name for schema-driven stats */
    entity?: string;
    /** Metrics to display (schema format) - accepts readonly for compatibility with generated const arrays */
    metrics?: readonly MetricDefinition[];
    /** Data to calculate stats from - accepts readonly for compatibility with generated const arrays */
    data?: readonly Record<string, unknown>[];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
}
declare const StatCard: React__default.FC<StatCardProps>;

interface PageBreadcrumb {
    label: string;
    href?: string;
}
/**
 * Schema-based action definition
 */
interface SchemaAction {
    label: string;
    /** Navigate to URL when clicked */
    navigatesTo?: string;
    /** Custom click handler */
    onClick?: () => void;
    /** Event to dispatch via event bus (for trait state machine integration) */
    event?: string;
    variant?: "primary" | "secondary" | "ghost" | "danger";
    icon?: LucideIcon;
    loading?: boolean;
    disabled?: boolean;
}
interface PageHeaderProps {
    /** Page title - accepts unknown to handle generated code accessing dynamic entity data */
    title?: string | number | unknown;
    /** Optional subtitle/description */
    subtitle?: string | number | unknown;
    /** Show back button */
    showBack?: boolean;
    /** Event to emit when back is clicked (default: BACK) */
    backEvent?: string;
    /** Breadcrumbs */
    breadcrumbs?: readonly PageBreadcrumb[];
    /** Status badge */
    status?: {
        label: string;
        variant?: "default" | "success" | "warning" | "danger" | "info";
    };
    /** Actions array - first action with variant='primary' (or first action) is the main action */
    actions?: readonly Readonly<SchemaAction>[];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Tabs for sub-navigation */
    tabs?: ReadonlyArray<{
        label: string;
        value: string;
        count?: number;
    }>;
    activeTab?: string;
    onTabChange?: (value: string) => void;
    /** Custom content in the header */
    children?: React__default.ReactNode;
    className?: string;
}
declare const PageHeader: React__default.FC<PageHeaderProps>;

/**
 * DetailPanel Organism Component
 *
 * Composes atoms and molecules to create a professional detail view.
 *
 * Data is provided by the trait via the `data` prop (render-ui effect).
 * See EntityDisplayProps in ./types.ts for base prop contract.
 */

interface DetailField {
    label: string;
    value: React__default.ReactNode;
    icon?: LucideIcon;
    copyable?: boolean;
}
interface DetailSection {
    title: string;
    fields: (DetailField | string)[];
}
/**
 * Action definition for DetailPanel
 */
interface DetailPanelAction {
    label: string;
    icon?: LucideIcon;
    onClick?: () => void;
    /** Event to emit via event bus */
    event?: string;
    /** Navigation URL */
    navigatesTo?: string;
    /** Button variant (primary for main action, others for secondary) */
    variant?: "primary" | "secondary" | "ghost" | "danger";
}
/**
 * Field definition for unified interface - can be a simple string or object
 */
type FieldDef$2 = string | {
    key: string;
    header?: string;
};
interface DetailPanelProps extends Omit<EntityDisplayProps<Record<string, unknown>>, 'data'> {
    title?: string;
    subtitle?: string;
    status?: {
        label: string;
        variant?: "default" | "success" | "warning" | "danger" | "info";
    };
    avatar?: React__default.ReactNode;
    sections?: readonly DetailSection[];
    /** Unified actions array - first action with variant='primary' is the main action */
    actions?: readonly DetailPanelAction[];
    footer?: React__default.ReactNode;
    slideOver?: boolean;
    /** Fields to display - accepts string[], {key, header}[], or DetailField[] */
    fields?: readonly (FieldDef$2 | DetailField)[];
    /** Alias for fields - backwards compatibility */
    fieldNames?: readonly string[];
    /** Data object provided by the trait via render-ui */
    data?: Record<string, unknown> | unknown;
    /** Initial data for edit mode (passed by compiler) */
    initialData?: Record<string, unknown> | unknown;
    /** Display mode (passed by compiler) */
    mode?: string;
    /** Panel position (for drawer/sidebar placement) */
    position?: "left" | "right";
    /** Panel width (CSS value, e.g., '400px', '50%') */
    width?: string;
}
declare const DetailPanel: React__default.FC<DetailPanelProps>;

interface FormSectionProps {
    /** Section title */
    title?: string;
    /** Section description */
    description?: string;
    /** Form fields */
    children: React__default.ReactNode;
    /** Collapsible */
    collapsible?: boolean;
    /** Default collapsed state */
    defaultCollapsed?: boolean;
    /** Use card wrapper */
    card?: boolean;
    /** Grid columns for fields */
    columns?: 1 | 2 | 3;
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
declare const FormSection$1: React__default.FC<FormSectionProps>;
/**
 * Form layout with multiple sections
 */
interface FormLayoutProps {
    children: React__default.ReactNode;
    /** Show section dividers */
    dividers?: boolean;
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
declare const FormLayout: React__default.FC<FormLayoutProps>;
/**
 * Form actions bar (submit/cancel buttons)
 */
interface FormActionsProps {
    children: React__default.ReactNode;
    /** Sticky at bottom */
    sticky?: boolean;
    /** Alignment */
    align?: "left" | "right" | "between" | "center";
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name */
    entity?: string;
}
declare const FormActions: React__default.FC<FormActionsProps>;

/**
 * Form Organism Component
 *
 * A form container component with submit/reset handling.
 * Supports both children-based and schema-based form generation.
 * Renders correct input types based on field definitions including relations.
 *
 * Extended for inspection forms with:
 * - Conditional field visibility via S-expressions
 * - Hidden calculations that emit GLOBAL_VARIABLE_SET events
 * - Violation triggers that emit VIOLATION_DETECTED events
 * - Nested sections with collapsible support
 */

/**
 * S-Expression type for conditional logic (re-export from @almadar/evaluator)
 */
type SExpression = SExpr;
/**
 * Form-specific evaluation context
 */
interface FormEvaluationContext {
    formValues: Record<string, unknown>;
    globalVariables: Record<string, unknown>;
    localVariables?: Record<string, unknown>;
    entity?: Record<string, unknown>;
}
/**
 * Hidden calculation definition
 */
interface HiddenCalculation {
    variableName: string;
    expression: SExpression;
    triggerFields: string[];
}
/**
 * Violation definition
 */
interface ViolationDefinition {
    law: string;
    article: string;
    actionType: "measure" | "admin" | "penalty";
    message: string;
}
/**
 * Violation trigger definition
 */
interface ViolationTrigger {
    condition: SExpression;
    violation: ViolationDefinition;
    fieldId?: string;
}
/**
 * Form section definition for nested sections
 */
interface FormSection {
    id: string;
    title: string;
    condition?: SExpression;
    fields: SchemaField[];
    collapsible?: boolean;
}
/**
 * Relation configuration for foreign key fields
 */
interface RelationConfig {
    /** Target entity name (e.g., 'User', 'Project') */
    entity: string;
    /** Field on target entity to display (defaults to 'name') */
    displayField?: string;
    /** Cardinality: one-to-one or one-to-many */
    cardinality?: "one" | "many";
}
/**
 * Schema field definition
 * Supports both 'name' and 'field' for compatibility with different schema formats
 */
interface SchemaField {
    /** Field name (primary) */
    name?: string;
    /** Field name (alias for compatibility) */
    field?: string;
    /** Display label */
    label?: string;
    /** Field type (string, number, email, date, boolean, enum, relation, etc.) */
    type?: string;
    /** Input type for rendering (text, select, textarea, checkbox, etc.) */
    inputType?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Whether field is required */
    required?: boolean;
    /** Default value */
    defaultValue?: unknown;
    /** Options for select/enum fields - accepts readonly for generated const arrays */
    options?: readonly SelectOption[];
    /** Enum values (alternative to options, just strings) - accepts readonly for generated const arrays */
    values?: readonly string[];
    /** Relation configuration for foreign key references */
    relation?: RelationConfig;
    /** Minimum value (for number) or length (for string) */
    min?: number;
    /** Maximum value or length */
    max?: number;
    /** Pattern for validation */
    pattern?: string;
    /** Validation rules */
    validation?: Record<string, unknown>;
    /** Whether field is readonly (displays value but cannot edit) */
    readonly?: boolean;
    /** Whether field is disabled (alternative to readonly for compatibility) */
    disabled?: boolean;
}
/**
 * Form is the ONE EXCEPTION to the "no internal state" rule for organisms.
 * It manages local `formData` state for field input tracking.
 * See EntityDisplayProps in ./types.ts for documentation.
 */
interface FormProps extends Omit<React__default.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
    /** Form fields (traditional React children) */
    children?: React__default.ReactNode;
    /** Submit event name for trait dispatch (emitted via eventBus as UI:{onSubmit}) */
    onSubmit?: string;
    /** Cancel event name for trait dispatch (emitted via eventBus as UI:{onCancel}) */
    onCancel?: string;
    /** Form layout */
    layout?: "vertical" | "horizontal" | "inline";
    /** Gap between fields */
    gap?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
    /** Entity type name (schema format) */
    entity?: string;
    /** Form mode - 'create' for new records, 'edit' for updating existing */
    mode?: "create" | "edit";
    /** Fields definition (schema format) - accepts readonly for generated const arrays */
    fields?: readonly Readonly<SchemaField>[];
    /** Initial form data */
    initialData?: Record<string, unknown> | unknown;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Submit button label */
    submitLabel?: string;
    /** Cancel button label (if provided, shows cancel button) */
    cancelLabel?: string;
    /** Show cancel button (defaults to true for schema forms) */
    showCancel?: boolean;
    /** Form title (used by ModalSlot to extract title) */
    title?: string;
    /** Event to dispatch on successful submit (defaults to 'SAVE') */
    submitEvent?: string;
    /** Event to dispatch on cancel (defaults to 'CANCEL') */
    cancelEvent?: string;
    /** Data for relation fields: { fieldName: RelationOption[] } */
    relationsData?: Record<string, readonly RelationOption[]>;
    /** Loading state for relation data: { fieldName: boolean } */
    relationsLoading?: Record<string, boolean>;
    /** Map of fieldId → S-expression condition for conditional field display (boolean true means enabled but config loaded separately) */
    conditionalFields?: Record<string, SExpression> | boolean;
    /** Hidden calculations that emit GLOBAL_VARIABLE_SET on field change (boolean true means enabled but config loaded separately) */
    hiddenCalculations?: HiddenCalculation[] | boolean;
    /** Violation conditions that emit VIOLATION_DETECTED when met (boolean true means enabled but config loaded separately) */
    violationTriggers?: ViolationTrigger[] | boolean;
    /** Context for S-expression evaluation - accepts flexible types from generated code */
    evaluationContext?: FormEvaluationContext | Record<string, unknown>;
    /** Nested form sections with optional conditions */
    sections?: FormSection[];
    /** Callback when any field value changes */
    onFieldChange?: (change: {
        fieldId: string;
        value: unknown;
        formValues: Record<string, unknown>;
    }) => void;
    /** Config path for form configuration (schema-driven) */
    configPath?: string;
    /** Whether the form supports repeatable entries */
    repeatable?: boolean;
}
declare const Form: React__default.FC<FormProps>;

/**
 * Header Organism Component
 *
 * A header component for mobile/responsive layouts with menu toggle, brand, and user avatar.
 * Styled to match the main Layout component's mobile header.
 */

interface HeaderProps {
    /**
     * Logo/Brand content
     */
    logo?: React__default.ReactNode;
    /**
     * Logo image source
     */
    logoSrc?: string;
    /**
     * Brand/App name
     */
    brandName?: string;
    /**
     * Navigation items (for desktop header variant)
     */
    navigationItems?: Array<{
        label: string;
        href?: string;
        onClick?: () => void;
        icon?: LucideIcon;
        badge?: string | number;
        active?: boolean;
    }>;
    /**
     * Show menu toggle button
     * @default true
     */
    showMenuToggle?: boolean;
    /**
     * Is menu open (for toggle icon)
     */
    isMenuOpen?: boolean;
    /**
     * Menu toggle callback
     */
    onMenuToggle?: () => void;
    /**
     * Show search input
     * @default false
     */
    showSearch?: boolean;
    /**
     * Search placeholder
     */
    searchPlaceholder?: string;
    /**
     * Search callback
     */
    onSearch?: (value: string) => void;
    /**
     * User avatar configuration
     */
    userAvatar?: {
        src?: string;
        alt?: string;
        initials?: string;
    };
    /**
     * User name (display name or email)
     */
    userName?: string;
    /**
     * Callback when user avatar is clicked
     */
    onUserClick?: () => void;
    /**
     * Action buttons (right side)
     */
    actions?: React__default.ReactNode;
    /**
     * Sticky header
     * @default true
     */
    sticky?: boolean;
    /**
     * Variant - mobile shows menu toggle, desktop shows full nav
     * @default 'mobile'
     */
    variant?: "mobile" | "desktop";
    /**
     * Callback when logo/brand is clicked
     */
    onLogoClick?: () => void;
    /**
     * Additional CSS classes
     */
    className?: string;
    /**
     * Loading state indicator (closed circuit)
     */
    isLoading?: boolean;
    /**
     * Error state (closed circuit)
     */
    error?: Error | null;
    /**
     * Entity name for schema-driven auto-fetch (closed circuit)
     */
    entity?: string;
}
declare const Header: React__default.FC<HeaderProps>;

/**
 * Navigation Organism Component
 *
 * A navigation component with items, active indicators, icons, and badges.
 * Uses Menu, ButtonGroup molecules and Button, Icon, Badge, Typography, Divider atoms.
 */

interface NavigationItem {
    /**
     * Item ID
     */
    id: string;
    /**
     * Item label
     */
    label: string;
    /**
     * Item icon
     */
    icon?: LucideIcon;
    /**
     * Item badge
     */
    badge?: string | number;
    /**
     * Item href
     */
    href?: string;
    /**
     * Item click handler
     */
    onClick?: () => void;
    /**
     * Is active
     */
    isActive?: boolean;
    /**
     * Disable item
     */
    disabled?: boolean;
    /**
     * Sub-menu items
     */
    subMenu?: NavigationItem[];
}
interface NavigationProps {
    /**
     * Navigation items
     */
    items: NavigationItem[];
    /**
     * Navigation orientation
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical';
    /**
     * Additional CSS classes
     */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
declare const Navigation: React__default.FC<NavigationProps>;

/**
 * Section Component
 *
 * A semantic section wrapper with optional title, description, and action.
 * Perfect for grouping related content with consistent spacing.
 */

type SectionPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
type SectionVariant = 'default' | 'card' | 'bordered' | 'filled';
interface SectionProps {
    /** Section title */
    title?: string;
    /** Section subtitle/description */
    description?: string;
    /** Action element (e.g., button, link) */
    action?: React__default.ReactNode;
    /** Padding amount */
    padding?: SectionPadding;
    /** Visual variant */
    variant?: SectionVariant;
    /** Show divider below header */
    divider?: boolean;
    /** Custom class name */
    className?: string;
    /** Children elements */
    children: React__default.ReactNode;
    /** Header custom class name */
    headerClassName?: string;
    /** Content custom class name */
    contentClassName?: string;
    /** HTML element to render as */
    as?: React__default.ElementType;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * Section - Semantic content grouping with header
 */
declare const Section: React__default.FC<SectionProps>;

/**
 * Sidebar Organism Component
 *
 * A sidebar component with logo, navigation items, user section, and collapse/expand.
 * Styled to match the main Layout component with theme-aware CSS variables.
 */

interface SidebarItem {
    /** Item ID */
    id: string;
    /** Item label */
    label: string;
    /** Item icon */
    icon?: LucideIcon;
    /** Item badge */
    badge?: string | number;
    /** Item href */
    href?: string;
    /** Item click handler */
    onClick?: () => void;
    /** Is active */
    active?: boolean;
    /** @deprecated Use `active` instead */
    isActive?: boolean;
    /** Sub-items (for nested navigation) */
    subItems?: SidebarItem[];
}
interface SidebarProps {
    /** Logo/Brand content - can be a ReactNode or logo config */
    logo?: React__default.ReactNode;
    /** Logo image source */
    logoSrc?: string;
    /** Brand/App name */
    brandName?: string;
    /** Navigation items */
    items: SidebarItem[];
    /** User section content */
    userSection?: React__default.ReactNode;
    /** Footer content (e.g., theme toggle) */
    footerContent?: React__default.ReactNode;
    /** Collapsed state (controlled) */
    collapsed?: boolean;
    /** Default collapsed state */
    defaultCollapsed?: boolean;
    /** Callback when collapse state changes */
    onCollapseChange?: (collapsed: boolean) => void;
    /** Hide the collapse/expand button */
    hideCollapseButton?: boolean;
    /** Show a close button (for mobile) */
    showCloseButton?: boolean;
    /** Callback when close button is clicked */
    onClose?: () => void;
    /** Callback when logo/brand is clicked */
    onLogoClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
declare const Sidebar: React__default.FC<SidebarProps>;

/**
 * Split Component
 *
 * A two-column layout with configurable ratios.
 * Perfect for sidebar/content layouts or side-by-side comparisons.
 */

type SplitRatio = '1:1' | '1:2' | '2:1' | '1:3' | '3:1' | '1:4' | '4:1' | '2:3' | '3:2';
type SplitGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';
interface SplitProps {
    /** Size ratio between left and right panels */
    ratio?: SplitRatio;
    /** Gap between panels */
    gap?: SplitGap;
    /** Reverse the order (right first) */
    reverse?: boolean;
    /** Stack vertically on mobile */
    stackOnMobile?: boolean;
    /** Breakpoint to switch from stacked to side-by-side */
    stackBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
    /** Align items vertically */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Custom class name */
    className?: string;
    /** Left/first panel class name */
    leftClassName?: string;
    /** Right/second panel class name */
    rightClassName?: string;
    /** Exactly two children: [left, right] */
    children: [React__default.ReactNode, React__default.ReactNode];
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * Split - Two-column layout with flexible ratios
 */
declare const Split: React__default.FC<SplitProps>;

type SortDirection = "asc" | "desc";
interface TableColumn<T = any> {
    /**
     * Column key
     */
    key: string;
    /**
     * Column header label
     */
    label: string;
    /**
     * Sortable column
     * @default false
     */
    sortable?: boolean;
    /**
     * Custom cell renderer
     */
    render?: (value: any, row: T, index: number) => React__default.ReactNode;
    /**
     * Column width
     */
    width?: string;
}
interface TableProps<T = Record<string, unknown>> extends EntityDisplayProps<T> {
    /**
     * Table columns
     */
    columns: TableColumn<T>[];
    /**
     * Enable row selection
     * @default false
     */
    selectable?: boolean;
    /**
     * Enable sorting
     * @default false
     */
    sortable?: boolean;
    /**
     * Current sort column (display hint, mapped from sortBy)
     */
    sortColumn?: string;
    /**
     * Current sort direction (display hint)
     */
    sortDirection?: SortDirection;
    /**
     * Enable search/filter
     * @default false
     */
    searchable?: boolean;
    /**
     * Search placeholder
     */
    searchPlaceholder?: string;
    /**
     * Enable pagination
     * @default false
     */
    paginated?: boolean;
    /**
     * Current page (display hint)
     */
    currentPage?: number;
    /**
     * Total pages (display hint)
     */
    totalPages?: number;
    /**
     * Row actions menu items
     */
    rowActions?: (row: T) => MenuItem[];
    /**
     * Empty state message
     */
    emptyMessage?: string;
    /**
     * Loading state
     * @default false
     */
    loading?: boolean;
}
declare const Table: {
    <T extends Record<string, any>>({ columns, entity, data, className, isLoading, error, sortBy, sortDirection: entitySortDirection, searchValue, page, pageSize, totalCount, selectedIds, selectable, sortable, sortColumn: sortColumnProp, sortDirection: sortDirectionProp, searchable, searchPlaceholder, paginated, currentPage: currentPageProp, totalPages: totalPagesProp, rowActions, emptyMessage, loading, }: TableProps<T>): react_jsx_runtime.JSX.Element;
    displayName: string;
};

/**
 * List Organism Component
 *
 * A beautifully designed, scannable list view.
 *
 * Design inspiration: Linear, Notion, Apple Reminders
 * - Soft, harmonious color palette
 * - Refined typography with proper hierarchy
 * - Subtle shadows and depth
 * - Delightful hover micro-interactions
 * - Elegant status indicators
 *
 * Closed Circuit Compliance (Dumb Organism):
 * - Receives ALL data via props (no internal fetch)
 * - Emits events via useEventBus (UI:SELECT, UI:DESELECT, UI:VIEW)
 * - Never listens to events — only emits
 * - No internal search/filter state — trait provides filtered data
 */

interface ListItem {
    id: string;
    title?: string;
    description?: string;
    icon?: LucideIcon;
    avatar?: {
        src?: string;
        alt?: string;
        initials?: string;
    };
    badge?: string | number;
    metadata?: React__default.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    completed?: boolean;
    [key: string]: unknown;
    _fields?: Record<string, unknown>;
}
interface SchemaItemAction {
    label: string;
    /** Event to dispatch on click */
    event?: string;
    navigatesTo?: string;
    /** Action placement - accepts all common placement values */
    placement?: "row" | "bulk" | "card" | "footer" | string;
    action?: string;
    variant?: "primary" | "secondary" | "ghost" | "danger" | "default";
    /** Click handler from generated code */
    onClick?: (row: unknown) => void;
}
/**
 * Field definition - can be a simple string or object with key/header
 */
type FieldDef$1 = string | {
    key: string;
    header?: string;
};
interface ListProps extends EntityDisplayProps {
    /** Entity type name for display */
    entityType?: string;
    selectable?: boolean;
    /** Item actions - schema-driven or function-based */
    itemActions?: ((item: ListItem) => MenuItem[]) | readonly SchemaItemAction[];
    showDividers?: boolean;
    variant?: "default" | "card";
    emptyMessage?: string;
    renderItem?: (item: ListItem, index: number) => React__default.ReactNode;
    children?: React__default.ReactNode;
    /** Fields to display - accepts string[] or {key, header}[] for unified interface */
    fields?: readonly FieldDef$1[];
    /** Alias for fields - backwards compatibility */
    fieldNames?: readonly string[];
}
declare const List: React__default.FC<ListProps>;

/**
 * CardGrid Component
 *
 * A dumb, responsive grid specifically designed for card layouts.
 * Uses CSS Grid auto-fit for automatic responsive columns.
 *
 * Data comes exclusively from the `data` prop (provided by the trait via render-ui).
 * All user interactions emit events via useEventBus — never manages internal state
 * for pagination, filtering, or search. All state is owned by the trait state machine.
 */

type CardGridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';
/**
 * Action configuration for card items (schema-driven)
 */
interface CardItemAction {
    /** Action button label */
    label: string;
    /** Event to dispatch on click (schema metadata) */
    event?: string;
    /** Navigation URL - supports template interpolation like "/products/{{row.id}}" */
    navigatesTo?: string;
    /** Callback on click */
    onClick?: (item: unknown) => void;
    /** Action used by generated code - alternative to event */
    action?: string;
    /** Action placement - accepts string for compatibility with generated code */
    placement?: 'card' | 'footer' | 'row' | string;
    /** Button variant - accepts string for compatibility with generated code */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | string;
}
/**
 * Field definition - can be a simple string or object with key/header
 */
type FieldDef = string | {
    key: string;
    header?: string;
};
interface CardGridProps extends EntityDisplayProps {
    /** Minimum width of each card (default: 280px) */
    minCardWidth?: number;
    /** Maximum number of columns */
    maxCols?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Gap between cards */
    gap?: CardGridGap;
    /** Align cards vertically in their cells */
    alignItems?: 'start' | 'center' | 'end' | 'stretch';
    /** Children elements (cards) - optional when using entity/data props */
    children?: React__default.ReactNode;
    /** Fields to display - accepts string[] or {key, header}[] for unified interface */
    fields?: readonly FieldDef[];
    /** Alias for fields - backwards compatibility */
    fieldNames?: readonly string[];
    /** Alias for fields - backwards compatibility */
    columns?: readonly FieldDef[];
    /** Actions for each card item (schema-driven) */
    itemActions?: readonly CardItemAction[];
    /** Show total count in pagination */
    showTotal?: boolean;
}
/**
 * CardGrid - Responsive card collection layout
 *
 * Can be used in two ways:
 * 1. With children: <CardGrid><Card>...</Card></CardGrid>
 * 2. With data: <CardGrid entity="Task" fieldNames={['title']} data={tasks} />
 *
 * All data comes from the `data` prop. Pagination display hints come from
 * `page`, `pageSize`, and `totalCount` props (set by the trait via render-ui).
 */
declare const CardGrid: React__default.FC<CardGridProps>;

/**
 * MasterDetail Component
 *
 * A layout pattern that shows a list/table of entities.
 * This is a thin wrapper around DataTable that accepts master-detail specific props.
 *
 * When `entity` prop is provided without `data`, automatically fetches data
 * using the useEntityList hook.
 *
 * The "detail" part is typically rendered separately via another render_ui effect
 * to a sidebar or detail panel when an item is selected.
 */

interface MasterDetailProps<T extends {
    id: string | number;
} = {
    id: string | number;
}> {
    /** Entity type name - when provided without data, auto-fetches from API */
    entity?: string;
    /** Fields to show in the master list (maps to DataTable columns) */
    masterFields?: readonly string[];
    /** Fields for detail view (passed through but typically handled by separate render_ui) */
    detailFields?: readonly string[];
    /** Data array - if not provided and entity is set, data is auto-fetched */
    data?: readonly T[] | T[];
    /** Loading state */
    loading?: boolean;
    /** Loading state alias */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional class name */
    className?: string;
}
declare function MasterDetail<T extends {
    id: string | number;
}>({ entity, masterFields, detailFields: _detailFields, // Captured but not used here - detail handled separately
data: externalData, loading: externalLoading, isLoading: externalIsLoading, error: externalError, className, ...rest }: MasterDetailProps<T>): React__default.ReactElement;
declare namespace MasterDetail {
    var displayName: string;
}

/**
 * ConfirmDialog Component
 *
 * Confirmation dialog for destructive or important actions.
 * Composes Modal molecule with Button atoms.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */

type ConfirmDialogVariant = "danger" | "warning" | "info" | "default";
interface ConfirmDialogProps {
    /** Whether the dialog is open (defaults to true when rendered by slot wrapper) */
    isOpen?: boolean;
    /** Callback when dialog is closed (injected by slot wrapper) */
    onClose?: () => void;
    /** Callback when action is confirmed (injected by slot wrapper) */
    onConfirm?: () => void;
    /** Dialog title */
    title: string;
    /** Dialog message/description */
    message?: string | React__default.ReactNode;
    /** Alias for message (schema compatibility) */
    description?: string | React__default.ReactNode;
    /** Confirm button text */
    confirmText?: string;
    /** Alias for confirmText (schema compatibility) */
    confirmLabel?: string;
    /** Cancel button text */
    cancelText?: string;
    /** Alias for cancelText (schema compatibility) */
    cancelLabel?: string;
    /** Dialog variant */
    variant?: ConfirmDialogVariant;
    /** Dialog size */
    size?: ModalSize;
    /** Loading state for confirm button */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Additional CSS classes */
    className?: string;
}
/**
 * ConfirmDialog - Confirmation dialog for important actions
 */
declare const ConfirmDialog: React__default.FC<ConfirmDialogProps>;

/**
 * WizardContainer Component
 *
 * Multi-step wizard pattern with progress indicator.
 * Composes Box, Typography, and Button atoms.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */

/** Form field definition for wizard sections */
interface WizardField {
    id: string;
    type: string;
    label?: string;
    required?: boolean;
    repeatable?: boolean;
    options?: Array<{
        value: string;
        label: string;
        isDefault?: boolean;
    }>;
    defaultValue?: unknown;
    condition?: unknown[];
    placeholder?: string;
    entityField?: string;
    minLength?: number;
    maxLength?: number;
    dataSource?: Record<string, unknown>;
    displayFields?: string[];
    searchConfig?: Record<string, unknown>;
    hiddenCalculations?: Array<{
        variable: string;
        expression: unknown;
        scope?: string;
    }>;
    signatureConfig?: Record<string, unknown>;
    displayTemplate?: Record<string, unknown>;
    lawReference?: Record<string, unknown>;
    contextMenu?: string[];
    calculated?: Record<string, unknown>;
    readOnly?: boolean;
    minDate?: unknown;
    stats?: Array<{
        label: string;
        value: unknown;
        icon?: string;
    }>;
    items?: Array<{
        id: string;
        label: string;
        autoCheck?: unknown;
    }>;
    [key: string]: unknown;
}
/** Section within a wizard step */
interface WizardSection {
    id: string;
    title?: string;
    description?: string;
    fields?: WizardField[];
    subsections?: WizardSection[];
    condition?: unknown[];
    repeatable?: boolean;
    minItems?: number;
    addButtonLabel?: string;
    hiddenCalculations?: Array<{
        variable: string;
        expression: unknown;
        scope?: string;
    }>;
    dataSource?: Record<string, unknown>;
    readOnly?: boolean;
    [key: string]: unknown;
}
/** Entity mapping configuration */
interface WizardEntityMapping {
    entity: string;
    mode: "search_or_create" | "create_multiple" | "select_one" | "update" | string;
    parentField?: string;
    idField?: string;
    [key: string]: unknown;
}
/** Validation rule for wizard steps */
interface WizardValidationRule {
    condition: unknown[];
    message: string;
}
/** Law reference for compliance */
interface WizardLawReference {
    law: string;
    article: string;
    description?: string;
}
interface WizardStep {
    /** Step identifier */
    id?: string;
    /** Tab identifier (schema-driven) */
    tabId?: string;
    /** Step title */
    title?: string;
    /** Step name (schema-driven, used as title if title not provided) */
    name?: string;
    /** Step description (optional) */
    description?: string;
    /** Step content (React component mode) */
    content?: React__default.ReactNode;
    /** Whether this step can be skipped */
    optional?: boolean;
    /** Custom validation for this step */
    isValid?: () => boolean;
    /** Form sections within this step */
    sections?: WizardSection[];
    /** Global variables required before entering this step */
    globalVariablesRequired?: string[];
    /** Global variables set by this step */
    globalVariablesSet?: string[];
    /** Local variables scoped to this step */
    localVariables?: string[];
    /** Entity mapping configuration */
    entityMapping?: WizardEntityMapping;
    /** Validation rules for this step */
    validationRules?: WizardValidationRule[];
    /** Law references for compliance */
    lawReferences?: WizardLawReference[];
    /** Phase of the inspection process */
    phase?: string;
    /** Context menu actions */
    contextMenu?: string[];
    /** Allow additional properties from schema */
    [key: string]: unknown;
}
interface WizardContainerProps {
    /** Wizard steps */
    steps: WizardStep[];
    /** Current step index (controlled) - accepts unknown for generated code compatibility */
    currentStep?: number | string | unknown;
    /** Callback when step changes */
    onStepChange?: (stepIndex: number) => void;
    /** Callback when wizard is completed */
    onComplete?: () => void;
    /** Show progress indicator */
    showProgress?: boolean;
    /** Allow navigation to previous steps */
    allowBack?: boolean;
    /** Modal mode (compact header, no padding) */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity type name (schema-driven) */
    entity?: string;
}
/**
 * WizardContainer - Multi-step wizard
 */
declare const WizardContainer: React__default.FC<WizardContainerProps>;

/**
 * OrbitalVisualization Component
 *
 * Visualizes KFlow schemas as atomic orbitals based on complexity.
 * Uses CSS 3D transforms for lightweight rendering without Three.js.
 *
 * Orbital Types (based on complexity score):
 * - 1s (1-3): Simple sphere - Red
 * - 2s (4-8): Larger sphere - Orange
 * - 2p (9-15): Dumbbell shape - Yellow
 * - 3s (16-25): Sphere with node - Green
 * - 3p (26-40): Complex dumbbell - Blue
 * - 3d (41-60): Cloverleaf - Indigo
 * - 4f (61+): Multi-lobe - Violet
 */

interface OrbitalVisualizationProps {
    /** Full KFlow schema object */
    schema?: {
        dataEntities?: unknown[];
        ui?: {
            pages?: {
                sections?: unknown[];
            }[];
        };
        traits?: unknown[];
    };
    /** Direct complexity override (1-100+) */
    complexity?: number;
    /** Size of the visualization */
    size?: "sm" | "md" | "lg" | "xl";
    /** Show complexity label */
    showLabel?: boolean;
    /** Animation enabled */
    animated?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
declare const OrbitalVisualization: React__default.FC<OrbitalVisualizationProps>;

/**
 * StateMachineView - Reusable State Machine Visualizer
 *
 * A hybrid DOM/SVG component for visualizing state machines.
 * Uses SVG for arrow paths, DOM for tooltips.
 *
 * Moved from projects/builder to @almadar/ui for reuse across projects.
 *
 * BUNDLING: When multiple transitions exist between the same states (same direction),
 * they are bundled into a single arrow with a badge showing the count.
 * Hovering shows all events and their effects in a detailed tooltip.
 *
 * Events Emitted:
 * - UI:STATE_CLICK - When a state node is clicked
 * - UI:TRANSITION_CLICK - When a transition bundle is clicked
 */

/** Bundled transitions between same from→to states */
interface TransitionBundle {
    id: string;
    from: string;
    to: string;
    labels: DomTransitionLabel[];
    isBidirectional: boolean;
    isReverse: boolean;
}
interface StateMachineViewProps extends EntityDisplayProps {
    layoutData: DomLayoutData;
    /** Custom state node renderer — when provided, replaces the default circle nodes */
    renderStateNode?: (state: DomStateNode, config: VisualizerConfig) => React__default.ReactNode;
}
declare const StateMachineView: React__default.FC<StateMachineViewProps>;

/**
 * JazariStateMachine — Al-Jazari themed state machine diagram.
 *
 * Thin wrapper around StateMachineView that:
 * 1. Extracts a state machine from an orbital schema (or accepts a trait directly)
 * 2. Converts it to DomLayoutData via the visualizer lib
 * 3. Applies Al-Jazari brass/gold/lapis color theme
 * 4. Renders gear-shaped state nodes via the renderStateNode prop
 */

interface SmState {
    name: string;
    isInitial?: boolean;
    isTerminal?: boolean;
    isFinal?: boolean;
}
interface SmTransition {
    from: string;
    to: string;
    event: string;
    guard?: unknown;
    effects?: unknown[];
}
interface SmStateMachine {
    states: SmState[];
    transitions: SmTransition[];
}
interface SmTrait {
    name: string;
    stateMachine?: SmStateMachine;
    linkedEntity?: string;
}
interface SmEntity {
    name: string;
    fields?: Array<{
        name: string;
    }>;
}
interface SmOrbital {
    entity?: SmEntity;
    traits?: SmTrait[];
}
interface SmSchema {
    orbitals?: SmOrbital[];
}
interface JazariStateMachineProps extends EntityDisplayProps {
    /** Full schema — extracts first trait's state machine */
    schema?: SmSchema;
    /** Or pass a single trait directly */
    trait?: SmTrait;
    /** Which trait to visualize (default: 0) */
    traitIndex?: number;
    /** Override entity field labels */
    entityFields?: string[];
    /** Text direction (default: 'ltr') */
    direction?: 'ltr' | 'rtl';
}
declare const JazariStateMachine: React__default.FC<JazariStateMachineProps>;

/**
 * ContentRenderer Organism
 *
 * Renders rich content as a sequence of typed segments: markdown, code,
 * orbital diagrams (via JazariStateMachine), and quiz blocks. Accepts
 * either raw content string (auto-parsed) or pre-parsed segments.
 *
 * Event Contract:
 * - Delegates to child components (CodeBlock -> UI:COPY_CODE)
 * - entityAware: false
 */

interface ContentRendererProps extends EntityDisplayProps {
    /** Raw content string — auto-parsed into segments */
    content?: string;
    /** Pre-parsed segments (overrides content) */
    segments?: ContentSegment[];
    /** Text direction for markdown */
    direction?: 'rtl' | 'ltr';
}
declare const ContentRenderer: React__default.FC<ContentRendererProps>;

/**
 * BookViewer shared types
 *
 * Field names are canonical English. When entity data arrives from a
 * schema with non-English field names (e.g. Arabic .orb), a field map
 * translates them before passing to BookViewer. See `mapBookData()`.
 */
interface BookData {
    title: string;
    subtitle?: string;
    author?: string;
    coverImageUrl?: string;
    direction?: 'rtl' | 'ltr';
    parts: BookPart[];
}
interface BookPart {
    title: string;
    chapters: BookChapter[];
}
interface BookChapter {
    id: string;
    title: string;
    content: string;
    orbitalSchema?: unknown;
}
/**
 * Maps raw entity field names to canonical BookData field names.
 * Each key is a canonical field, each value is the entity field name.
 *
 * @example
 * ```ts
 * // Arabic schema
 * const AR_BOOK_FIELDS: BookFieldMap = {
 *   title: 'العنوان',
 *   subtitle: 'العنوان_الفرعي',
 *   author: 'المؤلف',
 *   coverImageUrl: 'صورة_الغلاف',
 *   direction: 'الاتجاه',
 *   parts: 'الأجزاء',
 *   partTitle: 'العنوان',
 *   chapters: 'الفصول',
 *   chapterId: 'المعرف',
 *   chapterTitle: 'العنوان',
 *   chapterContent: 'المحتوى',
 *   chapterOrbitalSchema: 'المخطط_المداري',
 * };
 * ```
 */
interface BookFieldMap {
    title: string;
    subtitle: string;
    author: string;
    coverImageUrl: string;
    direction: string;
    parts: string;
    partTitle: string;
    chapters: string;
    chapterId: string;
    chapterTitle: string;
    chapterContent: string;
    chapterOrbitalSchema: string;
}
/** Identity map — entity already uses canonical English field names */
declare const IDENTITY_BOOK_FIELDS: BookFieldMap;
/** Arabic field map for الأمة_الرقمية schema */
declare const AR_BOOK_FIELDS: BookFieldMap;
/**
 * Resolves a fieldMap prop to a BookFieldMap object.
 * Accepts a BookFieldMap object directly, a locale string key ("ar"),
 * or undefined (defaults to identity/English).
 */
declare function resolveFieldMap(fieldMap: BookFieldMap | string | undefined): BookFieldMap;
/**
 * Maps a raw entity record to a typed BookData using a field map.
 * Pass `IDENTITY_BOOK_FIELDS` for English schemas, `AR_BOOK_FIELDS` for Arabic, etc.
 */
declare function mapBookData(raw: Record<string, unknown>, fields?: BookFieldMap): BookData;

/**
 * BookViewer Organism
 *
 * Flippable book reader with cover, TOC, chapter views, and navigation.
 * Supports RTL layout (Arabic), CSS slide transitions, and print mode.
 *
 * Page model:
 *   0 = cover, 1 = TOC, 2+ = chapters (flattened from parts)
 *
 * Field mapping:
 *   Entity data may use non-English field names (e.g. Arabic .orb schemas).
 *   Pass a `fieldMap` prop to translate entity fields to canonical BookData.
 *   Default: IDENTITY_BOOK_FIELDS (English field names, no translation).
 *
 * Event Contract:
 * - Emits: UI:BOOK_PAGE_CHANGE { pageIndex, chapterId? }
 * - Listens: UI:BOOK_START, UI:BOOK_NAVIGATE, UI:BOOK_PAGE_PREV/NEXT, UI:BOOK_PRINT, UI:BOOK_SHOW_TOC
 */

interface BookViewerProps extends EntityDisplayProps {
    /** Initial page index (default: 0 = cover) */
    initialPage?: number;
    /** Field name translation map — a BookFieldMap object or locale key ("ar") */
    fieldMap?: BookFieldMap | string;
}
declare const BookViewer: React__default.FC<BookViewerProps>;

/**
 * BookChapterView Organism
 *
 * Renders a single chapter: title + optional orbital diagram +
 * rich content via ContentRenderer.
 *
 * Event Contract:
 * - Delegates to ContentRenderer children
 */

interface BookChapterViewProps extends EntityDisplayProps {
    chapter: BookChapter;
    direction?: 'rtl' | 'ltr';
}
declare const BookChapterView: React__default.FC<BookChapterViewProps>;

/**
 * BookCoverPage Molecule
 *
 * Renders a book cover with title, subtitle, author, and optional image.
 * Centered layout suitable for the first "page" of a BookViewer.
 *
 * Event Contract:
 * - Emits: UI:BOOK_START
 */

interface BookCoverPageProps extends EntityDisplayProps {
    title: string;
    subtitle?: string;
    author?: string;
    coverImageUrl?: string;
    direction?: 'rtl' | 'ltr';
}
declare const BookCoverPage: React__default.FC<BookCoverPageProps>;

/**
 * BookTableOfContents Molecule
 *
 * Renders a clickable table of contents grouped by parts.
 * Highlights the current chapter.
 *
 * Event Contract:
 * - Emits: UI:BOOK_NAVIGATE { chapterId }
 */

interface BookTableOfContentsProps extends EntityDisplayProps {
    parts: BookPart[];
    currentChapterId?: string;
    direction?: 'rtl' | 'ltr';
}
declare const BookTableOfContents: React__default.FC<BookTableOfContentsProps>;

/**
 * BookNavBar Molecule
 *
 * Navigation bar for the BookViewer with prev/next, page indicator,
 * print button, and TOC toggle.
 *
 * Event Contract:
 * - Emits: UI:BOOK_PAGE_PREV, UI:BOOK_PAGE_NEXT, UI:BOOK_PRINT, UI:BOOK_SHOW_TOC
 */

interface BookNavBarProps extends EntityDisplayProps {
    currentPage: number;
    totalPages: number;
    chapterTitle?: string;
    direction?: 'rtl' | 'ltr';
}
declare const BookNavBar: React__default.FC<BookNavBarProps>;

/**
 * SplitPane Component
 *
 * Two-pane resizable split layout for master-detail views,
 * dual-pane editors, and code + preview layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */

interface SplitPaneProps {
    /** Direction of the split */
    direction?: "horizontal" | "vertical";
    /** Initial ratio (0-100, percentage of first pane) */
    ratio?: number;
    /** Minimum size of either pane in pixels */
    minSize?: number;
    /** Allow user resizing */
    resizable?: boolean;
    /** Content for the left/top pane */
    left: React__default.ReactNode;
    /** Content for the right/bottom pane */
    right: React__default.ReactNode;
    /** Additional CSS classes */
    className?: string;
    /** Class for left/top pane */
    leftClassName?: string;
    /** Class for right/bottom pane */
    rightClassName?: string;
}
/**
 * SplitPane - Two-pane resizable layout
 */
declare const SplitPane: React__default.FC<SplitPaneProps>;

/**
 * DashboardGrid Component
 *
 * Multi-column grid for widgets and stats cards.
 * Supports cell spanning for flexible dashboard layouts.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */

interface DashboardGridCell {
    /** Unique cell ID */
    id: string;
    /** Content to render in the cell */
    content: React__default.ReactNode;
    /** Number of columns this cell spans (1-4) */
    colSpan?: 1 | 2 | 3 | 4;
    /** Number of rows this cell spans (1-2) */
    rowSpan?: 1 | 2;
}
interface DashboardGridProps {
    /** Number of columns */
    columns?: 2 | 3 | 4;
    /** Gap between cells */
    gap?: "sm" | "md" | "lg";
    /** Cell definitions */
    cells: DashboardGridCell[];
    /** Additional CSS classes */
    className?: string;
}
/**
 * DashboardGrid - Multi-column widget grid
 */
declare const DashboardGrid: React__default.FC<DashboardGridProps>;

/**
 * TabbedContainer Component
 *
 * Tabbed content areas with shared header/context.
 * Wraps the Tabs molecule with layout-specific styling.
 *
 * Uses wireframe theme styling (high contrast, sharp edges).
 */

interface TabDefinition {
    /** Tab identifier */
    id: string;
    /** Tab label */
    label: string;
    /** Tab content (optional if using sectionId) */
    content?: React__default.ReactNode;
    /** Section ID to render (alternative to content) */
    sectionId?: string;
    /** Optional badge/count */
    badge?: string | number;
    /** Disable this tab */
    disabled?: boolean;
}
interface TabbedContainerProps {
    /** Tab definitions */
    tabs: TabDefinition[];
    /** Default active tab ID */
    defaultTab?: string;
    /** Controlled active tab */
    activeTab?: string;
    /** Callback when tab changes */
    onTabChange?: (tabId: string) => void;
    /** Tab position */
    position?: "top" | "left";
    /** Additional CSS classes */
    className?: string;
}
/**
 * TabbedContainer - Tabbed content areas
 */
declare const TabbedContainer: React__default.FC<TabbedContainerProps>;

/**
 * Sprite Sheet Animation Types
 *
 * Type definitions for frame-based sprite sheet animation system.
 * Supports standard 8-column × 5-row character sheets.
 *
 * @packageDocumentation
 */
/** Animation names matching sprite sheet row layout */
type AnimationName = 'idle' | 'walk' | 'attack' | 'hit' | 'death';
/** Sheet file directions (physical PNG files) */
type SpriteDirection = 'se' | 'sw';
/** Unit facing direction on screen (4 isometric directions) */
type FacingDirection = 'se' | 'sw' | 'ne' | 'nw';
/** Definition for a single animation row in the sprite sheet */
interface AnimationDef {
    /** Row index in the sprite sheet (0-4) */
    row: number;
    /** Number of frames in this animation */
    frames: number;
    /** Frames per second */
    frameRate: number;
    /** Whether the animation loops */
    loop: boolean;
}
/** A resolved frame ready to draw on canvas */
interface ResolvedFrame {
    /** URL of the sprite sheet image */
    sheetUrl: string;
    /** Source X in the sheet (pixel offset) */
    sx: number;
    /** Source Y in the sheet (pixel offset) */
    sy: number;
    /** Source width (frame width) */
    sw: number;
    /** Source height (frame height) */
    sh: number;
    /** Whether to flip horizontally when drawing (for NE/NW directions) */
    flipX: boolean;
    /** When true, canvas should apply sine-bob breathing offset (frozen idle frame) */
    applyBreathing?: boolean;
}
/** Per-unit animation state tracked in the animation system */
interface UnitAnimationState {
    /** Unit identifier */
    unitId: string;
    /** Current animation playing */
    animation: AnimationName;
    /** Current facing direction */
    direction: FacingDirection;
    /** Current frame index within the animation */
    frame: number;
    /** Elapsed time in current animation (ms) */
    elapsed: number;
    /** Animation to play after current one-shot completes (null = idle) */
    queuedAnimation: AnimationName | null;
    /** Whether the current one-shot animation has finished its last frame */
    finished: boolean;
}
/** Frame dimensions for a sprite sheet */
interface SpriteFrameDims {
    /** Width of a single frame in pixels */
    width: number;
    /** Height of a single frame in pixels */
    height: number;
}
/** Sheet URLs for both directions */
interface SpriteSheetUrls {
    /** Southeast-facing sheet URL */
    se: string;
    /** Southwest-facing sheet URL */
    sw: string;
}

/**
 * IsometricCanvas
 *
 * Core isometric game renderer. Maps to the `game-canvas` pattern.
 * Adapted from projects/trait-wars/design-system/organisms/IsometricGameCanvas.tsx
 * with full closed-circuit pattern compliance (className, isLoading, error, entity).
 *
 * Architecture:
 * - 2:1 diamond isometric projection
 * - Painter's algorithm (tile → feature → unit depth sort)
 * - Camera pan/zoom with lerp
 * - Off-screen culling
 * - Minimap on separate canvas
 * - Sprite sheet animation via resolveUnitFrame
 * - Event bus–friendly handlers (onTileClick, onUnitClick, etc.)
 *
 * **State categories (closed-circuit compliant):**
 * - All game data (tiles, units, features, selection, validMoves) → received via props
 * - Rendering state (viewportSize, RAF, camera lerp, sprite cache) → local only
 * - Events → emitted via `useEventBus()` for trait integration
 *
 * This component is a **pure renderer** — it holds no game logic state.
 *
 * @packageDocumentation
 */

interface IsometricCanvasProps {
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Array of tiles to render */
    tiles?: IsometricTile[];
    /** Array of units on the board */
    units?: IsometricUnit[];
    /** Array of features (resources, portals, buildings, etc.) */
    features?: IsometricFeature[];
    /** Currently selected unit ID */
    selectedUnitId?: string | null;
    /** Valid move positions (shown as pulsing green highlights) */
    validMoves?: Array<{
        x: number;
        y: number;
    }>;
    /** Attack target positions (shown as pulsing red highlights) */
    attackTargets?: Array<{
        x: number;
        y: number;
    }>;
    /** Hovered tile position */
    hoveredTile?: {
        x: number;
        y: number;
    } | null;
    /** Tile click handler */
    onTileClick?: (x: number, y: number) => void;
    /** Unit click handler */
    onUnitClick?: (unitId: string) => void;
    /** Tile hover handler */
    onTileHover?: (x: number, y: number) => void;
    /** Tile leave handler */
    onTileLeave?: () => void;
    /** Declarative event: emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: string;
    /** Declarative event: emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: string;
    /** Declarative event: emits UI:{tileHoverEvent} with { x, y } on tile hover */
    tileHoverEvent?: string;
    /** Declarative event: emits UI:{tileLeaveEvent} with {} on tile leave */
    tileLeaveEvent?: string;
    /** Render scale (0.4 = 40% zoom) */
    scale?: number;
    /** Show debug grid lines and coordinates */
    debug?: boolean;
    /** Background image URL tiled behind the isometric grid */
    backgroundImage?: string;
    /** Toggle minimap overlay */
    showMinimap?: boolean;
    /** Enable camera pan/zoom controls */
    enableCamera?: boolean;
    /** Extra scale multiplier for unit draw size. 1 = default. */
    unitScale?: number;
    /** Override for the diamond-top Y offset within the tile sprite (default: 374).
     *  This controls where the flat diamond face sits vertically inside the tile image. */
    diamondTopY?: number;
    /** Resolve terrain sprite URL from terrain key */
    getTerrainSprite?: (terrain: string) => string | undefined;
    /** Resolve feature sprite URL from feature type key */
    getFeatureSprite?: (featureType: string) => string | undefined;
    /** Resolve unit static sprite URL */
    getUnitSprite?: (unit: IsometricUnit) => string | undefined;
    /** Resolve animated sprite sheet frame for a unit */
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    /** Additional sprite URLs to preload (e.g., effect sprites) */
    effectSpriteUrls?: string[];
    /** Callback to draw canvas effects after units */
    onDrawEffects?: (ctx: CanvasRenderingContext2D, animTime: number, getImage: (url: string) => HTMLImageElement | undefined) => void;
    /** Whether there are active effects — keeps RAF loop alive */
    hasActiveEffects?: boolean;
    /** Base URL for remote asset resolution. When set, manifest paths
     *  are prefixed with this URL. Example: "https://trait-wars-assets.web.app" */
    assetBaseUrl?: string;
    /** Manifest mapping entity keys to relative sprite paths.
     *  Combined with assetBaseUrl to produce full URLs.
     *  Used as a fallback when inline URLs and callbacks don't resolve. */
    assetManifest?: {
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
        effects?: Record<string, string>;
    };
}
declare function IsometricCanvas({ className, isLoading, error, entity, tiles: tilesProp, units, features, selectedUnitId, validMoves, attackTargets, hoveredTile, onTileClick, onUnitClick, onTileHover, onTileLeave, tileClickEvent, unitClickEvent, tileHoverEvent, tileLeaveEvent, scale, debug, backgroundImage, showMinimap, enableCamera, unitScale, getTerrainSprite, getFeatureSprite, getUnitSprite, resolveUnitFrame, effectSpriteUrls, onDrawEffects, hasActiveEffects, diamondTopY: diamondTopYProp, assetBaseUrl, assetManifest, }: IsometricCanvasProps): React$1.JSX.Element;
declare namespace IsometricCanvas {
    var displayName: string;
}

/**
 * Combat action types that map to effect compositions.
 * Superset of trait-wars types + almadar-ui originals.
 */
type CombatActionType = 'melee' | 'ranged' | 'magic' | 'heal' | 'defend' | 'hit' | 'death' | 'buff' | 'debuff' | 'shield' | 'aoe' | 'critical';
/**
 * Effect asset manifest — the sprites and animation frames available for
 * the particle engine. This is the `assetManifest.effects` section.
 */
interface EffectAssetManifest {
    /** Base URL for all asset paths */
    baseUrl: string;
    /** Particle sprite groups (white-on-transparent, tinted at runtime) */
    particles?: {
        slash?: string[];
        magic?: string[];
        fire?: string[];
        flame?: string[];
        smoke?: string[];
        scorch?: string[];
        circle?: string[];
        flare?: string;
        spark?: string[];
        muzzle?: string[];
        star?: string[];
        trace?: string[];
        twirl?: string[];
        light?: string[];
        dirt?: string[];
        scratch?: string[];
        symbol?: string[];
    };
    /** Frame-sequence animations (array of frame image paths) */
    animations?: {
        explosion?: string[];
        smokePuff?: string[];
        flash?: string[];
        blackSmoke?: string[];
        gasSmoke?: string[];
        smokeExplosion?: string[];
    };
}

/**
 * CanvasEffect Component
 *
 * Renders animated visual effects using a `<canvas>` element with
 * sprite-based particles, frame-sequence animations, and overlays.
 * This is a render-ui pattern that can be placed in any slot —
 * it renders on top of whatever occupies that slot.
 *
 * Pattern: canvas-effect
 *
 * When an EffectAssetManifest is provided (via assetManifest prop),
 * the component uses the full particle engine with tinted sprites.
 * Without a manifest, it falls back to emoji-based rendering.
 *
 * **State categories (closed-circuit compliant):**
 * - Configuration (actionType, position, duration, manifest) → received via props
 * - Animation state (particles, shake, flash, RAF loop, phase timers) → local only
 * - Completion event → emitted via `useEventBus()` for trait integration
 *
 * This is an **ephemeral fire-and-forget** animation component.  All
 * internal state is rendering-only (particle physics, screen shake decay,
 * flash alpha, emoji phase timers).  No game logic lives here.
 *
 * @packageDocumentation
 */

interface CanvasEffectProps {
    /** The type of combat action to visualise */
    actionType: CombatActionType;
    /** Screen-space X position (center of the effect) */
    x: number;
    /** Screen-space Y position (center of the effect) */
    y: number;
    /** Duration in ms before auto-dismiss (default 2000 for canvas, 800 for emoji) */
    duration?: number;
    /** Optional intensity multiplier (1 = normal, 2 = double size/brightness) */
    intensity?: number;
    /** Callback when the effect animation completes */
    onComplete?: () => void;
    /** Declarative event: emits UI:{completeEvent} when the effect animation completes */
    completeEvent?: string;
    /** Additional CSS classes */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Sprite URL for the effect (emoji fallback mode).
     *  When set without assetManifest, renders this image instead of emoji. */
    effectSpriteUrl?: string;
    /** Base URL for remote assets. Prepended to relative effectSpriteUrl paths. */
    assetBaseUrl?: string;
    /** Full effect asset manifest for the sprite particle engine.
     *  When provided, enables the canvas-based particle system. */
    assetManifest?: EffectAssetManifest;
    /** Canvas width (default 400) */
    width?: number;
    /** Canvas height (default 300) */
    height?: number;
}
declare function CanvasEffect(props: CanvasEffectProps): React$1.JSX.Element | null;
declare namespace CanvasEffect {
    var displayName: string;
}

interface SoundEntry {
    /** Single path or array of paths — array picks randomly on each play */
    path: string | string[];
    /** Volume 0–1 (multiplied by masterVolume; default 1) */
    volume?: number;
    /** Whether this sound loops (background music) */
    loop?: boolean;
    /** Number of concurrent Audio instances in the pool (default 1) */
    poolSize?: number;
    /** Start automatically on first user interaction */
    autostart?: boolean;
    /** Use crossfade transitions when played via playMusic() */
    crossfade?: boolean;
    /** Crossfade duration in ms (default 1500) */
    crossfadeDurationMs?: number;
}
type AudioManifest = Record<string, SoundEntry>;
interface GameAudioControls {
    /** Play a sound effect (instant, pooled) */
    play: (key: string) => void;
    /** Stop all instances of a sound effect */
    stop: (key: string) => void;
    /** Stop all sounds including music */
    stopAll: () => void;
    /** Crossfade to a new music track */
    playMusic: (key: string) => void;
    /** Fade out and stop the current music */
    stopMusic: (fadeDurationMs?: number) => void;
    muted: boolean;
    setMuted: (muted: boolean) => void;
    masterVolume: number;
    setMasterVolume: (volume: number) => void;
}
interface UseGameAudioOptions {
    /** Sound definitions keyed by logical name */
    manifest: AudioManifest;
    /** Prefix prepended to all `path` values (default '') */
    baseUrl?: string;
    /** Start muted (default false) */
    initialMuted?: boolean;
    /** Master volume 0–1 (default 1) */
    initialVolume?: number;
}
declare function useGameAudio({ manifest, baseUrl, initialMuted, initialVolume, }: UseGameAudioOptions): GameAudioControls;
declare namespace useGameAudio {
    var displayName: string;
}

/**
 * GameAudioProvider
 *
 * Context provider that wires the audio system to the Almadar event bus.
 * Wrap your game organism with this provider, then emit:
 *
 *   emit('UI:PLAY_SOUND', { key: 'footstep' })
 *
 * from anywhere inside the tree and the corresponding sound will play.
 *
 * The provider also exposes `muted`/`setMuted` and `masterVolume`/
 * `setMasterVolume` via the `GameAudioContext` for toggle buttons.
 *
 * Closed-circuit props (`className`, `isLoading`, `error`, `entity`) are
 * accepted but intentionally unused — the provider renders only its children.
 *
 * @packageDocumentation
 */

type GameAudioContextValue = Pick<GameAudioControls, 'muted' | 'setMuted' | 'masterVolume' | 'setMasterVolume' | 'play' | 'playMusic' | 'stopMusic'>;
declare const GameAudioContext: React__default.Context<GameAudioContextValue | null>;
/**
 * Access the game audio context.
 * Must be called from within a `<GameAudioProvider>` tree.
 */
declare function useGameAudioContext(): GameAudioContextValue;
interface GameAudioProviderProps {
    /** Sound manifest — keys mapped to SoundEntry definitions */
    manifest: AudioManifest;
    /** Base URL prepended to all sound paths (default '') */
    baseUrl?: string;
    /** Children to render */
    children: React__default.ReactNode;
    /** Initial muted state */
    initialMuted?: boolean;
    /** Closed-circuit props (unused, accepted for runtime compatibility) */
    className?: string;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}
declare function GameAudioProvider({ manifest, baseUrl, children, initialMuted, }: GameAudioProviderProps): React__default.JSX.Element;
declare namespace GameAudioProvider {
    var displayName: string;
}

/**
 * GameAudioToggle
 *
 * A small mute/unmute button for game HUDs.
 * Must be rendered inside a <GameAudioProvider> tree.
 *
 * Shows 🔊 when sound is on and 🔇 when muted.
 *
 * @packageDocumentation
 */

interface GameAudioToggleProps {
    /** Button size */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Loading state (passed through) */
    isLoading?: boolean;
    /** Error state (passed through) */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
declare function GameAudioToggle({ size, className, }: GameAudioToggleProps): React__default.JSX.Element;
declare namespace GameAudioToggle {
    var displayName: string;
}

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
declare function useImageCache(urls: string[]): ImageCacheResult;

interface CameraResult {
    /** Mutable camera state ref (x, y, zoom) */
    cameraRef: React.MutableRefObject<CameraState>;
    /** Target camera position for smooth lerp centering. Set to null when reached. */
    targetCameraRef: React.MutableRefObject<{
        x: number;
        y: number;
    } | null>;
    /** Whether the user is currently dragging */
    isDragging: () => boolean;
    /** Total drag distance — used to distinguish click from pan (threshold: 5px) */
    dragDistance: () => number;
    /** Mouse down handler — starts panning */
    handleMouseDown: (e: React.MouseEvent) => void;
    /** Mouse up handler — stops panning */
    handleMouseUp: () => void;
    /** Mouse move handler — pans camera if dragging, returns true if panning */
    handleMouseMove: (e: React.MouseEvent, drawFn?: () => void) => boolean;
    /** Mouse leave handler — cancels drag */
    handleMouseLeave: () => void;
    /** Wheel handler — zoom in/out */
    handleWheel: (e: React.WheelEvent, drawFn?: () => void) => void;
    /** Convert screen coordinates to world coordinates (inverse camera transform) */
    screenToWorld: (clientX: number, clientY: number, canvas: HTMLCanvasElement, viewportSize: {
        width: number;
        height: number;
    }) => {
        x: number;
        y: number;
    };
    /** Lerp camera toward target. Call in animation loop. Returns true if still animating. */
    lerpToTarget: (t?: number) => boolean;
}
/**
 * Camera hook for pan/zoom canvas rendering.
 *
 * @returns Camera state, event handlers, and coordinate conversion
 */
declare function useCamera(): CameraResult;

interface UseSpriteAnimationsResult {
    /**
     * Sync unit list and advance all animation timers.
     * Call once per animation frame. Auto-detects movement
     * and infers direction from position deltas.
     */
    syncUnits: (units: IsometricUnit[], deltaMs: number) => void;
    /**
     * Explicitly set a unit's animation (for combat: attack, hit, death).
     * Optionally override direction.
     */
    setUnitAnimation: (unitId: string, animation: AnimationName, direction?: FacingDirection) => void;
    /**
     * Resolve the current frame for a unit. Returns null if no sprite sheet
     * is available for this unit (falls back to static sprite in canvas).
     * Pass this to IsometricCanvas.resolveUnitFrame.
     */
    resolveUnitFrame: (unitId: string) => ResolvedFrame | null;
}
interface UseSpriteAnimationsOptions {
    /** Playback speed multiplier. 1.0 = baseline, 2.0 = double speed. Default: 1. */
    speed?: number;
}
/**
 * Resolve sprite sheet URLs for a unit. Return null if no sheet available.
 * This is the project-agnostic callback version — projects pass manifest-specific logic.
 */
type SheetUrlResolver = (unit: IsometricUnit) => SpriteSheetUrls | null;
/**
 * Resolve frame dimensions for a unit's sprite sheet.
 * Projects pass manifest-specific logic.
 */
type FrameDimsResolver = (unit: IsometricUnit) => SpriteFrameDims | null;
/**
 * Hook for managing per-unit sprite sheet animations.
 *
 * @param getSheetUrls - Callback to resolve sprite sheet URLs for a unit
 * @param getFrameDims - Callback to resolve frame dimensions for a unit
 * @param options - Playback speed options
 */
declare function useSpriteAnimations(getSheetUrls: SheetUrlResolver, getFrameDims: FrameDimsResolver, options?: UseSpriteAnimationsOptions): UseSpriteAnimationsResult;

/**
 * PhysicsManager
 *
 * Manages 2D physics simulation for entities with Physics2D state.
 * This implements the tick logic that would normally be compiled from .orb schemas.
 *
 * @packageDocumentation
 */
interface Physics2DState {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    isGrounded: boolean;
    gravity: number;
    friction: number;
    airResistance: number;
    maxVelocityY: number;
    mass?: number;
    restitution?: number;
    state: 'Active' | 'Frozen';
}
interface PhysicsBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface PhysicsConfig {
    gravity?: number;
    friction?: number;
    airResistance?: number;
    maxVelocityY?: number;
    groundY?: number;
}
declare class PhysicsManager {
    private entities;
    private config;
    constructor(config?: PhysicsConfig);
    /**
     * Register an entity for physics simulation
     */
    registerEntity(entityId: string, initialState?: Partial<Physics2DState>): Physics2DState;
    /**
     * Unregister an entity from physics simulation
     */
    unregisterEntity(entityId: string): void;
    /**
     * Get physics state for an entity
     */
    getState(entityId: string): Physics2DState | undefined;
    /**
     * Get all registered entities
     */
    getAllEntities(): Physics2DState[];
    /**
     * Apply a force to an entity (impulse)
     */
    applyForce(entityId: string, fx: number, fy: number): void;
    /**
     * Set velocity directly
     */
    setVelocity(entityId: string, vx: number, vy: number): void;
    /**
     * Set position directly
     */
    setPosition(entityId: string, x: number, y: number): void;
    /**
     * Freeze/unfreeze an entity
     */
    setFrozen(entityId: string, frozen: boolean): void;
    /**
     * Main tick function - call this every frame
     * Implements the logic from std-physics2d ticks
     */
    tick(deltaTime?: number): void;
    /**
     * ApplyGravity tick implementation
     */
    private applyGravity;
    /**
     * ApplyVelocity tick implementation
     */
    private applyVelocity;
    /**
     * Check and handle ground collision
     */
    private checkGroundCollision;
    /**
     * Check AABB collision between two entities
     */
    checkCollision(entityIdA: string, entityIdB: string, boundsA: PhysicsBounds, boundsB: PhysicsBounds): boolean;
    /**
     * Resolve collision with bounce
     */
    resolveCollision(entityIdA: string, entityIdB: string): void;
    /**
     * Reset all physics state
     */
    reset(): void;
}

interface UsePhysics2DOptions extends PhysicsConfig {
    /** Enable physics debug visualization */
    debug?: boolean;
    /** Callback when collision occurs */
    onCollision?: (entityIdA: string, entityIdB: string) => void;
    /** Ground Y position (default: 500) */
    groundY?: number;
}
interface UsePhysics2DReturn {
    /** Register a unit for physics simulation */
    registerUnit: (unitId: string, options?: Partial<Physics2DState>) => void;
    /** Unregister a unit from physics */
    unregisterUnit: (unitId: string) => void;
    /** Get current physics position for a unit */
    getPosition: (unitId: string) => {
        x: number;
        y: number;
    } | null;
    /** Get full physics state for a unit */
    getState: (unitId: string) => Physics2DState | undefined;
    /** Apply force to a unit */
    applyForce: (unitId: string, fx: number, fy: number) => void;
    /** Set velocity directly */
    setVelocity: (unitId: string, vx: number, vy: number) => void;
    /** Set position directly (teleport) */
    setPosition: (unitId: string, x: number, y: number) => void;
    /** Run physics tick - call this in your RAF loop */
    tick: (deltaTime?: number) => void;
    /** Check collision between two units */
    checkCollision: (unitIdA: string, unitIdB: string, boundsA: PhysicsBounds, boundsB: PhysicsBounds) => boolean;
    /** Resolve collision between two units */
    resolveCollision: (unitIdA: string, unitIdB: string) => void;
    /** Freeze/unfreeze a unit */
    setFrozen: (unitId: string, frozen: boolean) => void;
    /** Get all physics-enabled units */
    getAllUnits: () => Physics2DState[];
    /** Reset all physics */
    reset: () => void;
}
/**
 * Hook for managing 2D physics simulation
 */
declare function usePhysics2D(options?: UsePhysics2DOptions): UsePhysics2DReturn;

/**
 * Isometric Coordinate Utilities
 *
 * Pure functions for 2:1 diamond isometric coordinate conversion.
 * No React dependencies — usable in any context.
 *
 * @packageDocumentation
 */
/** Base tile width in pixels (before scale) */
declare const TILE_WIDTH = 256;
/** Base tile height in pixels (before scale) — full sprite image height (Kenney 256×512) */
declare const TILE_HEIGHT = 512;
/** Floor diamond height — the "walkable surface" portion of the tile (TILE_WIDTH / 2 for 2:1 ratio) */
declare const FLOOR_HEIGHT = 128;
/**
 * Measured Y offset from sprite top to the diamond top vertex within a Kenney
 * 256×512 tile sprite.  The code previously assumed `TILE_HEIGHT - FLOOR_HEIGHT = 384`,
 * but the actual diamond (dirt_E.png) begins at y = 374 because the 3D side walls
 * occupy 10 extra pixels above the pure 128 px diamond.
 *
 * Use `DIAMOND_TOP_Y * scale` for highlight positioning, unit groundY, feature
 * placement, and hit-testing — NOT `(TILE_HEIGHT - FLOOR_HEIGHT) * scale`.
 * `FLOOR_HEIGHT` remains 128 for the isoToScreen spacing formula (2:1 ratio).
 */
declare const DIAMOND_TOP_Y = 374;
/**
 * Feature type → fallback color mapping (when sprites not loaded).
 */
declare const FEATURE_COLORS: Record<string, string>;
/**
 * Convert tile grid coordinates to screen pixel coordinates.
 *
 * Uses 2:1 diamond isometric projection:
 * - X increases to the lower-right
 * - Y increases to the lower-left
 *
 * @param tileX - Grid X coordinate
 * @param tileY - Grid Y coordinate
 * @param scale - Render scale factor
 * @param baseOffsetX - Horizontal offset to center the grid
 * @returns Screen position { x, y } of the tile's top-left corner
 */
declare function isoToScreen(tileX: number, tileY: number, scale: number, baseOffsetX: number): {
    x: number;
    y: number;
};
/**
 * Convert screen pixel coordinates back to tile grid coordinates.
 *
 * Inverse of isoToScreen. Snaps to nearest integer tile position.
 *
 * @param screenX - Screen X in pixels
 * @param screenY - Screen Y in pixels
 * @param scale - Render scale factor
 * @param baseOffsetX - Horizontal offset used in isoToScreen
 * @returns Snapped grid position { x, y }
 */
declare function screenToIso(screenX: number, screenY: number, scale: number, baseOffsetX: number): {
    x: number;
    y: number;
};

/**
 * Sprite Animation Engine
 *
 * Pure functions for sprite sheet animation: direction inference,
 * frame computation, sheet resolution, and animation state management.
 * No React dependencies — usable in any context.
 *
 * @packageDocumentation
 */

/**
 * Infer facing direction from a movement delta on the isometric grid.
 * dx/dy are tile coordinate deltas (not screen pixels).
 *
 * Isometric grid:
 *   NW ← (-x)    NE ← (-y)
 *   SW ← (+y)    SE ← (+x)
 */
declare function inferDirection(dx: number, dy: number): FacingDirection;
/**
 * Map a 4-direction facing to the actual sheet file direction + flipX flag.
 * We only have SE and SW sheet images. NE/NW are rendered by flipping:
 *   SE → SE sheet, no flip
 *   SW → SW sheet, no flip
 *   NE → SW sheet, flipX (mirror of SW gives NE)
 *   NW → SE sheet, flipX (mirror of SE gives NW)
 */
declare function resolveSheetDirection(facing: FacingDirection): {
    sheetDir: SpriteDirection;
    flipX: boolean;
};
/**
 * Compute the current frame index and whether the animation has finished.
 */
declare function getCurrentFrame(animName: AnimationName, elapsed: number): {
    frame: number;
    finished: boolean;
};
/**
 * Resolve a complete frame descriptor for canvas drawing.
 * Returns null if no sprite sheet URLs are available for this unit.
 */
declare function resolveFrame(sheetUrls: SpriteSheetUrls | null, frameDims: SpriteFrameDims, animState: UnitAnimationState): ResolvedFrame | null;
/**
 * Create initial animation state for a unit (idle, facing SE).
 */
declare function createUnitAnimationState(unitId: string): UnitAnimationState;
/**
 * Transition to a new animation. Resets elapsed time.
 * Optionally updates direction. Death cannot be overridden.
 */
declare function transitionAnimation(state: UnitAnimationState, newAnim: AnimationName, direction?: FacingDirection): UnitAnimationState;
/**
 * Advance animation state by deltaMs.
 * Handles one-shot → queued/idle transitions automatically.
 */
declare function tickAnimationState(state: UnitAnimationState, deltaMs: number): UnitAnimationState;

/**
 * Sprite Sheet Constants
 *
 * Standard layout for 8-column × 5-row character sprite sheets.
 * All characters share identical sheet geometry.
 *
 * @packageDocumentation
 */

/** Number of columns in a sprite sheet (frames per row) */
declare const SHEET_COLUMNS = 8;
/**
 * Standard sprite sheet row layout.
 * Row 0 = idle, Row 1 = walk, Row 2 = attack, Row 3 = hit, Row 4 = death.
 */
declare const SPRITE_SHEET_LAYOUT: Record<AnimationName, AnimationDef>;

interface StatBadgeProps {
    /** Stat label */
    label: string;
    /** Current value (defaults to 0 if not provided) */
    value?: number | string;
    /** Maximum value (for bar/hearts format) */
    max?: number;
    /** Data source entity name (for schema config) */
    source?: string;
    /** Field name in the source (for schema config) */
    field?: string;
    /** Display format */
    format?: 'number' | 'hearts' | 'bar' | 'text' | string;
    /** Icon component or emoji */
    icon?: React$1.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | string;
    /** Visual variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | string;
    /** Additional CSS classes */
    className?: string;
}

interface GameHudStat extends Omit<StatBadgeProps, "size"> {
    /** Data source entity name */
    source?: string;
    /** Field name in the source */
    field?: string;
}
/**
 * Schema-style HUD element definition.
 * Used when elements are passed from schema render_ui effects.
 */
interface GameHudElement {
    type: string;
    bind?: string;
    position?: string;
    label?: string;
}
interface GameHudProps {
    /** Position of the HUD */
    position?: "top" | "bottom" | "corners" | string;
    /** Stats to display - accepts readonly for compatibility with generated const arrays */
    stats?: readonly GameHudStat[];
    /** Alias for stats (schema compatibility) */
    items?: readonly GameHudStat[];
    /**
     * Schema-style elements array (alternative to stats).
     * Converted to stats internally for backwards compatibility.
     */
    elements?: readonly GameHudElement[];
    /** Size variant */
    size?: "sm" | "md" | "lg";
    /** Additional CSS classes */
    className?: string;
    /** Whether to use a semi-transparent background */
    transparent?: boolean;
}
declare function GameHud({ position: propPosition, stats: propStats, items, elements, size, className, transparent, }: GameHudProps): react_jsx_runtime.JSX.Element;
declare namespace GameHud {
    var displayName: string;
}

interface MenuOption {
    /** Optional ID (generated from index if not provided) */
    id?: string;
    /** Display label */
    label: string;
    /** Event to emit on click */
    event?: string;
    /** Page to navigate to */
    navigatesTo?: string;
    /** Button variant */
    variant?: "primary" | "secondary" | "ghost" | string;
    /** Whether the option is disabled */
    disabled?: boolean;
    /** Sub-label or description */
    subLabel?: string;
    /** Action identifier (alternative to event) */
    action?: string;
}
interface GameMenuProps {
    /** Menu title */
    title: string;
    /** Optional subtitle or version */
    subtitle?: string;
    /** Menu options - accepts readonly for compatibility with generated const arrays */
    options?: readonly MenuOption[];
    /** Alias for options (schema compatibility) */
    menuItems?: readonly MenuOption[];
    /** Called when an option is selected (legacy callback, prefer event bus) */
    onSelect?: (option: MenuOption) => void;
    /** Event bus for emitting UI events (optional, uses hook if not provided) */
    eventBus?: EventBusContextType;
    /** Background image or gradient */
    background?: string;
    /** Logo image URL */
    logo?: string;
    /** Additional CSS classes */
    className?: string;
}
declare function GameMenu({ title, subtitle, options, menuItems, onSelect, eventBus: eventBusProp, background, logo, className, }: GameMenuProps): react_jsx_runtime.JSX.Element;
declare namespace GameMenu {
    var displayName: string;
}

interface GameOverStat {
    /** Stat label */
    label: string;
    /** Stat value (required if bind is not provided) */
    value?: number | string;
    /**
     * Schema-style data binding (e.g., "player.score").
     * Alternative to value - used when stats come from schema render_ui effects.
     * Component will display 0 as placeholder since runtime binding is not implemented.
     */
    bind?: string;
    /** Display format */
    format?: "number" | "time" | "text";
    /** Icon */
    icon?: React$1.ReactNode;
}
interface GameOverAction {
    /** Display label */
    label: string;
    /** Event to emit on click */
    event?: string;
    /** Page to navigate to */
    navigatesTo?: string;
    /** Button variant */
    variant?: "primary" | "secondary" | "ghost";
}
interface GameOverScreenProps {
    /** Screen title (e.g., "Game Over", "Victory!") */
    title: string;
    /** Optional message */
    message?: string;
    /** Stats to display */
    stats?: GameOverStat[];
    /** Action buttons */
    actions?: GameOverAction[];
    /** Alias for actions (schema compatibility) */
    menuItems?: GameOverAction[];
    /** Called when an action is selected (legacy callback, prefer event bus) */
    onAction?: (action: GameOverAction) => void;
    /** Event bus for emitting UI events (optional, uses hook if not provided) */
    eventBus?: EventBusContextType;
    /** Victory or defeat variant */
    variant?: "victory" | "defeat" | "neutral";
    /** High score (optional, shows "NEW HIGH SCORE!" if exceeded) */
    highScore?: number | string;
    /** Current score for high score comparison (accepts string for schema bindings) */
    currentScore?: number | string;
    /** Additional CSS classes */
    className?: string;
}
declare function GameOverScreen({ title, message, stats, actions, menuItems, onAction, eventBus: eventBusProp, variant, highScore, currentScore, className, }: GameOverScreenProps): react_jsx_runtime.JSX.Element;
declare namespace GameOverScreen {
    var displayName: string;
}

/**
 * InventoryPanel Component
 *
 * Grid-based inventory UI with item selection and tooltips.
 *
 * **State categories (closed-circuit compliant):**
 * - Data (items, slots, selectedSlot) → received via props
 * - UI-transient (hoveredSlot, tooltipPosition) → local only
 * - Events → emitted via `useEventBus()` (selectSlot, useItem, dropItem)
 *
 * Local state is hover/tooltip only — rendering-only concerns.
 */

interface InventoryItem {
    id: string;
    type: string;
    quantity: number;
    sprite?: string;
    name?: string;
    description?: string;
}
interface InventoryPanelProps {
    /** Array of items in inventory */
    items: InventoryItem[];
    /** Total number of slots */
    slots: number;
    /** Number of columns in grid */
    columns: number;
    /** Currently selected slot index */
    selectedSlot?: number;
    /** Called when a slot is selected */
    onSelectSlot?: (index: number) => void;
    /** Called when an item is used (double-click or Enter) */
    onUseItem?: (item: InventoryItem) => void;
    /** Called when an item is dropped */
    onDropItem?: (item: InventoryItem) => void;
    /** Declarative event: emits UI:{selectSlotEvent} with { index } when a slot is selected */
    selectSlotEvent?: string;
    /** Declarative event: emits UI:{useItemEvent} with { item } when an item is used */
    useItemEvent?: string;
    /** Declarative event: emits UI:{dropItemEvent} with { item } when an item is dropped */
    dropItemEvent?: string;
    /** Show item tooltips on hover */
    showTooltips?: boolean;
    /** Optional className */
    className?: string;
    /** Slot size in pixels */
    slotSize?: number;
}
/**
 * Inventory panel component with grid layout
 *
 * @example
 * ```tsx
 * <InventoryPanel
 *   items={playerInventory}
 *   slots={20}
 *   columns={5}
 *   selectedSlot={selectedSlot}
 *   onSelectSlot={setSelectedSlot}
 *   onUseItem={(item) => console.log('Used:', item.name)}
 *   showTooltips
 * />
 * ```
 */
declare function InventoryPanel({ items, slots, columns, selectedSlot, onSelectSlot, onUseItem, onDropItem, selectSlotEvent, useItemEvent, dropItemEvent, showTooltips, className, slotSize, }: InventoryPanelProps): React__default.JSX.Element;

/**
 * DialogueBox Component
 *
 * NPC dialogue display with typewriter effect and choices.
 *
 * **State categories (closed-circuit compliant):**
 * - Content (dialogue node, speaker, text, choices) → received via props
 * - UI-transient animation (displayedText, isTyping, charIndex, selectedChoice) → local only
 * - Events → emitted via `useEventBus()` (complete, choice, advance)
 *
 * Local state is typewriter animation only — an inherently rendering-only
 * concern analogous to Form's `formData`.
 */

interface DialogueChoice {
    text: string;
    action?: string;
    next?: string;
    disabled?: boolean;
}
interface DialogueNode {
    id?: string;
    speaker: string;
    text: string;
    portrait?: string;
    choices?: DialogueChoice[];
    autoAdvance?: number;
}
interface DialogueBoxProps {
    /** Current dialogue node to display */
    dialogue: DialogueNode;
    /** Typewriter speed in ms per character (0 = instant) */
    typewriterSpeed?: number;
    /** Position of dialogue box */
    position?: 'top' | 'bottom';
    /** Called when text animation completes */
    onComplete?: () => void;
    /** Called when a choice is selected */
    onChoice?: (choice: DialogueChoice) => void;
    /** Called when dialogue is advanced (no choices) */
    onAdvance?: () => void;
    /** Declarative event: emits UI:{completeEvent} when text animation completes */
    completeEvent?: string;
    /** Declarative event: emits UI:{choiceEvent} with { choice } when a choice is selected */
    choiceEvent?: string;
    /** Declarative event: emits UI:{advanceEvent} when dialogue is advanced */
    advanceEvent?: string;
    /** Optional className */
    className?: string;
}
/**
 * Dialogue box component with typewriter effect
 *
 * @example
 * ```tsx
 * <DialogueBox
 *   dialogue={{
 *     speaker: "Old Man",
 *     text: "It's dangerous to go alone! Take this.",
 *     portrait: "/portraits/oldman.png",
 *     choices: [
 *       { text: "Thank you!", action: "ACCEPT_ITEM" },
 *       { text: "No thanks", next: "decline_node" }
 *     ]
 *   }}
 *   typewriterSpeed={30}
 *   onChoice={(choice) => handleChoice(choice)}
 *   position="bottom"
 * />
 * ```
 */
declare function DialogueBox({ dialogue, typewriterSpeed, position, onComplete, onChoice, onAdvance, completeEvent, choiceEvent, advanceEvent, className, }: DialogueBoxProps): React__default.JSX.Element;

/**
 * BattleBoard
 *
 * Core rendering organism for turn-based battles.
 *
 * This is a **controlled-only** component: all game state (units, phase,
 * turn, gameResult, selectedUnitId) must be provided via the `entity` prop.
 * User interactions are communicated via event bus emissions so the parent
 * (typically an Orbital trait or the `useBattleState` hook) can manage
 * state transitions.
 *
 * For a self-managing version, use `UncontrolledBattleBoard` which
 * composes this component with the `useBattleState` hook.
 *
 * Animation-only state (movement interpolation, screen shake, hover) is
 * always managed locally.
 *
 * @packageDocumentation
 */

/** Battle phases an encounter walks through */
type BattlePhase = 'observation' | 'selection' | 'movement' | 'action' | 'enemy_turn' | 'game_over';
/** A unit participating in battle */
interface BattleUnit {
    id: string;
    name: string;
    unitType?: string;
    heroId?: string;
    sprite?: string;
    /** Optional sprite sheet for animation (null = use static sprite) */
    spriteSheet?: {
        se: string;
        sw: string;
        frameWidth: number;
        frameHeight: number;
    } | null;
    team: 'player' | 'enemy';
    position: {
        x: number;
        y: number;
    };
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
    traits?: {
        name: string;
        currentState: string;
        states: string[];
        cooldown?: number;
    }[];
}
/** Minimal tile for map generation */
interface BattleTile {
    x: number;
    y: number;
    terrain: string;
    terrainSprite?: string;
}
/** Entity prop containing all board data.
 *
 * BattleBoard is **controlled-only**: all game-state fields (`units`, `phase`,
 * `turn`, `gameResult`, `selectedUnitId`) must be provided.  Mutations are
 * communicated via event bus emissions — the component never calls `setState`
 * for game-logic values.
 *
 * For a self-managing variant, use `UncontrolledBattleBoard`.
 *
 * Animation-only state (`movingPositions`, `isShaking`, `hoveredTile`) is
 * always managed locally.
 */
interface BattleEntity {
    id: string;
    tiles: IsometricTile[];
    features?: IsometricFeature[];
    boardWidth?: number;
    boardHeight?: number;
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
        effects?: Record<string, string>;
    };
    backgroundImage?: string;
    /** Current unit state. */
    units: BattleUnit[];
    /** Current battle phase. */
    phase: BattlePhase;
    /** Current turn number. */
    turn: number;
    /** Game result. `null` = still in progress. */
    gameResult: 'victory' | 'defeat' | null;
    /** Currently selected unit ID. */
    selectedUnitId: string | null;
}
/** Context exposed to render-prop slots */
interface BattleSlotContext {
    phase: BattlePhase;
    turn: number;
    selectedUnit: BattleUnit | null;
    hoveredUnit: BattleUnit | null;
    playerUnits: BattleUnit[];
    enemyUnits: BattleUnit[];
    gameResult: 'victory' | 'defeat' | null;
    onEndTurn: () => void;
    onCancel: () => void;
    onReset: () => void;
    attackTargets: Array<{
        x: number;
        y: number;
    }>;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => {
        x: number;
        y: number;
    };
}
interface BattleBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** Entity containing all board data */
    entity: BattleEntity;
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Header area -- receives battle context */
    header?: (ctx: BattleSlotContext) => React__default.ReactNode;
    /** Sidebar content (combat log, unit roster, etc.) */
    sidebar?: (ctx: BattleSlotContext) => React__default.ReactNode;
    /** Floating action buttons */
    actions?: (ctx: BattleSlotContext) => React__default.ReactNode;
    /** Floating overlays above the canvas (damage popups, tooltips) */
    overlay?: (ctx: BattleSlotContext) => React__default.ReactNode;
    /** Game-over screen overlay */
    gameOverOverlay?: (ctx: BattleSlotContext) => React__default.ReactNode;
    /** Called when a unit attacks another */
    onAttack?: (attacker: BattleUnit, target: BattleUnit, damage: number) => void;
    /** Called when battle ends */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Called after a unit moves */
    onUnitMove?: (unit: BattleUnit, to: {
        x: number;
        y: number;
    }) => void;
    /** Custom combat damage calculator */
    calculateDamage?: (attacker: BattleUnit, target: BattleUnit) => number;
    onDrawEffects?: (ctx: CanvasRenderingContext2D, timestamp: number) => void;
    hasActiveEffects?: boolean;
    effectSpriteUrls?: string[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    /** Emits UI:{tileClickEvent} with { x, y } on tile click */
    tileClickEvent?: string;
    /** Emits UI:{unitClickEvent} with { unitId } on unit click */
    unitClickEvent?: string;
    /** Emits UI:{endTurnEvent} with {} on end turn */
    endTurnEvent?: string;
    /** Emits UI:{cancelEvent} with {} on cancel */
    cancelEvent?: string;
    /** Emits UI:{gameEndEvent} with { result } on game end */
    gameEndEvent?: string;
    /** Emits UI:{playAgainEvent} with {} on play again / reset */
    playAgainEvent?: string;
    /** Emits UI:{attackEvent} with { attackerId, targetId, damage } on attack */
    attackEvent?: string;
    className?: string;
}
declare function BattleBoard({ entity, scale, unitScale, header, sidebar, actions, overlay, gameOverOverlay, onAttack, onGameEnd, onUnitMove, calculateDamage, onDrawEffects, hasActiveEffects, effectSpriteUrls, resolveUnitFrame, tileClickEvent, unitClickEvent, endTurnEvent, cancelEvent, gameEndEvent, playAgainEvent, attackEvent, className, }: BattleBoardProps): React__default.JSX.Element;
declare namespace BattleBoard {
    var displayName: string;
}

interface UncontrolledBattleBoardProps extends Omit<BattleBoardProps, 'entity'> {
    entity: Omit<BattleBoardProps['entity'], 'units' | 'phase' | 'turn' | 'gameResult' | 'selectedUnitId'> & {
        initialUnits: BattleUnit[];
    };
}
declare function UncontrolledBattleBoard({ entity, ...rest }: UncontrolledBattleBoardProps): react_jsx_runtime.JSX.Element;
declare namespace UncontrolledBattleBoard {
    var displayName: string;
}

interface BattleStateEventConfig {
    tileClickEvent?: string;
    unitClickEvent?: string;
    endTurnEvent?: string;
    cancelEvent?: string;
    gameEndEvent?: string;
    playAgainEvent?: string;
    attackEvent?: string;
}
interface BattleStateCallbacks {
    /** Called when a unit attacks another */
    onAttack?: (attacker: BattleUnit, target: BattleUnit, damage: number) => void;
    /** Called when battle ends */
    onGameEnd?: (result: 'victory' | 'defeat') => void;
    /** Called after a unit moves */
    onUnitMove?: (unit: BattleUnit, to: {
        x: number;
        y: number;
    }) => void;
    /** Custom combat damage calculator */
    calculateDamage?: (attacker: BattleUnit, target: BattleUnit) => number;
}
interface BattleStateResult {
    units: BattleUnit[];
    selectedUnitId: string | null;
    phase: BattlePhase;
    turn: number;
    gameResult: 'victory' | 'defeat' | null;
    handleTileClick: (x: number, y: number) => void;
    handleUnitClick: (unitId: string) => void;
    handleEndTurn: () => void;
    handleRestart: () => void;
}
declare function useBattleState(initialUnits: BattleUnit[], eventConfig?: BattleStateEventConfig, callbacks?: BattleStateCallbacks): BattleStateResult;

/**
 * WorldMapBoard
 *
 * Organism for the strategic world-map view.  Renders an isometric hex/iso
 * map with hero selection, movement animation, and encounter callbacks.
 * Game-specific panels (hero detail, hero lists, resource bars) are injected
 * via render-prop slots.
 *
 * **State categories (closed-circuit compliant):**
 * - Game data (hexes, heroes, selectedHeroId, features) → received via
 *   `entity` prop; the Orbital trait owns this state.
 * - Rendering state (hoveredTile, movingPositions animation) → local only.
 * - Events → emitted via `useEventBus()` for trait integration.
 *
 * This component is mostly prop-driven.  The only internal state is hover
 * tracking and movement animation interpolation, both of which are
 * rendering-only concerns that cannot (and should not) be externalised.
 *
 * @packageDocumentation
 */

/** A hero on the world map */
interface MapHero {
    id: string;
    name: string;
    owner: 'player' | 'enemy' | string;
    position: {
        x: number;
        y: number;
    };
    movement: number;
    sprite?: string;
    /** Optional sprite sheet for animation (null = use static sprite) */
    spriteSheet?: {
        se: string;
        sw: string;
        frameWidth: number;
        frameHeight: number;
    } | null;
    level?: number;
}
/** A hex on the map */
interface MapHex {
    x: number;
    y: number;
    terrain: string;
    terrainSprite?: string;
    feature?: string;
    featureData?: Record<string, unknown>;
    passable?: boolean;
}
/** Context exposed to render-prop slots */
interface WorldMapSlotContext {
    /** Currently hovered tile */
    hoveredTile: {
        x: number;
        y: number;
    } | null;
    /** Hex at the hovered tile */
    hoveredHex: MapHex | null;
    /** Hero at the hovered tile */
    hoveredHero: MapHero | null;
    /** Currently selected hero */
    selectedHero: MapHero | null;
    /** Valid move tiles for selected hero */
    validMoves: Array<{
        x: number;
        y: number;
    }>;
    /** Selects a hero */
    selectHero: (id: string) => void;
    /** Resolve screen position of a tile for overlays */
    tileToScreen: (x: number, y: number) => {
        x: number;
        y: number;
    };
    /** Canvas scale */
    scale: number;
}
/** Entity shape for the WorldMapBoard */
interface WorldMapEntity {
    id: string;
    hexes: MapHex[];
    heroes: MapHero[];
    features?: IsometricFeature[];
    selectedHeroId?: string | null;
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
    };
    backgroundImage?: string;
}
interface WorldMapBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** World map entity data */
    entity: WorldMapEntity;
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
    /** Custom movement range validator */
    isInRange?: (from: {
        x: number;
        y: number;
    }, to: {
        x: number;
        y: number;
    }, range: number) => boolean;
    /** Emits UI:{heroSelectEvent} with { heroId } */
    heroSelectEvent?: string;
    /** Emits UI:{heroMoveEvent} with { heroId, toX, toY } */
    heroMoveEvent?: string;
    /** Emits UI:{battleEncounterEvent} with { attackerId, defenderId } */
    battleEncounterEvent?: string;
    /** Emits UI:{featureEnterEvent} with { heroId, feature, hex } */
    featureEnterEvent?: string;
    /** Emits UI:{tileClickEvent} with { x, y } */
    tileClickEvent?: string;
    /** Header / top bar */
    header?: (ctx: WorldMapSlotContext) => React__default.ReactNode;
    /** Side panel (hero detail, hero lists, etc.) */
    sidePanel?: (ctx: WorldMapSlotContext) => React__default.ReactNode;
    /** Canvas overlay (tooltips, popups) */
    overlay?: (ctx: WorldMapSlotContext) => React__default.ReactNode;
    /** Footer */
    footer?: (ctx: WorldMapSlotContext) => React__default.ReactNode;
    onHeroSelect?: (heroId: string) => void;
    onHeroMove?: (heroId: string, toX: number, toY: number) => void;
    /** Called when hero clicks an enemy hero tile */
    onBattleEncounter?: (attackerId: string, defenderId: string) => void;
    /** Called when hero enters a feature hex (castle, resource, etc.) */
    onFeatureEnter?: (heroId: string, hex: MapHex) => void;
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Disable pan/zoom camera (default: true). Set false for fixed maps where overlay labels need stable positions. */
    enableCamera?: boolean;
    effectSpriteUrls?: string[];
    resolveUnitFrame?: (unitId: string) => ResolvedFrame | null;
    className?: string;
}
declare function WorldMapBoard({ entity, scale, unitScale, allowMoveAllHeroes, isInRange, heroSelectEvent, heroMoveEvent, battleEncounterEvent, featureEnterEvent, tileClickEvent, header, sidePanel, overlay, footer, onHeroSelect, onHeroMove, onBattleEncounter, onFeatureEnter, diamondTopY, enableCamera, effectSpriteUrls, resolveUnitFrame, className, }: WorldMapBoardProps): React__default.JSX.Element;
declare namespace WorldMapBoard {
    var displayName: string;
}

/**
 * CastleBoard
 *
 * Self-contained castle / base-management game board organism. Encapsulates all
 * isometric canvas rendering, hover/selection state, and slot-based layout.
 * Designed to be consumed by CastleTemplate (thin wrapper) or embedded directly
 * in any page that needs an isometric castle view.
 *
 * Accepts an `entity` prop conforming to `CastleEntity` and optional declarative
 * event props (`featureClickEvent`, `unitClickEvent`, `tileClickEvent`) that
 * emit through the Orbital event bus.
 *
 * @packageDocumentation
 */

/** Entity shape consumed by CastleBoard */
interface CastleEntity {
    id: string;
    tiles: IsometricTile[];
    features?: IsometricFeature[];
    units?: IsometricUnit[];
    assetManifest?: {
        baseUrl: string;
        terrains?: Record<string, string>;
        units?: Record<string, string>;
        features?: Record<string, string>;
    };
    backgroundImage?: string;
}
/** Context exposed to render-prop slots */
interface CastleSlotContext {
    /** Currently hovered tile coordinates (null when not hovering) */
    hoveredTile: {
        x: number;
        y: number;
    } | null;
    /** Feature that sits on the hovered tile, if any */
    hoveredFeature: IsometricFeature | null;
    /** Unit that sits on the hovered tile, if any */
    hoveredUnit: IsometricUnit | null;
    /** The clicked feature (e.g. building) for detail view */
    selectedFeature: IsometricFeature | null;
    /** Clear selected feature */
    clearSelection: () => void;
    /** Resolve screen position for overlay positioning */
    tileToScreen: (x: number, y: number) => {
        x: number;
        y: number;
    };
    /** Canvas scale */
    scale: number;
}
interface CastleBoardProps {
    /** Castle entity data */
    entity: CastleEntity;
    /** Canvas render scale */
    scale?: number;
    /** Top bar / header */
    header?: (ctx: CastleSlotContext) => React__default.ReactNode;
    /** Side panel content (buildings list, recruit tab, garrison tab) */
    sidePanel?: (ctx: CastleSlotContext) => React__default.ReactNode;
    /** Canvas overlay (hover tooltips, etc.) */
    overlay?: (ctx: CastleSlotContext) => React__default.ReactNode;
    /** Bottom bar (income summary, etc.) */
    footer?: (ctx: CastleSlotContext) => React__default.ReactNode;
    /** Called when a feature (building) is clicked */
    onFeatureClick?: (feature: IsometricFeature) => void;
    /** Called when a unit is clicked */
    onUnitClick?: (unit: IsometricUnit) => void;
    /** Called when any tile is clicked */
    onTileClick?: (x: number, y: number) => void;
    /** Event name to emit via event bus when a feature is clicked (emits UI:{featureClickEvent}) */
    featureClickEvent?: string;
    /** Event name to emit via event bus when a unit is clicked (emits UI:{unitClickEvent}) */
    unitClickEvent?: string;
    /** Event name to emit via event bus when a tile is clicked (emits UI:{tileClickEvent}) */
    tileClickEvent?: string;
    className?: string;
}
declare function CastleBoard({ entity, scale, header, sidePanel, overlay, footer, onFeatureClick, onUnitClick, onTileClick, featureClickEvent, unitClickEvent, tileClickEvent, className, }: CastleBoardProps): React__default.JSX.Element;
declare namespace CastleBoard {
    var displayName: string;
}

/**
 * TraitStateViewer Component
 *
 * Displays a state machine visualization for a trait / behavior.
 * Three variants for different complexity levels:
 * - `linear`  — simple step progression (ages 5-8)
 * - `compact` — current state + available actions (ages 9-12)
 * - `full`    — all states, transitions, guards (ages 13+)
 *
 * @packageDocumentation
 */

interface TraitTransition {
    from: string;
    to: string;
    event: string;
    guardHint?: string;
}
interface TraitStateMachineDefinition {
    name: string;
    states: string[];
    currentState: string;
    transitions: TraitTransition[];
    description?: string;
}
interface TraitStateViewerProps {
    /** The trait / state machine to visualize */
    trait: TraitStateMachineDefinition;
    /** Display variant */
    variant?: 'linear' | 'compact' | 'full';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show transition labels */
    showTransitions?: boolean;
    /** Click handler for states */
    onStateClick?: (state: string) => void;
    /** Custom state styles passed to StateIndicator */
    stateStyles?: Record<string, StateStyle>;
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
declare function TraitStateViewer({ trait, variant, size, showTransitions, onStateClick, stateStyles, className, }: TraitStateViewerProps): React__default.JSX.Element;
declare namespace TraitStateViewer {
    var displayName: string;
}

/**
 * TraitSlot Component
 *
 * A generic equippable slot with drag-and-drop support.
 * Shows a TraitStateViewer tooltip on hover for equipped items.
 * Used across game tiers:
 * - Sequencer (5-8): action slots in the sequence bar
 * - Event Handler (9-12): rule slots on world objects
 * - State Architect (13+): transition slots on state nodes
 *
 * **State categories (closed-circuit compliant):**
 * - Data (equippedItem, slotNumber, locked, selected, feedback) → received via props
 * - UI-transient (isHovered, isDragOver) → local only
 * - Events → emitted via `useEventBus()` (click, remove)
 *
 * Local state is hover/drag-over detection only — rendering-only concerns.
 *
 * @packageDocumentation
 */

/** Data shape for a slot's equipped item */
interface SlotItemData {
    id: string;
    name: string;
    category: string;
    description?: string;
    /** Emoji or text icon */
    iconEmoji?: string;
    /** Image URL icon (takes precedence over iconEmoji) */
    iconUrl?: string;
    /** Optional state machine for tooltip display */
    stateMachine?: TraitStateMachineDefinition;
}
interface TraitSlotProps {
    /** Slot index (1-based) */
    slotNumber: number;
    /** Currently equipped item, if any */
    equippedItem?: SlotItemData;
    /** Whether slot is locked */
    locked?: boolean;
    /** Label shown when locked */
    lockLabel?: string;
    /** Whether slot is selected */
    selected?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Show tooltip on hover */
    showTooltip?: boolean;
    /** Category → color mapping */
    categoryColors?: Record<string, {
        bg: string;
        border: string;
    }>;
    /** Optional tooltip frame image URL */
    tooltipFrameUrl?: string;
    /** Additional CSS classes */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Called when an item is dropped on this slot */
    onItemDrop?: (item: SlotItemData) => void;
    /** Whether this slot's equipped item is draggable */
    draggable?: boolean;
    /** Called when drag starts from this slot */
    onDragStart?: (item: SlotItemData) => void;
    /** Per-slot correctness feedback after a failed attempt */
    feedback?: 'correct' | 'wrong' | null;
    /** Click handler */
    onClick?: () => void;
    /** Remove handler */
    onRemove?: () => void;
    /** Emits UI:{clickEvent} with { slotNumber } */
    clickEvent?: string;
    /** Emits UI:{removeEvent} with { slotNumber } */
    removeEvent?: string;
}
declare function TraitSlot({ slotNumber, equippedItem, locked, lockLabel, selected, size, showTooltip, categoryColors, tooltipFrameUrl, className, feedback, onItemDrop, draggable, onDragStart, onClick, onRemove, clickEvent, removeEvent, }: TraitSlotProps): React__default.JSX.Element;
declare namespace TraitSlot {
    var displayName: string;
}

type EditorMode = 'select' | 'paint' | 'unit' | 'feature' | 'erase';
declare const TERRAIN_COLORS: Record<string, string>;
declare const FEATURE_TYPES: readonly ["goldMine", "resonanceCrystal", "traitCache", "salvageYard", "portal", "battleMarker", "treasure", "castle"];
interface CollapsibleSectionProps {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React__default.ReactNode;
    className?: string;
}
declare function CollapsibleSection({ title, expanded, onToggle, children, className }: CollapsibleSectionProps): react_jsx_runtime.JSX.Element;
declare namespace CollapsibleSection {
    var displayName: string;
}
interface EditorSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}
declare function EditorSlider({ label, value, min, max, step, onChange, className }: EditorSliderProps): react_jsx_runtime.JSX.Element;
declare namespace EditorSlider {
    var displayName: string;
}
interface EditorSelectProps {
    label: string;
    value: string;
    options: Array<{
        value: string;
        label: string;
    }>;
    onChange: (value: string) => void;
    className?: string;
}
declare function EditorSelect({ label, value, options, onChange, className }: EditorSelectProps): react_jsx_runtime.JSX.Element;
declare namespace EditorSelect {
    var displayName: string;
}
interface EditorCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}
declare function EditorCheckbox({ label, checked, onChange, className }: EditorCheckboxProps): react_jsx_runtime.JSX.Element;
declare namespace EditorCheckbox {
    var displayName: string;
}
interface EditorTextInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}
declare function EditorTextInput({ label, value, onChange, placeholder, className }: EditorTextInputProps): react_jsx_runtime.JSX.Element;
declare namespace EditorTextInput {
    var displayName: string;
}
interface StatusBarProps {
    hoveredTile: {
        x: number;
        y: number;
    } | null;
    mode: EditorMode;
    gridSize?: {
        width: number;
        height: number;
    };
    unitCount?: number;
    featureCount?: number;
    className?: string;
}
declare function StatusBar({ hoveredTile, mode, gridSize, unitCount, featureCount, className }: StatusBarProps): react_jsx_runtime.JSX.Element;
declare namespace StatusBar {
    var displayName: string;
}
interface TerrainPaletteProps {
    terrains: string[];
    selectedTerrain: string;
    onSelect: (terrain: string) => void;
    className?: string;
}
declare function TerrainPalette({ terrains, selectedTerrain, onSelect, className }: TerrainPaletteProps): react_jsx_runtime.JSX.Element;
declare namespace TerrainPalette {
    var displayName: string;
}
interface EditorToolbarProps {
    mode: EditorMode;
    onModeChange: (mode: EditorMode) => void;
    className?: string;
}
declare function EditorToolbar({ mode, onModeChange, className }: EditorToolbarProps): react_jsx_runtime.JSX.Element;
declare namespace EditorToolbar {
    var displayName: string;
}

/**
 * ActionTile Component
 *
 * A draggable action tile for the Sequencer tier (ages 5-8).
 * Kids drag these from the ActionPalette into SequenceBar slots.
 * Sets SlotItemData on dataTransfer for TraitSlot compatibility.
 *
 * @packageDocumentation
 */

interface ActionTileProps extends Omit<EntityDisplayProps, 'entity'> {
    /** The action data */
    action: SlotItemData;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether the tile is disabled / already used */
    disabled?: boolean;
    /** Category → color mapping */
    categoryColors?: Record<string, {
        bg: string;
        border: string;
    }>;
}
declare function ActionTile({ action, size, disabled, categoryColors, className, }: ActionTileProps): React__default.JSX.Element;
declare namespace ActionTile {
    var displayName: string;
}

/**
 * ActionPalette Component
 *
 * Grid of draggable ActionTile components for the Sequencer tier.
 * Kids pick from these to build their sequence.
 *
 * @packageDocumentation
 */

interface ActionPaletteProps {
    /** Available actions */
    actions: SlotItemData[];
    /** IDs of actions that are already used (shown as disabled) */
    usedActionIds?: string[];
    /** Whether each action can be used multiple times */
    allowDuplicates?: boolean;
    /** Category → color mapping */
    categoryColors?: Record<string, {
        bg: string;
        border: string;
    }>;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Label above the palette */
    label?: string;
    /** Additional CSS classes */
    className?: string;
}
declare function ActionPalette({ actions, usedActionIds, allowDuplicates, categoryColors, size, label, className, }: ActionPaletteProps): React__default.JSX.Element;
declare namespace ActionPalette {
    var displayName: string;
}

/**
 * SequenceBar Component
 *
 * A row of TraitSlot components forming the action sequence for the
 * Sequencer tier (ages 5-8). Kids drag ActionTiles from the palette
 * into these slots to build their sequence.
 *
 * @packageDocumentation
 */

interface SequenceBarProps {
    /** The current sequence (sparse — undefined means empty slot) */
    slots: Array<SlotItemData | undefined>;
    /** Max number of slots */
    maxSlots: number;
    /** Called when an item is dropped into slot at index */
    onSlotDrop: (index: number, item: SlotItemData) => void;
    /** Called when a slot is cleared */
    onSlotRemove: (index: number) => void;
    /** Whether the sequence is currently playing (disable interaction) */
    playing?: boolean;
    /** Current step index during playback (-1 = not playing) */
    currentStep?: number;
    /** Category → color mapping */
    categoryColors?: Record<string, {
        bg: string;
        border: string;
    }>;
    /** Per-slot correctness feedback shown after a failed attempt */
    slotFeedback?: Array<'correct' | 'wrong' | null>;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
}
declare function SequenceBar({ slots, maxSlots, onSlotDrop, onSlotRemove, playing, currentStep, categoryColors, slotFeedback, size, className, }: SequenceBarProps): React__default.JSX.Element;
declare namespace SequenceBar {
    var displayName: string;
}

/**
 * SequencerBoard Organism
 *
 * Contains ALL game logic for the Sequencer tier (ages 5-8).
 * Manages the action sequence, validates it, and animates Kekec
 * executing each step on the puzzle scene.
 *
 * Feedback-first UX:
 * - On failure: slots stay in place, each slot gets a green or red
 *   ring showing exactly which steps are correct and which need to change.
 * - Modifying a slot clears its individual feedback so the kid can re-try.
 * - After 3 failures a persistent hint appears above the sequence bar.
 * - "Reset" clears everything including attempts / hint.
 *
 * TraitStateViewer states use indexed labels ("1. Walk", "2. Jump") so that
 * repeated actions are correctly highlighted during playback.
 *
 * @packageDocumentation
 */

interface SequencerPuzzleEntity {
    id: string;
    title: string;
    description: string;
    /** Available actions the kid can use */
    availableActions: SlotItemData[];
    /** How many slots in the sequence bar */
    maxSlots: number;
    /** Whether actions can be reused */
    allowDuplicates?: boolean;
    /** The correct sequence(s) — list of action IDs. First match wins. */
    solutions: string[][];
    /** Feedback messages */
    successMessage?: string;
    failMessage?: string;
    /** Progressive hint shown after 3 failures */
    hint?: string;
    /** Hex coordinates for map animation — one per action + starting position */
    path?: Array<{
        x: number;
        y: number;
    }>;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface SequencerBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** Puzzle data */
    entity: SequencerPuzzleEntity;
    /** Category → color mapping */
    categoryColors?: Record<string, {
        bg: string;
        border: string;
    }>;
    /** Playback speed in ms per step */
    stepDurationMs?: number;
    /** Emits UI:{playEvent} with { sequence: string[] } */
    playEvent?: string;
    /** Emits UI:{completeEvent} with { success: boolean } */
    completeEvent?: string;
}
declare function SequencerBoard({ entity, categoryColors, stepDurationMs, playEvent, completeEvent, className, }: SequencerBoardProps): React__default.JSX.Element;
declare namespace SequencerBoard {
    var displayName: string;
}

/**
 * RuleEditor Component
 *
 * A single WHEN/THEN rule row for the Event Handler tier (ages 9-12).
 * Kid picks an event trigger and an action from dropdowns.
 *
 * @packageDocumentation
 */

interface RuleDefinition {
    id: string;
    whenEvent: string;
    thenAction: string;
}
interface RuleEditorProps {
    /** The current rule */
    rule: RuleDefinition;
    /** Available event triggers to listen for */
    availableEvents: Array<{
        value: string;
        label: string;
    }>;
    /** Available actions to perform */
    availableActions: Array<{
        value: string;
        label: string;
    }>;
    /** Called when rule changes */
    onChange: (rule: RuleDefinition) => void;
    /** Called when rule is removed */
    onRemove?: () => void;
    /** Whether editing is disabled (during playback) */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}
declare function RuleEditor({ rule, availableEvents, availableActions, onChange, onRemove, disabled, className, }: RuleEditorProps): React__default.JSX.Element;
declare namespace RuleEditor {
    var displayName: string;
}

/**
 * EventLog Component
 *
 * Scrolling log of events during playback in the Event Handler tier.
 * Shows the chain reaction as events cascade through objects.
 *
 * @packageDocumentation
 */

interface EventLogEntry {
    id: string;
    timestamp: number;
    icon: string;
    message: string;
    status: 'pending' | 'active' | 'done' | 'error';
}
interface EventLogProps {
    /** Log entries */
    entries: EventLogEntry[];
    /** Max visible height before scroll */
    maxHeight?: number;
    /** Title label */
    label?: string;
    /** Additional CSS classes */
    className?: string;
}
declare function EventLog({ entries, maxHeight, label, className, }: EventLogProps): React__default.JSX.Element;
declare namespace EventLog {
    var displayName: string;
}

/**
 * ObjectRulePanel Component
 *
 * Shows the rules panel for a selected world object in the Event Handler tier.
 * Displays object info, its current state (via TraitStateViewer), and
 * a list of WHEN/THEN rules the kid has set.
 *
 * @packageDocumentation
 */

interface PuzzleObjectDef {
    id: string;
    name: string;
    icon: string;
    states: string[];
    initialState: string;
    currentState: string;
    availableEvents: Array<{
        value: string;
        label: string;
    }>;
    availableActions: Array<{
        value: string;
        label: string;
    }>;
    rules: RuleDefinition[];
    /** Max rules allowed on this object */
    maxRules?: number;
}
interface ObjectRulePanelProps {
    /** The selected object */
    object: PuzzleObjectDef;
    /** Called when rules change */
    onRulesChange: (objectId: string, rules: RuleDefinition[]) => void;
    /** Whether editing is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}
declare function ObjectRulePanel({ object, onRulesChange, disabled, className, }: ObjectRulePanelProps): React__default.JSX.Element;
declare namespace ObjectRulePanel {
    var displayName: string;
}

/**
 * EventHandlerBoard Organism
 *
 * Contains ALL game logic for the Event Handler tier (ages 9-12).
 * Kids click on world objects, set WHEN/THEN rules, and watch
 * event chains cascade during playback.
 *
 * Encourages experimentation: on failure, resets to editing so the kid
 * can try different rules. After 3 failures, shows a progressive hint.
 *
 * @packageDocumentation
 */

interface EventHandlerPuzzleEntity {
    id: string;
    title: string;
    description: string;
    /** Objects the kid can configure */
    objects: PuzzleObjectDef[];
    /** Goal condition description */
    goalCondition: string;
    /** Event that represents goal completion */
    goalEvent: string;
    /** Sequence of events that auto-fire to start the simulation */
    triggerEvents?: string[];
    /** Feedback */
    successMessage?: string;
    failMessage?: string;
    /** Progressive hint shown after 3 failures */
    hint?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface EventHandlerBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** Puzzle data */
    entity: EventHandlerPuzzleEntity;
    /** Playback speed in ms per event */
    stepDurationMs?: number;
    /** Emits UI:{playEvent} */
    playEvent?: string;
    /** Emits UI:{completeEvent} with { success } */
    completeEvent?: string;
}
declare function EventHandlerBoard({ entity, stepDurationMs, playEvent, completeEvent, className, }: EventHandlerBoardProps): React__default.JSX.Element;
declare namespace EventHandlerBoard {
    var displayName: string;
}

/**
 * StateNode Component
 *
 * A draggable state circle for the graph editor in the State Architect tier (ages 13+).
 * Shows state name, highlights when current, and supports click to select.
 *
 * @packageDocumentation
 */

interface StateNodeProps {
    /** State name */
    name: string;
    /** Whether this is the current active state */
    isCurrent?: boolean;
    /** Whether this node is selected for editing */
    isSelected?: boolean;
    /** Whether this is the initial state */
    isInitial?: boolean;
    /** Position on the graph canvas */
    position: {
        x: number;
        y: number;
    };
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}
declare function StateNode({ name, isCurrent, isSelected, isInitial, position, onClick, className, }: StateNodeProps): React__default.JSX.Element;
declare namespace StateNode {
    var displayName: string;
}

/**
 * TransitionArrow Component
 *
 * An SVG arrow connecting two state nodes in the graph editor.
 * Shows the event name as a label on the arrow.
 *
 * @packageDocumentation
 */

interface TransitionArrowProps {
    /** Start position (center of from-node) */
    from: {
        x: number;
        y: number;
    };
    /** End position (center of to-node) */
    to: {
        x: number;
        y: number;
    };
    /** Event label shown on the arrow */
    eventLabel: string;
    /** Guard hint shown below event */
    guardHint?: string;
    /** Whether this transition is currently active */
    isActive?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes for the SVG group */
    className?: string;
}
declare function TransitionArrow({ from, to, eventLabel, guardHint, isActive, onClick, className, }: TransitionArrowProps): React__default.JSX.Element;
declare namespace TransitionArrow {
    var displayName: string;
}

/**
 * VariablePanel Component
 *
 * Shows entity variables and their current values during State Architect playback.
 *
 * @packageDocumentation
 */

interface VariableDef {
    name: string;
    value: number;
    min?: number;
    max?: number;
    unit?: string;
}
interface VariablePanelProps {
    /** Entity name */
    entityName: string;
    /** Variables to display */
    variables: VariableDef[];
    /** Additional CSS classes */
    className?: string;
}
declare function VariablePanel({ entityName, variables, className, }: VariablePanelProps): React__default.JSX.Element;
declare namespace VariablePanel {
    var displayName: string;
}

/**
 * CodeView Component
 *
 * Shows the JSON code representation of a state machine.
 * Toggle between visual and code view in State Architect tier.
 *
 * @packageDocumentation
 */

interface CodeViewProps {
    /** JSON data to display */
    data: Record<string, unknown>;
    /** Label */
    label?: string;
    /** Whether the code is expanded by default */
    defaultExpanded?: boolean;
    /** Additional CSS classes */
    className?: string;
}
declare function CodeView({ data, label, defaultExpanded, className, }: CodeViewProps): React__default.JSX.Element;
declare namespace CodeView {
    var displayName: string;
}

/**
 * StateArchitectBoard Organism
 *
 * Contains ALL game logic for the State Architect tier (ages 13+).
 * Kids design state machines via a visual graph editor, then run
 * them to see if the behavior matches the puzzle goal.
 *
 * @packageDocumentation
 */

interface StateArchitectTransition {
    id: string;
    from: string;
    to: string;
    event: string;
    guardHint?: string;
}
interface TestCase {
    /** Sequence of events to fire */
    events: string[];
    /** Expected final state */
    expectedState: string;
    /** Description */
    label: string;
}
interface StateArchitectPuzzleEntity {
    id: string;
    title: string;
    description: string;
    hint: string;
    /** Entity being designed */
    entityName: string;
    /** Variables with initial values */
    variables: VariableDef[];
    /** States provided (kid may need to add more) */
    states: string[];
    /** Initial state */
    initialState: string;
    /** Pre-existing transitions (puzzle may have some already) */
    transitions: StateArchitectTransition[];
    /** Events available to use */
    availableEvents: string[];
    /** States available to add */
    availableStates?: string[];
    /** Test cases to validate against */
    testCases: TestCase[];
    /** Show code view toggle */
    showCodeView?: boolean;
    /** Feedback */
    successMessage?: string;
    failMessage?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface StateArchitectBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    /** Puzzle data */
    entity: StateArchitectPuzzleEntity;
    /** Playback speed */
    stepDurationMs?: number;
    /** Emits UI:{testEvent} */
    testEvent?: string;
    /** Emits UI:{completeEvent} with { success, passedTests } */
    completeEvent?: string;
}
declare function StateArchitectBoard({ entity, stepDurationMs, testEvent, completeEvent, className, }: StateArchitectBoardProps): React__default.JSX.Element;
declare namespace StateArchitectBoard {
    var displayName: string;
}

/**
 * SimulatorBoard
 *
 * Parameter-slider game board. The player adjusts parameters
 * and observes real-time output. Correct parameter values
 * must bring the output within a target range to win.
 *
 * Good for: physics, economics, system design stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

interface SimulatorParameter {
    id: string;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    initial: number;
    correct: number;
    tolerance: number;
}
interface SimulatorPuzzleEntity {
    id: string;
    title: string;
    description: string;
    parameters: SimulatorParameter[];
    outputLabel: string;
    outputUnit: string;
    /** Pure function body as string: receives params object, returns number */
    computeExpression: string;
    targetValue: number;
    targetTolerance: number;
    successMessage?: string;
    failMessage?: string;
    hint?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface SimulatorBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    entity: SimulatorPuzzleEntity;
    completeEvent?: string;
}
declare function SimulatorBoard({ entity, completeEvent, className, }: SimulatorBoardProps): React__default.JSX.Element;
declare namespace SimulatorBoard {
    var displayName: string;
}

/**
 * ClassifierBoard
 *
 * Drag-and-drop classification game. The player sorts items
 * into the correct category buckets. All items must be correctly
 * classified to win.
 *
 * Good for: taxonomy, pattern recognition, sorting stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

interface ClassifierItem {
    id: string;
    label: string;
    description?: string;
    correctCategory: string;
}
interface ClassifierCategory {
    id: string;
    label: string;
    color?: string;
}
interface ClassifierPuzzleEntity {
    id: string;
    title: string;
    description: string;
    items: ClassifierItem[];
    categories: ClassifierCategory[];
    successMessage?: string;
    failMessage?: string;
    hint?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface ClassifierBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    entity: ClassifierPuzzleEntity;
    completeEvent?: string;
}
declare function ClassifierBoard({ entity, completeEvent, className, }: ClassifierBoardProps): React__default.JSX.Element;
declare namespace ClassifierBoard {
    var displayName: string;
}

/**
 * BuilderBoard
 *
 * Component-snapping game board. The player places components
 * onto slots in a blueprint. Correct placement completes the build.
 *
 * Good for: architecture, circuits, molecules, system design stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

interface BuilderComponent {
    id: string;
    label: string;
    description?: string;
    iconEmoji?: string;
    /** Image URL icon (takes precedence over iconEmoji) */
    iconUrl?: string;
    category?: string;
}
interface BuilderSlot {
    id: string;
    label: string;
    description?: string;
    acceptsComponentId: string;
}
interface BuilderPuzzleEntity {
    id: string;
    title: string;
    description: string;
    components: BuilderComponent[];
    slots: BuilderSlot[];
    successMessage?: string;
    failMessage?: string;
    hint?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface BuilderBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    entity: BuilderPuzzleEntity;
    completeEvent?: string;
}
declare function BuilderBoard({ entity, completeEvent, className, }: BuilderBoardProps): React__default.JSX.Element;
declare namespace BuilderBoard {
    var displayName: string;
}

/**
 * DebuggerBoard
 *
 * Error-finding game board. The player reviews a code/system
 * listing and identifies lines or elements that contain bugs.
 *
 * Good for: programming, logic, troubleshooting stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

interface DebuggerLine {
    id: string;
    content: string;
    isBug: boolean;
    explanation?: string;
}
interface DebuggerPuzzleEntity {
    id: string;
    title: string;
    description: string;
    language?: string;
    lines: DebuggerLine[];
    /** How many bugs the player should find */
    bugCount: number;
    successMessage?: string;
    failMessage?: string;
    hint?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface DebuggerBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    entity: DebuggerPuzzleEntity;
    completeEvent?: string;
}
declare function DebuggerBoard({ entity, completeEvent, className, }: DebuggerBoardProps): React__default.JSX.Element;
declare namespace DebuggerBoard {
    var displayName: string;
}

/**
 * NegotiatorBoard
 *
 * Turn-based decision matrix game. The player makes choices
 * over multiple rounds against an AI opponent. Each round
 * both sides pick an action, and payoffs are determined by
 * the combination.
 *
 * Good for: ethics, business, game theory, economics stories.
 *
 * Events emitted via completeEvent (default UI:PUZZLE_COMPLETE).
 */

interface NegotiatorAction {
    id: string;
    label: string;
    description?: string;
}
interface PayoffEntry {
    playerAction: string;
    opponentAction: string;
    playerPayoff: number;
    opponentPayoff: number;
}
interface NegotiatorPuzzleEntity {
    id: string;
    title: string;
    description: string;
    actions: NegotiatorAction[];
    payoffMatrix: PayoffEntry[];
    totalRounds: number;
    /** AI strategy: 'tit-for-tat' | 'always-cooperate' | 'always-defect' | 'random' */
    opponentStrategy: string;
    targetScore: number;
    successMessage?: string;
    failMessage?: string;
    hint?: string;
    /** Header image URL displayed above the title */
    headerImage?: string;
    /** Visual theme overrides */
    theme?: {
        background?: string;
        accentColor?: string;
    };
}
interface NegotiatorBoardProps extends Omit<EntityDisplayProps, 'entity'> {
    entity: NegotiatorPuzzleEntity;
    completeEvent?: string;
}
declare function NegotiatorBoard({ entity, completeEvent, className, }: NegotiatorBoardProps): React__default.JSX.Element;
declare namespace NegotiatorBoard {
    var displayName: string;
}

/**
 * Physics Preset Types
 *
 * Configuration for physics simulation presets.
 */
interface PhysicsBody {
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    mass: number;
    radius: number;
    color: string;
    fixed: boolean;
}
interface PhysicsConstraint {
    bodyA: number;
    bodyB: number;
    length: number;
    stiffness: number;
}
interface PhysicsPreset {
    id: string;
    name: string;
    description: string;
    domain: string;
    gravity?: {
        x: number;
        y: number;
    };
    bodies: PhysicsBody[];
    constraints?: PhysicsConstraint[];
    backgroundColor?: string;
    showVelocity?: boolean;
    parameters: Record<string, {
        value: number;
        min: number;
        max: number;
        step: number;
        label: string;
    }>;
}

/**
 * SimulationCanvas
 *
 * Self-contained 2D physics canvas for educational presets.
 * Runs its own Euler integration loop — no external physics hook needed.
 */

interface SimulationCanvasProps {
    preset: PhysicsPreset;
    width?: number;
    height?: number;
    running: boolean;
    speed?: number;
    className?: string;
}
declare function SimulationCanvas({ preset, width, height, running, speed, className, }: SimulationCanvasProps): React__default.JSX.Element;
declare namespace SimulationCanvas {
    var displayName: string;
}

/**
 * SimulationControls
 *
 * Play/pause/step/reset controls with speed and parameter sliders.
 */

interface SimulationControlsProps {
    running: boolean;
    speed: number;
    parameters: Record<string, {
        value: number;
        min: number;
        max: number;
        step: number;
        label: string;
    }>;
    onPlay: () => void;
    onPause: () => void;
    onStep: () => void;
    onReset: () => void;
    onSpeedChange: (speed: number) => void;
    onParameterChange: (name: string, value: number) => void;
    className?: string;
}
declare function SimulationControls({ running, speed, parameters, onPlay, onPause, onStep, onReset, onSpeedChange, onParameterChange, className, }: SimulationControlsProps): React__default.JSX.Element;
declare namespace SimulationControls {
    var displayName: string;
}

/**
 * SimulationGraph
 *
 * Real-time measurement graph for physics simulations.
 * Renders measurement data as a simple line chart on canvas.
 */

interface MeasurementPoint {
    time: number;
    value: number;
}
interface SimulationGraphProps {
    label: string;
    unit: string;
    data: MeasurementPoint[];
    maxPoints?: number;
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}
declare function SimulationGraph({ label, unit, data, maxPoints, width, height, color, className, }: SimulationGraphProps): React__default.JSX.Element;
declare namespace SimulationGraph {
    var displayName: string;
}

declare const projectileMotion: PhysicsPreset;
declare const pendulum: PhysicsPreset;
declare const springOscillator: PhysicsPreset;

declare const ALL_PRESETS: PhysicsPreset[];

/**
 * CombatLog Component
 *
 * Scrollable log of combat events with icons and colors.
 * Generalized from Trait Wars — removed asset manifest coupling.
 */

type CombatLogEventType = 'attack' | 'defend' | 'heal' | 'move' | 'special' | 'death' | 'spawn';
interface CombatEvent {
    id: string;
    type: CombatLogEventType;
    message: string;
    timestamp: number;
    actorName?: string;
    targetName?: string;
    value?: number;
    turn?: number;
}
interface CombatLogProps {
    events: CombatEvent[];
    maxVisible?: number;
    autoScroll?: boolean;
    showTimestamps?: boolean;
    title?: string;
    className?: string;
}
declare function CombatLog({ events, maxVisible, autoScroll, showTimestamps, className, title, }: CombatLogProps): React__default.JSX.Element;
declare namespace CombatLog {
    var displayName: string;
}

/**
 * Game Types — Generalized
 *
 * Core type definitions for tactical game state.
 * Extracted from Trait Wars and generalized for any game project.
 */
interface Position {
    x: number;
    y: number;
}
interface GameUnit {
    id: string;
    name: string;
    characterType: string;
    team: 'player' | 'enemy';
    position: Position;
    health: number;
    maxHealth: number;
    movement: number;
    attack: number;
    defense: number;
    traits: UnitTrait[];
}
interface UnitTrait {
    name: string;
    currentState: string;
    states: string[];
    cooldown: number;
}
interface BoardTile {
    terrain: string;
    unitId?: string;
    isBlocked?: boolean;
}
type GamePhase = 'observation' | 'planning' | 'execution' | 'tick';
interface GameState {
    board: BoardTile[][];
    units: Record<string, GameUnit>;
    currentPhase: GamePhase;
    currentTurn: number;
    activeTeam: 'player' | 'enemy';
    selectedUnitId?: string;
    validMoves: Position[];
    attackTargets: Position[];
}
type GameAction = {
    type: 'SELECT_UNIT';
    unitId: string;
} | {
    type: 'MOVE_UNIT';
    from: Position;
    to: Position;
} | {
    type: 'ATTACK';
    attackerId: string;
    targetId: string;
} | {
    type: 'END_TURN';
} | {
    type: 'EXECUTE_TRAITS';
};
declare function createInitialGameState(width: number, height: number, units: GameUnit[], defaultTerrain?: string): GameState;
declare function calculateValidMoves(state: GameState, unitId: string): Position[];
declare function calculateAttackTargets(state: GameState, unitId: string): Position[];

/**
 * Combat Effects Utility
 *
 * CSS animation utilities and effect triggers for combat visualization.
 * Extracted from Trait Wars design-system.
 */
declare const combatAnimations: {
    shake: string;
    flash: string;
    pulseRed: string;
    healGlow: string;
};
declare const combatClasses: {
    shake: string;
    flash: string;
    pulseRed: string;
    healGlow: string;
    hit: string;
    defend: string;
    critical: string;
};
interface CombatEffect {
    className: string;
    duration: number;
    sound?: string;
}
declare const combatEffects: Record<string, CombatEffect>;
declare function applyTemporaryEffect(element: HTMLElement, effect: CombatEffect, onComplete?: () => void): void;
interface DamageResult {
    baseDamage: number;
    finalDamage: number;
    isCritical: boolean;
    isBlocked: boolean;
    damageReduction: number;
}
declare function calculateDamage(attack: number, defense: number, isDefending?: boolean, criticalChance?: number): DamageResult;
type CombatEventType = 'attack' | 'critical' | 'defend' | 'heal' | 'defeat' | 'level_up' | 'state_change';
interface CombatEventData {
    type: CombatEventType;
    sourceId: string;
    targetId?: string;
    value?: number;
    message: string;
}
declare function generateCombatMessage(event: CombatEventData): string;

/**
 * UISlotRenderer Component
 *
 * Renders all UI slots. This is the central component that displays
 * content rendered by traits via render_ui effects.
 *
 * Slots are rendered as:
 * - Layout slots: Inline in the page flow (main, sidebar)
 * - Portal slots: Rendered via portals (modal, drawer, toast, etc.)
 * - HUD slots: Fixed position overlays (hud-top, hud-bottom)
 *
 * @packageDocumentation
 */

interface SuspenseConfig {
    /** Enable Suspense boundaries around slot content */
    enabled: boolean;
    /** Custom fallback per slot, overrides default Skeleton variant */
    slotFallbacks?: Partial<Record<UISlot, React__default.ReactNode>>;
}
interface UISlotComponentProps {
    slot: UISlot;
    portal?: boolean;
    position?: "left" | "right" | "top-right" | "top-left" | "bottom-right" | "bottom-left";
    className?: string;
    draggable?: boolean;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}
/**
 * Individual slot renderer.
 *
 * Handles different slot types with appropriate wrappers.
 */
declare function UISlotComponent({ slot, portal, position, className, }: UISlotComponentProps): React__default.ReactElement | null;
interface SlotContentRendererProps {
    content: SlotContent;
    onDismiss: () => void;
    className?: string;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}
/**
 * Renders the actual content of a slot.
 *
 * Dynamically renders pattern components from the registry.
 * For layout patterns with `hasChildren`, recursively renders nested patterns.
 */
declare function SlotContentRenderer({ content, onDismiss, }: SlotContentRendererProps): React__default.ReactElement;
interface UISlotRendererProps {
    /** Include HUD slots */
    includeHud?: boolean;
    /** Include floating slot */
    includeFloating?: boolean;
    /** Additional class name for the container */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /**
     * Enable Suspense boundaries around each slot.
     * When true, each inline slot is wrapped in `<ErrorBoundary><Suspense>` with
     * Skeleton fallbacks. Opt-in — existing isLoading prop pattern still works.
     */
    suspense?: boolean | SuspenseConfig;
}
/**
 * Main UI Slot Renderer component.
 *
 * Renders all slot containers. Place this in your page/layout component.
 *
 * @example
 * ```tsx
 * function PageLayout() {
 *   return (
 *     <div className="page-layout">
 *       <UISlotRenderer />
 *     </div>
 *   );
 * }
 * ```
 */
declare function UISlotRenderer({ includeHud, includeFloating, className, suspense, }: UISlotRendererProps): React__default.ReactElement;
declare namespace UISlotRenderer {
    var displayName: string;
}

/**
 * ModalSlot Component
 *
 * Wraps modal slot content in a proper Modal component.
 * Used by trait-driven pages to display modal UI from render_ui effects.
 *
 * Handles:
 * - Auto-open when content is present
 * - Dispatches CLOSE/CANCEL events when closed
 * - Extracts title from Form components
 */

interface ModalSlotProps {
    /** Content to display in the modal */
    children?: React__default.ReactNode;
    /** Override modal title (extracted from children if not provided) */
    title?: string;
    /** Modal size */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Custom class name */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * ModalSlot - Wrapper for modal slot content
 *
 * Automatically shows modal when children are present,
 * and dispatches close events when modal is dismissed.
 */
declare const ModalSlot: React__default.FC<ModalSlotProps>;

/**
 * DrawerSlot Component
 *
 * Wraps drawer slot content in a proper Drawer component.
 * Used by trait-driven pages to display drawer UI from render_ui effects.
 *
 * Handles:
 * - Auto-open when content is present
 * - Dispatches CLOSE/CANCEL events when closed
 * - Extracts title from Form or DetailPanel components
 * - Configurable position and size
 */

interface DrawerSlotProps {
    /** Content to display in the drawer */
    children?: React__default.ReactNode;
    /** Override drawer title (extracted from children if not provided) */
    title?: string;
    /** Drawer position */
    position?: DrawerPosition;
    /** Drawer size */
    size?: DrawerSize;
    /** Custom class name */
    className?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * DrawerSlot - Wrapper for drawer slot content
 *
 * Automatically shows drawer when children are present,
 * and dispatches close events when drawer is dismissed.
 */
declare const DrawerSlot: React__default.FC<DrawerSlotProps>;

/**
 * ToastSlot Component
 *
 * Wraps toast slot content in a proper Toast component with positioning.
 * Used by trait-driven pages to display toast UI from render_ui effects.
 *
 * Handles:
 * - Auto-show when content is present
 * - Dispatches DISMISS event when dismissed
 * - Fixed positioning in corner of screen
 */

interface ToastSlotProps {
    /** Content to display in the toast (message or ReactNode) */
    children?: React__default.ReactNode;
    /** Toast variant */
    variant?: ToastVariant;
    /** Toast title */
    title?: string;
    /** Auto-dismiss duration in ms (0 = no auto-dismiss) */
    duration?: number;
    /** Custom class name */
    className?: string;
    /** Loading state indicator */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
}
/**
 * ToastSlot - Wrapper for toast slot content
 *
 * Automatically shows toast when children are present,
 * and dispatches dismiss events when toast is dismissed.
 */
declare const ToastSlot: React__default.FC<ToastSlotProps>;

/**
 * Chart Organism Component
 *
 * A data visualization component supporting bar, line, pie, and area chart types.
 * Composes atoms and molecules for layout, uses CSS variables for theming.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

type ChartType = "bar" | "line" | "pie" | "area" | "donut";
interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}
interface ChartSeries {
    name: string;
    data: readonly ChartDataPoint[];
    color?: string;
}
interface ChartAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
interface ChartProps {
    /** Chart title */
    title?: string;
    /** Chart subtitle / description */
    subtitle?: string;
    /** Chart type */
    chartType?: ChartType;
    /** Data series */
    series?: readonly ChartSeries[];
    /** Simple data (single series shorthand) */
    data?: readonly ChartDataPoint[];
    /** Chart height in px */
    height?: number;
    /** Show legend */
    showLegend?: boolean;
    /** Show values on chart */
    showValues?: boolean;
    /** Actions for chart interactions */
    actions?: readonly ChartAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const Chart: React__default.FC<ChartProps>;

/**
 * Meter Organism Component
 *
 * A gauge/meter component for displaying a value within a range.
 * Supports linear, radial, and segmented display modes.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

type MeterVariant = "linear" | "radial" | "segmented";
interface MeterThreshold {
    value: number;
    color: string;
    label?: string;
}
interface MeterAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
interface MeterProps {
    /** Current value */
    value: number;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Display label */
    label?: string;
    /** Unit suffix (e.g., '%', 'MB', 'credits') */
    unit?: string;
    /** Display variant */
    variant?: MeterVariant;
    /** Color thresholds */
    thresholds?: readonly MeterThreshold[];
    /** Number of segments (for segmented variant) */
    segments?: number;
    /** Show value text */
    showValue?: boolean;
    /** Size (for radial variant) */
    size?: "sm" | "md" | "lg";
    /** Actions */
    actions?: readonly MeterAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const Meter: React__default.FC<MeterProps>;

/**
 * Timeline Organism Component
 *
 * A vertical timeline component for displaying chronological events.
 * Composes atoms and molecules for layout, uses CSS variables for theming.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

type TimelineItemStatus = "complete" | "active" | "pending" | "error";
interface TimelineItem {
    /** Unique identifier */
    id: string;
    /** Item title */
    title: string;
    /** Item description */
    description?: string;
    /** Timestamp string */
    date?: string;
    /** Status indicator */
    status?: TimelineItemStatus;
    /** Icon override */
    icon?: LucideIcon;
    /** Additional metadata tags */
    tags?: readonly string[];
}
interface TimelineAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
interface TimelineProps {
    /** Timeline title */
    title?: string;
    /** Timeline items */
    items?: readonly TimelineItem[];
    /** Schema-driven data */
    data?: readonly Record<string, unknown>[];
    /** Fields to display */
    fields?: readonly string[];
    /** Actions per item */
    itemActions?: readonly TimelineAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const Timeline: React__default.FC<TimelineProps>;

/**
 * MediaGallery Organism Component
 *
 * A gallery component for displaying images and media in a grid layout.
 * Supports lightbox viewing, selection, and upload interactions.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

interface MediaItem {
    /** Unique identifier */
    id: string;
    /** Media URL */
    src: string;
    /** Alt text */
    alt?: string;
    /** Thumbnail URL (defaults to src) */
    thumbnail?: string;
    /** Media type */
    mediaType?: "image" | "video";
    /** Caption */
    caption?: string;
    /** File size */
    fileSize?: string;
}
interface MediaGalleryAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
interface MediaGalleryProps {
    /** Gallery title */
    title?: string;
    /** Media items */
    items?: readonly MediaItem[];
    /** Schema-driven data */
    data?: readonly Record<string, unknown>[];
    /** Column count */
    columns?: 2 | 3 | 4 | 5 | 6;
    /** Enable item selection */
    selectable?: boolean;
    /** Selected item IDs */
    selectedItems?: readonly string[];
    /** Selection change callback */
    onSelectionChange?: (ids: string[]) => void;
    /** Show upload button */
    showUpload?: boolean;
    /** Actions */
    actions?: readonly MediaGalleryAction[];
    /** Aspect ratio for thumbnails */
    aspectRatio?: "square" | "landscape" | "portrait";
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const MediaGallery: React__default.FC<MediaGalleryProps>;

/**
 * SignaturePad Organism Component
 *
 * A canvas-based signature capture pad.
 * Uses a minimal canvas wrapper (necessary for drawing) but composes all
 * surrounding UI with atoms and molecules.
 *
 * Orbital Component Interface Compliance:
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

interface SignaturePadProps {
    /** Label above the pad */
    label?: string;
    /** Helper text */
    helperText?: string;
    /** Stroke color */
    strokeColor?: string;
    /** Stroke width */
    strokeWidth?: number;
    /** Pad height */
    height?: number;
    /** Whether the pad is read-only */
    readOnly?: boolean;
    /** Existing signature image URL */
    value?: string;
    /** Callback when signature changes */
    onChange?: (dataUrl: string | null) => void;
    /** Event to emit on sign */
    signEvent?: string;
    /** Event to emit on clear */
    clearEvent?: string;
    /** Entity name for schema-driven context */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const SignaturePad: React__default.FC<SignaturePadProps>;

/**
 * DocumentViewer Organism Component
 *
 * A document viewer for displaying PDFs, documents, and rich text content.
 * Uses iframe for PDF rendering (necessary) and atoms for all surrounding UI.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

type DocumentType = "pdf" | "text" | "html" | "markdown";
interface DocumentAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
interface DocumentViewerProps {
    /** Document title */
    title?: string;
    /** Document URL (for PDF/external documents) */
    src?: string;
    /** Document content (for text/html/markdown) */
    content?: string;
    /** Document type */
    documentType?: DocumentType;
    /** Current page (for multi-page documents) */
    currentPage?: number;
    /** Total pages */
    totalPages?: number;
    /** Viewer height */
    height?: number | string;
    /** Show toolbar */
    showToolbar?: boolean;
    /** Show download button */
    showDownload?: boolean;
    /** Show print button */
    showPrint?: boolean;
    /** Actions */
    actions?: readonly DocumentAction[];
    /** Multiple documents (tabbed view) */
    documents?: readonly {
        label: string;
        src?: string;
        content?: string;
        documentType?: DocumentType;
    }[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const DocumentViewer: React__default.FC<DocumentViewerProps>;

/**
 * GraphCanvas Organism Component
 *
 * A force-directed graph visualization component for node-link data.
 * Uses canvas (necessary for performant graph rendering) with atom wrappers.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

interface GraphNode {
    id: string;
    label?: string;
    group?: string;
    color?: string;
    size?: number;
    /** Position (optional, computed if missing) */
    x?: number;
    y?: number;
}
interface GraphEdge {
    source: string;
    target: string;
    label?: string;
    weight?: number;
    color?: string;
}
interface GraphAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
interface GraphCanvasProps {
    /** Graph title */
    title?: string;
    /** Graph nodes */
    nodes?: readonly GraphNode[];
    /** Graph edges */
    edges?: readonly GraphEdge[];
    /** Canvas height */
    height?: number;
    /** Show node labels */
    showLabels?: boolean;
    /** Enable zoom/pan */
    interactive?: boolean;
    /** Enable node dragging */
    draggable?: boolean;
    /** Actions */
    actions?: readonly GraphAction[];
    /** On node click */
    onNodeClick?: (node: GraphNode) => void;
    /** Node click event */
    nodeClickEvent?: string;
    /** Layout algorithm */
    layout?: "force" | "circular" | "grid";
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const GraphCanvas: React__default.FC<GraphCanvasProps>;

/**
 * CodeViewer Organism Component
 *
 * A code/diff viewer with syntax highlighting and line numbers.
 * Composes atoms and molecules for layout. Uses pre/code elements
 * which are semantically necessary for code display.
 *
 * Orbital Component Interface Compliance:
 * - Entity binding with auto-fetch when entity is a string
 * - Event emission via useEventBus (UI:* events)
 * - isLoading and error state props
 * - className for external styling
 */

type CodeViewerMode = "code" | "diff";
interface DiffLine {
    type: "add" | "remove" | "context";
    content: string;
    lineNumber?: number;
}
interface CodeViewerAction {
    label: string;
    event?: string;
    navigatesTo?: string;
    variant?: "primary" | "secondary" | "ghost";
}
interface CodeViewerProps {
    /** Viewer title */
    title?: string;
    /** Code content */
    code?: string;
    /** Language for display label */
    language?: string;
    /** Diff lines (for diff mode) */
    diff?: readonly DiffLine[];
    /** Old value (for generating diff) */
    oldValue?: string;
    /** New value (for generating diff) */
    newValue?: string;
    /** Display mode */
    mode?: CodeViewerMode;
    /** Show line numbers */
    showLineNumbers?: boolean;
    /** Show copy button */
    showCopy?: boolean;
    /** Enable word wrap */
    wordWrap?: boolean;
    /** Max height before scrolling */
    maxHeight?: number | string;
    /** Multiple files (tabbed view) */
    files?: readonly {
        label: string;
        code: string;
        language?: string;
    }[];
    /** Actions */
    actions?: readonly CodeViewerAction[];
    /** Entity name for schema-driven auto-fetch */
    entity?: string;
    /** Loading state */
    isLoading?: boolean;
    /** Error state */
    error?: Error | null;
    /** Additional CSS classes */
    className?: string;
}
declare const CodeViewer: React__default.FC<CodeViewerProps>;

/**
 * Base template types for Almadar UI.
 *
 * All templates MUST extend `TemplateProps<E>` to enforce entity-only data flow
 * and JSON round-trip compatibility with the flattener pipeline.
 *
 * @see docs/Almadar_Templates.md
 */
/** Base props for all templates — enforces entity-only data flow. */
interface TemplateProps<E extends {
    id: string;
}> {
    /** Entity data — the sole source of runtime state */
    entity: E;
    /** External styling override */
    className?: string;
}

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: string | number;
    children?: NavItem[];
}
interface DashboardLayoutProps {
    /** App name shown in sidebar */
    appName?: string;
    /** Logo component or URL */
    logo?: React__default.ReactNode;
    /** Navigation items */
    navItems?: NavItem[];
    /** Current user info (optional - auto-populated from auth context if not provided) */
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    /** Header actions (notifications, etc.) */
    headerActions?: React__default.ReactNode;
    /** Show search in header */
    showSearch?: boolean;
    /** Custom sidebar footer */
    sidebarFooter?: React__default.ReactNode;
    /** Callback when user clicks sign out (optional - uses auth context signOut if not provided) */
    onSignOut?: () => void;
}
declare const DashboardLayout: React__default.FC<DashboardLayoutProps>;

interface AuthLayoutProps {
    /** App name */
    appName?: string;
    /** Logo component or URL */
    logo?: React__default.ReactNode;
    /** Background image URL */
    backgroundImage?: string;
    /** Show branding panel on the side */
    showBranding?: boolean;
    /** Branding panel content */
    brandingContent?: React__default.ReactNode;
}
declare const AuthLayout: React__default.FC<AuthLayoutProps>;

/**
 * CounterTemplate
 *
 * A presentational template for counter/incrementer features.
 * Supports increment, decrement, and reset operations.
 */

type CounterSize = "sm" | "md" | "lg";
type CounterVariant = "minimal" | "standard" | "full";
interface CounterEntity {
    /** Entity ID */
    id: string;
    /** Current count value */
    count: number;
    /** Whether decrement button is disabled */
    decrementDisabled?: boolean;
    /** Whether increment button is disabled */
    incrementDisabled?: boolean;
    /** Step label for decrement button (e.g. "-5") */
    decrementLabel?: string;
    /** Step label for increment button (e.g. "+5") */
    incrementLabel?: string;
    /** Formatted range text (e.g. "Range: 0 to 100") */
    rangeText?: string;
}
interface CounterTemplateProps extends TemplateProps<CounterEntity> {
    /** Called when increment is clicked */
    onIncrement?: () => void;
    /** Called when decrement is clicked */
    onDecrement?: () => void;
    /** Called when reset is clicked */
    onReset?: () => void;
    /** Title displayed above the counter */
    title?: string;
    /** Show reset button */
    showReset?: boolean;
    /** Counter display size */
    size?: CounterSize;
    /** Template variant */
    variant?: CounterVariant;
}
declare const CounterTemplate: React__default.FC<CounterTemplateProps>;

/**
 * GameTemplate
 *
 * A presentational template for game applications.
 * Includes a main game canvas/area, HUD overlay, and an optional debug sidebar.
 * **Atomic Design**: Composed using Box, Typography, and Layout molecules/atoms.
 */

interface GameEntity {
    id: string;
    title?: string;
}
interface GameTemplateProps extends TemplateProps<GameEntity> {
    /** Title of the game */
    title?: string;
    /** The main game canvas or content */
    children: React__default.ReactNode;
    /** HUD overlay content (scores, health, etc.) */
    hud?: React__default.ReactNode;
    /** Debug panel content */
    debugPanel?: React__default.ReactNode;
    /** Whether the debug panel is visible */
    showDebugPanel?: boolean;
    /** Game controls */
    controls?: {
        onPlay?: () => void;
        onPause?: () => void;
        onReset?: () => void;
        isPlaying?: boolean;
    };
    /** Additional class name */
    className?: string;
}
declare const GameTemplate: React__default.FC<GameTemplateProps>;

/**
 * GenericAppTemplate
 *
 * A simple, generic template for any application.
 * Includes a header with title and actions, and a main content area.
 * **Atomic Design**: Composed using Box, Typography, and Button atoms.
 */

interface GenericAppEntity {
    id: string;
    title?: string;
    subtitle?: string;
}
interface GenericAppTemplateProps extends TemplateProps<GenericAppEntity> {
    /** Page title */
    title: string;
    /** Subtitle or description */
    subtitle?: string;
    /** Main content */
    children: React__default.ReactNode;
    /** Header actions (buttons, links) */
    headerActions?: React__default.ReactNode;
    /** Footer content */
    footer?: React__default.ReactNode;
    /** Additional class name */
    className?: string;
}
declare const GenericAppTemplate: React__default.FC<GenericAppTemplateProps>;

/**
 * GameShell
 *
 * A full-screen layout wrapper for game applications.
 * Replaces DashboardLayout for game clients — no sidebar nav, just full-viewport
 * rendering with an optional HUD overlay bar.
 *
 * Used as a React Router layout route element:
 *   <Route element={<GameShell appName="TraitWars" />}>
 *     <Route index element={<WorldMapPage />} />
 *     ...
 *   </Route>
 *
 * @generated pattern — can be customised per-game via props
 */

interface GameShellProps {
    /** Application / game title shown in the HUD bar */
    appName?: string;
    /** Optional HUD content rendered above the main area */
    hud?: React__default.ReactNode;
    /** Extra class name on the root container */
    className?: string;
    /** Whether to show the minimal top bar (default: true) */
    showTopBar?: boolean;
}
/**
 * Full-viewport game shell layout.
 *
 * Renders child routes via `<Outlet />` inside a full-height flex container.
 * An optional top bar shows the game title and can host HUD widgets.
 */
declare const GameShell: React__default.FC<GameShellProps>;

/**
 * BattleTemplate
 *
 * Thin declarative wrapper around BattleBoard organism.
 * All game logic (turn phases, movement animation, combat, etc.) lives in BattleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

interface BattleTemplateProps extends TemplateProps<BattleEntity> {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
}
declare function BattleTemplate({ entity, scale, unitScale, className, }: BattleTemplateProps): React__default.JSX.Element;
declare namespace BattleTemplate {
    var displayName: string;
}

/**
 * CastleTemplate
 *
 * Thin declarative wrapper around CastleBoard organism.
 * All game logic (hover state, feature selection, etc.) lives in CastleBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

interface CastleTemplateProps extends TemplateProps<CastleEntity> {
    /** Canvas render scale */
    scale?: number;
}
declare function CastleTemplate({ entity, scale, className, }: CastleTemplateProps): React__default.JSX.Element;
declare namespace CastleTemplate {
    var displayName: string;
}

/**
 * WorldMapTemplate
 *
 * Thin declarative wrapper around WorldMapBoard organism.
 * All game logic (hero movement, encounters, hex conversion, etc.) lives in WorldMapBoard.
 *
 * Compliant with Almadar_Templates.md: no hooks, no callbacks, entity-only data flow.
 *
 * @packageDocumentation
 */

interface WorldMapTemplateProps extends TemplateProps<WorldMapEntity> {
    /** Canvas render scale */
    scale?: number;
    /** Unit draw-size multiplier */
    unitScale?: number;
    /** Override for the diamond-top Y offset within tile sprites (default: 374). */
    diamondTopY?: number;
    /** Allow selecting / moving ALL heroes (including enemy). For testing. */
    allowMoveAllHeroes?: boolean;
}
declare function WorldMapTemplate({ entity, scale, unitScale, diamondTopY, allowMoveAllHeroes, className, }: WorldMapTemplateProps): React__default.JSX.Element;
declare namespace WorldMapTemplate {
    var displayName: string;
}

export { ALL_PRESETS, AR_BOOK_FIELDS, Accordion, type AccordionItem, type AccordionProps, Card as ActionCard, type CardProps as ActionCardProps, ActionPalette, type ActionPaletteProps, ActionTile, type ActionTileProps, Alert, type AlertProps, type AlertVariant, type AnimationDef, type AnimationName, type AudioManifest, AuthLayout, type AuthLayoutProps, Avatar, type AvatarProps, type AvatarSize, type AvatarStatus, Badge, type BadgeProps, type BadgeVariant, BattleBoard, type BattleBoardProps, type BattleEntity, type BattlePhase, type BattleSlotContext, type BattleStateCallbacks, type BattleStateEventConfig, type BattleStateResult, BattleTemplate, type BattleTemplateProps, type BattleTile, type BattleUnit, type BoardTile, type BookChapter, BookChapterView, type BookChapterViewProps, BookCoverPage, type BookCoverPageProps, type BookData, type BookFieldMap, BookNavBar, type BookNavBarProps, type BookPart, BookTableOfContents, type BookTableOfContentsProps, BookViewer, type BookViewerProps, Box, type BoxBg, type BoxMargin, type BoxPadding, type BoxProps, type BoxRounded, type BoxShadow, Breadcrumb, type BreadcrumbItem, type BreadcrumbProps, BuilderBoard, type BuilderBoardProps, type BuilderComponent, type BuilderPuzzleEntity, type BuilderSlot, Button, ButtonGroup, type ButtonGroupProps, type ButtonProps, CameraState, CanvasEffect, type CanvasEffectProps, Card$1 as Card, type CardAction, CardBody, CardContent, CardFooter, CardGrid, type CardGridGap, type CardGridProps, CardHeader, type CardProps$1 as CardProps, CardTitle, CastleBoard, type CastleBoardProps, type CastleEntity, type CastleSlotContext, CastleTemplate, type CastleTemplateProps, Center, type CenterProps, Chart, type ChartDataPoint, type ChartProps, type ChartSeries, type ChartType, Checkbox, type CheckboxProps, ClassifierBoard, type ClassifierBoardProps, type ClassifierCategory, type ClassifierItem, type ClassifierPuzzleEntity, CodeBlock, type CodeBlockProps, CodeView, type CodeViewProps, CodeViewer, type CodeViewerMode, type CodeViewerProps, CollapsibleSection, type CollapsibleSectionProps, type Column, type CombatActionType, type CombatEffect, type CombatEvent, type CombatEventData, type CombatEventType, CombatLog, type CombatLogEventType, type CombatLogProps, type ConditionalContext, ConditionalWrapper, type ConditionalWrapperProps, ConfirmDialog, type ConfirmDialogProps, type ConfirmDialogVariant, Container, type ContainerProps, ContentRenderer, type ContentRendererProps, ControlButton, type ControlButtonProps, type CounterSize, CounterTemplate, type CounterTemplateProps, type CounterVariant, DIAMOND_TOP_Y, type DamageResult, DashboardGrid, type DashboardGridCell, type DashboardGridProps, DashboardLayout, type DashboardLayoutProps, DataTable, type DataTableProps, DebuggerBoard, type DebuggerBoardProps, type DebuggerLine, type DebuggerPuzzleEntity, type DetailField, DetailPanel, type DetailPanelProps, type DetailSection, DialogueBox, type DialogueBoxProps, type DialogueChoice, type DialogueNode, type DiffLine, Divider, type DividerOrientation, type DividerProps, type DocumentType, DocumentViewer, type DocumentViewerProps, StateMachineView as DomStateMachineVisualizer, Drawer, type DrawerPosition, type DrawerProps, type DrawerSize, DrawerSlot, type DrawerSlotProps, EditorCheckbox, type EditorCheckboxProps, type EditorMode, EditorSelect, type EditorSelectProps, EditorSlider, type EditorSliderProps, EditorTextInput, type EditorTextInputProps, EditorToolbar, type EditorToolbarProps, EmptyState, type EmptyStateProps, EntityDisplayEvents, type EntityDisplayProps, ErrorBoundary, type ErrorBoundaryProps, ErrorState, type ErrorStateProps, EventBusContextType, EventHandlerBoard, type EventHandlerBoardProps, type EventHandlerPuzzleEntity, EventLog, type EventLogEntry, type EventLogProps, FEATURE_COLORS, FEATURE_TYPES, FLOOR_HEIGHT, type FacingDirection, type FilterDefinition, FilterGroup, type FilterGroupProps, type FilterPayload, Flex, type FlexProps, FloatingActionButton, type FloatingActionButtonProps, Form, FormActions, type FormActionsProps, FormField, type FormFieldProps, FormLayout, type FormLayoutProps, type FormProps, FormSection$1 as FormSection, FormSectionHeader, type FormSectionHeaderProps, type FormSectionProps, type FrameDimsResolver, type GameAction, GameAudioContext, type GameAudioContextValue, type GameAudioControls, GameAudioProvider, type GameAudioProviderProps, GameAudioToggle, type GameAudioToggleProps, GameHud, type GameHudElement, type GameHudProps, type GameHudStat, GameMenu, type GameMenuProps, type GameOverAction, GameOverScreen, type GameOverScreenProps, type GameOverStat, type GamePhase, GameShell, type GameShellProps, type GameState, GameTemplate, type GameTemplateProps, type GameUnit, GenericAppTemplate, type GenericAppTemplateProps, GraphCanvas, type GraphCanvasProps, type GraphEdge, type GraphNode, Grid, type GridProps, HStack, type HStackProps, Header, type HeaderProps, Heading, type HeadingProps, HealthBar, type HealthBarProps, type HighlightType, IDENTITY_BOOK_FIELDS, Icon, type IconAnimation, type IconProps, type IconSize, Input, InputGroup, type InputGroupProps, type InputProps, type InventoryItem, InventoryPanel, type InventoryPanelProps, IsometricCanvas, type IsometricCanvasProps, IsometricFeature, IsometricTile, IsometricUnit, JazariStateMachine, type JazariStateMachineProps, Label, type LabelProps, type LawReference, LawReferenceTooltip, type LawReferenceTooltipProps, List, type ListItem, type ListProps, LoadingState, type LoadingStateProps, type MapHero, type MapHex, MarkdownContent, type MarkdownContentProps, MasterDetail, type MasterDetailProps, type MeasurementPoint, MediaGallery, type MediaGalleryProps, type MediaItem, Menu, type MenuItem, type MenuOption, type MenuProps, Meter, type MeterProps, type MeterThreshold, type MeterVariant, Modal, type ModalProps, type ModalSize, ModalSlot, type ModalSlotProps, type NavItem, Navigation, type NavigationItem, type NavigationProps, type NegotiatorAction, NegotiatorBoard, type NegotiatorBoardProps, type NegotiatorPuzzleEntity, ObjectRulePanel, type ObjectRulePanelProps, StateMachineView as OrbitalStateMachineView, OrbitalVisualization, type OrbitalVisualizationProps, Overlay, type OverlayProps, type PageBreadcrumb, PageHeader, type PageHeaderProps, type PaginatePayload, Pagination, type PaginationProps, type PayoffEntry, type Physics2DState, type PhysicsBody, type PhysicsBounds, type PhysicsConfig, type PhysicsConstraint, PhysicsManager, type PhysicsPreset, Popover, type PopoverProps, type Position, ProgressBar, type ProgressBarColor, type ProgressBarProps, type ProgressBarVariant, type PuzzleObjectDef, QuizBlock, type QuizBlockProps, Radio, type RadioProps, type RelationOption, RelationSelect, type RelationSelectProps, RepeatableFormSection, type RepeatableFormSectionProps, type RepeatableItem, type ResolvedFrame, type RowAction, type RuleDefinition, RuleEditor, type RuleEditorProps, SHEET_COLUMNS, SPRITE_SHEET_LAYOUT, ScaledDiagram, type ScaledDiagramProps, ScoreDisplay, type ScoreDisplayProps, SearchInput, type SearchInputProps, type SearchPayload, Section, type SectionProps, Select, type SelectOption, type SelectPayload, type SelectProps, SequenceBar, type SequenceBarProps, SequencerBoard, type SequencerBoardProps, type SequencerPuzzleEntity, type SheetUrlResolver, SidePanel, type SidePanelProps, Sidebar, type SidebarItem, type SidebarProps, SignaturePad, type SignaturePadProps, SimpleGrid, type SimpleGridProps, SimulationCanvas, type SimulationCanvasProps, SimulationControls, type SimulationControlsProps, SimulationGraph, type SimulationGraphProps, SimulatorBoard, type SimulatorBoardProps, type SimulatorParameter, type SimulatorPuzzleEntity, Skeleton, type SkeletonProps, type SkeletonVariant, SlotContent, SlotContentRenderer, type SlotItemData, type SortDirection, type SortPayload, type SoundEntry, Spacer, type SpacerProps, type SpacerSize, Spinner, type SpinnerProps, Split, SplitPane, type SplitPaneProps, type SplitProps, Sprite, type SpriteDirection, type SpriteFrameDims, type SpriteProps, type SpriteSheetUrls, Stack, type StackAlign, type StackDirection, type StackGap, type StackJustify, type StackProps, StatCard, type StatCardProps, StateArchitectBoard, type StateArchitectBoardProps, type StateArchitectPuzzleEntity, type StateArchitectTransition, StateIndicator, type StateIndicatorProps, StateMachineView, type StateMachineViewProps, StateNode, type StateNodeProps, type StateStyle, StatusBar, type StatusBarProps, Switch, type SwitchProps, TERRAIN_COLORS, TILE_HEIGHT, TILE_WIDTH, type TabDefinition, type TabItem, TabbedContainer, type TabbedContainerProps, Table, type TableColumn, type TableProps, Tabs, type TabsProps, type TemplateProps, TerrainPalette, type TerrainPaletteProps, type TestCase, Text, TextHighlight, type TextHighlightProps, type TextProps, Textarea, type TextareaProps, ThemeSelector, ThemeToggle, type ThemeToggleProps, Timeline, type TimelineItem, type TimelineItemStatus, type TimelineProps, Toast, type ToastProps, ToastSlot, type ToastSlotProps, type ToastVariant, Tooltip, type TooltipProps, TraitSlot, type TraitSlotProps, type TraitStateMachineDefinition, TraitStateViewer, type TraitStateViewerProps, type TraitTransition, TransitionArrow, type TransitionArrowProps, type TransitionBundle, Typography, type TypographyProps, type TypographyVariant, UISlot, UISlotComponent, UISlotRenderer, type UISlotRendererProps, UncontrolledBattleBoard, type UncontrolledBattleBoardProps, type UnitAnimationState, type UnitTrait, type UseGameAudioOptions, type UsePhysics2DOptions, type UsePhysics2DReturn, type UseSpriteAnimationsOptions, type UseSpriteAnimationsResult, VStack, type VStackProps, type VariableDef, VariablePanel, type VariablePanelProps, ViolationAlert, type ViolationAlertProps, type ViolationRecord, WizardContainer, type WizardContainerProps, WizardNavigation, type WizardNavigationProps, WizardProgress, type WizardProgressProps, type WizardProgressStep, type WizardStep, WorldMapBoard, type WorldMapBoardProps, type WorldMapEntity, type WorldMapSlotContext, WorldMapTemplate, type WorldMapTemplateProps, applyTemporaryEffect, calculateAttackTargets, calculateDamage, calculateValidMoves, combatAnimations, combatClasses, combatEffects, createInitialGameState, createUnitAnimationState, drawSprite, generateCombatMessage, getCurrentFrame, inferDirection, isoToScreen, mapBookData, pendulum, projectileMotion, resolveFieldMap, resolveFrame, resolveSheetDirection, screenToIso, springOscillator, tickAnimationState, transitionAnimation, useBattleState, useCamera, useGameAudio, useGameAudioContext, useImageCache, usePhysics2D, useSpriteAnimations };
