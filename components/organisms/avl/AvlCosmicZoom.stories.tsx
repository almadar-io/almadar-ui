import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlCosmicZoom } from './AvlCosmicZoom';
import { AvlApplicationScene } from './AvlApplicationScene';
import { AvlOrbitalScene } from './AvlOrbitalScene';
import { AvlTraitScene } from './AvlTraitScene';
import { AvlTransitionScene } from './AvlTransitionScene';
import { parseApplicationLevel, parseOrbitalLevel, parseTraitLevel, parseTransitionLevel } from './avl-schema-parser';
import type { OrbitalSchema } from '@almadar/core';

// ---------------------------------------------------------------------------
// Test schemas
// ---------------------------------------------------------------------------

/** Simple single-orbital schema (task manager) */
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
    }],
    pages: [
      { name: 'TaskList', path: '/tasks' },
      { name: 'TaskDetail', path: '/tasks/:id' },
    ],
  }],
} as unknown as OrbitalSchema;

/** Multi-orbital schema with cross-orbital communication */
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
// Stories: AvlCosmicZoom (full interactive)
// ---------------------------------------------------------------------------

const cosmicMeta: Meta<typeof AvlCosmicZoom> = {
  title: 'Avl/Organisms/AvlCosmicZoom',
  component: AvlCosmicZoom,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
    animated: { control: 'boolean' },
    width: { control: 'number' },
    height: { control: 'number' },
  },
};

export default cosmicMeta;
type CosmicStory = StoryObj<typeof cosmicMeta>;

export const SingleOrbital: CosmicStory = {
  name: 'Single Orbital (Task Manager)',
  render: (args) => (
    <div style={{ width: 700, height: 500 }}>
      <AvlCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: TASK_MANAGER_SCHEMA,
    width: 700,
    height: 500,
  },
};

export const MultiOrbital: CosmicStory = {
  name: 'Multi-Orbital (E-Commerce)',
  render: (args) => (
    <div style={{ width: 800, height: 550 }}>
      <AvlCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: ECOMMERCE_SCHEMA,
    width: 800,
    height: 550,
  },
};

export const PreSelectedOrbital: CosmicStory = {
  name: 'Pre-selected Orbital',
  render: (args) => (
    <div style={{ width: 700, height: 500 }}>
      <AvlCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: ECOMMERCE_SCHEMA,
    initialOrbital: 'ShoppingCart',
    width: 700,
    height: 500,
  },
};

export const PreSelectedTrait: CosmicStory = {
  name: 'Pre-selected Trait',
  render: (args) => (
    <div style={{ width: 700, height: 500 }}>
      <AvlCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: TASK_MANAGER_SCHEMA,
    initialOrbital: 'TaskOrbital',
    initialTrait: 'TaskCrud',
    width: 700,
    height: 500,
  },
};

export const CustomColor: CosmicStory = {
  name: 'Custom Color (Indigo)',
  render: (args) => (
    <div style={{ width: 700, height: 500 }}>
      <AvlCosmicZoom {...args} />
    </div>
  ),
  args: {
    schema: ECOMMERCE_SCHEMA,
    color: '#6366f1',
    width: 700,
    height: 500,
  },
};

// ---------------------------------------------------------------------------
// Stories: Individual Scenes (standalone)
// ---------------------------------------------------------------------------

export const ApplicationScene: CosmicStory = {
  name: 'Scene: Application Level',
  render: () => {
    const data = parseApplicationLevel(ECOMMERCE_SCHEMA);
    return (
      <div style={{ width: 700, height: 500 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlApplicationScene data={data} onOrbitalClick={(name) => alert(`Clicked: ${name}`)} />
        </svg>
      </div>
    );
  },
};

export const OrbitalScene: CosmicStory = {
  name: 'Scene: Orbital Level (ShoppingCart)',
  render: () => {
    const data = parseOrbitalLevel(ECOMMERCE_SCHEMA, 'ShoppingCart');
    if (!data) return <div>Orbital not found</div>;
    return (
      <div style={{ width: 700, height: 500 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlOrbitalScene data={data} onTraitClick={(name) => alert(`Clicked trait: ${name}`)} />
        </svg>
      </div>
    );
  },
};

export const TraitScene: CosmicStory = {
  name: 'Scene: Trait Level (CartManager)',
  render: () => {
    const data = parseTraitLevel(ECOMMERCE_SCHEMA, 'ShoppingCart', 'CartManager');
    if (!data) return <div>Trait not found</div>;
    return (
      <div style={{ width: 700, height: 500 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTraitScene data={data} onTransitionClick={(i) => alert(`Clicked transition #${i}`)} />
        </svg>
      </div>
    );
  },
};

export const TransitionScene: CosmicStory = {
  name: 'Scene: Transition Level (CHECKOUT -> CONFIRM)',
  render: () => {
    const data = parseTransitionLevel(ECOMMERCE_SCHEMA, 'ShoppingCart', 'CartManager', 5);
    if (!data) return <div>Transition not found</div>;
    return (
      <div style={{ width: 700, height: 500 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTransitionScene data={data} />
        </svg>
      </div>
    );
  },
};

export const CrossOrbitalCommunication: CosmicStory = {
  name: 'Cross-Orbital Communication',
  render: () => {
    const data = parseApplicationLevel(ECOMMERCE_SCHEMA);
    return (
      <div style={{ width: 800, height: 550 }}>
        <div style={{ marginBottom: 8, color: '#999', fontSize: 12 }}>
          Cross-links: {data.crossLinks.map(l => `${l.emitterOrbital} --[${l.eventName}]-- ${l.listenerOrbital}`).join(', ')}
        </div>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlApplicationScene data={data} />
        </svg>
      </div>
    );
  },
};
