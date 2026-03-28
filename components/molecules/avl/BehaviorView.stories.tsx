import type { Meta, StoryObj } from '@storybook/react-vite';
import { BehaviorView } from './BehaviorView';
import { CLINIC_GRAPH, TASK_GRAPH } from './avl-story-schemas';
import type { AvlNodeData } from './avl-canvas-types';

const meta: Meta<typeof BehaviorView> = {
  title: 'Avl/Molecules/BehaviorView',
  component: BehaviorView,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ClinicWizard: Story = {
  name: 'Clinic — Wizard State Machine',
  render: () => {
    const data = CLINIC_GRAPH.nodes[0].data as AvlNodeData;
    return (
      <div style={{ padding: 20 }}>
        <BehaviorView data={data} />
      </div>
    );
  },
};

export const ClinicBrowse: Story = {
  name: 'Clinic — Browse State Machine',
  render: () => {
    const data = CLINIC_GRAPH.nodes[1].data as AvlNodeData;
    return (
      <div style={{ padding: 20 }}>
        <BehaviorView data={data} />
      </div>
    );
  },
};

export const TaskBrowse: Story = {
  name: 'Task Manager — Task State Machine',
  render: () => {
    const data = TASK_GRAPH.nodes[0].data as AvlNodeData;
    return (
      <div style={{ padding: 20 }}>
        <BehaviorView data={data} />
      </div>
    );
  },
};
