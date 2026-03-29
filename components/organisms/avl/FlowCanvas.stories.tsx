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

/** Default overview. Click any node to open OrbInspector on the right. */
export const ClinicOverview: Story = {
  name: 'Clinic — Overview',
  args: {
    schema: CLINIC_SCHEMA,
    width: '100%',
    height: 600,
  },
  parameters: { docs: { description: { story: 'Two orbital nodes. Click a node to open OrbInspector showing entity fields, traits, pages. Double-click to drill into Level 2.' } } },
};

/** Three orbitals. More event wires visible. */
export const TaskManagerOverview: Story = {
  name: 'Task Manager — Overview',
  args: {
    schema: TASK_SCHEMA,
    width: '100%',
    height: 600,
  },
};

/** With mock entity data for realistic OrbPreview rendering. */
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
  parameters: { docs: { description: { story: 'Mock data populates OrbPreview nodes. Forms show real field values. Data grids show sample rows.' } } },
};

/** Editable mode. OrbInspector fields become inputs when you click elements. */
export const EditableMode: Story = {
  name: 'Clinic — Editable',
  args: {
    schema: CLINIC_SCHEMA,
    width: '100%',
    height: 600,
    editable: true,
    onSchemaChange: (s) => console.log('Schema changed:', s.name),
  },
  parameters: { docs: { description: { story: 'Editable mode. Click any element, OrbInspector opens with editable inputs for props, guard expressions, entity fields.' } } },
};

/** JSON string schema (parsed internally). */
export const StringSchema: Story = {
  name: 'Clinic — JSON String',
  args: {
    schema: JSON.stringify(CLINIC_SCHEMA),
    width: '100%',
    height: 600,
  },
};
