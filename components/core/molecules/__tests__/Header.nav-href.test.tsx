/**
 * G-UI-016: a navigation item that carries only an `href` must follow it —
 * an in-app path through the nav stack, an in-page `#anchor` by scrolling to
 * it — instead of rendering an inert button.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../Header';
import { NavStackProvider } from '../../../../providers/NavStackContext';

function mount(items: React.ComponentProps<typeof Header>['navigationItems'], navigate = vi.fn()) {
  render(
    <MemoryRouter>
      <NavStackProvider pages={[]} currentPath="/" navigate={navigate}>
        <Header variant="desktop" brandName="Shop" navigationItems={items} />
      </NavStackProvider>
    </MemoryRouter>,
  );
  return navigate;
}

describe('Header navigation items with an href', () => {
  it('an in-app path navigates through the nav stack', () => {
    const navigate = mount([{ label: 'Pricing', href: '/pricing' }]);
    fireEvent.click(screen.getByRole('button', { name: /pricing/i }));
    expect(navigate).toHaveBeenCalledWith('/pricing');
  });

  it('an in-page #anchor scrolls to its target', () => {
    const target = document.createElement('section');
    target.id = 'product';
    const scroll = vi.fn();
    target.scrollIntoView = scroll;
    document.body.appendChild(target);
    const navigate = mount([{ label: 'Product', href: '#product' }]);
    fireEvent.click(screen.getByRole('button', { name: /product/i }));
    expect(scroll).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
    target.remove();
  });

  it('control: an item with its own onClick keeps it and does not navigate', () => {
    const onClick = vi.fn();
    const navigate = mount([{ label: 'Docs', href: '/docs', onClick }]);
    fireEvent.click(screen.getByRole('button', { name: /docs/i }));
    expect(onClick).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
