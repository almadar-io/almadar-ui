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
import { type ButtonVariant, type ButtonSize } from '../atoms/Button';
import { type BadgeVariant } from '../atoms/Badge';
import { type AlertVariant } from '../molecules/Alert';
/**
 * Base closed circuit props required by all organism components.
 */
interface ClosedCircuitProps {
    className?: string;
    isLoading?: boolean;
    error?: Error | null;
    entity?: string;
}
export interface ButtonPatternProps extends ClosedCircuitProps {
    label: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    onClick?: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
    className?: string;
}
/**
 * Button pattern that emits events via the event bus.
 */
export declare function ButtonPattern({ label, variant, size, disabled, onClick, icon, iconPosition, className, }: ButtonPatternProps): React.ReactElement;
export declare namespace ButtonPattern {
    var displayName: string;
}
export interface IconButtonPatternProps extends ClosedCircuitProps {
    icon: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    onClick?: string;
    ariaLabel?: string;
    className?: string;
}
/**
 * Icon-only button pattern.
 */
export declare function IconButtonPattern({ icon, variant, size, onClick, ariaLabel, className, }: IconButtonPatternProps): React.ReactElement;
export declare namespace IconButtonPattern {
    var displayName: string;
}
export interface LinkPatternProps extends ClosedCircuitProps {
    label: string;
    href?: string;
    external?: boolean;
    onClick?: string;
    className?: string;
}
/**
 * Link pattern for navigation.
 */
export declare function LinkPattern({ label, href, external, onClick, className, }: LinkPatternProps): React.ReactElement;
export declare namespace LinkPattern {
    var displayName: string;
}
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
export declare function TextPattern({ content, variant, size, weight, color, align, className, }: TextPatternProps): React.ReactElement;
export declare namespace TextPattern {
    var displayName: string;
}
export interface HeadingPatternProps extends ClosedCircuitProps {
    content: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    className?: string;
}
/**
 * Heading pattern.
 */
export declare function HeadingPattern({ content, level, size, className, }: HeadingPatternProps): React.ReactElement;
export declare namespace HeadingPattern {
    var displayName: string;
}
export interface BadgePatternProps extends ClosedCircuitProps {
    label: string;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    className?: string;
}
/**
 * Badge pattern for status/counts.
 */
export declare function BadgePattern({ label, variant, size, className, }: BadgePatternProps): React.ReactElement;
export declare namespace BadgePattern {
    var displayName: string;
}
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
export declare function AvatarPattern({ src, alt, name, size, className, }: AvatarPatternProps): React.ReactElement;
export declare namespace AvatarPattern {
    var displayName: string;
}
export interface IconPatternProps extends ClosedCircuitProps {
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
    className?: string;
}
/**
 * Icon pattern.
 */
export declare function IconPattern({ name, size, color, className, }: IconPatternProps): React.ReactElement;
export declare namespace IconPattern {
    var displayName: string;
}
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
export declare function ImagePattern({ src, alt, width, height, objectFit, className, }: ImagePatternProps): React.ReactElement;
export declare namespace ImagePattern {
    var displayName: string;
}
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
export declare function CardPattern({ title, subtitle, padding, shadow, onClick, className, children, }: CardPatternProps): React.ReactElement;
export declare namespace CardPattern {
    var displayName: string;
}
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
export declare function ProgressBarPattern({ value, max, variant, size, showLabel, className, }: ProgressBarPatternProps): React.ReactElement;
export declare namespace ProgressBarPattern {
    var displayName: string;
}
export interface SpinnerPatternProps extends ClosedCircuitProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    color?: string;
    className?: string;
}
/**
 * Spinner pattern.
 */
