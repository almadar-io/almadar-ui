import type { Meta, StoryObj } from '@storybook/react-vite';
import { WorkOrderCard } from './WorkOrderCard';
import { VStack, HStack } from '../atoms/Stack';

const meta: Meta<typeof WorkOrderCard> = {
  title: 'Molecules/WorkOrderCard',
  component: WorkOrderCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['created', 'assigned', 'en-route', 'on-site', 'completed', 'cancelled'],
    },
    priority: {
      control: 'select',
      options: ['low', 'normal', 'high', 'urgent'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orderId: 'WO-1042',
    customerName: 'Acme Industries',
    serviceType: 'AC tune-up',
    address: '142 Industrial Way, Riverside, CA',
    scheduledAt: 'May 12, 2026 — 9:00 AM',
    assignedTo: 'Maria Chen',
    status: 'assigned',
    priority: 'normal',
  },
  decorators: [
    (Story) => (
      <HStack className="w-96">
        <Story />
      </HStack>
    ),
  ],
};

export const EnRoute: Story = {
  args: {
    orderId: 'WO-1043',
    customerName: 'Greenview Apartments',
    serviceType: 'Plumbing repair',
    address: '8 Greenview Lane, Apt 3B, Portland, OR',
    scheduledAt: 'May 9, 2026 — 11:30 AM',
    etaMinutes: 25,
    assignedTo: 'David Park',
    status: 'en-route',
    priority: 'high',
  },
  decorators: [
    (Story) => (
      <HStack className="w-96">
        <Story />
      </HStack>
    ),
  ],
};

export const OnSite: Story = {
  args: {
    orderId: 'WO-1044',
    customerName: 'Bayside Cafe',
    serviceType: 'Refrigeration diagnostics',
    address: '21 Wharf Road, Seattle, WA',
    scheduledAt: 'May 9, 2026 — 1:15 PM',
    assignedTo: 'Priya Singh',
    status: 'on-site',
    priority: 'urgent',
  },
  decorators: [
    (Story) => (
      <HStack className="w-96">
        <Story />
      </HStack>
    ),
  ],
};

export const Completed: Story = {
  args: {
    orderId: 'WO-1031',
    customerName: 'Henderson Residence',
    serviceType: 'Furnace inspection',
    address: '4452 Pine Hill Drive, Denver, CO',
    scheduledAt: 'May 8, 2026 — 10:00 AM',
    assignedTo: 'Jamal Brooks',
    status: 'completed',
    priority: 'normal',
  },
  decorators: [
    (Story) => (
      <HStack className="w-96">
        <Story />
      </HStack>
    ),
  ],
};

export const Unassigned: Story = {
  args: {
    orderId: 'WO-1050',
    customerName: 'Northgate Tower',
    serviceType: 'Elevator maintenance',
    address: '900 Northgate Blvd, Floor 14, Chicago, IL',
    scheduledAt: 'May 10, 2026 — 8:00 AM',
    status: 'created',
    priority: 'normal',
  },
  decorators: [
    (Story) => (
      <HStack className="w-96">
        <Story />
      </HStack>
    ),
  ],
};

export const Urgent: Story = {
  args: {
    orderId: 'WO-1051',
    customerName: 'St. Mary Hospital',
    serviceType: 'Emergency electrical fault',
    address: '15 Medical Center Pkwy, Boston, MA',
    scheduledAt: 'May 9, 2026 — ASAP',
    status: 'created',
    priority: 'urgent',
  },
  decorators: [
    (Story) => (
      <HStack className="w-96">
        <Story />
      </HStack>
    ),
  ],
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="lg" align="stretch" className="w-96">
      <WorkOrderCard
        orderId="WO-1042"
        customerName="Acme Industries"
        serviceType="AC tune-up"
        address="142 Industrial Way, Riverside, CA"
        scheduledAt="May 12, 2026 — 9:00 AM"
        assignedTo="Maria Chen"
        status="assigned"
        priority="normal"
        size="sm"
      />
      <WorkOrderCard
        orderId="WO-1042"
        customerName="Acme Industries"
        serviceType="AC tune-up"
        address="142 Industrial Way, Riverside, CA"
        scheduledAt="May 12, 2026 — 9:00 AM"
        assignedTo="Maria Chen"
        status="assigned"
        priority="normal"
        size="md"
      />
      <WorkOrderCard
        orderId="WO-1042"
        customerName="Acme Industries"
        serviceType="AC tune-up"
        address="142 Industrial Way, Riverside, CA"
        scheduledAt="May 12, 2026 — 9:00 AM"
        assignedTo="Maria Chen"
        status="assigned"
        priority="normal"
        size="lg"
      />
    </VStack>
  ),
};

export const MultipleCards: Story = {
  render: () => (
    <VStack gap="md" align="stretch" className="w-96">
      <WorkOrderCard
        orderId="WO-1050"
        customerName="Northgate Tower"
        serviceType="Elevator maintenance"
        address="900 Northgate Blvd, Floor 14, Chicago, IL"
        scheduledAt="May 10, 2026 — 8:00 AM"
        status="created"
        priority="normal"
      />
      <WorkOrderCard
        orderId="WO-1043"
        customerName="Greenview Apartments"
        serviceType="Plumbing repair"
        address="8 Greenview Lane, Apt 3B, Portland, OR"
        scheduledAt="May 9, 2026 — 11:30 AM"
        etaMinutes={25}
        assignedTo="David Park"
        status="en-route"
        priority="high"
      />
      <WorkOrderCard
        orderId="WO-1044"
        customerName="Bayside Cafe"
        serviceType="Refrigeration diagnostics"
        address="21 Wharf Road, Seattle, WA"
        scheduledAt="May 9, 2026 — 1:15 PM"
        assignedTo="Priya Singh"
        status="on-site"
        priority="urgent"
      />
      <WorkOrderCard
        orderId="WO-1031"
        customerName="Henderson Residence"
        serviceType="Furnace inspection"
        address="4452 Pine Hill Drive, Denver, CO"
        scheduledAt="May 8, 2026 — 10:00 AM"
        assignedTo="Jamal Brooks"
        status="completed"
        priority="normal"
      />
    </VStack>
  ),
};
