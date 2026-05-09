import type { Meta, StoryObj } from '@storybook/react-vite';
import { TicketStub } from './TicketStub';
import { VStack, HStack } from '../atoms/Stack';

const meta: Meta<typeof TicketStub> = {
  title: 'Marketing/Molecules/TicketStub',
  component: TicketStub,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eventName: 'Sunset Open Air',
    date: 'Sat, June 14 2026 · 7:00 PM',
    venue: 'Pier 70, San Francisco',
    tier: 'General Admission',
    price: 49,
    currency: 'USD',
    attendeeName: 'Alex Rivera',
    ticketCode: 'TKT-AB12-CD34',
    variant: 'general',
  },
  decorators: [
    (Story) => (
      <HStack className="w-[560px]">
        <Story />
      </HStack>
    ),
  ],
};

export const VIP: Story = {
  args: {
    eventName: 'Midnight Symphony',
    date: 'Fri, July 11 2026 · 9:00 PM',
    venue: 'Royal Concert Hall',
    tier: 'VIP',
    price: 249,
    currency: 'USD',
    attendeeName: 'Jordan Park',
    ticketCode: 'TKT-VIP-9921',
    variant: 'vip',
  },
  decorators: [
    (Story) => (
      <HStack className="w-[560px]">
        <Story />
      </HStack>
    ),
  ],
};

export const EarlyBird: Story = {
  args: {
    eventName: 'Tech Horizons Conference',
    date: 'Mon, Sep 8 2026',
    venue: 'Convention Center',
    tier: 'Early Bird',
    price: 199,
    currency: 'USD',
    attendeeName: 'Sam Chen',
    ticketCode: 'TKT-EB-1042',
    variant: 'early-bird',
  },
  decorators: [
    (Story) => (
      <HStack className="w-[560px]">
        <Story />
      </HStack>
    ),
  ],
};

export const Student: Story = {
  args: {
    eventName: 'Indie Film Festival',
    date: 'Sat, Oct 3 2026 · 6:30 PM',
    venue: 'Old Town Cinema',
    tier: 'Student',
    price: 15,
    currency: 'USD',
    attendeeName: 'Riley Morgan',
    ticketCode: 'TKT-STU-7733',
    variant: 'student',
  },
  decorators: [
    (Story) => (
      <HStack className="w-[560px]">
        <Story />
      </HStack>
    ),
  ],
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="lg" className="w-[560px]">
      <TicketStub
        eventName="Small Stub"
        date="Jun 1 2026"
        venue="Studio A"
        tier="General"
        price="$25"
        attendeeName="Pat Lee"
        ticketCode="TKT-SM-001"
        size="sm"
      />
      <TicketStub
        eventName="Medium Stub"
        date="Jun 1 2026 · 8 PM"
        venue="Theater B"
        tier="VIP"
        price="$120"
        attendeeName="Pat Lee"
        ticketCode="TKT-MD-002"
        size="md"
        variant="vip"
      />
      <TicketStub
        eventName="Large Stub"
        date="Jun 1 2026 · 8 PM"
        venue="Grand Arena"
        tier="Early Bird"
        price="$80"
        attendeeName="Pat Lee"
        ticketCode="TKT-LG-003"
        size="lg"
        variant="early-bird"
      />
    </VStack>
  ),
};

export const MultipleTickets: Story = {
  render: () => (
    <VStack gap="md" className="w-[560px]">
      <TicketStub
        eventName="Sunset Open Air"
        date="Sat, June 14 2026 · 7:00 PM"
        venue="Pier 70, San Francisco"
        tier="General Admission"
        price={49}
        attendeeName="Alex Rivera"
        ticketCode="TKT-AB12-CD34"
        variant="general"
      />
      <TicketStub
        eventName="Sunset Open Air"
        date="Sat, June 14 2026 · 7:00 PM"
        venue="Pier 70, San Francisco"
        tier="VIP"
        price={249}
        attendeeName="Jordan Park"
        ticketCode="TKT-VIP-7788"
        variant="vip"
      />
      <TicketStub
        eventName="Sunset Open Air"
        date="Sat, June 14 2026 · 7:00 PM"
        venue="Pier 70, San Francisco"
        tier="Student"
        price={15}
        attendeeName="Riley Morgan"
        ticketCode="TKT-STU-3344"
        variant="student"
      />
    </VStack>
  ),
};
