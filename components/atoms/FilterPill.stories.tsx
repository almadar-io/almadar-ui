import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { FilterPill } from './FilterPill';

const meta: Meta<typeof FilterPill> = {
    title: 'Core/Atoms/FilterPill',
    component: FilterPill,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        removable: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: 'Category: Books',
        onRemove: () => console.log('removed'),
    },
};

export const WithIcon: Story = {
    args: {
        label: 'Tag',
        icon: 'tag',
        variant: 'primary',
        onRemove: () => console.log('removed'),
    },
};

export const NotRemovable: Story = {
    args: {
        label: 'Read-only',
        variant: 'neutral',
        removable: false,
    },
};

export const Variants: Story = {
    render: () => (
        <div className="flex flex-wrap gap-2">
            <FilterPill label="Default" onRemove={() => {}} />
            <FilterPill label="Primary" variant="primary" onRemove={() => {}} />
            <FilterPill label="Success" variant="success" onRemove={() => {}} />
            <FilterPill label="Warning" variant="warning" onRemove={() => {}} />
            <FilterPill label="Danger" variant="danger" onRemove={() => {}} />
            <FilterPill label="Info" variant="info" onRemove={() => {}} />
        </div>
    ),
};

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <FilterPill label="Small" size="sm" onRemove={() => {}} />
            <FilterPill label="Medium" size="md" onRemove={() => {}} />
            <FilterPill label="Large" size="lg" onRemove={() => {}} />
        </div>
    ),
};

export const ActiveFilters: Story = {
    render: () => {
        const FiltersDemo = () => {
            const [filters, setFilters] = useState([
                { id: 'a', label: 'In stock' },
                { id: 'b', label: 'Free shipping' },
                { id: 'c', label: '$0-$50' },
                { id: 'd', label: '4+ stars' },
            ]);
            return (
                <div className="flex flex-wrap gap-2 max-w-md">
                    {filters.map((f) => (
                        <FilterPill
                            key={f.id}
                            label={f.label}
                            variant="primary"
                            onRemove={() => setFilters((prev) => prev.filter((x) => x.id !== f.id))}
                        />
                    ))}
                    {filters.length === 0 && (
                        <span className="text-sm text-muted-foreground">No active filters</span>
                    )}
                </div>
            );
        };
        return <FiltersDemo />;
    },
};
