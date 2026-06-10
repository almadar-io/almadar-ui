import type { Meta, StoryObj } from '@storybook/react-vite';
import { ModuleCard } from './ModuleCard';
import { CLINIC_GRAPH, TASK_GRAPH } from './avl-story-schemas';
import type { AvlNodeData } from './avl-canvas-types';

const meta: Meta<typeof ModuleCard> = {
  title: 'Avl/Molecules/ModuleCard',
  component: ModuleCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ClinicPatient: Story = {
  name: 'Clinic — Patient Wizard',
  render: () => {
    const node = CLINIC_GRAPH.nodes[0];
    return (
      <div style={{ padding: 20 }}>
        <ModuleCard data={node.data as AvlNodeData} />
      </div>
    );
  },
};

export const ClinicQueue: Story = {
  name: 'Clinic — Reception Queue',
  render: () => {
    const node = CLINIC_GRAPH.nodes[1];
    return (
      <div style={{ padding: 20 }}>
        <ModuleCard data={node.data as AvlNodeData} />
      </div>
    );
  },
};

export const TaskManagerTask: Story = {
  name: 'Task Manager — Task Browse',
  render: () => {
    const node = TASK_GRAPH.nodes[0];
    return (
      <div style={{ padding: 20 }}>
        <ModuleCard data={node.data as AvlNodeData} />
      </div>
    );
  },
};

export const TaskManagerTimer: Story = {
  name: 'Task Manager — Focus Timer',
  render: () => {
    const node = TASK_GRAPH.nodes[1];
    return (
      <div style={{ padding: 20 }}>
        <ModuleCard data={node.data as AvlNodeData} />
      </div>
    );
  },
};
