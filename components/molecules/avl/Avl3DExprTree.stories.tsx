import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DExprTree } from './Avl3DExprTree';
import type { ExprTreeNode } from '../../organisms/avl/avl-schema-parser';

const meta: Meta<typeof Avl3DExprTree> = {
  title: 'Avl/Molecules/Avl3DExprTree',
  component: Avl3DExprTree,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} intensity={0.6} />
          <OrbitControls />
          <Story />
        </Canvas>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const simpleGuard: ExprTreeNode = {
  label: '>',
  type: 'operator',
  children: [
    { label: '@entity.stock', type: 'binding' },
    { label: '0', type: 'literal' },
  ],
};

const complexGuard: ExprTreeNode = {
  label: 'and',
  type: 'operator',
  children: [
    {
      label: '>',
      type: 'operator',
      children: [
        { label: '@entity.age', type: 'binding' },
        { label: '18', type: 'literal' },
      ],
    },
    {
      label: 'eq',
      type: 'operator',
      children: [
        { label: '@entity.status', type: 'binding' },
        { label: '"active"', type: 'literal' },
      ],
    },
  ],
};

export const SimpleExpression: Story = {
  name: 'Simple Guard',
  args: {
    expression: simpleGuard,
    position: [0, 0, 0],
  },
};

export const ComplexExpression: Story = {
  name: 'Complex Guard (AND)',
  args: {
    expression: complexGuard,
    position: [0, 1, 0],
  },
};

export const SingleLiteral: Story = {
  name: 'Single Literal',
  args: {
    expression: { label: '"hello"', type: 'literal' } as ExprTreeNode,
    position: [0, 0, 0],
  },
};

export const SingleBinding: Story = {
  name: 'Single Binding',
  args: {
    expression: { label: '@entity.name', type: 'binding' } as ExprTreeNode,
    position: [0, 0, 0],
  },
};
