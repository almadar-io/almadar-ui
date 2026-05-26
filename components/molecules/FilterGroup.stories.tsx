'use client';

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FilterGroup, type FilterDefinition } from "./FilterGroup";

const meta: Meta<typeof FilterGroup> = {
  title: "Core/Molecules/FilterGroup",
  component: FilterGroup,
  parameters: {
    layout: "padded",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "compact", "pills", "vertical"],
    },
    look: {
      control: "select",
      options: [
        "toolbar",
        "chips",
        "pills",
        "popover-trigger",
        "inline-column-header",
      ],
    },
    showIcon: { control: "boolean" },
    isLoading: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFields: readonly FilterDefinition[] = [
  {
    field: "status",
    label: "Status",
    filterType: "select",
    options: ["Open", "In Progress", "Done"],
  },
  {
    field: "assignee",
    label: "Assignee",
    filterType: "text",
  },
  {
    field: "dueDate",
    label: "Due date",
    filterType: "date-range",
  },
];

export const Default: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
  },
};

export const Compact: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    variant: "compact",
  },
};

export const Pills: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    variant: "pills",
  },
};

export const Vertical: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    variant: "vertical",
  },
};

/** ── Layer 2 looks ── */

export const Toolbar: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    look: "toolbar",
  },
  parameters: {
    docs: {
      description: {
        story: "Inline row of filters with labels. Standard toolbar treatment.",
      },
    },
  },
};

export const Chips: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    look: "chips",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Each filter renders as a removable chip — pill shape, compact.",
      },
    },
  },
};

export const PillsLook: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    look: "pills",
  },
  parameters: {
    docs: {
      description: {
        story: "Picker-style pills, no remove affordance.",
      },
    },
  },
};

export const PopoverTrigger: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    look: "popover-trigger",
  },
  parameters: {
    docs: {
      description: {
        story: "Single button opens a popover with all filters.",
      },
    },
  },
};

export const InlineColumnHeader: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    look: "inline-column-header",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Filters move into table column headers — bar collapses.",
      },
    },
  },
};

/** ── Event behavior ── */

export const WithChangeEvent: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    onFilterChange: (field, value) => {
      console.log("FILTER_CHANGED", { field, value });
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Each filter selection fires `UI:FILTER` on the event bus and invokes the `onFilterChange` callback shown here. Closed-circuit consumers listen on the bus.",
      },
    },
  },
};

export const WithClearEvent: Story = {
  args: {
    entity: "Task",
    filters: sampleFields,
    onClearAll: () => {
      console.log("FILTER_CLEARED");
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Pressing Clear fires `UI:CLEAR_FILTERS` on the event bus and invokes the `onClearAll` callback shown here.",
      },
    },
  },
};
