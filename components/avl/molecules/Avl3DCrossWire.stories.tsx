import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DCrossWire } from './Avl3DCrossWire';

const meta: Meta<typeof Avl3DCrossWire> = {
  title: 'Avl/Molecules/Avl3DCrossWire',
  component: Avl3DCrossWire,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
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
    from: [-3, 0, 0],
    to: [3, 0, 0],
    eventName: 'ADD_TO_CART',
  },
};

export const DiagonalWire: Story = {
  name: 'Diagonal Wire',
  args: {
    from: [-3, 0, -2],
    to: [3, 0, 2],
    eventName: 'CHECKOUT_COMPLETE',
  },
};

export const CustomColor: Story = {
  name: 'Custom Color',
  args: {
    from: [-2, 0, 0],
    to: [2, 0, 0],
    eventName: 'USER_LOGGED_IN',
    color: '#E8913A',
  },
};

export const MultipleWires: Story = {
  name: 'Multiple Wires',
  render: () => (
    <>
      {/* Endpoint markers */}
      {[[-4, 0, 0], [0, 0, -3], [4, 0, 0]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#1A1A2E" emissive="#4A90D9" emissiveIntensity={0.5} />
        </mesh>
      ))}
      <Avl3DCrossWire from={[-4, 0, 0]} to={[0, 0, -3]} eventName="EVENT_A" />
      <Avl3DCrossWire from={[0, 0, -3]} to={[4, 0, 0]} eventName="EVENT_B" />
      <Avl3DCrossWire from={[-4, 0, 0]} to={[4, 0, 0]} eventName="EVENT_C" color="#E74C3C" />
    </>
  ),
};
