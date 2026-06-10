import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DTooltip } from './Avl3DTooltip';

const meta: Meta<typeof Avl3DTooltip> = {
  title: 'Avl/Atoms/Avl3DTooltip',
  component: Avl3DTooltip,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0c1222' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <OrbitControls />
          {/* Reference sphere */}
          <mesh>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#5b9bd5" emissive="#5b9bd5" emissiveIntensity={0.5} />
          </mesh>
          <Story />
        </Canvas>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OrbitalTooltip: Story = {
  name: 'Orbital Info',
  args: {
    position: [1.2, 0.3, 0],
    title: 'ProductCatalog',
    accentColor: '#5b9bd5',
    rows: [
      { label: 'Entity', value: 'Product' },
      { label: 'Persistence', value: 'persistent' },
      { label: 'Traits', value: '2' },
      { label: 'Pages', value: '3' },
    ],
  },
};

export const StateTooltip: Story = {
  name: 'State Info',
  args: {
    position: [1, 0.2, 0],
    title: 'Browsing',
    accentColor: '#4ecb71',
    rows: [
      { label: 'Type', value: 'Initial' },
      { label: 'Incoming', value: '2' },
      { label: 'Outgoing', value: '3' },
    ],
  },
};

export const TransitionTooltip: Story = {
  name: 'Transition Info',
  args: {
    position: [0, 1, 0],
    title: 'ADD_TO_CART',
    accentColor: '#e0944a',
    rows: [
      { label: 'Transition', value: 'Browsing → Detail' },
      { label: 'Guard', value: 'Yes' },
      { label: 'Effects', value: 'emit, render-ui' },
    ],
  },
};
