import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvlTransitionScene } from './AvlTransitionScene';
import { parseTransitionLevel, parseTraitLevel } from './avl-schema-parser';
import type { OrbitalSchema } from '@almadar/core';

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

const meta: Meta<typeof AvlTransitionScene> = {
  title: 'Avl/Organisms/AvlTransitionScene',
  component: AvlTransitionScene,
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  tags: ['autodocs'],
  argTypes: {
    color: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ConfirmCheckout: Story = {
  render: (args) => {
    const data = parseTransitionLevel(CART_SCHEMA, 'ShoppingCart', 'CartManager', 5);
    return (
      <div style={{ width: 600 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTransitionScene {...args} data={data} />
        </svg>
      </div>
    );
  },
};

export const AddItem: Story = {
  render: (args) => {
    const data = parseTransitionLevel(CART_SCHEMA, 'ShoppingCart', 'CartManager', 1);
    return (
      <div style={{ width: 600 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTransitionScene {...args} data={data} />
        </svg>
      </div>
    );
  },
};

export const RenderUI: Story = {
  render: (args) => {
    const data = parseTransitionLevel(CART_SCHEMA, 'ShoppingCart', 'CartManager', 0);
    return (
      <div style={{ width: 600 }}>
        <svg viewBox="0 0 600 400" style={{ width: '100%', height: '100%' }}>
          <AvlTransitionScene {...args} data={data} />
        </svg>
      </div>
    );
  },
};
