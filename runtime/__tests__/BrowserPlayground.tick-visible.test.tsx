/**
 * A `[visible]` tick (`whileVisible`) pauses while its trait's rendered output is off screen and
 * resumes when it comes back; an untagged tick keeps firing off screen (LOLO §11).
 */
import { describe, expect, it, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { OrbitalSchema } from '@almadar/core';
import { BrowserPlayground } from '../BrowserPlayground';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

type Entry = { target: Element; isIntersecting: boolean };
const observers: Array<{ cb: (e: Entry[]) => void; targets: Set<Element> }> = [];
let onScreen = true;
function stubIo(): void {
  vi.stubGlobal('IntersectionObserver', class {
    private readonly entry: { cb: (e: Entry[]) => void; targets: Set<Element> };
    constructor(cb: (e: Entry[]) => void) { this.entry = { cb, targets: new Set() }; observers.push(this.entry); }
    observe(el: Element) { this.entry.targets.add(el); this.entry.cb([{ target: el, isIntersecting: onScreen }]); }
    unobserve(el: Element) { this.entry.targets.delete(el); }
    disconnect() { this.entry.targets.clear(); }
  });
}
const setOnScreen = (v: boolean) => act(() => { onScreen = v; for (const o of observers) o.cb([...o.targets].map((target) => ({ target, isIntersecting: v }))); });

// The page keeps one presence observer across tests, so the stubs' observers outlive a test too.
afterEach(() => { vi.unstubAllGlobals(); onScreen = true; });

function program(whileVisible: boolean): OrbitalSchema {
  return {
    name: `tick-visible-${whileVisible}`,
    version: '1.0.0',
    orbitals: [{
      name: 'Lab',
      entity: { name: 'Counter', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }, { name: 'n', type: 'number', default: 0 }] },
      traits: [{
        name: 'Clock', linkedEntity: 'Counter', category: 'interaction', scope: 'instance',
        stateMachine: {
          states: [{ name: 'idle', isInitial: true }],
          events: [{ key: 'INIT', name: 'INIT' }],
          transitions: [{ from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: ['str/concat', 'n=', '@entity.n'] }]] }],
        },
        ticks: [{ name: 'count', interval: 30, whileVisible, effects: [['set', '@entity.n', ['+', '@entity.n', 1]], ['render-ui', 'main', { type: 'typography', content: ['str/concat', 'n=', '@entity.n'] }]] }],
      }],
      pages: [{ name: 'Home', path: '/', traits: [{ ref: 'Clock' }] }],
    }],
  };
}

const count = (): number => Number((screen.getByText(/^n=/).textContent ?? 'n=0').slice(2));
const wait = (ms: number) => act(() => new Promise((r) => setTimeout(r, ms)));

describe('BrowserPlayground: a [visible] tick follows its trait on screen', () => {
  it('counts on screen, stops off screen, resumes on screen', async () => {
    stubIo();
    render(<MemoryRouter><BrowserPlayground schema={program(true)} /></MemoryRouter>);
    await screen.findByText(/^n=[1-9]/, {}, { timeout: 5_000 });
    setOnScreen(false);
    await wait(100);
    const paused = count();
    await wait(300);
    expect(count()).toBe(paused);
    setOnScreen(true);
    await wait(300);
    expect(count()).toBeGreaterThan(paused);
  }, 20_000);

  it('control: an untagged tick keeps counting off screen', async () => {
    stubIo();
    render(<MemoryRouter><BrowserPlayground schema={program(false)} /></MemoryRouter>);
    await screen.findByText(/^n=[1-9]/, {}, { timeout: 5_000 });
    setOnScreen(false);
    await wait(100);
    const before = count();
    await wait(300);
    expect(count()).toBeGreaterThan(before);
  }, 20_000);
});
