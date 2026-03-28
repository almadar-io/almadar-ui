import type { Meta, StoryObj } from '@storybook/react-vite';
import { SystemNode } from './SystemNode';
import { CLINIC_GRAPH, TASK_GRAPH } from './avl-story-schemas';
import type { AvlNodeData } from './avl-canvas-types';

const meta: Meta<typeof SystemNode> = {
  title: 'Avl/Molecules/SystemNode',
  component: SystemNode,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ClinicPatient: Story = {
  name: 'Clinic — Patient Orbital',
  render: () => {
    const node = CLINIC_GRAPH.nodes[0];
    return (
      <div style={{ width: 300, padding: 20 }}>
        <SystemNode data={node.data as AvlNodeData} />
      </div>
    );
  },
};

export const TaskManager: Story = {
  name: 'Task Manager — Task Orbital',
  render: () => {
    const node = TASK_GRAPH.nodes[0];
    return (
      <div style={{ width: 300, padding: 20 }}>
        <SystemNode data={node.data as AvlNodeData} />
      </div>
    );
  },
};

export const AllTaskNodes: Story = {
  name: 'All Task Manager Nodes',
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 20, flexWrap: 'wrap' }}>
      {TASK_GRAPH.nodes.map(node => (
        <SystemNode key={node.id} data={node.data as AvlNodeData} />
      ))}
    </div>
  ),
};
