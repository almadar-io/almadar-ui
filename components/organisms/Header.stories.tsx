import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header';
import { Bell, Settings, User } from 'lucide-react';

const meta: Meta<typeof Header> = {
    title: 'Organisms/Header',
    component: Header,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        logo: 'MyApp',
        user: {
            name: 'John Doe',
            email: 'john@example.com',
            avatar: 'https://i.pravatar.cc/150?img=1',
        },
        navItems: [
            { label: 'Dashboard', href: '#' },
            { label: 'Projects', href: '#' },
            { label: 'Team', href: '#' },
        ],
    },
};

export const WithSearch: Story = {
    args: {
        logo: 'MyApp',
        showSearch: true,
        user: {
            name: 'Jane Smith',
            email: 'jane@example.com',
        },
        navItems: [
            { label: 'Dashboard', href: '#' },
            { label: 'Projects', href: '#' },
        ],
    },
};

export const WithNotifications: Story = {
    args: {
        logo: 'MyApp',
        user: {
            name: 'John Doe',
            email: 'john@example.com',
        },
        notifications: [
            { id: '1', title: 'New message', message: 'You have a new message from Jane', time: '5 min ago' },
            { id: '2', title: 'Task completed', message: 'Project review is complete', time: '1 hour ago' },
            { id: '3', title: 'Update available', message: 'A new version is available', time: '2 hours ago' },
        ],
        navItems: [
            { label: 'Dashboard', href: '#' },
            { label: 'Projects', href: '#' },
        ],
    },
};

export const MinimalHeader: Story = {
    args: {
        logo: 'SimpleApp',
    },
};

export const FullFeatured: Story = {
    args: {
        logo: 'Enterprise App',
        showSearch: true,
        user: {
            name: 'Admin User',
            email: 'admin@company.com',
            avatar: 'https://i.pravatar.cc/150?img=3',
        },
        navItems: [
            { label: 'Dashboard', href: '#', active: true },
            { label: 'Analytics', href: '#' },
            { label: 'Reports', href: '#' },
            { label: 'Settings', href: '#' },
        ],
        notifications: [
            { id: '1', title: 'New user signup', message: '5 new users signed up today', time: '10 min ago' },
            { id: '2', title: 'Server alert', message: 'CPU usage above 80%', time: '30 min ago' },
        ],
    },
};
