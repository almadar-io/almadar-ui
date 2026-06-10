import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DOrbitalNode } from './Avl3DOrbitalNode';

const meta: Meta<typeof Avl3DOrbitalNode> = {
  title: 'Avl/Molecules/Avl3DOrbitalNode',
  component: Avl3DOrbitalNode,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 3, 6], fov: 60 }}>
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

export const Default: Story = {
  args: {
    name: 'ProductCatalog',
    entityName: 'Product',
    traitCount: 2,
    position: [0, 0, 0],
  },
};

export const LargeOrbital: Story = {
  name: 'Large Orbital (many traits)',
  args: {
    name: 'UserManagement',
    entityName: 'User',
    traitCount: 6,
    position: [0, 0, 0],
  },
};

export const SmallOrbital: Story = {
  name: 'Small Orbital (one trait)',
  args: {
    name: 'Settings',
    entityName: 'Config',
    traitCount: 1,
    position: [0, 0, 0],
  },
};

export const MultipleOrbitals: Story = {
  name: 'Multiple Orbitals',
  render: () => (
    <>
      <Avl3DOrbitalNode
        name="ProductCatalog"
        entityName="Product"
        traitCount={2}
        position={[-3, 0, 0]}
        onClick={() => console.log('Clicked ProductCatalog')}
      />
      <Avl3DOrbitalNode
        name="ShoppingCart"
        entityName="CartItem"
        traitCount={3}
        position={[0, 0, -2]}
        onClick={() => console.log('Clicked ShoppingCart')}
      />
      <Avl3DOrbitalNode
        name="OrderManagement"
        entityName="Order"
        traitCount={1}
        position={[3, 0, 0]}
        onClick={() => console.log('Clicked OrderManagement')}
      />
    </>
  ),
};
