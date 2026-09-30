import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardGrid } from '../CardGrid';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { useEventBus } from '../../../../hooks/useEventBus';

const wrap = (ui: React.ReactElement) => render(<EventBusProvider debug={false}>{ui}</EventBusProvider>);

const rows = [{ id: '1', name: 'Laptop', status: 'failed', createdAt: '2024-03-05', note: 'plain' }];

describe('CardGrid declared fields', () => {
  it('renders the declared h4 field as the title', () => {
    wrap(<CardGrid entity={rows} fields={[{ name: 'name', variant: 'h4' }, 'note']} />);
    expect(screen.getByRole('heading', { name: 'Laptop' })).toBeInTheDocument();
  });

  it('does not treat the first field as a title when none is declared', () => {
    wrap(<CardGrid entity={rows} fields={['name', 'note']} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('Laptop')).toBeInTheDocument();
  });

  it('colours a declared badge from its colorMap', () => {
    wrap(<CardGrid entity={rows} fields={[{ name: 'status', variant: 'badge', colorMap: { failed: 'danger' } }]} />);
    expect(screen.getByText('failed').className).toMatch(/error|danger/);
  });

  it('keeps a declared badge neutral for an unmapped value', () => {
    wrap(<CardGrid entity={rows} fields={[{ name: 'status', variant: 'badge' }]} />);
    expect(screen.getByText('failed').className).not.toMatch(/error|danger/);
  });

  it('renders an undeclared status field as a plain labelled row, not a badge', () => {
    wrap(<CardGrid entity={rows} fields={['status']} />);
    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('failed').className).not.toMatch(/badge|rounded-full/);
  });

  it('formats a declared date and leaves an undeclared date-named field raw', () => {
    wrap(<CardGrid entity={rows} fields={[{ name: 'createdAt', format: 'date' }]} />);
    expect(screen.queryByText('2024-03-05')).toBeNull();
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('shows an undeclared date-named field as-is', () => {
    wrap(<CardGrid entity={rows} fields={['createdAt']} />);
    expect(screen.getByText('2024-03-05')).toBeInTheDocument();
  });

  it('emits itemClickEvent only when declared', () => {
    const seen = vi.fn();
    const Probe: React.FC = () => {
      const bus = useEventBus();
      React.useEffect(() => bus.on('UI:VIEW', seen), [bus]);
      return null;
    };
    const { unmount } = wrap(<><Probe /><CardGrid entity={rows} fields={['name']} itemClickEvent="VIEW" /></>);
    fireEvent.click(screen.getByText('Laptop'));
    expect(seen).toHaveBeenCalledTimes(1);
    unmount();
    seen.mockClear();
    wrap(<><Probe /><CardGrid entity={rows} fields={['name']} /></>);
    fireEvent.click(screen.getByText('Laptop'));
    expect(seen).not.toHaveBeenCalled();
  });
});
