'use client';
/**
 * Component Pattern Wrappers
 *
 * Pattern wrappers for atomic UI components that can be rendered via render_ui.
 * These bridge the shell's atomic components with the pattern system.
 *
 * Interactive components emit events via useEventBus for the closed circuit pattern.
 *
 * @packageDocumentation
 */

import React from 'react';
import type { EventKey, EventPayload } from '@almadar/core';
import { useEventBus } from '../../hooks/useEventBus';

// Shell component imports
import { Button, type ButtonVariant, type ButtonSize, type ButtonProps } from '../atoms/Button';
import { Badge, type BadgeVariant } from '../atoms/Badge';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { Checkbox } from '../atoms/Checkbox';
import { Radio } from '../atoms/Radio';
import { Label } from '../atoms/Label';
import { Spinner } from '../atoms/Spinner';
import { ProgressBar } from '../atoms/ProgressBar';
import { Card } from '../atoms/Card';
import { Box } from '../atoms/Box';
import { Typography, Heading } from '../atoms/Typography';
import { Alert, type AlertVariant } from '../molecules/Alert';
import { Tooltip } from '../molecules/Tooltip';
import { Popover } from '../molecules/Popover';
import { Menu } from '../molecules/Menu';
import { Accordion } from '../molecules/Accordion';
import { Container } from '../molecules/Container';
import { SimpleGrid } from '../molecules/SimpleGrid';
import { FloatingActionButton } from '../molecules/FloatingActionButton';
import { MapView, type MapViewProps } from '../molecules/MapView';

/**
 * Base closed circuit props required by all organism components.
 */
interface ClosedCircuitProps {
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  entity?: string;
}

// ============================================================================
// Interactive Components (emit events via closed circuit)
// ============================================================================

/**
 * Props for {@link ButtonPattern}. A thin pass-through over the Button
 * atom: accepts every Button prop plus wrapper-level aliases for the
 * `.orb` schema convention (`action`/`event`/`onClick` as string
 * event names, `iconPosition` for left/right icon placement).
 *
 * Anything not explicitly named is forwarded to `<Button>` via rest-spread,
 * so a future Button prop lands automatically without needing a wrapper
 * edit. This is the contract that fixes VG17: `action: EventKey` flows
 * through to Button, which owns both `UI:{action}` emit AND the
 * `data-testid="action-{NAME}"` attribute the verifier selects on.
 */
export interface ButtonPatternProps extends Omit<ButtonProps, 'onClick'>, ClosedCircuitProps {
  /** Legacy alias for {@link ButtonProps.action} (string event name). */
  onClick?: EventKey;
  /** Legacy alias for {@link ButtonProps.action}. */
  event?: EventKey;
  /** Icon placement — maps to Button's `icon` (left) or `iconRight` (right). */
  iconPosition?: 'left' | 'right';
}

/**
 * Button pattern — thin pass-through to the Button atom.
 *
 * Prior to VG17 this wrapper owned a local event-bus emit and
 * hand-enumerated only a narrow slice of props, silently dropping
 * every prop outside that list (including the Pre-Phase `action:
 * EventKey`). The atom already handles emit + data-testid via its
 * `action` prop, so the wrapper simply forwards everything.
 */
export function ButtonPattern({
  action,
  onClick,
  event,
  icon,
  iconPosition,
  ...rest
}: ButtonPatternProps): React.ReactElement {
  const resolvedAction = action ?? onClick ?? event;
  // `iconPosition: 'right'` slots the icon into `iconRight`; anything
  // else (undefined or 'left') keeps it on the left via the `icon` alias.
  const iconProps: Pick<ButtonProps, 'icon' | 'iconRight'> =
    iconPosition === 'right' ? { iconRight: icon } : { icon };
  return <Button {...rest} action={resolvedAction} {...iconProps} />;
}

ButtonPattern.displayName = 'ButtonPattern';

export interface IconButtonPatternProps extends Omit<ButtonProps, 'onClick'>, ClosedCircuitProps {
  icon: string;
  ariaLabel?: string;
  /** Legacy alias for {@link ButtonProps.action}. */
  onClick?: EventKey;
  /** Legacy alias for {@link ButtonProps.action}. */
  event?: EventKey;
}

/**
 * Icon-only button pattern — pass-through to the Button atom with a
 * mandatory icon and optional aria-label. Same VG17 fix as
 * {@link ButtonPattern}: `action` forwards to the atom, which owns the
 * emit + data-testid.
 */
