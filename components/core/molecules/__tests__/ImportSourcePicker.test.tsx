/**
 * ImportSourcePicker Component Tests
 *
 * Tests for source option rendering and selection callbacks.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportSourcePicker, type ImportSourceOption } from '../import/ImportSourcePicker';
import { EventBusProvider } from '../../../../providers/EventBusProvider';
import { MemoryRouter } from 'react-router-dom';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    <EventBusProvider debug={false}>{children}</EventBusProvider>
  </MemoryRouter>
);

const sources: ImportSourceOption[] = [
  { id: 'paste', label: 'Paste text', description: 'Paste raw content', icon: 'clipboard' },
  { id: 'markdown', label: 'Markdown files', kind: 'file', accept: '.md', multiple: true },
];

describe('ImportSourcePicker', () => {
  it('renders source options with labels and descriptions', () => {
    render(
      <TestWrapper>
        <ImportSourcePicker sources={sources} title="Import from" />
      </TestWrapper>
    );

    expect(screen.getByText('Import from')).toBeTruthy();
    expect(screen.getByText('Paste text')).toBeTruthy();
    expect(screen.getByText('Paste raw content')).toBeTruthy();
    expect(screen.getByText('Markdown files')).toBeTruthy();
  });

  it('calls onSelect with the source id when an action option is clicked', () => {
    const onSelect = vi.fn();
    render(
      <TestWrapper>
        <ImportSourcePicker sources={sources} onSelect={onSelect} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Paste text'));
    expect(onSelect).toHaveBeenCalledWith('paste');
  });

  it('calls onFilesSelected when a file option resolves files', async () => {
    const onFilesSelected = vi.fn();
    render(
      <TestWrapper>
        <ImportSourcePicker sources={sources} onFilesSelected={onFilesSelected} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Markdown files'));
    const input = screen.getByTestId('import-source-file-input');
    const file = new File(['# Notes'], 'notes.md', { type: 'text/markdown' });
    await userEvent.upload(input, file);

    expect(onFilesSelected).toHaveBeenCalledTimes(1);
    expect(onFilesSelected.mock.calls[0][0]).toHaveLength(1);
    expect(onFilesSelected.mock.calls[0][0][0].name).toBe('notes.md');
  });

  it('renders the moreSources slot', () => {
    render(
      <TestWrapper>
        <ImportSourcePicker sources={sources} moreSources={<div>Notion (coming soon)</div>} />
      </TestWrapper>
    );

    expect(screen.getByText('Notion (coming soon)')).toBeTruthy();
  });
});
