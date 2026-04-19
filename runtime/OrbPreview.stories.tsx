import type { Meta, StoryObj } from '@storybook/react-vite';
import type { OrbitalSchema, EntityData } from '@almadar/core';
import { OrbPreview } from './OrbPreview';

/**
 * Stories here use **fully-inlined orbitals** (explicit `stateMachine` with
 * states, events, transitions and render-ui effects) rather than the
 * `uses:` + `ref:` descriptor model produced by `stdBrowse` / `stdWizard`.
 *
 * Why: `@almadar/core`'s `schemaToIR` doesn't inline `uses:` references
 * client-side. The playground runs that preprocess step server-side
 * (see `packages/almadar-playground-runtime/src/server/routes.ts:106`),
 * but `OrbPreview` standalone has no equivalent. Until a browser-side
 * preprocessor lands in `useResolvedSchema`, standalone previews must
 * carry their own state machines.
 */

// ---------------------------------------------------------------------------
// Task Manager — single browse orbital
// ---------------------------------------------------------------------------

const TASK_LIST_SCHEMA: OrbitalSchema = {
  name: 'Task Manager',
  description: 'Task tracking application',
  orbitals: [
    {
      name: 'TaskOrbital',
      entity: {
        name: 'Task',
        persistence: 'persistent',
        fields: [
          { name: 'title', type: 'string' },
          { name: 'priority', type: 'number' },
          { name: 'done', type: 'boolean' },
          { name: 'assignee', type: 'string' },
        ],
      },
      traits: [
        {
          name: 'TaskBrowse',
          linkedEntity: 'Task',
          stateMachine: {
            states: [
              { name: 'init', isInitial: true },
              { name: 'loaded' },
            ],
            events: [{ key: 'INIT', name: 'Initialize' }],
            transitions: [
              {
                from: 'init',
                to: 'loaded',
                event: 'INIT',
                effects: [
                  ['fetch', 'Task'],
                  [
                    'render-ui',
                    'main',
                    {
                      type: 'entity-table',
                      entity: 'Task',
                      columns: ['title', 'priority', 'done', 'assignee'],
                    },
                  ],
                ],
              },
            ],
          },
        },
      ],
      pages: [
        {
          name: 'TasksPage',
          path: '/tasks',
          traits: [{ ref: 'TaskBrowse', linkedEntity: 'Task' }],
        },
      ],
    },
  ],
};

const TASK_MOCK_DATA: EntityData = {
  Task: [
    { id: '1', title: 'Design landing page', priority: 1, done: false, assignee: 'Alice' },
    { id: '2', title: 'Write API docs', priority: 2, done: false, assignee: 'Bob' },
    { id: '3', title: 'Fix login bug', priority: 0, done: true, assignee: 'Alice' },
    { id: '4', title: 'Deploy to production', priority: 1, done: false, assignee: 'Carlos' },
  ],
};

// ---------------------------------------------------------------------------
// Dermatology Clinic — two orbitals (patient directory + queue)
// ---------------------------------------------------------------------------

const CLINIC_SCHEMA: OrbitalSchema = {
  name: 'Dermatology Clinic',
  description: 'Patient intake and daily queue',
  orbitals: [
    {
      name: 'PatientOrbital',
      entity: {
        name: 'Patient',
        persistence: 'persistent',
        fields: [
          { name: 'fullName', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'dateOfBirth', type: 'string' },
          { name: 'medicalHistory', type: 'string' },
          { name: 'insuranceProvider', type: 'string' },
        ],
      },
      traits: [
        {
          name: 'PatientBrowse',
          linkedEntity: 'Patient',
          stateMachine: {
            states: [
              { name: 'init', isInitial: true },
              { name: 'loaded' },
            ],
            events: [{ key: 'INIT', name: 'Initialize' }],
            transitions: [
              {
                from: 'init',
                to: 'loaded',
                event: 'INIT',
                effects: [
                  ['fetch', 'Patient'],
                  [
                    'render-ui',
                    'main',
                    {
                      type: 'entity-table',
                      entity: 'Patient',
                      columns: ['fullName', 'email', 'insuranceProvider'],
                    },
                  ],
                ],
              },
            ],
          },
        },
      ],
      pages: [
        {
          name: 'PatientsPage',
          path: '/patients',
          traits: [{ ref: 'PatientBrowse', linkedEntity: 'Patient' }],
        },
      ],
    },
    {
      name: 'QueueOrbital',
      entity: {
        name: 'QueueEntry',
        persistence: 'persistent',
        fields: [
          { name: 'patientName', type: 'string' },
          { name: 'waitMinutes', type: 'number' },
          { name: 'status', type: 'string' },
          { name: 'arrivalTime', type: 'string' },
        ],
      },
      traits: [
        {
          name: 'QueueBrowse',
          linkedEntity: 'QueueEntry',
          stateMachine: {
            states: [
              { name: 'init', isInitial: true },
              { name: 'loaded' },
            ],
            events: [{ key: 'INIT', name: 'Initialize' }],
            transitions: [
              {
                from: 'init',
                to: 'loaded',
                event: 'INIT',
                effects: [
                  ['fetch', 'QueueEntry'],
                  [
                    'render-ui',
                    'sidebar',
                    {
                      type: 'entity-table',
                      entity: 'QueueEntry',
                      columns: ['patientName', 'waitMinutes', 'status'],
                    },
                  ],
                ],
              },
            ],
          },
        },
      ],
      pages: [
        {
          name: 'QueuePage',
          path: '/queue',
          traits: [{ ref: 'QueueBrowse', linkedEntity: 'QueueEntry' }],
        },
      ],
    },
  ],
};

