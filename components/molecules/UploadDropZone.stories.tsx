'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { UploadDropZone } from "./UploadDropZone";

const meta: Meta<typeof UploadDropZone> = {
  title: "Molecules/UploadDropZone",
  component: UploadDropZone,
  parameters: {
    layout: "centered",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    maxFiles: { control: { type: "number", min: 1, max: 20 } },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const ImagesOnly: Story = {
  args: {
    accept: "image/*",
    label: "Drop images here or click to browse",
    description: "PNG, JPG, WebP up to 10MB",
    maxSize: 10 * 1024 * 1024,
  },
};

export const PDFOnly: Story = {
  args: {
    accept: "application/pdf",
    label: "Upload PDF document",
    description: "Single PDF file, max 25MB",
    maxSize: 25 * 1024 * 1024,
    maxFiles: 1,
  },
};

export const MultipleFiles: Story = {
  args: {
    maxFiles: 5,
    label: "Drop up to 5 files",
    description: "Any file type, max 10MB each",
    maxSize: 10 * 1024 * 1024,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Upload disabled",
  },
};

function InteractiveUpload() {
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>([]);
  return (
    <div className="w-96 space-y-4">
      <UploadDropZone
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        maxFiles={3}
        label="Drop images here or click to browse"
        description="PNG, JPG, WebP up to 5MB. Max 3 files."
        onFiles={(newFiles) =>
          setFiles(newFiles.map((f) => ({ name: f.name, size: f.size })))
        }
      />
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground">
            Selected files:
          </div>
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded bg-surface border border-border text-sm"
            >
              <span className="text-foreground truncate">{f.name}</span>
              <span className="text-muted-foreground ml-2 flex-shrink-0">
                {Math.round(f.size / 1024)}KB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveUpload />,
};
