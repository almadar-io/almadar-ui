/**
 * MermaidDiagram Component Tests
 *
 * The mermaid library is mocked — jsdom can't run its real SVG layout.
 * Covers: successful render injection, parse-error fallback to CodeBlock,
 * recovery after a corrected source, and the MarkdownContent + SegmentRenderer
 * routing of ```mermaid fences / mermaid code segments.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MermaidDiagram } from '../markdown/MermaidDiagram';
import { MarkdownContent } from '../markdown/MarkdownContent';
import { SegmentRenderer } from '../../organisms/SegmentRenderer';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

const initialize = vi.fn();
const renderDiagram = vi.fn();

vi.mock('mermaid', () => ({
  default: {
    initialize: (...args: unknown[]) => initialize(...args),
    render: (...args: unknown[]) => renderDiagram(...args) as Promise<{ svg: string }>,
  },
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <EventBusProvider debug={false}>{children}</EventBusProvider>
);

const GRAPH = 'graph TD\n  A --> B';

describe('MermaidDiagram', () => {
  beforeEach(() => {
    initialize.mockReset();
    renderDiagram.mockReset();
    renderDiagram.mockResolvedValue({ svg: '<svg data-diagram="ok"><g>A→B</g></svg>' });
  });

  it('renders the SVG returned by mermaid.render', async () => {
    render(<MermaidDiagram code={GRAPH} />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByTestId('mermaid-diagram').innerHTML).toContain('data-diagram="ok"');
    });
    expect(renderDiagram).toHaveBeenCalledWith(expect.stringMatching(/^mermaid-/), GRAPH);
    expect(initialize).toHaveBeenCalledWith(
      expect.objectContaining({ startOnLoad: false, securityLevel: 'strict' }),
    );
  });

  it('falls back to the source code block with the error on a parse failure', async () => {
    renderDiagram.mockRejectedValueOnce(new Error('Parse error on line 2'));
    render(<MermaidDiagram code="graph TD\n  A -->" />, { wrapper: Wrapper });
    await waitFor(() => {
      expect(screen.getByText('Parse error on line 2')).toBeInTheDocument();
    });
    expect(screen.getByTestId('mermaid-diagram')).not.toBeVisible();
  });

  it('recovers from an error when the source is corrected', async () => {
    renderDiagram.mockRejectedValueOnce(new Error('Parse error'));
    const { rerender } = render(<MermaidDiagram code="graph TD\n  A -->" />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText('Parse error')).toBeInTheDocument());
    rerender(<MermaidDiagram code={GRAPH} />);
    await waitFor(() => {
      expect(screen.getByTestId('mermaid-diagram').innerHTML).toContain('data-diagram="ok"');
    });
    expect(screen.queryByText('Parse error')).not.toBeInTheDocument();
  });

  it('is routed from a ```mermaid fence in MarkdownContent', async () => {
    render(
      <MarkdownContent content={'Before\n\n```mermaid\ngraph TD\n  A --> B\n```\n\nAfter'} />,
      { wrapper: Wrapper },
    );
    await waitFor(() => {
      expect(screen.getByTestId('mermaid-diagram').innerHTML).toContain('data-diagram="ok"');
    });
    expect(screen.getByText('Before')).toBeInTheDocument();
    expect(screen.getByText('After')).toBeInTheDocument();
  });

  it('is routed from a mermaid code segment in SegmentRenderer', async () => {
    render(
      <SegmentRenderer segments={[{ type: 'code', language: 'mermaid', content: GRAPH }]} />,
      { wrapper: Wrapper },
    );
    await waitFor(() => {
      expect(screen.getByTestId('mermaid-diagram').innerHTML).toContain('data-diagram="ok"');
    });
  });
});
