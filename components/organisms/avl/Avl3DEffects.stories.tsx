import type { Meta, StoryObj } from '@storybook/react-vite';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Avl3DEffects } from './Avl3DEffects';

const meta: Meta<typeof Avl3DEffects> = {
  title: 'Avl/Organisms/Avl3DEffects',
  component: Avl3DEffects,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: 500, background: '#0A0A1A' }}>
        <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 10, 5]} intensity={0.5} />
          <OrbitControls />

          {/* Sample glowing objects to show bloom effect */}
          <mesh position={[-2, 0, 0]}>
            <sphereGeometry args={[0.8, 24, 24]} />
            <meshStandardMaterial color="#1A1A2E" emissive="#4A90D9" emissiveIntensity={1.5} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
          </mesh>
          <mesh position={[2, 0, 0]}>
            <sphereGeometry args={[0.5, 24, 24]} />
            <meshStandardMaterial color="#27AE60" emissive="#27AE60" emissiveIntensity={1.8} />
          </mesh>

          <Story />
        </Canvas>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ApplicationLevel: Story = {
  name: 'Application Level Effects',
  args: {
    level: 'application',
    enabled: true,
  },
};

export const OrbitalLevel: Story = {
  name: 'Orbital Level Effects',
  args: {
    level: 'orbital',
    enabled: true,
  },
};

export const TraitLevel: Story = {
  name: 'Trait Level Effects',
  args: {
    level: 'trait',
    enabled: true,
  },
};

export const Disabled: Story = {
  name: 'Effects Disabled',
  args: {
    level: 'application',
    enabled: false,
  },
};
