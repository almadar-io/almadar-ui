import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ConfettiEffect } from '../ConfettiEffect';
import { TypewriterText } from '../TypewriterText';

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