export function IconButtonPattern({
  action,
  onClick,
  event,
  icon,
  ariaLabel,
  variant = 'ghost',
  ...rest
}: IconButtonPatternProps): React.ReactElement {
  const resolvedAction = action ?? onClick ?? event;
  return (
    <Button
      {...rest}
      variant={variant}
      action={resolvedAction}
      icon={icon}
      aria-label={ariaLabel}
    />
  );
}

IconButtonPattern.displayName = 'IconButtonPattern';

export interface LinkPatternProps extends ClosedCircuitProps {
  label: string;
  href?: string;
  external?: boolean;
  /** Event key emitted on click (intercepts native navigation when set). */
  action?: EventKey;
  /** Legacy alias for action. */
  onClick?: EventKey;
  /** Legacy alias for action. */
  event?: EventKey;
  /** Payload for the dispatched event. */
  actionPayload?: EventPayload;
  className?: string;
}

/**
 * Link pattern for navigation. When an event key is provided via
 * `action` / `onClick` / `event`, intercepts the native `<a>`
 * navigation and emits `UI:{action}` with the `href` in the payload.
 * Sets `data-testid="action-{NAME}"` so the verifier's click-path
 * gate can select it symmetrically with Button.
 */
export function LinkPattern({
  label,
  href,
  external = false,
  action,
  onClick,
  event,
  actionPayload,
  className,
}: LinkPatternProps): React.ReactElement {
  const { emit } = useEventBus();
  const resolvedAction = action ?? onClick ?? event;

  const handleClick = (e: React.MouseEvent) => {
    if (resolvedAction) {
      e.preventDefault();
      emit(`UI:${resolvedAction}`, actionPayload ?? ({ href } as EventPayload));
    }
  };

  return (
    <a
      href={href ?? '#'}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={resolvedAction ? handleClick : undefined}
      className={className}
      data-testid={resolvedAction ? `action-${resolvedAction}` : undefined}
    >
      {label}
    </a>
  );
}

LinkPattern.displayName = 'LinkPattern';

// ============================================================================
// Display Components
// ============================================================================

export interface TextPatternProps extends ClosedCircuitProps {
  content: string;
  variant?: 'body' | 'caption' | 'overline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * Text pattern for typography.
 */
export function TextPattern({
  content,
  variant = 'body',
  size = 'md',
  weight = 'normal',
  color,
  align,
  className,
}: TextPatternProps): React.ReactElement {
  return (
    <Typography
      variant={variant}
      size={size}
      weight={weight}
      className={className}
      style={{ color, textAlign: align }}
    >
      {content}
    </Typography>
  );
}

TextPattern.displayName = 'TextPattern';

export interface HeadingPatternProps extends ClosedCircuitProps {
  content: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
}

/**
 * Heading pattern.
 */
export function HeadingPattern({
  content,
  level = 2,
  size,
  className,
}: HeadingPatternProps): React.ReactElement {
  return (
    <Heading level={level} size={size} className={className}>
      {content}
    </Heading>
  );
}

HeadingPattern.displayName = 'HeadingPattern';

export interface BadgePatternProps extends ClosedCircuitProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Badge pattern for status/counts.
 */
export function BadgePattern({
  label,
  variant = 'default',
  size = 'md',
  className,
}: BadgePatternProps): React.ReactElement {
  return <Badge variant={variant} size={size} className={className}>{label}</Badge>;
}

BadgePattern.displayName = 'BadgePattern';

export interface AvatarPatternProps extends ClosedCircuitProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Avatar pattern.
 */
export function AvatarPattern({
  src,
  alt,
  name,
  size = 'md',
  className,
}: AvatarPatternProps): React.ReactElement {
  return <Avatar src={src} alt={alt ?? name ?? ''} name={name} size={size} className={className} />;
}

AvatarPattern.displayName = 'AvatarPattern';

export interface IconPatternProps extends ClosedCircuitProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

/**
 * Icon pattern.
 */
export function IconPattern({
  name,
  size = 'md',
  color,
  className,
}: IconPatternProps): React.ReactElement {
  return <Icon name={name} size={size} className={className} style={{ color }} />;
}

IconPattern.displayName = 'IconPattern';

export interface ImagePatternProps extends ClosedCircuitProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill';
  fallback?: string;
  className?: string;
}

/**
 * Image pattern.
 */
