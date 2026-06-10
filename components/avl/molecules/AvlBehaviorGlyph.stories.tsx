import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlBehaviorGlyph } from './AvlBehaviorGlyph';

const meta: Meta<typeof AvlBehaviorGlyph> = {
  title: 'Avl/Molecules/AvlBehaviorGlyph',
  component: AvlBehaviorGlyph,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
  },
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'select', options: ['atom', 'molecule', 'organism'] },
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    domain: {
      control: 'select',
      options: ['commerce', 'healthcare', 'education', 'finance', 'scheduling', 'workflow', 'social', 'media', 'gaming', 'iot', 'crm', 'analytics', 'communication', 'content', 'location', 'hr', 'legal', 'real-estate'],
    },
    persistence: { control: 'select', options: ['persistent', 'runtime', 'singleton', 'instance'] },
    fieldCount: { control: { type: 'range', min: 0, max: 12, step: 1 } },
    stateCount: { control: { type: 'range', min: 1, max: 8, step: 1 } },
    showLabels: { control: 'boolean' },
    animated: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Atom Examples ────────────────────────────────────────────

export const BrowseAtom: Story = {
  args: {
    name: 'std-browse',
    level: 'atom',
    domain: 'commerce',
    fieldCount: 4,
    stateCount: 2,
    persistence: 'persistent',
    effectTypes: ['render-ui', 'fetch', 'persist'],
    size: 'lg',
    showLabels: true,
  },
};

export const ModalAtom: Story = {
  args: {
    name: 'std-modal',
    level: 'atom',
    domain: 'commerce',
    fieldCount: 3,
    stateCount: 3,
    persistence: 'persistent',
    effectTypes: ['render-ui', 'persist'],
    size: 'lg',
    showLabels: true,
  },
};

export const AppointmentAtom: Story = {
  args: {
    name: 'std-appointment',
    level: 'atom',
    domain: 'scheduling',
    fieldCount: 6,
    stateCount: 4,
    persistence: 'persistent',
    effectTypes: ['render-ui', 'persist', 'navigate', 'notify'],
    size: 'lg',
    showLabels: true,
  },
};

export const GameLoopAtom: Story = {
  args: {
    name: 'std-game-loop',
    level: 'atom',
    domain: 'gaming',
    fieldCount: 8,
    stateCount: 5,
    persistence: 'runtime',
    effectTypes: ['render-ui', 'set', 'emit'],
    size: 'lg',
    showLabels: true,
    animated: true,
  },
};

// ─── Molecule Examples ────────────────────────────────────────

export const CartMolecule: Story = {
  args: {
    name: 'std-cart',
    level: 'molecule',
    domain: 'commerce',
    size: 'lg',
    showLabels: true,
    children: [
      { name: 'Browse', fieldCount: 4, stateCount: 3, effectTypes: ['render-ui', 'fetch'] },
      { name: 'AddItem', fieldCount: 3, stateCount: 2, effectTypes: ['render-ui', 'persist'] },
      { name: 'Confirm', fieldCount: 2, stateCount: 2, effectTypes: ['render-ui'] },
    ],
  },
};

export const ListMolecule: Story = {
  args: {
    name: 'std-list',
    level: 'molecule',
    domain: 'commerce',
    size: 'lg',
    showLabels: true,
    children: [
      { name: 'Browse', fieldCount: 5, stateCount: 2, effectTypes: ['render-ui', 'fetch'] },
      { name: 'Create', fieldCount: 3, stateCount: 2, effectTypes: ['render-ui', 'persist'] },
      { name: 'Edit', fieldCount: 3, stateCount: 2, effectTypes: ['render-ui', 'persist'] },
      { name: 'Detail', fieldCount: 5, stateCount: 2, effectTypes: ['render-ui'] },
    ],
  },
};

export const InventoryMolecule: Story = {
  args: {
    name: 'std-inventory',
    level: 'molecule',
    domain: 'gaming',
    size: 'lg',
    showLabels: true,
    animated: true,
    children: [
      { name: 'Browse', fieldCount: 6, stateCount: 3, persistence: 'runtime', effectTypes: ['render-ui', 'fetch'] },
      { name: 'Use', fieldCount: 2, stateCount: 2, persistence: 'runtime', effectTypes: ['render-ui', 'emit'] },
      { name: 'Drop', fieldCount: 1, stateCount: 2, persistence: 'runtime', effectTypes: ['render-ui'] },
    ],
  },
};

// ─── Organism Examples ────────────────────────────────────────

