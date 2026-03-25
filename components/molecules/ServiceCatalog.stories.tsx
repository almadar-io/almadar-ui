import type { Meta, StoryObj } from '@storybook/react-vite';
import { ServiceCatalog } from './ServiceCatalog';

const meta: Meta<typeof ServiceCatalog> = {
  title: 'Molecules/ServiceCatalog',
  component: ServiceCatalog,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultServices = [
  { name: 'Auth Service', layer: 'Core', layerColor: 'bg-primary text-primary-foreground' },
  { name: 'User Service', layer: 'Core', layerColor: 'bg-primary text-primary-foreground' },
  { name: 'Config Service', layer: 'Core', layerColor: 'bg-primary text-primary-foreground' },
  { name: 'Notification Service', layer: 'Core', layerColor: 'bg-primary text-primary-foreground' },
  { name: 'Payment Gateway', layer: 'Integration', layerColor: 'bg-success text-white' },
  { name: 'Email Provider', layer: 'Integration', layerColor: 'bg-success text-white' },
  { name: 'SMS Provider', layer: 'Integration', layerColor: 'bg-success text-white' },
  { name: 'Storage CDN', layer: 'Integration', layerColor: 'bg-success text-white' },
  { name: 'Product Catalog', layer: 'Domain', layerColor: 'bg-warning text-white' },
  { name: 'Order Engine', layer: 'Domain', layerColor: 'bg-warning text-white' },
  { name: 'Inventory Tracker', layer: 'Domain', layerColor: 'bg-warning text-white' },
  { name: 'Analytics Engine', layer: 'Domain', layerColor: 'bg-warning text-white' },
];

export const Default: Story = {
  args: {
    services: defaultServices,
  },
};

export const FewServices: Story = {
  args: {
    services: [
      { name: 'Auth Service', layer: 'Core' },
      { name: 'User Service', layer: 'Core' },
      { name: 'Payment Gateway', layer: 'Integration' },
    ],
  },
};

export const ManyServices: Story = {
  args: {
    services: [
      ...defaultServices,
      { name: 'Search Index', layer: 'Infrastructure', layerColor: 'bg-info text-white' },
      { name: 'Cache Layer', layer: 'Infrastructure', layerColor: 'bg-info text-white' },
      { name: 'Queue Service', layer: 'Infrastructure', layerColor: 'bg-info text-white' },
      { name: 'Log Aggregator', layer: 'Infrastructure', layerColor: 'bg-info text-white' },
      { name: 'Rate Limiter', layer: 'Infrastructure', layerColor: 'bg-info text-white' },
      { name: 'Feature Flags', layer: 'Infrastructure', layerColor: 'bg-info text-white' },
    ],
  },
};