const CLINIC_MOCK_DATA: EntityData = {
  Patient: [
    {
      id: '1',
      fullName: 'Amara Okafor',
      email: 'amara@example.com',
      dateOfBirth: '1990-03-15',
      medicalHistory: 'None',
      insuranceProvider: 'BlueCross',
    },
    {
      id: '2',
      fullName: 'Carlos Mendes',
      email: 'carlos@example.com',
      dateOfBirth: '1985-07-22',
      medicalHistory: 'Asthma',
      insuranceProvider: 'Aetna',
    },
  ],
  QueueEntry: [
    { id: '1', patientName: 'Amara Okafor', waitMinutes: 12, status: 'waiting', arrivalTime: '09:15' },
    { id: '2', patientName: 'Carlos Mendes', waitMinutes: 8, status: 'in_review', arrivalTime: '09:22' },
    { id: '3', patientName: 'Yuki Tanaka', waitMinutes: 3, status: 'waiting', arrivalTime: '09:30' },
  ],
};

// ---------------------------------------------------------------------------
// HR Portal — team directory (single orbital for now; wizard intake needs
// form patterns wired beyond a simple state machine)
// ---------------------------------------------------------------------------

const HR_SCHEMA: OrbitalSchema = {
  name: 'HR Portal',
  description: 'Team directory',
  orbitals: [
    {
      name: 'TeamOrbital',
      entity: {
        name: 'TeamMember',
        persistence: 'persistent',
        fields: [
          { name: 'name', type: 'string' },
          { name: 'department', type: 'string' },
          { name: 'role', type: 'string' },
          { name: 'active', type: 'boolean' },
        ],
      },
      traits: [
        {
          name: 'TeamBrowse',
          linkedEntity: 'TeamMember',
          stateMachine: {
            states: [
              { name: 'init', isInitial: true },
              { name: 'loaded' },
            ],
            events: [{ key: 'INIT', name: 'Initialize' }],
            transitions: [
              {
                from: 'init',
                to: 'loaded',
                event: 'INIT',
                effects: [
                  ['fetch', 'TeamMember'],
                  [
                    'render-ui',
                    'main',
                    {
                      type: 'entity-table',
                      entity: 'TeamMember',
                      columns: ['name', 'department', 'role', 'active'],
                    },
                  ],
                ],
              },
            ],
          },
        },
      ],
      pages: [
        {
          name: 'TeamPage',
          path: '/team',
          traits: [{ ref: 'TeamBrowse', linkedEntity: 'TeamMember' }],
        },
      ],
    },
  ],
};

const HR_MOCK_DATA: EntityData = {
  TeamMember: [
    { id: '1', name: 'Dana Kim', department: 'Engineering', role: 'Senior Engineer', active: true },
    { id: '2', name: 'Raj Patel', department: 'Design', role: 'UX Designer', active: true },
    { id: '3', name: 'Lena Muller', department: 'Engineering', role: 'Staff Engineer', active: true },
    { id: '4', name: 'Tomoko Sato', department: 'Product', role: 'Product Manager', active: false },
  ],
};

// ---------------------------------------------------------------------------
// Meta + stories
// ---------------------------------------------------------------------------

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

export const TaskList: Story = {
  name: 'Task Manager',
  args: {
    schema: TASK_LIST_SCHEMA,
    mockData: TASK_MOCK_DATA,
    height: '500px',
  },
};

export const Clinic: Story = {
  name: 'Dermatology Clinic (multi-orbital)',
  args: {
    schema: CLINIC_SCHEMA,
    mockData: CLINIC_MOCK_DATA,
    height: '500px',
  },
};

export const HRPortal: Story = {
  name: 'HR Portal',
  args: {
    schema: HR_SCHEMA,
    mockData: HR_MOCK_DATA,
    height: '500px',
  },
};

export const NoMockData: Story = {
  name: 'Task Manager (empty state)',
  args: {
    schema: TASK_LIST_SCHEMA,
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
