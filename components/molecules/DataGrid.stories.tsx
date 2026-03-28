'use client';

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataGrid } from "./DataGrid";

const meta: Meta<typeof DataGrid> = {
  title: "Core/Molecules/DataGrid",
  component: DataGrid,
  parameters: {
    layout: "padded",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    cols: { control: "select", options: [1, 2, 3, 4, 5, 6] },
    gap: { control: "select", options: ["none", "sm", "md", "lg", "xl"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleProducts = [
  { id: "1", name: "Wireless Headphones", price: 79.99, status: "active", category: "Electronics", image: "https://via.placeholder.com/400x200" },
  { id: "2", name: "Running Shoes", price: 129.99, status: "active", category: "Footwear", image: "https://via.placeholder.com/400x200" },
  { id: "3", name: "Backpack Pro", price: 59.99, status: "draft", category: "Accessories" },
  { id: "4", name: "Smart Watch", price: 249.99, status: "active", category: "Electronics" },
  { id: "5", name: "Water Bottle", price: 24.99, status: "inactive", category: "Accessories" },
  { id: "6", name: "Desk Lamp", price: 44.99, status: "active", category: "Home" },
];

export const Default: Story = {
  args: {
    entity: sampleProducts,
    cols: 3,
    fields: [
      { name: "name", variant: "h4" },
      { name: "status", variant: "badge" },
      { name: "price", format: "currency" },
      { name: "category", variant: "caption" },
    ],
  },
};

export const Selectable: Story = {
  name: "Multi-Select",
  args: {
    entity: sampleProducts,
    cols: 3,
    selectable: true,
    selectionEvent: "PRODUCTS_SELECTED",
    fields: [
      { name: "name", variant: "h4" },
      { name: "status", variant: "badge" },
      { name: "price", format: "currency" },
    ],
  },
};

export const SelectableWithActions: Story = {
  name: "Selectable + Actions",
  args: {
    entity: sampleProducts,
    cols: 2,
    selectable: true,
    selectionEvent: "PRODUCTS_SELECTED",
    fields: [
      { name: "name", variant: "h4", icon: "package" },
      { name: "status", variant: "badge" },
      { name: "price", format: "currency" },
      { name: "category", variant: "caption" },
    ],
    itemActions: [
      { label: "Edit", event: "EDIT_PRODUCT", icon: "pencil", variant: "ghost" },
      { label: "Delete", event: "DELETE_PRODUCT", icon: "trash-2", variant: "danger" },
    ],
  },
};

export const WithImages: Story = {
  args: {
    entity: sampleProducts,
    cols: 3,
    imageField: "image",
    fields: [
      { name: "name", variant: "h4" },
      { name: "price", format: "currency" },
      { name: "status", variant: "badge" },
    ],
  },
};
