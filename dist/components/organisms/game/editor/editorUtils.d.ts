/**
 * Shared Map Editor Utilities
 *
 * Reusable editor components for Storybook-based map editing.
 * All composed from @almadar/ui atoms (Box, VStack, HStack, Typography, Button, Badge).
 *
 * NOTE: These are Storybook editor controls, NOT Orbital templates.
 * They use native HTML inputs wrapped in Box for lightweight editor UX.
 */
import React from 'react';
export type EditorMode = 'select' | 'paint' | 'unit' | 'feature' | 'erase';
export declare const TERRAIN_COLORS: Record<string, string>;
export declare const FEATURE_TYPES: readonly ["goldMine", "resonanceCrystal", "traitCache", "salvageYard", "portal", "battleMarker", "treasure", "castle"];
export interface CollapsibleSectionProps {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    className?: string;
}
export declare function CollapsibleSection({ title, expanded, onToggle, children, className }: CollapsibleSectionProps): import("react/jsx-runtime").JSX.Element;
export declare namespace CollapsibleSection {
    var displayName: string;
}
export interface EditorSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}
export declare function EditorSlider({ label, value, min, max, step, onChange, className }: EditorSliderProps): import("react/jsx-runtime").JSX.Element;
export declare namespace EditorSlider {
    var displayName: string;
}
export interface EditorSelectProps {
    label: string;
    value: string;
    options: Array<{
        value: string;
        label: string;
    }>;
    onChange: (value: string) => void;
    className?: string;
}
export declare function EditorSelect({ label, value, options, onChange, className }: EditorSelectProps): import("react/jsx-runtime").JSX.Element;
export declare namespace EditorSelect {
    var displayName: string;
}
export interface EditorCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}
export declare function EditorCheckbox({ label, checked, onChange, className }: EditorCheckboxProps): import("react/jsx-runtime").JSX.Element;
export declare namespace EditorCheckbox {
    var displayName: string;
}
export interface EditorTextInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}
export declare function EditorTextInput({ label, value, onChange, placeholder, className }: EditorTextInputProps): import("react/jsx-runtime").JSX.Element;
export declare namespace EditorTextInput {
    var displayName: string;
}
export interface StatusBarProps {
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
export declare function StatusBar({ hoveredTile, mode, gridSize, unitCount, featureCount, className }: StatusBarProps): import("react/jsx-runtime").JSX.Element;
export declare namespace StatusBar {
    var displayName: string;
}
export interface TerrainPaletteProps {
    terrains: string[];
    selectedTerrain: string;
    onSelect: (terrain: string) => void;
    className?: string;
}
export declare function TerrainPalette({ terrains, selectedTerrain, onSelect, className }: TerrainPaletteProps): import("react/jsx-runtime").JSX.Element;
export declare namespace TerrainPalette {
    var displayName: string;
}
export interface EditorToolbarProps {
    mode: EditorMode;
    onModeChange: (mode: EditorMode) => void;
    className?: string;
}
export declare function EditorToolbar({ mode, onModeChange, className }: EditorToolbarProps): import("react/jsx-runtime").JSX.Element;
export declare namespace EditorToolbar {
    var displayName: string;
}
