import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ConfettiEffect } from '../ConfettiEffect';
import { TypewriterText } from '../TypewriterText';
import { AnimatedReveal } from '../AnimatedReveal';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ConfettiEffect', () => {
  it('control: bursts particles when motion is allowed', () => {
    setReducedMotion(false);
    const { container } = render(<ConfettiEffect trigger particleCount={5} />);
    expect(container.querySelectorAll('[style*="confetti-burst"]').length).toBe(5);
  });

  it('spawns nothing under prefers-reduced-motion', () => {
    setReducedMotion(true);
    const { container } = render(<ConfettiEffect trigger particleCount={5} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('TypewriterText', () => {
  it('control: reveals character by character when motion is allowed', () => {
    setReducedMotion(false);
    render(<TypewriterText text="Hello" speed={100} />);
    expect(screen.queryByText('Hello')).toBeNull();
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.getByText('He')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows the full text at once and completes under prefers-reduced-motion', () => {
    setReducedMotion(true);
    const onComplete = vi.fn();
    render(<TypewriterText text="Hello" speed={100} onComplete={onComplete} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalled();
  });

  it('edge: empty text under reduced motion renders no cursor', () => {
    setReducedMotion(true);
    const { container } = render(<TypewriterText text="" />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
  });
});

describe('AnimatedReveal', () => {
  it('control: starts hidden until triggered when motion is allowed', () => {
    setReducedMotion(false);
    render(<AnimatedReveal trigger="manual" animation="fade-up">Section</AnimatedReveal>);
    expect((screen.getByText('Section') as HTMLElement).style.opacity).toBe('0');
  });

  it('shows its final state at once under prefers-reduced-motion', () => {
    setReducedMotion(true);
    render(<AnimatedReveal trigger="manual" animation="fade-up">Section</AnimatedReveal>);
    const el = screen.getByText('Section') as HTMLElement;
    expect(el.style.opacity).toBe('1');
    expect(el.style.transitionDuration).toBe('0ms');
  });
});

describe('AnimatedReveal revealEvent', () => {
  type Fired = string[];
  function Spy({ fired }: { fired: Fired }) {
    const bus = useEventBus();
    React.useEffect(() => bus.on('UI:SECTION_SEEN', () => { fired.push('UI:SECTION_SEEN'); }), [bus, fired]);
    return null;
  }
  function stubObserver(intersecting: boolean) {
    vi.stubGlobal('IntersectionObserver', class {
      private cb: (entries: Array<{ isIntersecting: boolean }>) => void;
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) { this.cb = cb; }
      observe() { this.cb([{ isIntersecting: intersecting }]); }
      disconnect() { /* nothing to release */ }
    });
  }

  it('emits its revealEvent once when the section scrolls into view', () => {
    setReducedMotion(false);
    stubObserver(true);
    const fired: Fired = [];
    render(<EventBusProvider debug={false}><Spy fired={fired} /><AnimatedReveal revealEvent="SECTION_SEEN">Demo</AnimatedReveal></EventBusProvider>);
    expect(fired).toEqual(['UI:SECTION_SEEN']);
  });

  it('emits when the revealEvent arrives after the section was already revealed', () => {
    setReducedMotion(false);
    stubObserver(true);
    const fired: Fired = [];
    const { rerender } = render(<EventBusProvider debug={false}><Spy fired={fired} /><AnimatedReveal revealEvent="">Demo</AnimatedReveal></EventBusProvider>);
    expect(fired).toEqual([]);
    rerender(<EventBusProvider debug={false}><Spy fired={fired} /><AnimatedReveal revealEvent="SECTION_SEEN">Demo</AnimatedReveal></EventBusProvider>);
    expect(fired).toEqual(['UI:SECTION_SEEN']);
  });

  it('control: emits nothing while the section is out of view', () => {
    setReducedMotion(false);
    stubObserver(false);
    const fired: Fired = [];
    render(<EventBusProvider debug={false}><Spy fired={fired} /><AnimatedReveal revealEvent="SECTION_SEEN">Demo</AnimatedReveal></EventBusProvider>);
    expect(fired).toEqual([]);
  });

  it('never emits under prefers-reduced-motion, so nothing starts on its own', () => {
    setReducedMotion(true);
    stubObserver(true);
    const fired: Fired = [];
    render(<EventBusProvider debug={false}><Spy fired={fired} /><AnimatedReveal revealEvent="SECTION_SEEN">Demo</AnimatedReveal></EventBusProvider>);
    expect(fired).toEqual([]);
  });
});
