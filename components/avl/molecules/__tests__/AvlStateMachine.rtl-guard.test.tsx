// @vitest-environment jsdom
/**
 * A guard is code: `(> @payload.amount 0)` must read left to right even on an
 * RTL page, or the bidi algorithm reorders its parentheses and operators.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AvlStateMachine } from '../AvlStateMachine';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { I18nProvider, createTranslate } from '../../../../hooks/useTranslate';
import type { TraitLevelData } from '../../../../lib/avl-schema-parser';

const CHECKOUT: TraitLevelData = {
  name: 'Checkout',
  linkedEntity: 'Order',
  states: [
    { name: 'pending', isInitial: true, isTerminal: false },
    { name: 'paid', isInitial: false, isTerminal: false },
  ],
  transitions: [
    { from: 'pending', to: 'paid', event: 'PAY', guard: ['>', '@payload.amount', 0], effects: [], index: 0 },
    { from: 'paid', to: 'pending', event: 'RESET', guard: null, effects: [], index: 1 },
  ],
  emittedEvents: [],
  listenedEvents: [],
};

async function labels(direction: 'ltr' | 'rtl'): Promise<HTMLElement[]> {
  render(
    <I18nProvider value={{ locale: direction === 'rtl' ? 'ar' : 'en', direction, t: createTranslate({}) }}>
      <EventBusProvider debug={false}>
        <AvlStateMachine trait={CHECKOUT} />
      </EventBusProvider>
    </I18nProvider>,
  );
  await waitFor(() => expect(screen.getAllByTestId('avl-sm-label')).toHaveLength(2));
  return screen.getAllByTestId('avl-sm-label');
}

describe('AvlStateMachine guard text direction', () => {
  it('renders the guard as a left-to-right run on an RTL page', async () => {
    const [pay] = await labels('rtl');
    const guard = [...pay.querySelectorAll<HTMLElement>('span')].find((el) => el.textContent?.includes('@payload.amount'));
    expect(guard?.getAttribute('dir')).toBe('ltr');
  });

  it('control: an unguarded transition has no guard run', async () => {
    const [, reset] = await labels('rtl');
    expect([...reset.querySelectorAll('[dir="ltr"]')]).toHaveLength(0);
  });

  it('control: the event name itself is not forced LTR', async () => {
    const [pay] = await labels('ltr');
    const event = [...pay.querySelectorAll<HTMLElement>('span')].find((el) => el.textContent === 'PAY');
    expect(event?.getAttribute('dir')).toBeNull();
  });
});