export declare function SpinnerPattern({ size, className, }: SpinnerPatternProps): React.ReactElement;
export declare namespace SpinnerPattern {
    var displayName: string;
}
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
export declare function InputPattern({ value, placeholder, inputType, disabled, fieldError, onChange, onBlur, className, }: InputPatternProps): React.ReactElement;
export declare namespace InputPattern {
    var displayName: string;
}
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
export declare function TextareaPattern({ value, placeholder, rows, disabled, fieldError, onChange, className, }: TextareaPatternProps): React.ReactElement;
export declare namespace TextareaPattern {
    var displayName: string;
}
export interface SelectPatternProps extends ClosedCircuitProps {
    value?: string;
    options: Array<{
        value: string;
        label: string;
    }>;
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
export declare function SelectPattern({ value, options, placeholder, disabled, fieldError, onChange, className, }: SelectPatternProps): React.ReactElement;
export declare namespace SelectPattern {
    var displayName: string;
}
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
export declare function CheckboxPattern({ checked, label, disabled, onChange, className, }: CheckboxPatternProps): React.ReactElement;
export declare namespace CheckboxPattern {
    var displayName: string;
}
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
export declare function RadioPattern({ value, checked, name, label, disabled, onChange, className, }: RadioPatternProps): React.ReactElement;
export declare namespace RadioPattern {
    var displayName: string;
}
export interface LabelPatternProps extends ClosedCircuitProps {
    text: string;
    htmlFor?: string;
    required?: boolean;
    className?: string;
}
/**
 * Label pattern.
 */
export declare function LabelPattern({ text, htmlFor, required, className, }: LabelPatternProps): React.ReactElement;
export declare namespace LabelPattern {
    var displayName: string;
}
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
export declare function AlertPattern({ message, title, variant, dismissible, onDismiss, className, }: AlertPatternProps): React.ReactElement;
export declare namespace AlertPattern {
    var displayName: string;
}
export interface TooltipPatternProps extends ClosedCircuitProps {
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
    children?: React.ReactNode;
}
/**
 * Tooltip pattern.
 */
export declare function TooltipPattern({ content, position, className, children, }: TooltipPatternProps): React.ReactElement;
export declare namespace TooltipPattern {
    var displayName: string;
}
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
export declare function PopoverPattern({ content, position, trigger, className, children, }: PopoverPatternProps): React.ReactElement;
export declare namespace PopoverPattern {
    var displayName: string;
}
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
export declare function MenuPattern({ items, trigger, position, className, }: MenuPatternProps): React.ReactElement;
export declare namespace MenuPattern {
    var displayName: string;
}
export interface AccordionPatternProps extends ClosedCircuitProps {
    items: Array<{
        title: string;
        content: React.ReactNode;
    }>;
    multiple?: boolean;
    defaultOpen?: number[];
    className?: string;
}
/**
 * Accordion pattern.
 */
export declare function AccordionPattern({ items, multiple, defaultOpen, className, }: AccordionPatternProps): React.ReactElement;
export declare namespace AccordionPattern {
    var displayName: string;
}
export interface ContainerPatternProps extends ClosedCircuitProps {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    children?: React.ReactNode;
}
/**
 * Container pattern.
 */
export declare function ContainerPattern({ maxWidth, padding, className, children, }: ContainerPatternProps): React.ReactElement;
export declare namespace ContainerPattern {
    var displayName: string;
}
export interface SimpleGridPatternProps extends ClosedCircuitProps {
    minChildWidth?: string;
    gap?: 'xs' | 'sm' | 'md' | 'lg';
    className?: string;
    children?: React.ReactNode;
}
/**
 * Simple grid pattern.
 */
export declare function SimpleGridPattern({ minChildWidth, gap, className, children, }: SimpleGridPatternProps): React.ReactElement;
export declare namespace SimpleGridPattern {
    var displayName: string;
}
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
export declare function FloatButtonPattern({ icon, onClick, position, variant, className, }: FloatButtonPatternProps): React.ReactElement;
export declare namespace FloatButtonPattern {
    var displayName: string;
}
export declare const COMPONENT_PATTERNS: {
    readonly button: typeof ButtonPattern;
    readonly 'icon-button': typeof IconButtonPattern;
    readonly link: typeof LinkPattern;
    readonly text: typeof TextPattern;
    readonly heading: typeof HeadingPattern;
    readonly badge: typeof BadgePattern;
    readonly avatar: typeof AvatarPattern;
    readonly icon: typeof IconPattern;
    readonly image: typeof ImagePattern;
    readonly card: typeof CardPattern;
    readonly 'progress-bar': typeof ProgressBarPattern;
    readonly spinner: typeof SpinnerPattern;
    readonly input: typeof InputPattern;
    readonly textarea: typeof TextareaPattern;
    readonly select: typeof SelectPattern;
    readonly checkbox: typeof CheckboxPattern;
    readonly radio: typeof RadioPattern;
    readonly label: typeof LabelPattern;
    readonly alert: typeof AlertPattern;
    readonly tooltip: typeof TooltipPattern;
    readonly popover: typeof PopoverPattern;
    readonly menu: typeof MenuPattern;
    readonly accordion: typeof AccordionPattern;
    readonly container: typeof ContainerPattern;
    readonly 'simple-grid': typeof SimpleGridPattern;
    readonly 'float-button': typeof FloatButtonPattern;
};
export {};
