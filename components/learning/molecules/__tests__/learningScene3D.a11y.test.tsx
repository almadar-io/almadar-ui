import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { axeViolations, describeViolations } from '../../../../test/axe';

vi.mock('@almadar/ui/components/molecules/game/three', () => ({ Canvas3DHost: () => null }));

import { LearningScene3D } from '../learningScene3D';

function mount(props: Partial<React.ComponentProps<typeof LearningScene3D>>) {
  return render(<EventBusProvider debug={false}><LearningScene3D drawables={[]} {...props} /></EventBusProvider>);
}

describe('LearningScene3D a11y', () => {
  it('is a named image with a linked, visually hidden text alternative', async () => {
    const { container } = mount({ title: 'Cell', description: 'A cell with a central nucleus.' });
    const img = screen.getByRole('img', { name: 'Cell' });
    const text = container.querySelector(`[id="${img.getAttribute('aria-describedby')}"]`);
    expect(text?.textContent).toBe('A cell with a central nucleus.');
    expect(text?.className).toContain('sr-only');
    expect(describeViolations(await axeViolations(container))).toEqual([]);
  });

  it('control: no title falls back to the default name; aria-label wins over title', () => {
    const { unmount } = mount({});
    expect(screen.getByRole('img', { name: '3D scene' }).hasAttribute('aria-describedby')).toBe(false);
    unmount();
    mount({ title: 'Cell', 'aria-label': 'Animal cell' });
    expect(screen.getByRole('img', { name: 'Animal cell' })).toBeTruthy();
  });
});
