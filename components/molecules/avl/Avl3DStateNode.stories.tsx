import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DStateNode } from './Avl3DStateNode';

const meta: Meta<typeof Avl3DStateNode> = {
  title: 'Avl/Molecules/Avl3DStateNode',
  component: Avl3DStateNode,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
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
    name: 'Browsing',
    position: [0, 0, 0],
  },
};

export const InitialState: Story = {
  name: 'Initial State',
  args: {
    name: 'Idle',
    isInitial: true,
    position: [0, 0, 0],
  },
};

export const TerminalState: Story = {
  name: 'Terminal State',
  args: {
    name: 'Completed',
    isTerminal: true,
    position: [0, 0, 0],
  },
};

export const ActiveState: Story = {
  name: 'Active State',
  args: {
    name: 'Processing',
    active: true,
    position: [0, 0, 0],
  },
};

export const StateMachine: Story = {
  name: 'State Machine Layout',
  render: () => (
    <>
      <Avl3DStateNode name="Idle" isInitial position={[-3, 0, 0]} />
      <Avl3DStateNode name="Active" active position={[0, 0, -1]} />
      <Avl3DStateNode name="Done" isTerminal position={[3, 0, 0]} />
    </>
  ),
};
