// @vitest-environment jsdom
/**
 * A sandboxed preview (BrowserPlayground — every studio canvas card) must
 * never navigate the host page: no `history.pushState`, no global
 * `popstate`, no native link navigation. Navigation stays inside the preview.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { OrbitalSchema } from '@almadar/core';
import { BrowserPlayground } from '../BrowserPlayground';
import { OrbPreview } from '../OrbPreview';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

function schema(pageCount: 1 | 2): OrbitalSchema {
  const listPage = { name: 'ListPage', path: '/list', traits: [{ ref: 'Lister' }] };
  const detailPage = { name: 'DetailPage', path: '/detail', traits: [{ ref: 'Detail' }] };
  return {
    name: 'nav-app',
    version: '1.0.0',
    orbitals: [
      {
        name: 'NavOrbital',
        entity: { name: 'Item', persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
        traits: [
          {
            name: 'Lister',
            scope: 'instance',
            linkedEntity: 'Item',
            stateMachine: {
              states: [{ name: 'idle', isInitial: true }],
              events: [],
              transitions: [
                { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'button', label: 'Open detail', action: 'OPEN' }]] },
                { from: 'idle', to: 'idle', event: 'OPEN', effects: [['navigate', '/detail']] },
              ],
            },
          },
          {
            name: 'Detail',
            scope: 'instance',
            linkedEntity: 'Item',
            stateMachine: {
              states: [{ name: 'idle', isInitial: true }],
              events: [],
              transitions: [
                { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', { type: 'typography', content: 'Detail page' }]] },
              ],
            },
          },
        ],
        pages: pageCount === 2 ? [listPage, detailPage] : [listPage],
      },
    ],
  } as OrbitalSchema;
}

/** Records every way the preview could move the host page. */
function watchHost() {
  const pushState = vi.spyOn(window.history, 'pushState');
  const replaceState = vi.spyOn(window.history, 'replaceState');
  const popstate = vi.fn();
  window.addEventListener('popstate', popstate);
  const hrefBefore = window.location.href;
  return {
    assertUntouched() {
      expect(pushState).not.toHaveBeenCalled();
      expect(replaceState).not.toHaveBeenCalled();
      expect(popstate).not.toHaveBeenCalled();
      expect(window.location.href).toBe(hrefBefore);
    },
    dispose() {
      window.removeEventListener('popstate', popstate);
    },
  };
}

function clickInjectedLink(container: HTMLElement, href: string): MouseEvent {
  const preview = container.querySelector('.overflow-auto, .overflow-hidden') ?? container;
  const anchor = document.createElement('a');
  anchor.setAttribute('href', href);
  anchor.textContent = 'raw link';
  preview.appendChild(anchor);
  const click = new MouseEvent('click', { bubbles: true, cancelable: true });
  anchor.dispatchEvent(click);
  return click;
}

describe('isolated preview navigation', () => {
  let host: ReturnType<typeof watchHost>;
  afterEach(() => {
    host?.dispose();
    vi.restoreAllMocks();
  });

  it('a navigate effect switches the preview page without touching the host history', async () => {
    host = watchHost();
    render(<BrowserPlayground schema={schema(2)} />);
    fireEvent.click(await screen.findByText('Open detail'));
    await waitFor(() => expect(screen.getByText('Detail page')).toBeTruthy());
    host.assertUntouched();
  });

  it('a raw link in a multi-page preview is contained', async () => {
    host = watchHost();
    const { container } = render(<BrowserPlayground schema={schema(2)} />);
    await screen.findByText('Open detail');
    const click = clickInjectedLink(container, '/detail');
    expect(click.defaultPrevented).toBe(true);
    await waitFor(() => expect(screen.getByText('Detail page')).toBeTruthy());
    host.assertUntouched();
  });

  it('a raw link in a single-page preview is contained too', async () => {
    host = watchHost();
    const { container } = render(<BrowserPlayground schema={schema(1)} />);
    await screen.findByText('Open detail');
    const click = clickInjectedLink(container, '/somewhere-in-the-host-app');
    expect(click.defaultPrevented).toBe(true);
    host.assertUntouched();
  });

  it('a link to an unknown path in a sandbox goes nowhere', async () => {
    host = watchHost();
    const { container } = render(<BrowserPlayground schema={schema(2)} />);
    await screen.findByText('Open detail');
    expect(clickInjectedLink(container, '/not-a-page').defaultPrevented).toBe(true);
    expect(screen.getByText('Open detail')).toBeTruthy();
    host.assertUntouched();
  });

  it('an external link in a sandbox opens a new tab instead of leaving the host', async () => {
    host = watchHost();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { container } = render(<BrowserPlayground schema={schema(2)} />);
    await screen.findByText('Open detail');
    expect(clickInjectedLink(container, 'https://example.com/docs').defaultPrevented).toBe(true);
    expect(open).toHaveBeenCalledWith('https://example.com/docs', '_blank', 'noopener,noreferrer');
    host.assertUntouched();
  });

  it('a hash link in a sandbox never changes the host URL', async () => {
    host = watchHost();
    const { container } = render(<BrowserPlayground schema={schema(1)} />);
    await screen.findByText('Open detail');
    expect(clickInjectedLink(container, '#section').defaultPrevented).toBe(true);
    host.assertUntouched();
  });

  it('control: a non-isolated preview still syncs ?page= into the URL', async () => {
    const pushState = vi.spyOn(window.history, 'pushState');
    render(<OrbPreview schema={schema(2)} />);
    fireEvent.click(await screen.findByText('Open detail'));
    await waitFor(() => expect(pushState).toHaveBeenCalled());
    expect(String(pushState.mock.calls[0][2])).toContain('page=%2Fdetail');
  });
});
