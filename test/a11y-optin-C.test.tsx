// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { ScoreDisplay } from '../components/game/atoms/ScoreDisplay';
import { TimerDisplay } from '../components/game/atoms/TimerDisplay';
import { HealthBar } from '../components/game/atoms/HealthBar';
import { DialogueBubble } from '../components/game/atoms/DialogueBubble';
import { GameAudioToggle } from '../components/game/atoms/GameAudioToggle';
import { StatBadge } from '../components/game/molecules/StatBadge';
import { ActionPalette } from '../components/game/molecules/ActionPalette';
import { StateJsonView } from '../components/game/molecules/StateJsonView';
import { GameMenu } from '../components/game/molecules/GameMenu';
import { AvlGlyph } from '../components/avl/molecules/AvlGlyph';

type Case = { name: string; element: (a11y: { 'aria-label'?: string; lang?: string }) => React.ReactElement };

const cases: Case[] = [
  { name: 'ScoreDisplay', element: (a) => <ScoreDisplay value={5} {...a} /> },
  { name: 'TimerDisplay', element: (a) => <TimerDisplay seconds={30} {...a} /> },
  { name: 'HealthBar bar', element: (a) => <HealthBar current={2} max={5} format="bar" {...a} /> },
  { name: 'HealthBar hearts', element: (a) => <HealthBar current={2} max={5} format="hearts" {...a} /> },
  { name: 'HealthBar numeric', element: (a) => <HealthBar current={2} max={5} format="numeric" {...a} /> },
  { name: 'DialogueBubble', element: (a) => <DialogueBubble text="Hi" {...a} /> },
  { name: 'StatBadge', element: (a) => <StatBadge label="HP" value={3} {...a} /> },
  { name: 'ActionPalette', element: (a) => <ActionPalette actions={[]} {...a} /> },
  { name: 'StateJsonView', element: (a) => <StateJsonView name="Door" initialState="closed" states={['closed', 'open']} transitions={[]} {...a} /> },
  { name: 'GameMenu', element: (a) => <GameMenu title="Game" {...a} /> },
  { name: 'AvlGlyph', element: (a) => <AvlGlyph kind="state" {...a} /> },
];

function root(element: React.ReactElement): Element {
  const { container } = render(<EventBusProvider debug={false}>{element}</EventBusProvider>);
  const el = container.firstElementChild;
  if (!el) throw new Error('nothing rendered');
  return el;
}

describe('A11yProps opt-in: game / avl components forward to the root element', () => {
  it.each(cases)('$name forwards aria-label and lang to its root', ({ element }) => {
    const el = root(element({ 'aria-label': 'custom name', lang: 'ar' }));
    expect(el.getAttribute('aria-label')).toBe('custom name');
    expect(el.getAttribute('lang')).toBe('ar');
  });

  it.each(cases)('$name leaves the root unlabelled when no a11y props are given', ({ element }) => {
    const el = root(element({}));
    expect(el.hasAttribute('lang')).toBe(false);
    expect(el.getAttribute('aria-label')).not.toBe('custom name');
  });

  it('GameAudioToggle: caller aria-label wins over the default, which is kept otherwise', () => {
    const named = root(<GameAudioToggle aria-label="Mute music" />);
    expect(named.getAttribute('aria-label')).toBe('Mute music');
    const plain = root(<GameAudioToggle />);
    expect(plain.getAttribute('aria-label')).toBeTruthy();
    expect(plain.getAttribute('aria-label')).not.toBe('Mute music');
  });
});
