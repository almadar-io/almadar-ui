import { describe, it, expect } from 'vitest';
import { stampLocallyDeliveredEchoes } from '../cascadeEcho';

describe('stampLocallyDeliveredEchoes', () => {
  it('drops the dispatched event echo, stamps one echo per locally-emitted name, leaves the rest unstamped', () => {
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
      { event: 'FETCHED' },
    ]);
  });

  it('stamps only as many echoes of a name as were locally emitted — extras pass through unstamped', () => {
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
      { event: 'REFRESH' },
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
    expect(result).toEqual([{ event: 'FETCHED' }]);
  });
});