export const EcommerceOrganism: Story = {
  args: {
    name: 'std-ecommerce',
    level: 'organism',
    domain: 'commerce',
    size: 'xl',
    showLabels: true,
    children: [
      { name: 'Products', fieldCount: 5, stateCount: 2, effectTypes: ['render-ui', 'fetch'] },
      { name: 'Cart', fieldCount: 4, stateCount: 3, effectTypes: ['render-ui', 'persist'] },
      { name: 'Checkout', fieldCount: 6, stateCount: 5, effectTypes: ['render-ui', 'persist', 'navigate'] },
      { name: 'Orders', fieldCount: 4, stateCount: 2, effectTypes: ['render-ui', 'fetch'] },
    ],
    connections: [
      { from: 'Products', to: 'Cart', event: 'ADD_TO_CART' },
      { from: 'Cart', to: 'Checkout', event: 'CHECKOUT' },
      { from: 'Checkout', to: 'Orders', event: 'ORDER_PLACED' },
    ],
  },
};

export const LmsOrganism: Story = {
  args: {
    name: 'std-lms',
    level: 'organism',
    domain: 'education',
    size: 'xl',
    showLabels: true,
    children: [
      { name: 'Courses', fieldCount: 5, stateCount: 2, effectTypes: ['render-ui', 'fetch'] },
      { name: 'Enrollment', fieldCount: 4, stateCount: 4, effectTypes: ['render-ui', 'persist', 'navigate'] },
      { name: 'Progress', fieldCount: 3, stateCount: 3, effectTypes: ['render-ui', 'set'] },
    ],
    connections: [
      { from: 'Courses', to: 'Enrollment', event: 'ENROLL' },
      { from: 'Enrollment', to: 'Progress', event: 'COMPLETE_LESSON' },
    ],
  },
};

export const CrmOrganism: Story = {
  args: {
    name: 'std-crm',
    level: 'organism',
    domain: 'crm',
    size: 'xl',
    showLabels: true,
    children: [
      { name: 'Contacts', fieldCount: 6, stateCount: 2, effectTypes: ['render-ui', 'fetch', 'persist'] },
      { name: 'Deals', fieldCount: 5, stateCount: 3, effectTypes: ['render-ui', 'persist'] },
      { name: 'Pipeline', fieldCount: 3, stateCount: 2, effectTypes: ['render-ui'] },
      { name: 'Notes', fieldCount: 3, stateCount: 2, effectTypes: ['render-ui', 'persist', 'emit'] },
    ],
    connections: [
      { from: 'Contacts', to: 'Deals', event: 'CONVERT_LEAD' },
      { from: 'Deals', to: 'Pipeline', event: 'CLOSE_DEAL' },
    ],
  },
};

// ─── All Sizes ────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'end', gap: 24 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} style={{ textAlign: 'center' }}>
          <AvlBehaviorGlyph
            name="std-browse"
            level="atom"
            domain="commerce"
            fieldCount={4}
            stateCount={2}
            effectTypes={['render-ui', 'fetch', 'persist']}
            size={s}
          />
          <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>{s}</div>
        </div>
      ))}
    </div>
  ),
};

// ─── All Persistence Types ────────────────────────────────────

export const PersistenceTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32 }}>
      {(['persistent', 'runtime', 'singleton', 'instance'] as const).map((p) => (
        <div key={p} style={{ textAlign: 'center' }}>
          <AvlBehaviorGlyph
            name={p}
            level="atom"
            domain="commerce"
            fieldCount={4}
            stateCount={2}
            persistence={p}
            effectTypes={['render-ui']}
            size="lg"
            showLabels
          />
        </div>
      ))}
    </div>
  ),
};

// ─── Domain Color Palette ─────────────────────────────────────

export const DomainPalette: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, maxWidth: 600 }}>
      {['commerce', 'healthcare', 'education', 'finance', 'scheduling', 'workflow',
        'social', 'media', 'gaming', 'iot', 'crm', 'analytics',
        'communication', 'content', 'location', 'hr', 'legal', 'real-estate',
      ].map((d) => (
        <div key={d} style={{ textAlign: 'center' }}>
          <AvlBehaviorGlyph
            name={d}
            level="atom"
            domain={d}
            fieldCount={4}
            stateCount={3}
            effectTypes={['render-ui', 'persist']}
            size="sm"
          />
          <div style={{ color: '#94a3b8', fontSize: 9, marginTop: 2 }}>{d}</div>
        </div>
      ))}
    </div>
  ),
};

// ─── Complexity Comparison ────────────────────────────────────

export const ComplexityComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <AvlBehaviorGlyph name="simple" level="atom" domain="commerce" fieldCount={2} stateCount={2} effectTypes={['render-ui']} size="lg" showLabels />
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvlBehaviorGlyph name="medium" level="atom" domain="commerce" fieldCount={5} stateCount={4} effectTypes={['render-ui', 'persist', 'fetch']} size="lg" showLabels />
      </div>
      <div style={{ textAlign: 'center' }}>
        <AvlBehaviorGlyph name="complex" level="atom" domain="commerce" fieldCount={10} stateCount={7} effectTypes={['render-ui', 'persist', 'fetch', 'emit', 'navigate', 'notify']} size="lg" showLabels />
      </div>
    </div>
  ),
};
