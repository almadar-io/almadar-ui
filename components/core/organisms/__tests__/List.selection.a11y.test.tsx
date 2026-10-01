import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { List } from '../List';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { axeViolations, describeViolations } from '../../../../test/axe';

const wrap = (ui: React.ReactElement) =>
  render(ui, { wrapper: ({ children }) => <EventBusProvider>{children}</EventBusProvider> });

const rows = [
  { id: '1', title: 'One' },
  { id: '2', title: 'Two' },
];

describe('List selection state', () => {
  it('marks selected rows aria-current=true and forwards aria-label', async () => {
    const { container } = wrap(<List entity={rows} fields={['title']} selectable selectedIds={['2']} aria-label="Items" />);
    expect(container.querySelector('[aria-current="true"]')).not.toBeNull();
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(1);
    expect(container.querySelector('[aria-label="Items"]')).not.toBeNull();
    expect(describeViolations(await axeViolations(container))).toEqual([]);
  });

  it('marks nothing with empty selection', () => {
    const { container } = wrap(<List entity={rows} fields={['title']} selectable />);
    expect(container.querySelectorAll('[aria-current]')).toHaveLength(0);
  });
});
