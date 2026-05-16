import type { Meta, StoryObj } from '@storybook/react-vite';
import { CalendarGrid, type CalendarEvent } from './CalendarGrid';

const meta: Meta<typeof CalendarGrid> = {
    title: 'Core/Molecules/CalendarGrid',
    component: CalendarGrid,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'wireframe' },
        docs: {
            description: {
                component:
                    'Weekly calendar grid with a viewport-driven day window: 1 day on mobile (≤640 px), 3 days on tablet (641–1024 px), 7 days on laptop+ (≥1025 px). A prev/next nav appears below laptop so users can scan all 7 days without horizontal scroll. Pass `dayWindow={1|3|7}` to force a specific layout.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        dayWindow: {
            control: 'select',
            options: ['auto', 1, 3, 7],
            description: 'Day-count window. `"auto"` (default) tracks viewport. Numeric values force a fixed layout.',
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Fixed week start so snapshots are deterministic.
const fixedWeekStart = new Date('2026-05-11T00:00:00'); // Monday

const sampleEvents: CalendarEvent[] = [
    {
        id: 'evt-1',
        title: 'Sprint planning',
        startTime: '2026-05-11T09:00:00',
        endTime: '2026-05-11T10:00:00',
    },
    {
        id: 'evt-2',
        title: 'Design review',
        startTime: '2026-05-12T14:00:00',
    },
    {
        id: 'evt-3',
        title: 'Customer demo',
        startTime: '2026-05-13T11:00:00',
    },
    {
        id: 'evt-4',
        title: '1:1 with manager',
        startTime: '2026-05-14T15:00:00',
    },
    {
        id: 'evt-5',
        title: 'Friday retro',
        startTime: '2026-05-15T16:00:00',
    },
];

/** Auto-windowing — responds to viewport width. Default. */
export const Default: Story = {
    args: {
        weekStart: fixedWeekStart,
        events: sampleEvents,
        dayWindow: 'auto',
    },
};

/** Forced 7-day week view, e.g. for print layouts or laptop+ snapshots. */
export const Forced7Day: Story = {
    args: {
        weekStart: fixedWeekStart,
        events: sampleEvents,
        dayWindow: 7,
    },
};

/** Forced 3-day window, e.g. for tablet preview testing. */
export const Forced3Day: Story = {
    args: {
        weekStart: fixedWeekStart,
        events: sampleEvents,
        dayWindow: 3,
    },
};

/** Forced 1-day window, e.g. for mobile preview testing. */
export const Forced1Day: Story = {
    args: {
        weekStart: fixedWeekStart,
        events: sampleEvents,
        dayWindow: 1,
    },
};
