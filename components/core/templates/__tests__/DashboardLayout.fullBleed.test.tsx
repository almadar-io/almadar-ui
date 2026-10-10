/**
 * Workspaces, canvases and maps fill the content area edge to edge: `fullBleed` drops the
 * main area's padding and the page's max width.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardLayout } from '../DashboardLayout';

function mainOf(fullBleed: boolean | undefined): HTMLElement {
  const { container } = render(
    <MemoryRouter>
      <DashboardLayout appName="Studio" layoutMode="topnav" fullBleed={fullBleed}>
        <span data-testid="page">content</span>
      </DashboardLayout>
    </MemoryRouter>,
  );
  const main = container.querySelector('main');
  if (!main) throw new Error('no main');
  return main;
}

describe('DashboardLayout fullBleed', () => {
  it('drops the main padding and the max width', () => {
    const main = mainOf(true);
    expect(main.className).not.toMatch(/\bp-3\b/);
    expect(main.querySelector('.max-w-\\[1440px\\]')).toBeNull();
  });

  it('control: by default the content is padded and width-capped', () => {
    const main = mainOf(undefined);
    expect(main.className).toMatch(/\bp-3\b/);
    expect(main.querySelector('.max-w-\\[1440px\\]')).not.toBeNull();
  });
});
