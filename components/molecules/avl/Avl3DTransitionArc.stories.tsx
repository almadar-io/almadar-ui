import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DTransitionArc } from './Avl3DTransitionArc';
import { Avl3DStateNode } from './Avl3DStateNode';

const meta: Meta<typeof Avl3DTransitionArc> = {
  title: 'Avl/Molecules/Avl3DTransitionArc',
  component: Avl3DTransitionArc,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 4, 8], fov: 60 }}>
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
    event: 'SUBMIT',
    effectCount: 2,
    index: 0,
  },
};

export const WithGuard: Story = {
  name: 'With Guard Gate',
  args: {
    from: [-3, 0, 0],
    to: [3, 0, 0],
    event: 'APPROVE',
    hasGuard: true,
    effectCount: 1,
    index: 0,
  },
};

export const SelfTransition: Story = {
  name: 'Self Transition',
  args: {
    from: [0, 0, 0],
    to: [0, 0, 0],
    event: 'REFRESH',
    effectCount: 1,
    index: 0,
    isSelf: true,
  },
};

export const WithStateNodes: Story = {
  name: 'Complete State Machine',
  render: () => (
    <>
      <Avl3DStateNode name="Idle" isInitial position={[-3, 0, 0]} />
      <Avl3DStateNode name="Active" position={[3, 0, 0]} />

      <Avl3DTransitionArc
        from={[-3, 0, 0]}
        to={[3, 0, 0]}
        event="START"
        effectCount={1}
        index={0}
      />
      <Avl3DTransitionArc
        from={[3, 0, 0]}
        to={[-3, 0, 0]}
        event="STOP"
        hasGuard
        effectCount={2}
        index={0}
      />
      <Avl3DTransitionArc
        from={[3, 0, 0]}
        to={[3, 0, 0]}
        event="TICK"
        effectCount={1}
        index={0}
        isSelf
      />
    </>
  ),
};
