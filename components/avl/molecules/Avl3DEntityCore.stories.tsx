import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DEntityCore } from './Avl3DEntityCore';

const meta: Meta<typeof Avl3DEntityCore> = {
  title: 'Avl/Molecules/Avl3DEntityCore',
  component: Avl3DEntityCore,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={0.5} />
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
    name: 'Product',
    fieldCount: 4,
    persistence: 'persistent',
    position: [0, 0, 0],
  },
};

export const ManyFields: Story = {
  name: 'Many Fields (10)',
  args: {
    name: 'User',
    fieldCount: 10,
    persistence: 'persistent',
    position: [0, 0, 0],
  },
};

export const RuntimeEntity: Story = {
  name: 'Runtime Entity',
  args: {
    name: 'CartItem',
    fieldCount: 3,
    persistence: 'runtime',
    position: [0, 0, 0],
  },
};

export const SingletonEntity: Story = {
  name: 'Singleton Entity',
  args: {
    name: 'AppConfig',
    fieldCount: 6,
    persistence: 'singleton',
    position: [0, 0, 0],
  },
};
