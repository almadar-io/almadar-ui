import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { TagInput } from './TagInput';
import { VStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { EventBusProvider } from '../../providers/EventBusProvider';
import { useEventBus } from '../../hooks/useEventBus';

const meta: Meta<typeof TagInput> = {
  title: 'Core/Molecules/TagInput',
  component: TagInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultDemo() {
    const [value, setValue] = useState<ReadonlyArray<string>>([]);
    return (
      <VStack gap="md" className="max-w-md">
        <Typography variant="body2" color="muted">
          Type a value and press Enter to add a chip. Backspace on the empty
          input removes the most recent chip.
        </Typography>
        <TagInput
          value={value}
          onChange={setValue}
          placeholder="Type and press Enter…"
        />
        <Typography variant="caption" color="muted">
          Current value: <code>{JSON.stringify(value)}</code>
        </Typography>
      </VStack>
    );
  },
};

export const Prefilled: Story = {
  render: function PrefilledDemo() {
    const [value, setValue] = useState<ReadonlyArray<string>>([
      'apples',
      'oranges',
      'bananas',
    ]);
    return (
      <VStack gap="md" className="max-w-md">
        <TagInput
          value={value}
          onChange={setValue}
          placeholder="Add another fruit…"
          helperText="Click the X on any chip to remove it."
        />
      </VStack>
    );
  },
};

export const VariantPrimary: Story = {
  render: function VariantDemo() {
    const [value, setValue] = useState<ReadonlyArray<string>>([
      'admin',
      'editor',
    ]);
    return (
      <VStack gap="md" className="max-w-md">
        <Typography variant="body2" color="muted">
          Variant <code>primary</code> renders the chips with the primary
          theme colour.
        </Typography>
        <TagInput value={value} onChange={setValue} variant="primary" />
      </VStack>
    );
  },
};

export const AllowDuplicates: Story = {
  render: function AllowDuplicatesDemo() {
    const [value, setValue] = useState<ReadonlyArray<string>>([]);
    return (
      <VStack gap="md" className="max-w-md">
        <Typography variant="body2" color="muted">
          With <code>unique={'{false}'}</code> the same value can be added
          multiple times.
        </Typography>
        <TagInput
          value={value}
          onChange={setValue}
          unique={false}
          placeholder="Duplicates allowed…"
        />
      </VStack>
    );
  },
};

export const Disabled: Story = {
  args: {
    value: ['locked', 'frozen', 'read-only'],
    disabled: true,
    placeholder: 'Disabled — cannot edit',
  },
};

export const WithHelperText: Story = {
  render: function HelperDemo() {
    const [value, setValue] = useState<ReadonlyArray<string>>(['orbital']);
    return (
      <TagInput
        value={value}
        onChange={setValue}
        helperText="Each chip becomes one item in the `nav-items` list."
      />
    );
  },
};

/**
 * Wired to the event bus — adding or removing a chip emits typed
 * `UI:TAG_ADDED` / `UI:TAG_REMOVED` events alongside the `onChange`
 * callback. The Listener box below the input prints every event it sees.
 */
export const WithEventBus: Story = {
  render: function EventBusDemo() {
    return (
      <EventBusProvider debug={false}>
        <EventBusDemoInner />
      </EventBusProvider>
    );
  },
};

function EventBusDemoInner() {
  const [value, setValue] = useState<ReadonlyArray<string>>([]);
  const [events, setEvents] = useState<string[]>([]);
  const eventBus = useEventBus();
  React.useEffect(() => {
    const offAdd = eventBus.on('UI:TAG_ADDED', (e) => {
      setEvents((prev) => [...prev, `ADDED ${JSON.stringify(e.payload)}`]);
    });
    const offRemove = eventBus.on('UI:TAG_REMOVED', (e) => {
      setEvents((prev) => [...prev, `REMOVED ${JSON.stringify(e.payload)}`]);
    });
    return () => {
      offAdd();
      offRemove();
    };
  }, [eventBus]);
  return (
    <VStack gap="md" className="max-w-md">
      <TagInput
        value={value}
        onChange={setValue}
        addEvent="TAG_ADDED"
        removeEvent="TAG_REMOVED"
        placeholder="Type and press Enter…"
      />
      <VStack gap="xs">
        <Typography variant="caption" color="muted">
          Bus event log:
        </Typography>
        {events.length === 0 ? (
          <Typography variant="caption" color="muted">
            (none yet)
          </Typography>
        ) : (
          events.map((e, i) => (
            <Typography key={i} variant="caption">
              {e}
            </Typography>
          ))
        )}
      </VStack>
    </VStack>
  );
}
