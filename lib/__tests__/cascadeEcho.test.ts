import { describe, it, expect } from 'vitest';
import { stampLocallyDeliveredEchoes } from '../cascadeEcho';

describe('stampLocallyDeliveredEchoes', () => {
  it('drops the dispatched event echo, stamps one echo per locally-emitted name, clears the rest to dispatched:false', () => {
    const result = stampLocallyDeliveredEchoes(
      'MOVE_ID',
      [
        { event: 'MOVE_ID' },
        { event: 'POSE_ROTATE' },
        { event: 'REFRESH' },
        { event: 'FETCHED' },
      ],
      ['POSE_ROTATE', 'REFRESH'],
    );
    expect(result).toEqual([
      { event: 'POSE_ROTATE', source: { dispatched: true } },
      { event: 'REFRESH', source: { dispatched: true } },
      { event: 'FETCHED', source: { dispatched: false } },
    ]);
  });

  it('stamps only as many echoes of a name as were locally emitted — extras are cleared to dispatched:false', () => {
    const result = stampLocallyDeliveredEchoes(
      'DISPATCH',
      [
        { event: 'REFRESH' },
        { event: 'REFRESH' },
      ],
      ['REFRESH'],
    );
    expect(result).toEqual([
      { event: 'REFRESH', source: { dispatched: true } },
      { event: 'REFRESH', source: { dispatched: false } },
    ]);
  });

  it('with an empty local list, stamps nothing and drops only the dispatched event echo', () => {
    const result = stampLocallyDeliveredEchoes(
      'DISPATCH',
      [
        { event: 'DISPATCH' },
        { event: 'FETCHED' },
      ],
      [],
    );
    expect(result).toEqual([{ event: 'FETCHED', source: { dispatched: false } }]);
  });

  it('clears a SERVER-stamped dispatched:true on a non-locally-delivered echo (the server consumed it, the local machine never ran it)', () => {
    // The server's own cascade/fan-out consumed the event and stamped it —
    // the echo's payload is the only delivery of server-produced render
    // data, so the flag must NOT reach the self-subscribe as "locally
    // delivered" (it would be dropped and the payload stranded).
    const result = stampLocallyDeliveredEchoes(
      'INIT',
      [
        {
          event: 'BrowseItemLoaded',
          source: { orbital: 'O', trait: 'T', dispatched: true },
        },
      ],
      [],
    );
    expect(result).toEqual([
      { event: 'BrowseItemLoaded', source: { orbital: 'O', trait: 'T', dispatched: false } },
    ]);
  });

  it('a locally-delivered echo keeps dispatched:true even when the server also stamped it (the local leg already ran the transition)', () => {
    const result = stampLocallyDeliveredEchoes(
      'SEND',
      [
        {
          event: 'SAVE',
          source: { orbital: 'O', trait: 'T', dispatched: true },
        },
      ],
      ['SAVE'],
    );
    expect(result).toEqual([
      { event: 'SAVE', source: { orbital: 'O', trait: 'T', dispatched: true } },
    ]);
  });
});
