import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';

const meta: Meta<typeof Table> = {
    title: 'Organisms/Table',
    component: Table,
    parameters: {
        layout: 'padded',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

interface Person {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
}

const sampleData: Person[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'Editor', status: 'Pending' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Inactive' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
];

const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
];


export const Default: Story = {
    args: {
        data: sampleData,
        columns,

    },
};

export const WithSearch: Story = {
    args: {
        data: sampleData,
        columns,

        searchable: true,
        searchPlaceholder: 'Search people...',
    },
};

export const Selectable: Story = {
    args: {
        data: sampleData,
        columns,

        selectable: true,
        selectedIds: [],
    },
};

export const WithSorting: Story = {
    args: {
        data: sampleData,
        columns,

        sortable: true,
        sortColumn: 'name',
        sortDirection: 'asc',
    },
};

export const WithRowActions: Story = {
    args: {
        data: sampleData,
        columns,

        rowActions: () => [
            { label: 'View', onClick: () => console.log('View') },
            { label: 'Edit', onClick: () => console.log('Edit') },
            { label: 'Delete', onClick: () => console.log('Delete') },
        ],
    },
};

export const WithPagination: Story = {
    args: {
        data: sampleData,
        columns,

        paginated: true,
        currentPage: 1,
        totalPages: 5,
    },
};

export const Loading: Story = {
    args: {
        data: [],
        columns,

        isLoading: true,
    },
};

export const Empty: Story = {
    args: {
        data: [],
        columns,

        emptyMessage: 'No records found.',
    },
};

export const FullFeatured: Story = {
    args: {
        data: sampleData,
        columns,

        searchable: true,
        selectable: true,
        sortable: true,
        sortColumn: 'name',
        sortDirection: 'asc',
        paginated: true,
        currentPage: 1,
        totalPages: 3,
        rowActions: () => [
            { label: 'View', onClick: () => console.log('View') },
            { label: 'Edit', onClick: () => console.log('Edit') },
        ],
    },
};
