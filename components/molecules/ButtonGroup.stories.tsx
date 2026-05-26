import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../atoms';

const meta: Meta<typeof ButtonGroup> = {
    title: 'Core/Molecules/ButtonGroup',
    component: ButtonGroup,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'segmented', 'toggle'],
        },
        orientation: {
            control: 'select',
            options: ['horizontal', 'vertical'],
        },
        look: {
            control: 'select',
            options: [
                'right-aligned-buttons',
                'floating-bar',
                'inline-row',
                'dropdown-menu',
                'command-palette-trigger',
            ],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** ── Section 1: Variants ── */

export const Default: Story = {
    args: {
        variant: 'default',
        children: (
            <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="secondary">Save</Button>
                <Button variant="primary">Submit</Button>
            </>
        ),
    },
};

export const Segmented: Story = {
    args: {
        variant: 'segmented',
        children: (
            <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="secondary">Save</Button>
                <Button variant="primary">Submit</Button>
            </>
        ),
    },
};

export const Toggle: Story = {
    args: {
        variant: 'toggle',
        children: (
            <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="secondary">Save</Button>
                <Button variant="primary">Submit</Button>
            </>
        ),
    },
};

/** ── Section 2: Layer 2 looks ── */

export const RightAlignedButtons: Story = {
    args: {
        look: 'right-aligned-buttons',
        children: (
            <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="secondary">Save</Button>
                <Button variant="primary">Submit</Button>
            </>
        ),
    },
    parameters: {
        docs: { description: { story: 'Standard right-aligned cluster — the default form-actions layout.' } },
    },
};

export const FloatingBar: Story = {
    args: {
        look: 'floating-bar',
        children: (
            <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="secondary">Save</Button>
                <Button variant="primary">Submit</Button>
            </>
        ),
    },
    parameters: {
        docs: { description: { story: 'Fixed at bottom of viewport, anchored as an action bar. v1 ships as class-only; full DOM treatment in Phase 2 follow-up.' } },
    },
};

export const InlineRow: Story = {
    args: {
        look: 'inline-row',
        children: (
            <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="secondary">Save</Button>
                <Button variant="primary">Submit</Button>
            </>
        ),
    },
    parameters: {
        docs: { description: { story: 'Buttons flow inline with content.' } },
    },
};

export const DropdownMenu: Story = {
    args: {
        look: 'dropdown-menu',
        children: (
            <>
                <Button variant="secondary">Actions</Button>
                <Button variant="ghost">Edit</Button>
                <Button variant="ghost">Duplicate</Button>
                <Button variant="danger">Delete</Button>
            </>
        ),
    },
    parameters: {
        docs: { description: { story: 'Collapses buttons into a single dropdown trigger. v1 ships as class-only; full DOM treatment in Phase 2 follow-up.' } },
    },
};

export const CommandPaletteTrigger: Story = {
    args: {
        look: 'command-palette-trigger',
        children: (
            <>
                <Button variant="secondary">Search commands…</Button>
                <Button variant="ghost">Open file</Button>
                <Button variant="ghost">Go to symbol</Button>
            </>
        ),
    },
    parameters: {
        docs: { description: { story: 'Single search-style button opens a command palette. v1 ships as class-only; full DOM treatment in Phase 2 follow-up.' } },
    },
};

/** ── Section 3: Event behavior ── */

export const WithActions: Story = {
    args: {
        primary: { label: 'Submit', actionType: 'submit', event: 'FORM_SUBMIT', variant: 'primary' },
        secondary: [
            { label: 'Cancel', event: 'FORM_CANCEL', variant: 'ghost' },
            { label: 'Save Draft', event: 'FORM_SAVE_DRAFT', variant: 'secondary' },
        ],
    },
    parameters: {
        docs: { description: { story: 'Form-actions pattern — primary/secondary configs emit named events through the UI event bus on click.' } },
    },
};
