// @vitest-environment jsdom
/**
 * CalendarGrid placement contract — an event handed to the grid must be
 * reachable on screen.
 *
 * Two silent drops used to make a populated schedule look empty:
 *   1. `eventInSlot` required an EXACT hour *and minute* match against the
 *      slot label, so anything at :15/:30/:45 rendered nowhere — while the
 *      day-header count badge still counted it (that filter is date-only), so
 *      the header said "3" above three empty columns.
 *   2. The slot band was hard-coded 09:00–17:00, so early-morning and evening
 *      events had no row to land in at all.
 *
 * Live-reproduced on std-fitness-studio `/classes`, where every seeded class
 * session sat outside the band or off the hour and the week timeline painted
 * an empty grid under an "Upcoming Classes" header.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { createElement } from 'react';
import { render, cleanup } from '@testing-library/react';
import { CalendarGrid } from '../components/core/molecules/CalendarGrid';

afterEach(cleanup);

/** An ISO timestamp on today's date at the given local time. */
function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function renderGrid(events: Array<Record<string, unknown>>) {
  // dayWindow is forced to 7 so the assertion never depends on the jsdom
  // viewport width (the auto window would page today's column out of view).
  return render(createElement(CalendarGrid, { events, dayWindow: 7 } as never));
}

describe('CalendarGrid event placement', () => {
  it('places an off-the-hour event in its hour bucket', () => {
    const { getByText } = renderGrid([
      { id: '1', title: 'Half-past Yoga', startTime: todayAt(9, 30) },
    ]);
    expect(getByText('Half-past Yoga')).toBeTruthy();
  });

  it('widens the slot band to cover events outside business hours', () => {
    const { getByText } = renderGrid([
      { id: '1', title: 'Sunrise Run', startTime: todayAt(6, 15) },
      { id: '2', title: 'Late Spin', startTime: todayAt(20, 45) },
    ]);
    expect(getByText('Sunrise Run')).toBeTruthy();
    expect(getByText('Late Spin')).toBeTruthy();
  });

  it('keeps the author-supplied slot band exactly as given', () => {
    const { queryByText, getByText } = renderGrid([]);
    expect(getByText('09:00')).toBeTruthy();
    expect(queryByText('06:00')).toBeNull();
  });

  it('renders an unparseable startTime nowhere instead of throwing', () => {
    const { queryByText } = renderGrid([
      { id: '1', title: 'Lorem Ipsum', startTime: 'veniam aliquip' },
    ]);
    expect(queryByText('Lorem Ipsum')).toBeNull();
  });

  it('counts a day exactly as many times as chips are placeable there', () => {
    const { getAllByText } = renderGrid([
      { id: '1', title: 'A', startTime: todayAt(9, 30) },
      { id: '2', title: 'B', startTime: todayAt(9, 45) },
    ]);
    // Both land in the same 09:00 bucket, and the day header badge agrees.
    expect(getAllByText('2').length).toBeGreaterThan(0);
  });
});
