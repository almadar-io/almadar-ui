import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avl3DViewer } from './Avl3DViewer';
import type { OrbitalSchema } from '@almadar/core';

// ---------------------------------------------------------------------------
// Test schemas (shared with AvlCosmicZoom stories)
// ---------------------------------------------------------------------------

const TASK_MANAGER_SCHEMA: OrbitalSchema = {
  name: 'TaskManager',
  orbitals: [{
    name: 'TaskOrbital',
    entity: {
      name: 'Task',
      persistence: 'persistent',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'status', type: 'string', default: 'pending' },
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
          { key: 'EDIT', name: 'Edit' },
          { key: 'SAVE', name: 'Save' },
          { key: 'CANCEL', name: 'Cancel' },
        ],
        transitions: [
          { from: 'Listing', to: 'Listing', event: 'INIT', effects: [['fetch', 'Task'], ['render-ui', 'main', { type: 'stack' }]] },
          { from: 'Listing', to: 'Creating', event: 'CREATE', effects: [['render-ui', 'modal', { type: 'form' }]] },
          { from: 'Creating', to: 'Listing', event: 'SAVE', effects: [['persist', 'create', 'Task'], ['notify', 'success', 'Created']] },
          { from: 'Creating', to: 'Listing', event: 'CANCEL' },
          { from: 'Listing', to: 'Editing', event: 'EDIT', effects: [['render-ui', 'modal', { type: 'form' }]] },
          { from: 'Editing', to: 'Listing', event: 'SAVE', effects: [['persist', 'update', 'Task']] },
          { from: 'Editing', to: 'Listing', event: 'CANCEL' },
        ],
      },
    }, {
      name: 'TaskAssign',
      linkedEntity: 'Task',
      category: 'interaction',
      stateMachine: {
        states: [
          { name: 'Unassigned', isInitial: true },
          { name: 'Assigned' },
        ],
        events: [
          { key: 'ASSIGN', name: 'Assign' },
          { key: 'UNASSIGN', name: 'Unassign' },
        ],
        transitions: [
          { from: 'Unassigned', to: 'Assigned', event: 'ASSIGN', effects: [['set', 'assignee', '@payload.userId']] },
          { from: 'Assigned', to: 'Unassigned', event: 'UNASSIGN', effects: [['set', 'assignee', '']] },
        ],
      },
    }],
    pages: [
      { name: 'TaskList', path: '/tasks' },
      { name: 'TaskDetail', path: '/tasks/:id' },
    ],
  }],
} as unknown as OrbitalSchema;

