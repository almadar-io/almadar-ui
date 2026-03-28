import type { Meta, StoryObj } from '@storybook/react-vite';
import type { OrbitalSchema } from '@almadar/core';
import { OrbPreview } from './OrbPreview';
import { CLINIC_SCHEMA } from '../components/molecules/avl/avl-story-schemas';
import { stdBrowse, stdWizard } from '@almadar/std/behaviors/functions';

/**
 * Task list schema: single browse orbital (same pattern as the working Clinic browse).
 */
const TASK_LIST_SCHEMA: OrbitalSchema = {
  name: 'Task Manager',
  description: 'Task tracking application',
  orbitals: [
    stdBrowse({
      entityName: 'Task',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'priority', type: 'number' },
        { name: 'done', type: 'boolean' },
        { name: 'assignee', type: 'string' },
      ],
      persistence: 'persistent',
      listFields: ['title', 'priority', 'done', 'assignee'],
      pageTitle: 'Tasks',
      headerIcon: 'check-square',
      emptyTitle: 'No tasks yet',
      emptyDescription: 'Create your first task to get started.',
    }),
  ],
};

/**
 * Multi-orbital schema: wizard intake + browse list (same combo as Clinic).
 */
const HR_SCHEMA: OrbitalSchema = {
  name: 'HR Portal',
  description: 'Employee onboarding and directory',
  orbitals: [
    stdWizard({
      entityName: 'Employee',
      fields: [
        { name: 'fullName', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'department', type: 'string' },
        { name: 'startDate', type: 'string' },
        { name: 'role', type: 'string' },
      ],
      persistence: 'persistent',
      steps: [
        { name: 'personal', fields: ['fullName', 'email'] },
        { name: 'work', fields: ['department', 'startDate', 'role'] },
      ],
      pagePath: '/onboarding',
    }),
    stdBrowse({
      entityName: 'TeamMember',
      fields: [
        { name: 'name', type: 'string' },
        { name: 'department', type: 'string' },
        { name: 'role', type: 'string' },
        { name: 'active', type: 'boolean' },
      ],
      persistence: 'persistent',
      listFields: ['name', 'department', 'role'],
      pageTitle: 'Team Directory',
      headerIcon: 'users',
      emptyTitle: 'No team members',
      emptyDescription: 'Add your first team member.',
    }),
  ],
};

const CLINIC_MOCK_DATA: Record<string, unknown[]> = {
  Patient: [
    { id: '1', fullName: 'Amara Okafor', email: 'amara@example.com', dateOfBirth: '1990-03-15', medicalHistory: 'None', insuranceProvider: 'BlueCross' },
    { id: '2', fullName: 'Carlos Mendes', email: 'carlos@example.com', dateOfBirth: '1985-07-22', medicalHistory: 'Asthma', insuranceProvider: 'Aetna' },
  ],
  QueueEntry: [
    { id: '1', patientName: 'Amara Okafor', waitMinutes: 12, status: 'waiting', arrivalTime: '09:15' },
    { id: '2', patientName: 'Carlos Mendes', waitMinutes: 8, status: 'in_review', arrivalTime: '09:22' },
    { id: '3', patientName: 'Yuki Tanaka', waitMinutes: 3, status: 'waiting', arrivalTime: '09:30' },
  ],
};

const TASK_MOCK_DATA: Record<string, unknown[]> = {
  Task: [
    { id: '1', title: 'Design landing page', priority: 1, done: false, assignee: 'Alice' },
    { id: '2', title: 'Write API docs', priority: 2, done: false, assignee: 'Bob' },
    { id: '3', title: 'Fix login bug', priority: 0, done: true, assignee: 'Alice' },
    { id: '4', title: 'Deploy to production', priority: 1, done: false, assignee: 'Carlos' },
  ],
};

const HR_MOCK_DATA: Record<string, unknown[]> = {
  Employee: [
    { id: '1', fullName: 'Dana Kim', email: 'dana@company.com', department: 'Engineering', startDate: '2025-01-15', role: 'Senior Engineer' },
  ],
  TeamMember: [
    { id: '1', name: 'Dana Kim', department: 'Engineering', role: 'Senior Engineer', active: true },
    { id: '2', name: 'Raj Patel', department: 'Design', role: 'UX Designer', active: true },
    { id: '3', name: 'Lena Muller', department: 'Engineering', role: 'Staff Engineer', active: true },
    { id: '4', name: 'Tomoko Sato', department: 'Product', role: 'Product Manager', active: false },
  ],
};

const meta: Meta<typeof OrbPreview> = {
  title: 'Orb/OrbPreview',
  component: OrbPreview,
  parameters: { layout: 'padded' },
  argTypes: {
    height: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Clinic: Story = {
  name: 'Dermatology Clinic',
  args: {
    schema: CLINIC_SCHEMA,
    mockData: CLINIC_MOCK_DATA,
    height: '500px',
  },
};

export const TaskList: Story = {
  name: 'Task Manager',
  args: {
    schema: TASK_LIST_SCHEMA,
    mockData: TASK_MOCK_DATA,
    height: '500px',
  },
};

export const HRPortal: Story = {
  name: 'HR Portal (multi-orbital)',
  args: {
    schema: HR_SCHEMA,
    mockData: HR_MOCK_DATA,
    height: '500px',
  },
};

export const NoMockData: Story = {
  name: 'Clinic (empty state)',
  args: {
    schema: CLINIC_SCHEMA,
    height: '400px',
  },
};

export const InvalidSchema: Story = {
  name: 'Invalid Schema (error)',
  args: {
    schema: '{ invalid json',
    height: '200px',
  },
};
