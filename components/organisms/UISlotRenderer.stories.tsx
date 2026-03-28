import React, { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { UISlotRenderer } from './UISlotRenderer';
import { UISlotProvider, useUISlots, type UISlot } from '../../context/UISlotContext';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { VStack } from '../atoms/Stack';

/**
 * Helper that populates slots on mount using the UISlot manager.
 */
function SlotPopulator({ slots }: { slots: Array<{ target: UISlot; pattern: string; props: Record<string, unknown> }> }) {
  const { render } = useUISlots();
  useEffect(() => {
    for (const slot of slots) {
      render(slot);
    }
  }, []);
  return null;
}

/**
 * Main slot background - an alert that says "Main" so all overlays render on top of it.
 */
const MAIN_SLOT = {
  target: 'main' as UISlot,
  pattern: 'alert',
  props: {
    title: 'Main Slot',
    message: 'This is the main content area. Other slots render on top of this background.',
    variant: 'info',
  },
};

function StoryShell({ children }: { children: React.ReactNode }) {
  return (
    <UISlotProvider>
      <Box
        style={{ height: '600px', position: 'relative', overflow: 'hidden' }}
        className="border border-[var(--color-border)] rounded-lg bg-[var(--color-background)]"
      >
        {children}
      </Box>
    </UISlotProvider>
  );
}

const meta: Meta<typeof UISlotRenderer> = {
  title: 'Orb/UISlotRenderer',
  component: UISlotRenderer,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const MainSlot: Story = {
  name: 'main (inline)',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[{
        target: 'main',
        pattern: 'alert',
        props: {
          title: 'Main Slot Content',
          message: 'This alert is rendered into the main slot by a render-ui effect. The main slot is an inline slot that takes up the primary content area.',
          variant: 'info',
        },
      }]} />
      <UISlotRenderer hudMode="inline" />
    </StoryShell>
  ),
};

export const SidebarSlot: Story = {
  name: 'sidebar (inline, reference)',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'sidebar',
          pattern: 'alert',
          props: {
            title: 'Sidebar',
            message: 'Navigation sidebar rendered inline to the left of main.',
            variant: 'default',
          },
        },
      ]} />
      <UISlotRenderer hudMode="inline" />
    </StoryShell>
  ),
};

export const ModalSlot: Story = {
  name: 'modal (portal)',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'modal',
          pattern: 'alert',
          props: {
            title: 'Modal Dialog',
            message: 'This alert is rendered inside a modal portal slot. It floats above the main content with a backdrop.',
            variant: 'warning',
          },
        },
      ]} />
      <UISlotRenderer hudMode="inline" />
    </StoryShell>
  ),
};

export const DrawerSlot: Story = {
  name: 'drawer (portal)',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'drawer',
          pattern: 'alert',
          props: {
            title: 'Drawer Panel',
            message: 'This alert is rendered inside a drawer that slides in from the right.',
            variant: 'default',
            position: 'right',
          },
        },
      ]} />
      <UISlotRenderer hudMode="inline" />
    </StoryShell>
  ),
};

export const ToastSlot: Story = {
  name: 'toast (portal)',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'toast',
          pattern: 'toast',
          props: {
            variant: 'success',
            title: 'Task Saved',
            message: 'Your changes have been saved successfully.',
          },
        },
      ]} />
      <UISlotRenderer hudMode="inline" />
    </StoryShell>
  ),
};

export const OverlaySlot: Story = {
  name: 'overlay (portal)',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'overlay',
          pattern: 'alert',
          props: {
            title: 'Overlay',
            message: 'This alert is rendered in a full-screen overlay slot with a semi-transparent backdrop.',
            variant: 'error',
          },
        },
      ]} />
      <UISlotRenderer hudMode="inline" />
    </StoryShell>
  ),
};

export const CenterSlot: Story = {
  name: 'center (portal)',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'center',
          pattern: 'alert',
          props: {
            title: 'Centered Content',
            message: 'This alert is rendered in the center slot, floating in the middle of the viewport.',
            variant: 'success',
          },
        },
      ]} />
      <UISlotRenderer hudMode="inline" />
    </StoryShell>
  ),
};

export const HudSlots: Story = {
  name: 'hud-top + hud-bottom',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'hud-top',
          pattern: 'alert',
          props: {
            title: 'HUD Top',
            message: 'HP: 85/100  |  MP: 42/60  |  Gold: 1,250  |  Level 12',
            variant: 'info',
          },
        },
        {
          target: 'hud-bottom',
          pattern: 'alert',
          props: {
            title: 'HUD Bottom',
            message: 'Attack  |  Defend  |  Magic  |  Items  |  Run',
            variant: 'default',
          },
        },
      ]} />
      <UISlotRenderer includeHud hudMode="inline" />
    </StoryShell>
  ),
};

export const FloatingSlot: Story = {
  name: 'floating',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'floating',
          pattern: 'alert',
          props: {
            title: 'Floating Widget',
            message: 'This alert is rendered in the floating slot.',
            variant: 'warning',
          },
        },
      ]} />
      <UISlotRenderer includeFloating hudMode="inline" />
    </StoryShell>
  ),
};

export const AllSlotsActive: Story = {
  name: 'All Slots Active',
  render: () => (
    <StoryShell>
      <SlotPopulator slots={[
        MAIN_SLOT,
        {
          target: 'sidebar',
          pattern: 'alert',
          props: { title: 'Sidebar', message: 'Sidebar slot', variant: 'default' },
        },
        {
          target: 'modal',
          pattern: 'alert',
          props: { title: 'Modal', message: 'Modal portal slot', variant: 'warning' },
        },
        {
          target: 'toast',
          pattern: 'toast',
          props: { variant: 'info', title: 'Toast', message: 'Toast notification slot' },
        },
        {
          target: 'hud-top',
          pattern: 'alert',
          props: { title: 'HUD Top', message: 'Top bar', variant: 'info' },
        },
        {
          target: 'hud-bottom',
          pattern: 'alert',
          props: { title: 'HUD Bottom', message: 'Bottom bar', variant: 'info' },
        },
        {
          target: 'floating',
          pattern: 'alert',
          props: { title: 'Floating', message: 'Floating widget', variant: 'success' },
        },
      ]} />
      <UISlotRenderer includeHud includeFloating hudMode="inline" />
    </StoryShell>
  ),
};

export const Empty: Story = {
  name: 'Empty (no content)',
  render: () => (
    <StoryShell>
      <VStack className="items-center justify-center h-full text-center p-8">
        <Typography variant="h3" color="muted">No Slot Content</Typography>
        <Typography color="muted">
          UISlotRenderer with no patterns rendered into any slot.
        </Typography>
      </VStack>
      <UISlotRenderer includeHud includeFloating hudMode="inline" />
    </StoryShell>
  ),
};
