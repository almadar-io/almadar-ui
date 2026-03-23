import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { Avl3DLabel } from './Avl3DLabel';

const meta: Meta<typeof Avl3DLabel> = {
  title: 'Avl/Atoms/Avl3DLabel',
  component: Avl3DLabel,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 400, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
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
    position: [0, 0, 0],
    text: 'ProductCatalog',
    color: '#ffffff',
    fontSize: 14,
  },
};

export const Colored: Story = {
  name: 'Colored Label',
  args: {
    position: [0, 1, 0],
    text: 'ShoppingCart',
    color: '#4A90D9',
    fontSize: 16,
  },
};

export const SmallMuted: Story = {
  name: 'Small Muted',
  args: {
    position: [0, -1, 0],
    text: 'Entity: CartItem',
    color: '#999999',
    fontSize: 10,
  },
};

export const MultipleLabels: Story = {
  name: 'Multiple Labels',
  render: () => (
    <>
      <Avl3DLabel position={[-2, 1, 0]} text="Orbital A" color="#4A90D9" />
      <Avl3DLabel position={[0, 0, 0]} text="Orbital B" color="#27AE60" />
      <Avl3DLabel position={[2, -1, 0]} text="Orbital C" color="#E8913A" />
    </>
  ),
};
