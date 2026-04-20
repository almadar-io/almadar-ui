import type { Meta, StoryObj } from '@storybook/react';
import type { Trait, Effect } from '@almadar/core';
import { JazariStateMachine } from './JazariStateMachine';

const meta: Meta<typeof JazariStateMachine> = {
  title: 'Core/Organisms/JazariStateMachine',
  component: JazariStateMachine,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'dark', values: [{ name: 'dark', value: '#1a1a2e' }] },
  },
};

export default meta;
type Story = StoryObj<typeof JazariStateMachine>;

// ---------------------------------------------------------------------------
// Sample data
// ---------------------------------------------------------------------------

const simpleTrait: Trait = {
  name: 'TaskManagement',
  scope: 'instance',
  stateMachine: {
    states: [
      { name: 'draft', isInitial: true },
      { name: 'active' },
      { name: 'completed', isTerminal: true },
    ],
    events: [
      { key: 'ACTIVATE', name: 'Activate' },
      { key: 'COMPLETE', name: 'Complete' },
    ],
    transitions: [
      { from: 'draft', to: 'active', event: 'ACTIVATE' },
      { from: 'active', to: 'completed', event: 'COMPLETE' },
    ],
  },
};

const complexTrait: Trait = {
  name: 'OrderProcessing',
  scope: 'instance',
  stateMachine: {
    states: [
      { name: 'pending', isInitial: true },
      { name: 'confirmed' },
      { name: 'processing' },
      { name: 'shipped' },
      { name: 'delivered', isTerminal: true },
      { name: 'cancelled', isTerminal: true },
    ],
    events: [
      { key: 'CONFIRM', name: 'Confirm' },
      { key: 'PROCESS', name: 'Process' },
      { key: 'SHIP', name: 'Ship' },
      { key: 'DELIVER', name: 'Deliver' },
      { key: 'CANCEL', name: 'Cancel' },
      { key: 'RETRY', name: 'Retry' },
    ],
    transitions: [
      { from: 'pending', to: 'confirmed', event: 'CONFIRM', guard: ['>', '@entity.total', 0] },
      {
        from: 'confirmed', to: 'processing', event: 'PROCESS',
        effects: [['set', '@entity.status', 'processing'], ['emit', 'ORDER_STARTED']],
      },
      { from: 'processing', to: 'shipped', event: 'SHIP', effects: [['emit', 'ORDER_SHIPPED']] },
      { from: 'shipped', to: 'delivered', event: 'DELIVER' },
      { from: 'pending', to: 'cancelled', event: 'CANCEL' },
      { from: 'confirmed', to: 'cancelled', event: 'CANCEL' },
      { from: 'processing', to: 'confirmed', event: 'RETRY' },
    ],
  },
};

const arabicTrait: Trait = {
  name: 'إدارة_الهجرة',
  scope: 'instance',
  stateMachine: {
    states: [
      { name: 'تخطيط', isInitial: true },
      { name: 'تنفيذ' },
      { name: 'وصول' },
      { name: 'استقرار', isTerminal: true },
    ],
    events: [
      { key: 'بدء', name: 'Begin' },
      { key: 'وصول', name: 'Arrive' },
      { key: 'استقرار', name: 'Settle' },
    ],
    transitions: [
      { from: 'تخطيط', to: 'تنفيذ', event: 'بدء', guard: ['>', '@entity.readiness', 0.5] },
      { from: 'تنفيذ', to: 'وصول', event: 'وصول' },
      { from: 'وصول', to: 'استقرار', event: 'استقرار', effects: [['emit', 'HIJRA_COMPLETE']] },
    ],
  },
};

const selfLoopTrait: Trait = {
  name: 'Retry',
  scope: 'instance',
  stateMachine: {
    states: [
      { name: 'idle', isInitial: true },
      { name: 'running' },
      { name: 'done', isTerminal: true },
    ],
    events: [
      { key: 'START', name: 'Start' },
      { key: 'RETRY', name: 'Retry' },
      { key: 'FINISH', name: 'Finish' },
    ],
    transitions: [
      { from: 'idle', to: 'running', event: 'START' },
      { from: 'running', to: 'running', event: 'RETRY', effects: [['set', '@entity.attempts', ['+', '@entity.attempts', 1]]] },
      { from: 'running', to: 'done', event: 'FINISH' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Simple: Story = {
  args: {
    trait: simpleTrait,
    entityFields: ['title', 'status', 'createdAt'],
  },
};

export const Complex: Story = {
  args: {
    trait: complexTrait,
    entityFields: ['orderId', 'total', 'status', 'address'],
  },
};

export const Arabic: Story = {
  args: {
    trait: arabicTrait,
    direction: 'rtl',
    entityFields: ['الاسم', 'الجاهزية', 'الموقع'],
  },
};

export const SelfLoop: Story = {
  args: {
    trait: selfLoopTrait,
    entityFields: ['attempts', 'lastError'],
  },
};

export const FromSchema: Story = {
  args: {
    schema: {
      name: 'TaskApp',
      orbitals: [
        {
          name: 'TaskOrbital',
          entity: {
            name: 'Task',
            fields: [
              { name: 'title', type: 'string' },
              { name: 'status', type: 'string' },
              { name: 'assignee', type: 'string' },
            ],
          },
          traits: [simpleTrait],
          pages: [],
        },
      ],
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    error: new Error('Failed to load schema'),
  },
};

export const Empty: Story = {
  args: {
    trait: { name: 'Empty', scope: 'instance' },
  },
};