export function ImagePattern({
  src,
  alt,
  width,
  height,
  objectFit = 'cover',
  className,
}: ImagePatternProps): React.ReactElement {
  return (
     
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ objectFit }}
    />
  );
}

ImagePattern.displayName = 'ImagePattern';

export interface CardPatternProps extends ClosedCircuitProps {
  title?: string;
  subtitle?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Card pattern.
 */
export function CardPattern({
  title,
  subtitle,
  padding = 'md',
  shadow = 'md',
  onClick,
  className,
  children,
}: CardPatternProps): React.ReactElement {
  const { emit } = useEventBus();

  const handleClick = onClick
    ? () => emit(`UI:${onClick}`, {})
    : undefined;

  return (
    <Card
      title={title}
      subtitle={subtitle}
      padding={padding}
      shadow={shadow}
      onClick={handleClick}
      className={className}
    >
      {children}
    </Card>
  );
}

CardPattern.displayName = 'CardPattern';

export interface ProgressBarPatternProps extends ClosedCircuitProps {
  value: number;
  max?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Progress bar pattern.
 */
export function ProgressBarPattern({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarPatternProps): React.ReactElement {
  return (
    <ProgressBar
      value={value}
      max={max}
      variant={variant}
      size={size}
      showLabel={showLabel}
      className={className}
    />
  );
}

ProgressBarPattern.displayName = 'ProgressBarPattern';

export interface SpinnerPatternProps extends ClosedCircuitProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

/**
 * Spinner pattern.
 */
export function SpinnerPattern({
  size = 'md',
  className,
}: SpinnerPatternProps): React.ReactElement {
  return <Spinner size={size} className={className} />;
}

SpinnerPattern.displayName = 'SpinnerPattern';

// ============================================================================
// Form Input Components
// ============================================================================

export interface InputPatternProps extends ClosedCircuitProps {
  value?: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  disabled?: boolean;
  /** Field-level validation error message */
  fieldError?: string;
  onChange?: string;
  onBlur?: string;
  className?: string;
}

/**
 * Input pattern.
 */
export function InputPattern({
  value = '',
  placeholder,
  inputType = 'text',
  disabled = false,
  fieldError,
  onChange,
  onBlur,
  className,
}: InputPatternProps): React.ReactElement {
  const { emit } = useEventBus();
  const [localValue, setLocalValue] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    if (onChange) {
      emit(`UI:${onChange}`, { value: e.target.value });
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      emit(`UI:${onBlur}`, { value: localValue });
    }
  };

  return (
    <Input
      value={localValue}
      placeholder={placeholder}
      inputType={inputType}
      disabled={disabled}
      error={fieldError}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
    />
  );
}

InputPattern.displayName = 'InputPattern';

export interface TextareaPatternProps extends ClosedCircuitProps {
  value?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  /** Field-level validation error message */
  fieldError?: string;
  onChange?: string;
  className?: string;
}

/**
 * Textarea pattern.
 */
export function TextareaPattern({
  value = '',
  placeholder,
  rows = 4,
  disabled = false,
  fieldError,
  onChange,
  className,
}: TextareaPatternProps): React.ReactElement {
  const { emit } = useEventBus();
  const [localValue, setLocalValue] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
    if (onChange) {
      emit(`UI:${onChange}`, { value: e.target.value });
    }
  };

  return (
    <Textarea
      value={localValue}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      error={fieldError}
      onChange={handleChange}
      className={className}
    />
  );
}

TextareaPattern.displayName = 'TextareaPattern';

export interface SelectPatternProps extends ClosedCircuitProps {
  value?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  /** Field-level validation error message */
  fieldError?: string;
  onChange?: string;
  className?: string;
}

/**
 * Select pattern.
 */
export function SelectPattern({
  value = '',
  options,
  placeholder,
  disabled = false,
  fieldError,
  onChange,
  className,
}: SelectPatternProps): React.ReactElement {
  const { emit } = useEventBus();
  const [localValue, setLocalValue] = React.useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalValue(e.target.value);
    if (onChange) {
      emit(`UI:${onChange}`, { value: e.target.value });
    }
  };

  return (
    <Select
      value={localValue}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      error={fieldError}
      onChange={handleChange}
      className={className}
    />
  );
}

SelectPattern.displayName = 'SelectPattern';

export interface CheckboxPatternProps extends ClosedCircuitProps {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
  onChange?: string;
  className?: string;
}

/**
 * Checkbox pattern.
 */
