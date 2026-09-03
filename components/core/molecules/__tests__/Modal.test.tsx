/**
 * Modal Component Tests
 *
 * Regression coverage for MODAL-DIALOG-ARIA-HIDDEN: the portal root must
 * never carry `aria-hidden="true"` while it contains the open Dialog, or
 * the whole modal (title, content, close button) drops out of the
 * accessibility tree even though its raw HTML looks correct.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from '../Modal';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EventBusProvider debug={false}>{children}</EventBusProvider>
);

describe('Modal', () => {
  it('exposes the open dialog on the accessibility tree (no aria-hidden ancestor)', () => {
    render(
      <TestWrapper>
        <Modal isOpen title="Settings">
          <p>Body content</p>
        </Modal>
      </TestWrapper>
    );

    // getByRole without `{ hidden: true }` walks the accessibility tree the
    // way real assistive tech does — it fails whenever an aria-hidden
    // ancestor blankets the dialog, which is exactly the regression.
    const dialog = screen.getByRole('dialog', { name: 'Settings' });
    expect(dialog).toBeInTheDocument();
  });

  it('keeps the close button reachable by role on an open modal', () => {
    render(
      <TestWrapper>
        <Modal isOpen title="Settings" showCloseButton>
          <p>Body content</p>
        </Modal>
      </TestWrapper>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('fires onClose when the close button is activated', () => {
    const onClose = vi.fn();
    render(
      <TestWrapper>
        <Modal isOpen title="Settings" onClose={onClose}>
          <p>Body content</p>
        </Modal>
      </TestWrapper>
    );

    screen.getByRole('button').click();
    expect(onClose).toHaveBeenCalled();
  });

  it('has no aria-hidden ancestor on the portal root while open', () => {
    render(
      <TestWrapper>
        <Modal isOpen title="Settings">
          <p>Body content</p>
        </Modal>
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog.closest('[aria-hidden="true"]')).toBeNull();
  });
});