const ECOMMERCE_SCHEMA: OrbitalSchema = {
  name: 'ECommerce',
  orbitals: [
    {
      name: 'ProductCatalog',
      entity: {
        name: 'Product',
        persistence: 'persistent',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'price', type: 'number' },
          { name: 'stock', type: 'number' },
        ],
      },
      traits: [{
        name: 'ProductBrowse',
        linkedEntity: 'Product',
        category: 'interaction',
        emits: [{ event: 'ADD_TO_CART', scope: 'external' }],
        stateMachine: {
          states: [
            { name: 'Browsing', isInitial: true },
            { name: 'ViewingDetail' },
          ],
          events: [
            { key: 'INIT', name: 'Initialize' },
            { key: 'VIEW', name: 'View Product' },
            { key: 'ADD_TO_CART', name: 'Add to Cart' },
            { key: 'BACK', name: 'Back' },
          ],
          transitions: [
            { from: 'Browsing', to: 'Browsing', event: 'INIT', effects: [['fetch', 'Product'], ['render-ui', 'main', { type: 'grid' }]] },
            { from: 'Browsing', to: 'ViewingDetail', event: 'VIEW', effects: [['render-ui', 'main', { type: 'card' }]] },
            { from: 'ViewingDetail', to: 'ViewingDetail', event: 'ADD_TO_CART', effects: [['emit', 'ADD_TO_CART']] },
            { from: 'ViewingDetail', to: 'Browsing', event: 'BACK' },
          ],
        },
      }],
      pages: [{ name: 'Shop', path: '/shop' }],
    },
    {
      name: 'ShoppingCart',
      entity: {
        name: 'CartItem',
        persistence: 'runtime',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'productId', type: 'string' },
          { name: 'quantity', type: 'number' },
          { name: 'price', type: 'number' },
        ],
      },
      traits: [{
        name: 'CartManager',
        linkedEntity: 'CartItem',
        category: 'interaction',
        listens: [{ event: 'ADD_TO_CART' }],
        emits: [{ event: 'CHECKOUT_COMPLETE', scope: 'external' }],
        stateMachine: {
          states: [
            { name: 'Empty', isInitial: true },
            { name: 'HasItems' },
            { name: 'CheckingOut' },
          ],
          events: [
            { key: 'INIT', name: 'Initialize' },
            { key: 'ADD_ITEM', name: 'Add Item' },
            { key: 'REMOVE_ITEM', name: 'Remove' },
            { key: 'CHECKOUT', name: 'Checkout' },
            { key: 'CONFIRM', name: 'Confirm' },
          ],
          transitions: [
            { from: 'Empty', to: 'Empty', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography' }]] },
            { from: 'Empty', to: 'HasItems', event: 'ADD_ITEM', effects: [['persist', 'create', 'CartItem']] },
            { from: 'HasItems', to: 'HasItems', event: 'ADD_ITEM', effects: [['persist', 'create', 'CartItem']] },
            { from: 'HasItems', to: 'HasItems', event: 'REMOVE_ITEM', effects: [['persist', 'delete', 'CartItem']] },
            { from: 'HasItems', to: 'CheckingOut', event: 'CHECKOUT', effects: [['render-ui', 'modal', { type: 'form' }]] },
            { from: 'CheckingOut', to: 'Empty', event: 'CONFIRM', effects: [['emit', 'CHECKOUT_COMPLETE'], ['notify', 'success', 'Order placed']] },
          ],
        },
      }],
      pages: [{ name: 'Cart', path: '/cart' }],
    },
    {
      name: 'OrderManagement',
      entity: {
        name: 'Order',
        persistence: 'persistent',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'total', type: 'number' },
          { name: 'status', type: 'string' },
          { name: 'createdAt', type: 'string' },
        ],
      },
      traits: [{
        name: 'OrderLifecycle',
        linkedEntity: 'Order',
        category: 'interaction',
        listens: [{ event: 'CHECKOUT_COMPLETE' }],
        stateMachine: {
          states: [
            { name: 'Pending', isInitial: true },
            { name: 'Processing' },
            { name: 'Shipped' },
            { name: 'Delivered', isTerminal: true },
          ],
          events: [
            { key: 'INIT', name: 'Initialize' },
            { key: 'PROCESS', name: 'Process' },
            { key: 'SHIP', name: 'Ship' },
            { key: 'DELIVER', name: 'Deliver' },
          ],
          transitions: [
            { from: 'Pending', to: 'Pending', event: 'INIT', effects: [['fetch', 'Order'], ['render-ui', 'main', { type: 'stack' }]] },
            { from: 'Pending', to: 'Processing', event: 'PROCESS', effects: [['set', 'status', 'processing']] },
            { from: 'Processing', to: 'Shipped', event: 'SHIP', effects: [['set', 'status', 'shipped'], ['notify', 'info', 'Shipped']] },
            { from: 'Shipped', to: 'Delivered', event: 'DELIVER', effects: [['set', 'status', 'delivered']] },
          ],
        },
      }],
      pages: [{ name: 'Orders', path: '/orders' }],
    },
  ],
} as unknown as OrbitalSchema;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof Avl3DViewer> = {
  title: 'Avl/Organisms/Avl3DViewer',
  component: Avl3DViewer,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    // Disable autodocs to prevent R3F hooks from running outside Canvas
    docs: { disable: true },
  },
  tags: [],
  argTypes: {
    animated: { control: 'boolean' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', minHeight: '100vh', background: '#0c1222', padding: 0 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GalaxyView: Story = {
  name: 'Galaxy View (Single Orbital)',
  args: {
    schema: TASK_MANAGER_SCHEMA,
    width: '100%',
    height: 600,
  },
};

export const MultiOrbital: Story = {
  name: 'Multi-Orbital Galaxy (E-Commerce)',
  args: {
    schema: ECOMMERCE_SCHEMA,
    width: '100%',
    height: 600,
  },
};

export const NoAnimation: Story = {
  name: 'No Animation',
  args: {
    schema: ECOMMERCE_SCHEMA,
    animated: false,
    width: '100%',
    height: 600,
  },
};

export const CompactSize: Story = {
  name: 'Compact Size',
  args: {
    schema: ECOMMERCE_SCHEMA,
    width: 500,
    height: 400,
  },
};

export const WithEffects: Story = {
  name: 'With Postprocessing Effects',
  args: {
    schema: ECOMMERCE_SCHEMA,
    effects: true,
    width: '100%',
    height: 600,
  },
};
