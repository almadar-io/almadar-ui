import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { Coachmark } from './Coachmark';
import { Button } from '../atoms/Button';

const meta: Meta<typeof Coachmark> = {
  title: 'Core/Molecules/Coachmark',
  component: Coachmark,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultCoachmark() {
    const ref = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button ref={ref} onClick={() => setOpen(true)}>
          Canvas
        </Button>
        <Coachmark
          open={open}
          anchor={ref}
          placement="bottom"
          title="Your app as a living flow"
          onDismiss={() => setOpen(false)}
        >
          Each node is an entity, state, or screen — the agent fills it in as you chat.
        </Coachmark>
      </>
    );
  },
};

export const WithPrimaryAction: Story = {
  render: function PrimaryCoachmark() {
    const ref = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button ref={ref}>Preview</Button>
        <Coachmark
          open={open}
          anchor={ref}
          placement="bottom"
          title="Run it for real"
          onDismiss={() => setOpen(false)}
          onPrimary={() => setOpen(false)}
          primaryLabel="Got it"
        >
          Run the real app right here and click through it as your users will.
        </Coachmark>
      </>
    );
  },
};

export const KeystoneBeacon: Story = {
  render: function BeaconCoachmark() {
    const ref = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button ref={ref} variant="ghost">
          Builder ▾
        </Button>
        <Coachmark
          open={open}
          anchor={ref}
          placement="bottom"
          title="You're in Builder mode"
          showBeacon
          onDismiss={() => setOpen(false)}
        >
          Switch to Designer or Architect any time to unlock more power.
        </Coachmark>
      </>
    );
  },
};
