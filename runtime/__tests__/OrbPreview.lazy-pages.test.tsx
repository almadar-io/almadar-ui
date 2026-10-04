// @vitest-environment jsdom
/**
 * `uses lazy`: a lazily-used behavior is not in the importer's schema — only
 * its pages are, as `lazyPages`. Opening one of those pages loads the
 * behavior's own `.orb` and runs it; nothing is fetched before.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { OrbitalSchema } from '@almadar/core';
import { createHttpLoader, createInProcessTransport, type EventTransport } from '@almadar/runtime';
import { OrbitalServerRuntime } from '@almadar/runtime/OrbitalServerRuntime';
import { OrbPreview } from '../OrbPreview';
import { BrowserPlayground } from '../BrowserPlayground';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

function page(orbital: string, path: string, text: string, link?: { label: string; to: string }): OrbitalSchema['orbitals'][number] {
  const content = link
    ? { type: 'stack', children: [{ type: 'typography', content: text }, { type: 'button', label: link.label, action: 'GO' }] }
    : { type: 'typography', content: text };
  return {
    name: orbital,
    entity: { name: `${orbital}State`, persistence: 'runtime', fields: [{ name: 'id', type: 'string' }] },
    traits: [{
      name: `${orbital}View`,
      scope: 'instance',
      linkedEntity: `${orbital}State`,
      stateMachine: {
        states: [{ name: 'idle', isInitial: true }],
        events: link ? [{ key: 'GO', name: 'Go' }] : [],
        transitions: [
          { from: 'idle', to: 'idle', event: 'INIT', effects: [['render-ui', 'main', content]] },
          ...(link ? [{ from: 'idle', to: 'idle', event: 'GO', effects: [['navigate', link.to]] }] : []),
        ],
      },
    }],
    pages: [{ name: `${orbital}Page`, path, traits: [{ ref: `${orbital}View` }] }],
  } as OrbitalSchema['orbitals'][number];
}

const site: OrbitalSchema = {
  name: 'site',
  orbitals: [page('Home', '/', 'Welcome home', { label: 'Read', to: '/blog/why' })],
  lazyPages: [{ path: '/blog/why', orbital: 'BlogWhy', orbRef: 'lazy/BlogWhy.orb' }],
};
const post: OrbitalSchema = {
  name: 'BlogWhy',
  orbitals: [page('BlogWhy', '/blog/why', 'Why we started', { label: 'Back', to: '/' })],
};

function serve(files: Record<string, OrbitalSchema>): string[] {
  const requested: string[] = [];
  vi.stubGlobal('fetch', async (url: string) => {
    requested.push(url);
    const body = files[url];
    return body
      ? new Response(JSON.stringify(body), { status: 200 })
      : new Response('missing', { status: 404, statusText: 'Not Found' });
  });
  return requested;
}

const loader = () => createHttpLoader('https://site.test/');
const renderSite = (initialPagePath: string) =>
  render(
    <MemoryRouter>
      <OrbPreview schema={site} initialPagePath={initialPagePath} lazyLoader={loader()} schemaPath="https://site.test/site.orb" isolated />
    </MemoryRouter>,
  );

describe('lazy pages on the interpreter', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('control: an eager page renders and fetches nothing', async () => {
    const requested = serve({ 'https://site.test/lazy/BlogWhy.orb': post });
    renderSite('/');
    await screen.findByText('Welcome home', {}, { timeout: 10_000 });
    expect(requested).toEqual([]);
  }, 30_000);

  it('navigating to a lazy page loads its .orb and runs it', async () => {
    const requested = serve({ 'https://site.test/lazy/BlogWhy.orb': post });
    renderSite('/');
    fireEvent.click(await screen.findByTestId('action-GO', {}, { timeout: 10_000 }));
    await screen.findByText('Why we started', {}, { timeout: 10_000 });
    expect(requested).toEqual(['https://site.test/lazy/BlogWhy.orb']);
  }, 30_000);

  it('a link out of the lazy page returns to the importer page', async () => {
    serve({ 'https://site.test/lazy/BlogWhy.orb': post });
    renderSite('/blog/why');
    fireEvent.click(await screen.findByTestId('action-GO', {}, { timeout: 10_000 }));
    await screen.findByText('Welcome home', {}, { timeout: 10_000 });
  }, 30_000);

  it('a missing .orb shows the load error instead of a blank page', async () => {
    serve({});
    renderSite('/blog/why');
    const alert = await screen.findByTestId('lazy-page-error', {}, { timeout: 10_000 });
    expect(alert.textContent).toContain('https://site.test/lazy/BlogWhy.orb');
  }, 30_000);
});

describe('lazy pages behind a server', () => {
  afterEach(() => vi.unstubAllGlobals());

  // The host registered the whole program, lazy behaviors included (as `registerFromFile` does).
  async function hostTransport(lifecycle: string[]): Promise<EventTransport> {
    const runtime = new OrbitalServerRuntime();
    await runtime.register(site, { lazy: [post] });
    return createInProcessTransport((orbital, request) => runtime.processOrbitalEvent(orbital, request), {
      onRegister: (s) => { lifecycle.push(`register ${s.name}`); },
      onUnregister: () => { lifecycle.push('unregister'); },
    });
  }

  function renderServed(transport: EventTransport, initialPagePath: string) {
    return render(
      <MemoryRouter>
        <OrbPreview schema={site} initialPagePath={initialPagePath} lazyLoader={loader()} schemaPath="https://site.test/site.orb" transport={transport} isolated />
      </MemoryRouter>,
    );
  }

  it('opening a lazy page keeps the program registered and never registers the lazy behavior', async () => {
    serve({ 'https://site.test/lazy/BlogWhy.orb': post });
    const lifecycle: string[] = [];
    renderServed(await hostTransport(lifecycle), '/');
    fireEvent.click(await screen.findByTestId('action-GO', {}, { timeout: 10_000 }));
    await screen.findByText('Why we started', {}, { timeout: 10_000 });
    expect(lifecycle).toEqual(['register site']);
  }, 30_000);

  it('control: unmounting the preview still unregisters the program once', async () => {
    serve({ 'https://site.test/lazy/BlogWhy.orb': post });
    const lifecycle: string[] = [];
    const view = renderServed(await hostTransport(lifecycle), '/blog/why');
    await screen.findByText('Why we started', {}, { timeout: 10_000 });
    view.unmount();
    expect(lifecycle).toEqual(['register site', 'unregister']);
  }, 30_000);
});

describe('lazy pages in the in-browser playground', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('a lazy page runs on the in-browser runtime', async () => {
    const requested = serve({ 'https://site.test/lazy/BlogWhy.orb': post });
    render(<BrowserPlayground schema={site} initialPagePath="/" lazyLoader={loader()} schemaPath="https://site.test/site.orb" />);
    fireEvent.click(await screen.findByTestId('action-GO', {}, { timeout: 10_000 }));
    await screen.findByText('Why we started', {}, { timeout: 10_000 });
    expect(requested).toContain('https://site.test/lazy/BlogWhy.orb');
  }, 30_000);

  it('edge: opening the lazy page directly runs it too', async () => {
    serve({ 'https://site.test/lazy/BlogWhy.orb': post });
    render(<BrowserPlayground schema={site} initialPagePath="/blog/why" lazyLoader={loader()} schemaPath="https://site.test/site.orb" />);
    await screen.findByText('Why we started', {}, { timeout: 10_000 });
  }, 30_000);
});
