import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from '../StarRating';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

const wrap = (ui: React.ReactElement) => render(<EventBusProvider debug={false}>{ui}</EventBusProvider>);

describe('StarRating accessibility', () => {
  it('is a slider named through the locale table', () => {
    wrap(<StarRating value={3} max={5} />);
    expect(screen.getByRole('slider', { name: 'Rating: 3 out of 5' })).toBeTruthy();
  });

  it('Home and End jump to the ends', () => {
    const onChange = vi.fn();
    wrap(<StarRating value={3} max={5} onChange={onChange} />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(5);
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('control: an explicit label wins', () => {
    wrap(<StarRating value={2} label="Service" />);
    expect(screen.getByRole('slider', { name: 'Service' })).toBeTruthy();
  });
});
