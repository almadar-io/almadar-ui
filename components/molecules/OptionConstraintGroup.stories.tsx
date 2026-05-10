'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { OptionConstraintGroup, type OptionConstraintOption } from './OptionConstraintGroup';

const meta: Meta<typeof OptionConstraintGroup> = {
  title: 'Core/Molecules/OptionConstraintGroup',
  component: OptionConstraintGroup,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sizeOptions: OptionConstraintOption[] = [
  { id: 'small', label: 'Small (10")' },
  { id: 'medium', label: 'Medium (12")' },
  { id: 'large', label: 'Large (14")' },
  { id: 'xlarge', label: 'Extra Large (16")' },
];

const toppingOptions: OptionConstraintOption[] = [
  { id: 'pepperoni', label: 'Pepperoni', priceDelta: 1.5 },
  { id: 'mushrooms', label: 'Mushrooms', priceDelta: 1.0 },
  { id: 'olives', label: 'Black Olives', priceDelta: 1.0 },
  { id: 'onions', label: 'Red Onions', priceDelta: 0.75 },
  { id: 'peppers', label: 'Bell Peppers', priceDelta: 0.75 },
];

const addOnOptions: OptionConstraintOption[] = [
  { id: 'extra-cheese', label: 'Extra Cheese' },
  { id: 'extra-sauce', label: 'Extra Sauce' },
  { id: 'gluten-free', label: 'Gluten-free Crust' },
];

const decorator = (Story: React.ComponentType): React.ReactElement => (
  <div className="w-96">
    <Story />
  </div>
);

export const SizeRequired: Story = {
  args: {
    groupId: 'size',
    title: 'Size',
    options: sizeOptions,
    constraint: { type: 'single', required: true },
    selected: ['medium'],
  },
  decorators: [decorator],
};

export const ToppingsMulti: Story = {
  args: {
    groupId: 'toppings',
    title: 'Toppings',
    description: 'Choose your favorite toppings',
    options: toppingOptions,
    constraint: { type: 'multi', min: 1, max: 3 },
    selected: ['pepperoni', 'mushrooms'],
  },
  decorators: [decorator],
};

export const AddOnsOptional: Story = {
  args: {
    groupId: 'addons',
    title: 'Add-ons',
    options: addOnOptions,
    constraint: { type: 'multi' },
    selected: [],
  },
  decorators: [decorator],
};

export const WithPriceDelta: Story = {
  args: {
    groupId: 'crust',
    title: 'Crust Style',
    options: [
      { id: 'thin', label: 'Thin Crust' },
      { id: 'classic', label: 'Classic' },
      { id: 'stuffed', label: 'Stuffed Crust', priceDelta: 2.5 },
      { id: 'gluten-free', label: 'Gluten-free', priceDelta: 3.0 },
    ],
    constraint: { type: 'single', required: true },
    selected: ['classic'],
  },
  decorators: [decorator],
};

export const WithOutOfStock: Story = {
  args: {
    groupId: 'toppings-stock',
    title: 'Toppings',
    options: [
      { id: 'pepperoni', label: 'Pepperoni', priceDelta: 1.5 },
      { id: 'mushrooms', label: 'Mushrooms', priceDelta: 1.0, outOfStock: true },
      { id: 'olives', label: 'Black Olives', priceDelta: 1.0 },
      { id: 'truffle', label: 'Truffle Oil', priceDelta: 4.0, outOfStock: true },
    ],
    constraint: { type: 'multi', max: 2 },
    selected: ['pepperoni'],
  },
  decorators: [decorator],
};

export const ErrorState: Story = {
  args: {
    groupId: 'toppings-error',
    title: 'Toppings',
    options: toppingOptions,
    constraint: { type: 'multi', min: 2, max: 3 },
    selected: ['pepperoni'],
  },
  decorators: [decorator],
};

export const Interactive: Story = {
  render: () => {
    const [size, setSize] = useState<string[]>(['medium']);
    const [toppings, setToppings] = useState<string[]>(['pepperoni']);
    const [addOns, setAddOns] = useState<string[]>([]);

    return (
      <div className="w-96 space-y-6">
        <OptionConstraintGroup
          groupId="size-interactive"
          title="Size"
          options={sizeOptions}
          constraint={{ type: 'single', required: true }}
          selected={size}
          onChange={setSize}
        />
        <OptionConstraintGroup
          groupId="toppings-interactive"
          title="Toppings"
          description="Pick 1 to 3 toppings"
          options={toppingOptions}
          constraint={{ type: 'multi', min: 1, max: 3 }}
          selected={toppings}
          onChange={setToppings}
        />
        <OptionConstraintGroup
          groupId="addons-interactive"
          title="Add-ons"
          options={addOnOptions}
          constraint={{ type: 'multi' }}
          selected={addOns}
          onChange={setAddOns}
        />
      </div>
    );
  },
};
