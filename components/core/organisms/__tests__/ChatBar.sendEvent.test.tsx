// @vitest-environment jsdom
/**
 * `sendEvent` names the event a message is sent as (Enter and the send button
 * alike), so a `.lolo` trait declares it like any action prop. Default:
 * CHAT_SEND.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';
import { ChatBar } from '../ChatBar';

function mount(sendEvent?: string) {
  const seen: Array<{ type: string; message: unknown }> = [];
  function Spy() {
    const bus = useEventBus();
    React.useEffect(() => bus.onAny?.((e) => { seen.push({ type: e.type, message: e.payload?.message }); }), [bus]);
    return null;
  }
  const view = render(
    <EventBusProvider debug={false}>
      <Spy />
      <ChatBar {...(sendEvent !== undefined ? { sendEvent } : {})} />
    </EventBusProvider>,
  );
  const input = view.container.querySelector('textarea');
  if (!input) throw new Error('no chat input');
  return { input, seen };
}

describe('ChatBar — sendEvent', () => {
  it('Enter sends the message as the declared event and clears the input', () => {
    const { input, seen } = mount('ASK');
    fireEvent.change(input, { target: { value: 'add a task' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(seen).toContainEqual({ type: 'UI:ASK', message: 'add a task' });
    expect(seen.some((e) => e.type === 'UI:CHAT_SEND')).toBe(false);
    expect(input.value).toBe('');
  });

  it('the send button sends the declared event', () => {
    const { input, seen } = mount('ASK');
    fireEvent.change(input, { target: { value: 'hello' } });
    act(() => { fireEvent.click(screen.getByRole('button', { name: /send/i })); });
    expect(seen).toContainEqual({ type: 'UI:ASK', message: 'hello' });
  });

  it('control: without sendEvent it sends CHAT_SEND', () => {
    const { input, seen } = mount();
    fireEvent.change(input, { target: { value: 'hi' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(seen).toContainEqual({ type: 'UI:CHAT_SEND', message: 'hi' });
  });
});
