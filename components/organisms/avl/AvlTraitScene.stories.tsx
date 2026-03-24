import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlTraitScene } from './AvlTraitScene';
import { parseTraitLevel } from './avl-schema-parser';
import type { OrbitalSchema } from '@almadar/core';

// Re-use the test schemas from AvlCosmicZoom.stories
const TASK_SCHEMA: OrbitalSchema = {
  name: 'TaskManager',
  orbitals: [{
    name: 'TaskOrbital',
    entity: { name: 'Task', persistence: 'persistent', fields: [{ name: 'id', type: 'string' }, { name: 'title', type: 'string' }, { name: 'status', type: 'string', default: 'pending' }] },
    traits: [{
      name: 'TaskCrud', linkedEntity: 'Task', category: 'interaction',
      stateMachine: {
        states: [{ name: 'Listing', isInitial: true }, { name: 'Creating' }, { name: 'Editing' }],
        events: [{ key: 'CREATE', name: 'Create' }, { key: 'EDIT', name: 'Edit' }, { key: 'SAVE', name: 'Save' }, { key: 'CANCEL', name: 'Cancel' }, { key: 'INIT', name: 'Init' }],
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
    pages: [{ name: 'TaskList', path: '/tasks' }],
  }],
} as unknown as OrbitalSchema;

const CART_SCHEMA: OrbitalSchema = {
  name: 'ECommerce',
  orbitals: [{
    name: 'ShoppingCart',
    entity: { name: 'CartItem', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }, { name: 'productId', type: 'string' }, { name: 'quantity', type: 'number' }, { name: 'price', type: 'number' }] },
    traits: [{
      name: 'CartManager', linkedEntity: 'CartItem', category: 'interaction',
      listens: [{ event: 'ADD_TO_CART' }],
      emits: [{ event: 'CHECKOUT_COMPLETE', scope: 'external' }],
      stateMachine: {
        states: [{ name: 'Empty', isInitial: true }, { name: 'HasItems' }, { name: 'CheckingOut' }],
        events: [{ key: 'INIT', name: 'Init' }, { key: 'ADD_ITEM', name: 'Add' }, { key: 'REMOVE_ITEM', name: 'Remove' }, { key: 'CHECKOUT', name: 'Checkout' }, { key: 'CONFIRM', name: 'Confirm' }],
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
  }],
} as unknown as OrbitalSchema;

const meta: Meta<typeof AvlTraitScene> = {
  title: 'Avl/Organisms/AvlTraitScene',
  component: AvlTraitScene,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CartManager: Story = {
  render: (args) => {
    const data = parseTraitLevel(CART_SCHEMA, 'ShoppingCart', 'CartManager');
    return (
      <div style={{ width: 700 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTraitScene {...args} data={data} />
        </svg>
      </div>
    );
  },
};

export const TaskCrud: Story = {
  render: (args) => {
    const data = parseTraitLevel(TASK_SCHEMA, 'TaskOrbital', 'TaskCrud');
    return (
      <div style={{ width: 700 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTraitScene {...args} data={data} />
        </svg>
      </div>
    );
  },
};

export const WithEmitListen: Story = {
  render: (args) => {
    const data = parseTraitLevel(CART_SCHEMA, 'ShoppingCart', 'CartManager');
    return (
      <div style={{ width: 700 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTraitScene {...args} data={data} onTransitionClick={(idx, pos) => console.log('Clicked transition', idx, pos)} />
        </svg>
      </div>
    );
  },
};
