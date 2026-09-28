// @vitest-environment jsdom
/**
 * A host can hand the conversation to the user: UI:CHAT_FOCUS puts the caret in
 * the chat input, optionally with a prompt of what to write, until the message
 * is sent.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { act, render } from '@testing-library/react';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';
import { ChatBar } from '../ChatBar';

let bus: ReturnType<typeof useEventBus> | null = null;
function Grab() {
  bus = useEventBus();
  return null;
}

function mount() {
  const view = render(
    <EventBusProvider debug={false}>
      <Grab />
      <ChatBar placeholder="Ask anything" />
    </EventBusProvider>,
  );
  const input = view.container.querySelector('textarea');
  if (!input) throw new Error('no chat input');
  return input;
}

describe('ChatBar — UI:CHAT_FOCUS', () => {
  it('focuses the input and shows the requested prompt', () => {
    const input = mount();
    act(() => bus?.emit('UI:CHAT_FOCUS', { placeholder: 'Describe the behavior you want' }));
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('placeholder')).toBe('Describe the behavior you want');
  });

  it('sending the message puts the host placeholder back', () => {
    const input = mount();
    act(() => bus?.emit('UI:CHAT_FOCUS', { placeholder: 'Describe the behavior you want' }));
    act(() => bus?.emit('UI:CHAT_SEND', { message: 'a customer list' }));
    expect(input.getAttribute('placeholder')).toBe('Ask anything');
  });

  it('without a placeholder it only focuses', () => {
    const input = mount();
    act(() => bus?.emit('UI:CHAT_FOCUS', {}));
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('placeholder')).toBe('Ask anything');
  });

  it('control: nothing focuses the input on its own', () => {
    const input = mount();
    expect(document.activeElement).not.toBe(input);
  });
});