export function CheckboxPattern({
  checked = false,
  label,
  disabled = false,
  onChange,
  className,
}: CheckboxPatternProps): React.ReactElement {
  const { emit } = useEventBus();
  const [localChecked, setLocalChecked] = React.useState(checked);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalChecked(e.target.checked);
    if (onChange) {
      emit(`UI:${onChange}`, { checked: e.target.checked });
    }
  };

  return (
    <Checkbox
      checked={localChecked}
      label={label}
      disabled={disabled}
      onChange={handleChange}
      className={className}
    />
  );
}

CheckboxPattern.displayName = 'CheckboxPattern';

export interface RadioPatternProps extends ClosedCircuitProps {
  value: string;
  checked?: boolean;
  name?: string;
  label?: string;
  disabled?: boolean;
  onChange?: string;
  className?: string;
}

/**
 * Radio pattern.
 */
export function RadioPattern({
  value,
  checked = false,
  name,
  label,
  disabled = false,
  onChange,
  className,
}: RadioPatternProps): React.ReactElement {
  const { emit } = useEventBus();

  const handleChange = () => {
    if (onChange) {
      emit(`UI:${onChange}`, { value });
    }
  };

  return (
    <Radio
      value={value}
      checked={checked}
      name={name}
      label={label}
      disabled={disabled}
      onChange={handleChange}
      className={className}
    />
  );
}

RadioPattern.displayName = 'RadioPattern';

