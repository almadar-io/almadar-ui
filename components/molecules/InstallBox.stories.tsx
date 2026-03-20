import type { Meta, StoryObj } from '@storybook/react-vite';
import { InstallBox } from './InstallBox';
import { VStack } from '../atoms/Stack';

const meta: Meta<typeof InstallBox> = {
  title: 'Molecules/InstallBox',
  component: InstallBox,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    command: 'curl -fsSL https://almadar.io/install | sh',
  },
};

export const WithLabel: Story = {
  args: {
    command: 'npm install @almadar/core',
    label: 'Install via npm',
  },
};

export const LongCommand: Story = {
  args: {
    command:
      'npx tsx tools/almadar-pattern-sync/index.ts --core-only && npx tsx tools/sync-rust/src/index.ts',
    label: 'Full pattern pipeline',
  },
  decorators: [
    (Story) => (
      <VStack gap="md" className="w-[500px]">
        <Story />
      </VStack>
    ),
  ],
};

export const AllVariants: Story = {
  render: () => (
    <VStack gap="lg" className="w-[500px]">
      <InstallBox command="npm install @almadar/ui" label="npm" />
      <InstallBox command="pnpm add @almadar/ui" label="pnpm" />
      <InstallBox command="yarn add @almadar/ui" label="yarn" />
    </VStack>
  ),
};
