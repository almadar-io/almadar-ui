import type { Meta, StoryObj } from '@storybook/react-vite';
import { Invoice } from './Invoice';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof Invoice> = {
  title: 'Marketing/Molecules/Invoice',
  component: Invoice,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseFrom = {
  name: 'Almadar Inc.',
  addressLines: ['1 Orbital Way', 'Cambridge, MA 02139'],
  email: 'billing@almadar.io',
};

const baseTo = {
  name: 'Acme Corp.',
  addressLines: ['500 Market Street', 'San Francisco, CA 94105'],
  email: 'ap@acme.com',
};

const wrap = (Story: React.ComponentType) => (
  <VStack className="w-[720px]">
    <Story />
  </VStack>
);

export const Default: Story = {
  args: {
    invoiceNumber: 'INV-2026-0042',
    status: 'sent',
    issuedAt: '2026-05-01',
    dueAt: '2026-05-31',
    from: baseFrom,
    to: baseTo,
    items: [
      { id: '1', description: 'Implementation services', quantity: 10, unitPrice: 200, taxRate: 0.08 },
      { id: '2', description: 'Monthly subscription', quantity: 1, unitPrice: 499, taxRate: 0.08 },
    ],
    currency: 'USD',
    paymentUrl: 'https://pay.almadar.io/INV-2026-0042',
  },
  decorators: [wrap],
};

export const Paid: Story = {
  args: {
    invoiceNumber: 'INV-2026-0017',
    status: 'paid',
    issuedAt: '2026-04-01',
    dueAt: '2026-04-30',
    from: baseFrom,
    to: baseTo,
    items: [
      { id: '1', description: 'Annual platform license', quantity: 1, unitPrice: 12000, taxRate: 0.08 },
    ],
    currency: 'USD',
  },
  decorators: [wrap],
};

export const Overdue: Story = {
  args: {
    invoiceNumber: 'INV-2026-0008',
    status: 'overdue',
    issuedAt: '2026-03-01',
    dueAt: '2026-03-31',
    from: baseFrom,
    to: baseTo,
    items: [
      { id: '1', description: 'Consulting hours', quantity: 20, unitPrice: 250, taxRate: 0.08 },
      { id: '2', description: 'Workshop facilitation', quantity: 1, unitPrice: 2000, taxRate: 0.08 },
    ],
    currency: 'USD',
    paymentUrl: 'https://pay.almadar.io/INV-2026-0008',
  },
  decorators: [wrap],
};

export const Draft: Story = {
  args: {
    invoiceNumber: 'INV-2026-DRAFT',
    status: 'draft',
    issuedAt: '2026-05-09',
    dueAt: '2026-06-08',
    from: baseFrom,
    to: baseTo,
    items: [
      { id: '1', description: 'Discovery sprint', quantity: 1, unitPrice: 5000 },
    ],
    currency: 'USD',
    taxRateDefault: 0.08,
  },
  decorators: [wrap],
};

export const MultipleItems: Story = {
  args: {
    invoiceNumber: 'INV-2026-0099',
    status: 'sent',
    issuedAt: '2026-05-05',
    dueAt: '2026-06-04',
    from: baseFrom,
    to: baseTo,
    items: [
      { id: '1', description: 'Strategy workshop', quantity: 2, unitPrice: 1500, taxRate: 0.08 },
      { id: '2', description: 'Architecture review', quantity: 4, unitPrice: 350, taxRate: 0.08 },
      { id: '3', description: 'Code audit', quantity: 12, unitPrice: 200, taxRate: 0.08 },
      { id: '4', description: 'Performance tuning', quantity: 8, unitPrice: 225, taxRate: 0.08 },
      { id: '5', description: 'Documentation', quantity: 6, unitPrice: 175, taxRate: 0.08 },
      { id: '6', description: 'Training session', quantity: 1, unitPrice: 2500, taxRate: 0.08 },
    ],
    currency: 'USD',
    paymentUrl: 'https://pay.almadar.io/INV-2026-0099',
  },
  decorators: [wrap],
};

export const WithDifferentTaxRates: Story = {
  args: {
    invoiceNumber: 'INV-2026-EU-12',
    status: 'sent',
    issuedAt: '2026-05-02',
    dueAt: '2026-06-01',
    from: { ...baseFrom, name: 'Almadar EU GmbH' },
    to: { ...baseTo, name: 'Beispiel GmbH', addressLines: ['Hauptstr. 1', '10115 Berlin'] },
    items: [
      { id: '1', description: 'Software license (digital)', quantity: 1, unitPrice: 1000, taxRate: 0.19 },
      { id: '2', description: 'Printed manuals', quantity: 5, unitPrice: 40, taxRate: 0.07 },
      { id: '3', description: 'Export-exempt support', quantity: 10, unitPrice: 100, taxRate: 0 },
    ],
    currency: 'EUR',
    paymentUrl: 'https://pay.almadar.io/INV-2026-EU-12',
  },
  decorators: [wrap],
};

export const WithNotes: Story = {
  args: {
    invoiceNumber: 'INV-2026-0123',
    status: 'sent',
    issuedAt: '2026-05-03',
    dueAt: '2026-06-02',
    from: baseFrom,
    to: baseTo,
    items: [
      { id: '1', description: 'Integration milestone 1', quantity: 1, unitPrice: 8000, taxRate: 0.08 },
    ],
    currency: 'USD',
    notes: 'Payment terms: net 30. Wire transfer details on request. Thank you for your business.',
    paymentUrl: 'https://pay.almadar.io/INV-2026-0123',
  },
  decorators: [wrap],
};

export const MinimalNoTax: Story = {
  args: {
    invoiceNumber: 'INV-2026-0500',
    issuedAt: '2026-05-09',
    dueAt: '2026-05-23',
    from: { name: 'Solo Dev Co.' },
    to: { name: 'Tiny Startup Inc.' },
    items: [
      { id: '1', description: 'One-off consultation', quantity: 1, unitPrice: 350 },
    ],
  },
  decorators: [wrap],
};
