import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrbInspector } from './OrbInspector';
import type { OrbitalSchema } from '@almadar/core';
import type { PreviewNodeData } from '../../molecules/avl/avl-preview-types';
import { PatternSelectionContext, type SelectedPattern } from '../../molecules/avl/OrbPreviewNode';

const SCHEMA: OrbitalSchema = {
  name: 'Clinic',
  orbitals: [{
    name: 'PatientOrbital',
    entity: {
      name: 'Patient',
      persistence: 'persistent',
      fields: [
        { name: 'fullName', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'dateOfBirth', type: 'date' },
        { name: 'insuranceProvider', type: 'string' },
      ],
    },
    traits: [{
      name: 'PatientWizard',
      linkedEntity: 'Patient',
      category: 'interaction',
      stateMachine: {
        states: [{ name: 'step1', isInitial: true }, { name: 'step2' }, { name: 'complete' }],
        events: [{ key: 'INIT', name: 'Init' }, { key: 'NEXT', name: 'Next' }],
        transitions: [
          { from: 'step1', to: 'step1', event: 'INIT', effects: [['render-ui', 'main', { type: 'stack', direction: 'vertical', children: [{ type: 'typography', content: 'Patient Intake', variant: 'h2' }, { type: 'form-field', label: 'Name', children: [{ type: 'input', event: 'CHANGE' }] }, { type: 'button', label: 'Next', event: 'NEXT', variant: 'primary' }] }]] },
          { from: 'step1', to: 'step2', event: 'NEXT', guard: ['>', '@entity.fullName', '""'], effects: [['render-ui', 'main', { type: 'stack', children: [{ type: 'typography', content: 'Step 2' }] }], ['set', '@entity.step', 2]] },
        ],
      },
    }],
    pages: [{ name: 'IntakePage', path: '/intake' }],
  }],
} as OrbitalSchema;

const LEVEL1_NODE: PreviewNodeData = {
  orbitalName: 'PatientOrbital',
  patterns: [],
  eventSources: [],
  entityName: 'Patient',
  persistence: 'persistent',
  fieldCount: 4,
  traitCount: 1,
  pageRoutes: ['/intake'],
};

const LEVEL2_NODE: PreviewNodeData = {
  orbitalName: 'PatientOrbital',
  traitName: 'PatientWizard',
  transitionEvent: 'NEXT',
  fromState: 'step1',
  toState: 'step2',
  patterns: [{ slot: 'main', pattern: { type: 'stack', children: [{ type: 'typography', content: 'Step 2' }] } }],
  eventSources: [],
  effectTypes: ['render-ui', 'set'],
  guard: ['>', '@entity.fullName', '""'],
  entityName: 'Patient',
};

function withSelection(pattern: SelectedPattern | null) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <PatternSelectionContext.Provider value={{ selected: pattern, select: () => {} }}>
        {children}
      </PatternSelectionContext.Provider>
    );
  };
}

const meta: Meta<typeof OrbInspector> = {
  title: 'Avl/Organisms/OrbInspector',
  component: OrbInspector,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 340, height: 600, border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

/** Level 1: click orbital header. Shows entity + traits + pages. */
export const OrbitalOverview: Story = {
  args: {
    node: LEVEL1_NODE,
    schema: SCHEMA,
    onClose: () => {},
  },
  parameters: { docs: { description: { story: 'Click an orbital node header at Level 1. Shows entity fields with AVL FieldType glyphs, trait list, page routes.' } } },
};

/** Level 2: click transition node header. Shows state diagram + trigger + guard + effects + pattern tree. */
export const TransitionDetail: Story = {
  args: {
    node: LEVEL2_NODE,
    schema: SCHEMA,
    onClose: () => {},
  },
  parameters: { docs: { description: { story: 'Click a transition node at Level 2. Shows from/to states (AVL State atoms), event trigger, guard expression, effects list, render-ui source tree.' } } },
};

/** Click a button pattern that fires an event. Shows props + transition it triggers. */
export const PatternWithEvent: Story = {
  args: {
    node: LEVEL2_NODE,
    schema: SCHEMA,
    onClose: () => {},
  },
  decorators: [
    (Story) => {
      const Wrapper = withSelection({
        patternType: 'button',
        patternId: 'btn-next',
        nodeData: LEVEL2_NODE,
        sourceTrait: 'PatientWizard',
      });
      return <Wrapper><Story /></Wrapper>;
    },
  ],
  parameters: { docs: { description: { story: 'Click a "Next" button. Inspector shows button props from @almadar/patterns propsSchema, plus the NEXT transition detail (guard, effects).' } } },
};

/** Click an entity-aware pattern (form-field). Shows props + entity fields. */
export const EntityAwarePattern: Story = {
  args: {
    node: LEVEL2_NODE,
    schema: SCHEMA,
    onClose: () => {},
  },
  decorators: [
    (Story) => {
      const Wrapper = withSelection({
        patternType: 'form-field',
        patternId: 'field-name',
        nodeData: LEVEL2_NODE,
        sourceTrait: 'PatientWizard',
      });
      return <Wrapper><Story /></Wrapper>;
    },
  ],
  parameters: { docs: { description: { story: 'Click a form-field (entity-aware). Inspector shows field props + Patient entity fields with AVL FieldType glyphs.' } } },
};

/** Editable mode: fields become inputs. Pattern props, guard, effects all interactive. */
export const EditableMode: Story = {
  args: {
    node: LEVEL2_NODE,
    schema: SCHEMA,
    editable: true,
    onSchemaChange: (s: OrbitalSchema) => console.log('Schema changed:', s.name),
    onClose: () => {},
  },
  decorators: [
    (Story) => {
      const Wrapper = withSelection({
        patternType: 'button',
        patternId: 'btn-next',
        nodeData: LEVEL2_NODE,
      });
      return <Wrapper><Story /></Wrapper>;
    },
  ],
  parameters: { docs: { description: { story: 'Editable mode. Pattern props render as inputs with current values. Guard expression is editable. Effects have delete buttons and Add Effect dropdown. All mutations emit via EventBus (UI:PROP_CHANGE, UI:GUARD_CHANGE, UI:ADD_EFFECT, UI:REMOVE_EFFECT).' } } },
};

/** Editable entity fields: add, rename, change type, delete. */
export const EditableEntityFields: Story = {
  args: {
    node: LEVEL1_NODE,
    schema: SCHEMA,
    editable: true,
    onClose: () => {},
  },
  parameters: { docs: { description: { story: 'Editable entity fields at orbital level. Each field has name Input, type Select (from @almadar/core FieldTypeSchema), and delete button. Add Field button at bottom. Mutations emit UI:UPDATE_FIELD, UI:REMOVE_FIELD, UI:ADD_FIELD via EventBus.' } } },
};

/** Editable transition guard and effects. */
export const EditableTransitionEffects: Story = {
  args: {
    node: LEVEL2_NODE,
    schema: SCHEMA,
    editable: true,
    onClose: () => {},
  },
  parameters: { docs: { description: { story: 'Editable guard expression input and effect list. Guard onBlur emits UI:GUARD_CHANGE. Each effect has delete button (UI:REMOVE_EFFECT). Add Effect dropdown with all effect types from EFFECT_TYPE_TO_CATEGORY (UI:ADD_EFFECT).' } } },
};
