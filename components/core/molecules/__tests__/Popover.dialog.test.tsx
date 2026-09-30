import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Popover } from '../Popover';

describe('Popover dialog semantics', () => {
  it('announces its state on the trigger and links to the panel', () => {
    render(<Popover content="Details here"><button>More</button></Popover>);
    const trigger = screen.getByRole('button', { name: 'More' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    act(() => { fireEvent.click(trigger); });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const panel = screen.getByRole('dialog', { hidden: true });
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('closes on Escape', () => {
    render(<Popover content="Details here"><button>More</button></Popover>);
    const trigger = screen.getByRole('button', { name: 'More' });
    act(() => { fireEvent.click(trigger); });
    act(() => { fireEvent.keyDown(document, { key: 'Escape' }); });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('control: a string popover is named by its content', () => {
    render(<Popover content="Details here" open><button>More</button></Popover>);
    expect(screen.getByRole('dialog', { hidden: true }).getAttribute('aria-label')).toBe('Details here');
  });
});
