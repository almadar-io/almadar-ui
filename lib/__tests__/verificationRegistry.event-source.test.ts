// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import type { BusEvent } from '@almadar/core';
import { bindEventBus } from '../verificationRegistry';

afterEach(() => { delete window.__orbitalVerification; });

describe('verification event provenance', () => {
  it('preserves distinct machine sources when fetch events share a bare key', () => {
    let receive: ((event: BusEvent) => void) | undefined;
    bindEventBus({ emit: () => {}, onAny(listener) { receive = listener; return () => {}; } });
    if (receive === undefined) throw new Error('Missing real event logger subscription');
    const events: BusEvent[] = ['ChannelRail', 'MemberDirectory'].map(trait => ({ type: 'UI:BrowseItemLoaded', payload: { data: [{ id: trait }] }, timestamp: 10, source: { orbital: 'Chat', trait, dispatched: true } }));
    for (const event of events) receive(event);
    expect(window.__orbitalVerification?.eventLog).toEqual(events.map(event => ({ type: event.type, payload: event.payload, source: event.source, timestamp: expect.any(Number) })));
  });
  it('keeps source-less user events source-less with the complete payload', () => {
    let receive: ((event: BusEvent) => void) | undefined;
    bindEventBus({ emit: () => {}, onAny(listener) { receive = listener; return () => {}; } });
    if (receive === undefined) throw new Error('Missing real event logger subscription');
    receive({ type: 'UI:Chat.Composer.SEND', payload: { content: 'complete message' }, timestamp: 10 });
    expect(window.__orbitalVerification?.eventLog).toEqual([{ type: 'UI:Chat.Composer.SEND', payload: { content: 'complete message' }, timestamp: expect.any(Number) }]);
  });
});
