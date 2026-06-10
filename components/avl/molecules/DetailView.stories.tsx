import type { Meta, StoryObj } from '@storybook/react-vite';
import { DetailView } from './DetailView';
import { CLINIC_GRAPH, TASK_GRAPH } from './avl-story-schemas';
import type { AvlNodeData } from './avl-canvas-types';

const meta: Meta<typeof DetailView> = {
  title: 'Avl/Molecules/DetailView',
  component: DetailView,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ClinicWizardTransition: Story = {
  name: 'Clinic — Wizard First Transition',
  render: () => {
    const data = CLINIC_GRAPH.nodes[0].data as AvlNodeData;
    return (
      <div style={{ padding: 20 }}>
        <DetailView data={data} />
      </div>
    );
  },
};

export const TaskBrowseTransition: Story = {
  name: 'Task Manager — Browse First Transition',
  render: () => {
    const data = TASK_GRAPH.nodes[0].data as AvlNodeData;
    return (
      <div style={{ padding: 20 }}>
        <DetailView data={data} />
      </div>
    );
  },
};
