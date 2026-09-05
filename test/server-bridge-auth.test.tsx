/**
 * The HTTP server bridge authenticates with the hosting server: every fetch
 * carries `Authorization: Bearer <token>` and the SSE channel carries the same
 * token as `?access_token=` (EventSource cannot set headers). Without a
 * provider nothing is attached (dev servers bypass auth).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { EventBusProvider } from '../providers/EventBusProvider';
import { ServerBridgeProvider } from '../providers/ServerBridge';
import type { OrbitalSchema } from '@almadar/core';

const schema: OrbitalSchema = { name: 'Probe', orbitals: [] };

class FakeEventSource {
  static urls: string[] = [];
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(url: string) {
    FakeEventSource.urls.push(url);
  }
  close(): void {}
}

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () =>
  new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
);

beforeEach(() => {
  FakeEventSource.urls = [];
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('EventSource', FakeEventSource);
});
afterEach(() => vi.unstubAllGlobals());

function headerOf(call: [RequestInfo | URL, RequestInit?], name: string): string | null {
  return new Headers(call[1]?.headers).get(name);
}

describe('ServerBridgeProvider auth', () => {
  it('sends the bearer token on register and on the SSE url', async () => {
    const getAccessToken = vi.fn(async () => 'id-token-1');
    render(
      <EventBusProvider>
        <ServerBridgeProvider schema={schema} serverUrl="https://api.test/api/orbitals" getAccessToken={getAccessToken}>
          <div />
        </ServerBridgeProvider>
      </EventBusProvider>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const register = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/register'));
    expect(register).toBeDefined();
    expect(headerOf(register!, 'Authorization')).toBe('Bearer id-token-1');
    await waitFor(() => expect(FakeEventSource.urls).toHaveLength(1));
    const url = new URL(FakeEventSource.urls[0]);
    expect(url.pathname).toBe('/api/events');
    expect(url.searchParams.get('access_token')).toBe('id-token-1');
    expect(url.searchParams.get('clientId')).toBeTruthy();
  });

  it('attaches nothing without a token provider', async () => {
    render(
      <EventBusProvider>
        <ServerBridgeProvider schema={schema} serverUrl="https://api.test/api/orbitals">
          <div />
        </ServerBridgeProvider>
      </EventBusProvider>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const register = fetchMock.mock.calls.find((c) => String(c[0]).endsWith('/register'));
    expect(headerOf(register!, 'Authorization')).toBeNull();
    await waitFor(() => expect(FakeEventSource.urls).toHaveLength(1));
    expect(new URL(FakeEventSource.urls[0]).searchParams.has('access_token')).toBe(false);
  });
});
