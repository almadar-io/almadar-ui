import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeExample } from './CodeExample';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof CodeExample> = {
  title: 'Core/Molecules/CodeExample',
  component: CodeExample,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const jsonCode = `{
  "entity": "Product",
  "fields": [
    { "name": "title", "type": "string" },
    { "name": "price", "type": "number" },
    { "name": "inStock", "type": "boolean" }
  ]
}`;

const tsCode = `import { OrbitalUnit } from '@almadar/core';

export const ProductUnit: OrbitalUnit = {
  entity: 'Product',
  traits: ['ProductBrowse', 'ProductCreate', 'ProductEdit'],
  pages: [
    { path: '/products', trait: 'ProductBrowse' },
    { path: '/products/new', trait: 'ProductCreate' },
    { path: '/products/:id', trait: 'ProductEdit' },
  ],
};`;

export const Default: Story = {
  args: {
    code: jsonCode,
    language: 'json',
  },
  decorators: [
    (Story) => (
      <VStack className="w-[500px]">
        <Story />
      </VStack>
    ),
  ],
};

export const WithTitle: Story = {
  args: {
    code: jsonCode,
    language: 'json',
    title: 'schema.orb (entity definition)',
  },
  decorators: [
    (Story) => (
      <VStack className="w-[500px]">
        <Story />
      </VStack>
    ),
  ],
};

export const Copyable: Story = {
  args: {
    code: 'npm install @almadar/core @almadar/ui @almadar/runtime',
    language: 'bash',
    title: 'Install dependencies',
    copyable: true,
  },
  decorators: [
    (Story) => (
      <VStack className="w-[500px]">
        <Story />
      </VStack>
    ),
  ],
};

export const WithMaxHeight: Story = {
  args: {
    code: Array.from({ length: 30 }, (_, i) => `line ${i + 1}: content here`).join('\n'),
    language: 'text',
    title: 'Long output (scrollable)',
    copyable: true,
    maxHeight: '200px',
  },
  decorators: [
    (Story) => (
      <VStack className="w-[500px]">
        <Story />
      </VStack>
    ),
  ],
};

export const TypeScriptExample: Story = {
  args: {
    code: tsCode,
    language: 'typescript',
    title: 'ProductUnit.ts',
    copyable: true,
  },
  decorators: [
    (Story) => (
      <VStack className="w-[560px]">
        <Story />
      </VStack>
    ),
  ],
};
