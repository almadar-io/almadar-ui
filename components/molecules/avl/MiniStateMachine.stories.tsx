import type { Meta, StoryObj } from '@storybook/react-vite';
import { MiniStateMachine } from './MiniStateMachine';
import { CLINIC_GRAPH } from './avl-story-schemas';
import type { AvlNodeData } from './avl-canvas-types';

const meta: Meta<typeof MiniStateMachine> = {
  title: 'Avl/Molecules/MiniStateMachine',
  component: MiniStateMachine,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ClinicWizard: Story = {
  name: 'Clinic — Wizard Trait',
  render: () => {
    const data = (CLINIC_GRAPH.nodes[0].data as AvlNodeData);
    const firstTrait = Object.values(data.traitDetails)[0];
    if (!firstTrait) return <div>No trait data</div>;
    return (
      <div style={{ padding: 20, background: 'var(--color-card)', borderRadius: 8 }}>
        <MiniStateMachine data={firstTrait} />
      </div>
    );
  },
};

export const ClinicBrowse: Story = {
  name: 'Clinic — Browse Trait',
  render: () => {
    const data = (CLINIC_GRAPH.nodes[1].data as AvlNodeData);
    const firstTrait = Object.values(data.traitDetails)[0];
    if (!firstTrait) return <div>No trait data</div>;
    return (
      <div style={{ padding: 20, background: 'var(--color-card)', borderRadius: 8 }}>
        <MiniStateMachine data={firstTrait} />
      </div>
    );
  },
};
