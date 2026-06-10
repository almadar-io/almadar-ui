'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MatrixQuestion, DEFAULT_MATRIX_COLUMNS } from "./MatrixQuestion";
import type { MatrixColumn } from "./MatrixQuestion";

const meta: Meta<typeof MatrixQuestion> = {
  title: "Core/Molecules/MatrixQuestion",
  component: MatrixQuestion,
  parameters: {
    layout: "padded",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md"] },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRows = [
  { id: "q1", label: "The product was easy to use." },
  { id: "q2", label: "I would recommend this to a colleague." },
  { id: "q3", label: "The documentation was clear and helpful." },
];

const customColumns: MatrixColumn[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const Default: Story = {
  args: {
    title: "Please rate your experience",
    rows: sampleRows,
    columns: DEFAULT_MATRIX_COLUMNS,
  },
};

export const CustomColumns: Story = {
  args: {
    title: "Rate the priority of each item",
    rows: sampleRows,
    columns: customColumns,
  },
};

export const Disabled: Story = {
  args: {
    title: "Read-only matrix",
    rows: sampleRows,
    columns: DEFAULT_MATRIX_COLUMNS,
    values: { q1: 4, q2: 5, q3: 3 },
    disabled: true,
  },
};

export const Interactive: Story = {
  render: (args) => {
    const InteractiveMatrix: React.FC = () => {
      const [values, setValues] = useState<Record<string, number | string>>({});
      return (
        <MatrixQuestion
          {...args}
          values={values}
          onChange={(rowId, value) =>
            setValues((prev) => ({ ...prev, [rowId]: value }))
          }
        />
      );
    };
    return <InteractiveMatrix />;
  },
  args: {
    title: "Interactive survey",
    rows: sampleRows,
    columns: DEFAULT_MATRIX_COLUMNS,
  },
};