export interface LabelPatternProps extends ClosedCircuitProps {
  text: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

/**
 * Label pattern.
 */
export function LabelPattern({
  text,
  htmlFor,
  required = false,
  className,
}: LabelPatternProps): React.ReactElement {
  return (
    <Label htmlFor={htmlFor} required={required} className={className}>
      {text}
    </Label>
  );
}

LabelPattern.displayName = 'LabelPattern';

// ============================================================================
// Feedback Components
// ============================================================================

export interface AlertPatternProps extends ClosedCircuitProps {
  message: string;
  title?: string;
  variant?: AlertVariant;
  dismissible?: boolean;
  onDismiss?: string;
  className?: string;
}

/**
 * Alert pattern.
 */
export function AlertPattern({
  message,
  title,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className,
}: AlertPatternProps): React.ReactElement {
  const { emit } = useEventBus();

  const handleDismiss = () => {
    if (onDismiss) {
      emit(`UI:${onDismiss}`, {});
    }
  };

  return (
    <Alert
      message={message}
      title={title}
      variant={variant}
      dismissible={dismissible}
      onDismiss={dismissible ? handleDismiss : undefined}
      className={className}
    />
  );
}

AlertPattern.displayName = 'AlertPattern';

export interface TooltipPatternProps extends ClosedCircuitProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Tooltip pattern.
 */
export function TooltipPattern({
  content,
  position = 'top',
  className,
  children,
}: TooltipPatternProps): React.ReactElement {
  return (
    <Tooltip content={content} position={position} className={className}>
      {children}
    </Tooltip>
  );
}

TooltipPattern.displayName = 'TooltipPattern';

export interface PopoverPatternProps extends ClosedCircuitProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'click' | 'hover';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Popover pattern.
 */
export function PopoverPattern({
  content,
  position = 'bottom',
  trigger = 'click',
  className,
  children,
}: PopoverPatternProps): React.ReactElement {
  return (
    <Popover content={content} position={position} trigger={trigger} className={className}>
      {children}
    </Popover>
  );
}

PopoverPattern.displayName = 'PopoverPattern';

// ============================================================================
// Navigation Components
// ============================================================================

export interface MenuPatternProps extends ClosedCircuitProps {
  items: Array<{
    label: string;
    event: string;
    icon?: string;
    disabled?: boolean;
    variant?: 'default' | 'danger';
  }>;
  trigger?: React.ReactNode;
  position?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
}

/**
 * Menu pattern.
 */
export function MenuPattern({
  items,
  trigger,
  position = 'bottom-start',
  className,
}: MenuPatternProps): React.ReactElement {
  const { emit } = useEventBus();

  const menuItems = items.map((item) => ({
    ...item,
    onClick: () => emit(`UI:${item.event}`, {}),
  }));

  return (
    <Menu items={menuItems} trigger={trigger} position={position} className={className} />
  );
}

MenuPattern.displayName = 'MenuPattern';

export interface AccordionPatternProps extends ClosedCircuitProps {
  items: Array<{ title: string; content: React.ReactNode }>;
  multiple?: boolean;
  defaultOpen?: number[];
  className?: string;
}

/**
 * Accordion pattern.
 */
export function AccordionPattern({
  items,
  multiple = false,
  defaultOpen = [],
  className,
}: AccordionPatternProps): React.ReactElement {
  return (
    <Accordion
      items={items}
      multiple={multiple}
      defaultOpen={defaultOpen}
      className={className}
    />
  );
}

AccordionPattern.displayName = 'AccordionPattern';

// ============================================================================
// Layout Components
// ============================================================================

export interface ContainerPatternProps extends ClosedCircuitProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Container pattern.
 */
export function ContainerPattern({
  maxWidth = 'lg',
  padding = 'md',
  className,
  children,
}: ContainerPatternProps): React.ReactElement {
  return (
    <Container maxWidth={maxWidth} padding={padding} className={className}>
      {children}
    </Container>
  );
}

ContainerPattern.displayName = 'ContainerPattern';

export interface SimpleGridPatternProps extends ClosedCircuitProps {
  minChildWidth?: string;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Simple grid pattern.
 */
export function SimpleGridPattern({
  minChildWidth = '250px',
  gap = 'md',
  className,
  children,
}: SimpleGridPatternProps): React.ReactElement {
  return (
    <SimpleGrid minChildWidth={minChildWidth} gap={gap} className={className}>
      {children}
    </SimpleGrid>
  );
}

SimpleGridPattern.displayName = 'SimpleGridPattern';

export interface FloatButtonPatternProps extends ClosedCircuitProps {
  icon: string;
  onClick?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  variant?: 'primary' | 'secondary';
  className?: string;
}

/**
 * Floating action button pattern.
 */
export function FloatButtonPattern({
  icon,
  onClick,
  position = 'bottom-right',
  variant = 'primary',
  className,
}: FloatButtonPatternProps): React.ReactElement {
  const { emit } = useEventBus();

  const handleClick = () => {
    if (onClick) {
      emit(`UI:${onClick}`, {});
    }
  };

  return (
    <FloatingActionButton
      icon={icon}
      onClick={handleClick}
      position={position}
      variant={variant}
      className={className}
    />
  );
}

FloatButtonPattern.displayName = 'FloatButtonPattern';

// ============================================================================
// Map Pattern
// ============================================================================

export type MapViewPatternProps = Omit<MapViewProps, 'onMapClick' | 'onMarkerClick'> & ClosedCircuitProps;

/**
 * Map view pattern. Passes through all MapView props.
 * Event dispatch is handled internally by MapView via mapClickEvent/markerClickEvent.
 */
export function MapViewPattern({
  markers,
  centerLat,
  centerLng,
  zoom,
  height,
  mapClickEvent,
  markerClickEvent,
  showClickedPin,
  className,
  showAttribution,
}: MapViewPatternProps): React.ReactElement {
  return (
    <MapView
      markers={markers}
      centerLat={centerLat}
      centerLng={centerLng}
      zoom={zoom}
      height={height}
      mapClickEvent={mapClickEvent}
      markerClickEvent={markerClickEvent}
      showClickedPin={showClickedPin}
      className={className}
      showAttribution={showAttribution}
    />
  );
}

MapViewPattern.displayName = 'MapViewPattern';

// ============================================================================
// Export Pattern Registry
// ============================================================================

 
export const COMPONENT_PATTERNS = {
  // Interactive
  'button': ButtonPattern,
  'icon-button': IconButtonPattern,
  'link': LinkPattern,
  // Display
  'text': TextPattern,
  'heading': HeadingPattern,
  'badge': BadgePattern,
  'avatar': AvatarPattern,
  'icon': IconPattern,
  'image': ImagePattern,
  'card': CardPattern,
  'progress-bar': ProgressBarPattern,
  'spinner': SpinnerPattern,
  // Form inputs
  'input': InputPattern,
  'textarea': TextareaPattern,
  'select': SelectPattern,
  'checkbox': CheckboxPattern,
  'radio': RadioPattern,
  'label': LabelPattern,
  // Feedback
  'alert': AlertPattern,
  'tooltip': TooltipPattern,
  'popover': PopoverPattern,
  // Navigation
  'menu': MenuPattern,
  'accordion': AccordionPattern,
  // Layout
  'container': ContainerPattern,
  'simple-grid': SimpleGridPattern,
  'float-button': FloatButtonPattern,
  // Map
  'map-view': MapViewPattern,
} as const;
