import type { Meta, StoryObj } from '@storybook/react-vite';
import { FlowCanvas } from './FlowCanvas';
import { CLINIC_SCHEMA, TASK_SCHEMA } from '../../molecules/avl/avl-story-schemas';

const meta: Meta<typeof FlowCanvas> = {
  title: 'Avl/Organisms/FlowCanvas',
  component: FlowCanvas,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ClinicDefault: Story = {
  name: 'Clinic (2 orbitals)',
  args: {
    schema: CLINIC_SCHEMA,
    width: '100%',
    height: 600,
  },
};

export const TaskManager: Story = {
  name: 'Task Manager (3 orbitals)',
  args: {
    schema: TASK_SCHEMA,
    width: '100%',
    height: 600,
  },
};

export const WithInitialOrbital: Story = {
  name: 'Clinic — Focus on Patient',
  args: {
    schema: CLINIC_SCHEMA,
    width: '100%',
    height: 600,
    initialOrbital: CLINIC_SCHEMA.orbitals[0].name,
  },
};

export const CustomColor: Story = {
  name: 'Task Manager — Custom Color',
  args: {
    schema: TASK_SCHEMA,
    width: '100%',
    height: 600,
    color: '#8B5CF6',
  },
};

export const StringSchema: Story = {
  name: 'Clinic — JSON String Schema',
  args: {
    schema: JSON.stringify(CLINIC_SCHEMA),
    width: '100%',
    height: 600,
  },
};
