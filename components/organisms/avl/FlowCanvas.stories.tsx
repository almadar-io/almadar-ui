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

export const ClinicOverview: Story = {
  name: 'Clinic — Overview (2 orbitals)',
  args: {
    schema: CLINIC_SCHEMA,
    width: '100%',
    height: 600,
  },
};

export const TaskManagerOverview: Story = {
  name: 'Task Manager — Overview (3 orbitals)',
  args: {
    schema: TASK_SCHEMA,
    width: '100%',
    height: 600,
  },
};

export const WithMockData: Story = {
  name: 'Clinic — With Mock Data',
  args: {
    schema: CLINIC_SCHEMA,
    width: '100%',
    height: 600,
    mockData: {
      Patient: [
        { id: '1', fullName: 'Jane Smith', email: 'jane@example.com', dateOfBirth: '1990-05-14', medicalHistory: 'None', insuranceProvider: 'Almadar Health' },
        { id: '2', fullName: 'Ahmed Ali', email: 'ahmed@example.com', dateOfBirth: '1985-11-22', medicalHistory: 'Asthma', insuranceProvider: 'Gulf Insurance' },
      ],
      QueueEntry: [
        { id: '1', patientName: 'Jane Smith', waitMinutes: 12, status: 'waiting', arrivalTime: '09:30' },
        { id: '2', patientName: 'Ahmed Ali', waitMinutes: 5, status: 'in-progress', arrivalTime: '09:45' },
      ],
    },
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
