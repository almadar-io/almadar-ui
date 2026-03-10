'use client';

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataList } from "./DataList";

const meta: Meta<typeof DataList> = {
  title: "Molecules/DataList",
  component: DataList,
  parameters: {
    layout: "padded",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "card", "compact", "message"] },
    gap: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleUsers = [
  { id: "1", name: "Alice Johnson", role: "Admin", status: "active", department: "Engineering" },
  { id: "2", name: "Bob Smith", role: "Editor", status: "pending", department: "Engineering" },
  { id: "3", name: "Carol Williams", role: "Viewer", status: "active", department: "Design" },
  { id: "4", name: "David Brown", role: "Editor", status: "inactive", department: "Design" },
  { id: "5", name: "Eve Davis", role: "Admin", status: "active", department: "Marketing" },
];

export const Default: Story = {
  args: {
    entity: sampleUsers,
    fields: [
      { name: "name", variant: "h4" },
      { name: "role", variant: "badge" },
      { name: "status", variant: "badge" },
      { name: "department", variant: "body" },
    ],
  },
};

export const CardVariant: Story = {
  args: {
    entity: sampleUsers,
    variant: "card",
    fields: [
      { name: "name", variant: "h4", icon: "user" },
      { name: "status", variant: "badge" },
      { name: "role", variant: "body" },
    ],
  },
};

export const GroupedByDepartment: Story = {
  name: "Grouped by Department",
  args: {
    entity: sampleUsers,
    groupBy: "department",
    fields: [
      { name: "name", variant: "h4" },
      { name: "role", variant: "badge" },
      { name: "status", variant: "badge" },
    ],
  },
};

export const GroupedCardVariant: Story = {
  name: "Grouped (Card Variant)",
  args: {
    entity: sampleUsers,
    variant: "card",
    groupBy: "department",
    fields: [
      { name: "name", variant: "h4", icon: "user" },
      { name: "status", variant: "badge" },
      { name: "role", variant: "caption" },
    ],
  },
};

const chatMessages = [
  { id: "1", sender: "alice", content: "Hey, are you available for a quick sync?", timestamp: "2026-03-10T10:00:00Z" },
  { id: "2", sender: "me", content: "Sure, give me 5 minutes.", timestamp: "2026-03-10T10:01:00Z" },
  { id: "3", sender: "alice", content: "No rush! I wanted to discuss the new component design.", timestamp: "2026-03-10T10:02:00Z" },
  { id: "4", sender: "me", content: "Sounds good. I just finished the DataList groupBy feature.", timestamp: "2026-03-10T10:03:00Z" },
  { id: "5", sender: "alice", content: "Perfect timing!", timestamp: "2026-03-10T10:03:30Z" },
  { id: "6", sender: "me", content: "Let me share my screen when we connect.", timestamp: "2026-03-10T10:04:00Z" },
];

export const MessageVariant: Story = {
  name: "Message Bubbles",
  args: {
    entity: chatMessages,
    variant: "message",
    senderField: "sender",
    currentUser: "me",
    fields: [
      { name: "content", variant: "body" },
      { name: "timestamp", format: "date" },
    ],
  },
};

const groupedChat = [
  { id: "1", sender: "alice", content: "Good morning!", timestamp: "2026-03-09T09:00:00Z", date: "March 9" },
  { id: "2", sender: "me", content: "Morning! How was the weekend?", timestamp: "2026-03-09T09:01:00Z", date: "March 9" },
  { id: "3", sender: "alice", content: "Great, thanks!", timestamp: "2026-03-09T09:02:00Z", date: "March 9" },
  { id: "4", sender: "alice", content: "Ready for the standup?", timestamp: "2026-03-10T09:00:00Z", date: "March 10" },
  { id: "5", sender: "me", content: "Yes, joining now.", timestamp: "2026-03-10T09:01:00Z", date: "March 10" },
];

export const MessageGroupedByDate: Story = {
  name: "Messages Grouped by Date",
  args: {
    entity: groupedChat,
    variant: "message",
    groupBy: "date",
    senderField: "sender",
    currentUser: "me",
    fields: [
      { name: "content", variant: "body" },
      { name: "timestamp", format: "date" },
    ],
  },
};

export const WithActions: Story = {
  args: {
    entity: sampleUsers,
    fields: [
      { name: "name", variant: "h4" },
      { name: "status", variant: "badge" },
    ],
    itemActions: [
      { label: "Edit", event: "EDIT_USER", icon: "pencil", variant: "ghost" },
      { label: "Delete", event: "DELETE_USER", icon: "trash-2", variant: "danger" },
    ],
  },
};
