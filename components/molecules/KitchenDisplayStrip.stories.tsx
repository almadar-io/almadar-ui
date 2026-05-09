import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { KitchenDisplayStrip, type KdsItem } from './KitchenDisplayStrip';

const meta: Meta<typeof KitchenDisplayStrip> = {
  title: 'Core/Molecules/KitchenDisplayStrip',
  component: KitchenDisplayStrip,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'preparing', 'ready', 'served'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseItems: KdsItem[] = [
  { id: '1', name: 'Cheeseburger', quantity: 2 },
  { id: '2', name: 'Fries', quantity: 1 },
];

const minutesAgo = (m: number): number => Date.now() - m * 60_000;

export const Default: Story = {
  args: {
    orderId: '1042',
    tableLabel: 'Table 7',
    serverName: 'Alex',
    items: baseItems,
    status: 'pending',
    receivedAt: minutesAgo(2),
  },
};

export const Aging: Story = {
  args: {
    orderId: '1043',
    tableLabel: 'Table 12',
    serverName: 'Jordan',
    items: baseItems,
    status: 'preparing',
    receivedAt: minutesAgo(10),
  },
};

export const Overdue: Story = {
  args: {
    orderId: '1044',
    tableLabel: 'Counter',
    serverName: 'Sam',
    items: baseItems,
    status: 'preparing',
    receivedAt: minutesAgo(25),
  },
};

export const MultipleItems: Story = {
  args: {
    orderId: '1045',
    tableLabel: 'Table 3',
    serverName: 'Riley',
    items: [
      { id: '1', name: 'Caesar Salad', quantity: 1 },
      { id: '2', name: 'Margherita Pizza', quantity: 2 },
      { id: '3', name: 'Spaghetti Carbonara', quantity: 1 },
      { id: '4', name: 'Tiramisu', quantity: 2 },
      { id: '5', name: 'Sparkling Water', quantity: 4 },
    ],
    status: 'pending',
    receivedAt: minutesAgo(3),
  },
};

export const WithModifiers: Story = {
  args: {
    orderId: '1046',
    tableLabel: 'Table 9',
    serverName: 'Casey',
    items: [
      {
        id: '1',
        name: 'Ribeye Steak',
        quantity: 1,
        modifiers: ['medium-rare', 'no butter'],
        notes: 'Allergic to garlic',
      },
      {
        id: '2',
        name: 'House Burger',
        quantity: 1,
        modifiers: ['no onion', 'extra cheese', 'gluten-free bun'],
      },
      {
        id: '3',
        name: 'Side Salad',
        quantity: 2,
        modifiers: ['dressing on the side'],
      },
    ],
    status: 'preparing',
    receivedAt: minutesAgo(7),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-start gap-4">
      <KitchenDisplayStrip
        orderId="1047-sm"
        tableLabel="Table 1"
        serverName="Pat"
        size="sm"
        items={baseItems}
        status="pending"
        receivedAt={minutesAgo(2)}
      />
      <KitchenDisplayStrip
        orderId="1047-md"
        tableLabel="Table 1"
        serverName="Pat"
        size="md"
        items={baseItems}
        status="pending"
        receivedAt={minutesAgo(2)}
      />
    </div>
  ),
};

export const ReadyState: Story = {
  args: {
    orderId: '1048',
    tableLabel: 'Takeout',
    serverName: 'Morgan',
    items: baseItems,
    status: 'ready',
    receivedAt: minutesAgo(6),
    onMarkServed: () => console.log('marked served'),
  },
};

export const LiveTimer: Story = {
  render: () => {
    const [fresh, setFresh] = useState<number>(Date.now() - 1 * 60 * 1000);
    const [aging, setAging] = useState<number>(Date.now() - 8 * 60 * 1000);
    const [overdue, setOverdue] = useState<number>(Date.now() - 22 * 60 * 1000);

    useEffect(() => {
      const id = setInterval(() => {
        setFresh((v) => v - 60_000);
        setAging((v) => v - 60_000);
        setOverdue((v) => v - 60_000);
      }, 5_000);
      return () => clearInterval(id);
    }, []);

    return (
      <div className="flex items-start gap-4">
        <KitchenDisplayStrip
          orderId="L-1"
          tableLabel="Table 4"
          serverName="Live"
          items={baseItems}
          status="pending"
          receivedAt={fresh}
          onMarkReady={() => console.log('ready 1')}
        />
        <KitchenDisplayStrip
          orderId="L-2"
          tableLabel="Table 5"
          serverName="Live"
          items={baseItems}
          status="preparing"
          receivedAt={aging}
          onMarkReady={() => console.log('ready 2')}
        />
        <KitchenDisplayStrip
          orderId="L-3"
          tableLabel="Table 6"
          serverName="Live"
          items={baseItems}
          status="preparing"
          receivedAt={overdue}
          onMarkReady={() => console.log('ready 3')}
        />
      </div>
    );
  },
};
