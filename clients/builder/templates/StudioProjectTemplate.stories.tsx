import type { Meta, StoryObj } from "@storybook/react";
import { StudioProjectTemplate } from "./StudioProjectTemplate";

const meta: Meta<typeof StudioProjectTemplate> = {
  title: "Builder/Templates/StudioProjectTemplate",
  component: StudioProjectTemplate,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    mode: {
      control: "select",
      options: ["hq", "build"],
    },
    validationStatus: {
      control: "select",
      options: ["valid", "invalid", "validating"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StudioProjectTemplate>;

const mockProject = {
  id: "1",
  name: "Task Manager",
  description: "A comprehensive task management application with kanban boards and team collaboration",
  version: "1.0.0",
  createdAt: "2024-01-15",
  updatedAt: "2024-02-01",
  orbitalsCount: 3,
  traitsCount: 5,
  pagesCount: 4,
};

const MockSchemaEditor = () => (
  <div style={{ padding: "16px", height: "100%", background: "#1e1e1e", color: "#d4d4d4", fontFamily: "monospace", fontSize: "14px" }}>
    <pre>{`{
  "name": "TaskManager",
  "version": "1.0.0",
  "orbitals": [
    {
      "name": "TaskManagement",
      "entity": {
        "name": "Task",
        "fields": [
          { "name": "title", "type": "string" },
          { "name": "status", "type": "enum" }
        ]
      }
    }
  ]
}`}</pre>
  </div>
);

const MockVisualization = () => (
  <div style={{ padding: "16px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-muted)" }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔀</div>
      <p style={{ color: "var(--color-muted-foreground)" }}>State Machine Visualization</p>
    </div>
  </div>
);

const MockAgentPanel = () => (
  <div style={{ padding: "16px", height: "100%" }}>
    <div style={{ padding: "12px", background: "var(--color-muted)", borderRadius: "8px" }}>
      <p style={{ fontSize: "14px" }}>AI Assistant ready to help...</p>
    </div>
  </div>
);

const MockInspector = () => (
  <div style={{ padding: "8px" }}>
    <div style={{ fontSize: "12px", color: "var(--color-muted-foreground)" }}>
      <p><strong>Selected:</strong> TaskManagement</p>
      <p><strong>Type:</strong> Orbital</p>
      <p><strong>States:</strong> 4</p>
      <p><strong>Transitions:</strong> 6</p>
    </div>
  </div>
);

export const HQMode: Story = {
  args: {
    project: mockProject,
    mode: "hq",
    activeTab: "info",
    validationStatus: "valid",
  },
};

export const HQModeProposal: Story = {
  args: {
    project: mockProject,
    mode: "hq",
    activeTab: "proposal",
    validationStatus: "valid",
  },
};

export const HQModeDesignSystem: Story = {
  args: {
    project: mockProject,
    mode: "hq",
    activeTab: "design-system",
    validationStatus: "valid",
  },
};

export const BuildModeSchema: Story = {
  args: {
    project: mockProject,
    mode: "build",
    activeTab: "schema",
    validationStatus: "valid",
    schemaEditor: <MockSchemaEditor />,
  },
};

export const BuildModeVisualization: Story = {
  args: {
    project: mockProject,
    mode: "build",
    activeTab: "visualization",
    validationStatus: "valid",
    orbitalVisualization: <MockVisualization />,
  },
};

export const WithValidationError: Story = {
  args: {
    project: mockProject,
    mode: "build",
    activeTab: "schema",
    validationStatus: "invalid",
    errorCount: 3,
    schemaEditor: <MockSchemaEditor />,
  },
};

export const Validating: Story = {
  args: {
    project: mockProject,
    mode: "build",
    activeTab: "schema",
    validationStatus: "validating",
    schemaEditor: <MockSchemaEditor />,
  },
};

export const WithAgentPanel: Story = {
  args: {
    project: mockProject,
    mode: "build",
    activeTab: "schema",
    validationStatus: "valid",
    schemaEditor: <MockSchemaEditor />,
    agentPanel: <MockAgentPanel />,
    showAgentPanel: true,
  },
};

export const WithInspectorPanel: Story = {
  args: {
    project: mockProject,
    mode: "build",
    activeTab: "schema",
    validationStatus: "valid",
    schemaEditor: <MockSchemaEditor />,
    inspectorPanel: <MockInspector />,
    showInspectorPanel: true,
  },
};

export const WithAllPanels: Story = {
  args: {
    project: mockProject,
    mode: "build",
    activeTab: "schema",
    validationStatus: "valid",
    schemaEditor: <MockSchemaEditor />,
    agentPanel: <MockAgentPanel />,
    inspectorPanel: <MockInspector />,
    showAgentPanel: true,
    showInspectorPanel: true,
  },
};

export const MinimalProject: Story = {
  args: {
    project: {
      id: "2",
      name: "New Project",
      version: "0.1.0",
      createdAt: "Today",
      updatedAt: "Today",
      orbitalsCount: 0,
      traitsCount: 0,
      pagesCount: 0,
    },
    mode: "hq",
    activeTab: "info",
    validationStatus: "valid",
  },
};
