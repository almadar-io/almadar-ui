import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlOrbitalsCosmicZoom } from './AvlOrbitalsCosmicZoom';

const meta: Meta<typeof AvlOrbitalsCosmicZoom> = {
  title: 'Avl/Organisms/AvlOrbitalsCosmicZoom',
  component: AvlOrbitalsCosmicZoom,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  argTypes: {
    animated: { control: 'boolean' },
    color: { control: 'color' },
    height: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const SINGLE_ORBITAL_SCHEMA = JSON.stringify({
  name: 'TaskManager',
  orbitals: [{
    name: 'TaskOrbital',
    entity: {
      name: 'Task',
      persistence: 'persistent',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'assignee', type: 'string' },
      ],
    },
    traits: [{
      name: 'TaskCrud',
      linkedEntity: 'Task',
      category: 'interaction',
      stateMachine: {
        states: [
          { name: 'Listing', isInitial: true },
          { name: 'Creating' },
          { name: 'Editing' },
        ],
        events: [
          { key: 'INIT', name: 'Initialize' },
          { key: 'CREATE', name: 'Create' },
          { key: 'SAVE', name: 'Save' },
          { key: 'CANCEL', name: 'Cancel' },
        ],
        transitions: [],
      },
    }],
    pages: [
      { name: 'TaskList', path: '/tasks' },
    ],
  }],
});

const MULTI_ORBITAL_SCHEMA = JSON.stringify({
  name: 'eCommerce',
  orbitals: [
    {
      name: 'OrderOrbital',
      entity: {
        name: 'Order',
        persistence: 'persistent',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'status', type: 'string' },
          { name: 'total', type: 'number' },
          { name: 'customerId', type: 'string' },
        ],
      },
      traits: [{
        name: 'OrderLifecycle',
        linkedEntity: 'Order',
        category: 'lifecycle',
        emits: [
          { event: 'ORDER_PLACED', scope: 'external' },
          { event: 'ORDER_SHIPPED', scope: 'external' },
        ],
        stateMachine: { states: [{ name: 'pending', isInitial: true }, { name: 'confirmed' }, { name: 'shipped' }], transitions: [], events: [] },
      }],
      pages: [{ name: 'Orders', path: '/orders' }],
    },
    {
      name: 'InventoryOrbital',
      entity: {
        name: 'InventoryItem',
        persistence: 'persistent',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'sku', type: 'string' },
          { name: 'quantity', type: 'number' },
        ],
      },
      traits: [{
        name: 'InventoryManager',
        linkedEntity: 'InventoryItem',
        category: 'interaction',
        listens: [{ event: 'ORDER_PLACED' }],
        emits: [{ event: 'STOCK_UPDATED', scope: 'external' }],
        stateMachine: { states: [{ name: 'idle', isInitial: true }], transitions: [], events: [] },
      }],
      pages: [{ name: 'Inventory', path: '/inventory' }],
    },
    {
      name: 'NotificationOrbital',
      entity: {
        name: 'Notification',
        persistence: 'runtime',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'message', type: 'string' },
        ],
      },
      traits: [{
        name: 'NotificationHandler',
        linkedEntity: 'Notification',
        category: 'notification',
        listens: [
          { event: 'ORDER_SHIPPED' },
          { event: 'STOCK_UPDATED' },
        ],
        stateMachine: { states: [{ name: 'idle', isInitial: true }, { name: 'active' }], transitions: [], events: [] },
      }],
      pages: [],
    },
  ],
});

const FOUR_ORBITAL_SCHEMA = JSON.stringify({
  name: 'ProjectManagement',
  orbitals: [
    {
      name: 'ProjectOrbital',
      entity: { name: 'Project', persistence: 'persistent', fields: [{ name: 'id', type: 'string' }, { name: 'name', type: 'string' }, { name: 'status', type: 'string' }] },
      traits: [{ name: 'ProjectCrud', linkedEntity: 'Project', category: 'interaction', emits: [{ event: 'PROJECT_CREATED', scope: 'external' }], stateMachine: { states: [{ name: 'listing', isInitial: true }], transitions: [], events: [] } }],
      pages: [{ name: 'Projects', path: '/projects' }],
    },
    {
      name: 'TaskOrbital',
      entity: { name: 'Task', persistence: 'persistent', fields: [{ name: 'id', type: 'string' }, { name: 'title', type: 'string' }, { name: 'assignee', type: 'string' }] },
      traits: [{ name: 'TaskAssignment', linkedEntity: 'Task', category: 'interaction', listens: [{ event: 'PROJECT_CREATED' }], emits: [{ event: 'TASK_COMPLETED', scope: 'external' }], stateMachine: { states: [{ name: 'open', isInitial: true }], transitions: [], events: [] } }],
      pages: [{ name: 'Tasks', path: '/tasks' }],
    },
    {
      name: 'TeamOrbital',
      entity: { name: 'Team', persistence: 'persistent', fields: [{ name: 'id', type: 'string' }, { name: 'name', type: 'string' }] },
      traits: [{ name: 'TeamManager', linkedEntity: 'Team', category: 'interaction', listens: [{ event: 'TASK_COMPLETED' }], stateMachine: { states: [{ name: 'idle', isInitial: true }], transitions: [], events: [] } }],
      pages: [{ name: 'Teams', path: '/teams' }],
    },
    {
      name: 'ReportOrbital',
      entity: { name: 'Report', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }, { name: 'data', type: 'object' }] },
      traits: [{ name: 'ReportGenerator', linkedEntity: 'Report', category: 'integration', listens: [{ event: 'TASK_COMPLETED' }, { event: 'PROJECT_CREATED' }], stateMachine: { states: [{ name: 'idle', isInitial: true }], transitions: [], events: [] } }],
      pages: [{ name: 'Reports', path: '/reports' }],
    },
  ],
});

export const SingleOrbital: Story = {
  render: (args) => (
    <div style={{ width: 700, height: 350, background: 'var(--color-background, #0d1117)' }}>
      <AvlOrbitalsCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: SINGLE_ORBITAL_SCHEMA,
    animated: true,
    height: 350,
  },
};

export const MultiOrbitalWithEvents: Story = {
  render: (args) => (
    <div style={{ width: 800, height: 500, background: 'var(--color-background, #0d1117)' }}>
      <AvlOrbitalsCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: MULTI_ORBITAL_SCHEMA,
    animated: true,
    height: 500,
  },
};

export const FourOrbitals: Story = {
  render: (args) => (
    <div style={{ width: 800, height: 550, background: 'var(--color-background, #0d1117)' }}>
      <AvlOrbitalsCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: FOUR_ORBITAL_SCHEMA,
    animated: true,
    height: 550,
  },
};

export const CustomColor: Story = {
  render: (args) => (
    <div style={{ width: 800, height: 500, background: 'var(--color-background, #0d1117)' }}>
      <AvlOrbitalsCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: MULTI_ORBITAL_SCHEMA,
    color: '#1ABC9C',
    animated: true,
    height: 500,
  },
};

export const StaticNoAnimation: Story = {
  render: (args) => (
    <div style={{ width: 800, height: 500, background: 'var(--color-background, #0d1117)' }}>
      <AvlOrbitalsCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: MULTI_ORBITAL_SCHEMA,
    animated: false,
    height: 500,
  },
};
