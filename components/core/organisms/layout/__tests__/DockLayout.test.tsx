/**
 * DockLayout Component Tests
 *
 * Covers region presence/absence, collapse props hiding regions, and that
 * the two resizable boundaries wire controlled ratio through to SplitPane.
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DockLayout } from '../DockLayout';

vi.mock('../SplitPane', () => ({
  SplitPane: (props: {
    direction?: string;
    ratio?: number;
    onRatioChange?: (ratio: number) => void;
    left: React.ReactNode;
    right: React.ReactNode;
    className?: string;
  }) => (
    <div
      data-testid={`split-pane-${props.direction}`}
      data-ratio={props.ratio}
      data-has-on-ratio-change={String(typeof props.onRatioChange === 'function')}
    >
      <div data-testid={`split-pane-${props.direction}-left`}>{props.left}</div>
      <div data-testid={`split-pane-${props.direction}-right`}>{props.right}</div>
    </div>
  ),
}));

describe('DockLayout', () => {
  it('renders only the required main region when no optional regions are provided', () => {
    render(<DockLayout main={<div data-testid="main">Main</div>} />);

    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.queryByTestId('split-pane-horizontal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('split-pane-vertical')).not.toBeInTheDocument();
  });

  it('renders only the regions that are provided (no empty gutters)', () => {
    render(
      <DockLayout
        rail={<div data-testid="rail">Rail</div>}
        main={<div data-testid="main">Main</div>}
        statusBar={<div data-testid="status-bar">Status</div>}
      />
    );

    expect(screen.getByTestId('rail')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bottom-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('secondary-sidebar')).not.toBeInTheDocument();
  });

  it('renders sidebar, bottomPanel, and secondarySidebar when all regions are provided', () => {
    render(
      <DockLayout
        rail={<div data-testid="rail">Rail</div>}
        sidebar={<div data-testid="sidebar">Sidebar</div>}
        main={<div data-testid="main">Main</div>}
        bottomPanel={<div data-testid="bottom-panel">Bottom</div>}
        statusBar={<div data-testid="status-bar">Status</div>}
        secondarySidebar={<div data-testid="secondary-sidebar">Secondary</div>}
      />
    );

    expect(screen.getByTestId('rail')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-panel')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('secondary-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('split-pane-horizontal')).toBeInTheDocument();
    expect(screen.getByTestId('split-pane-vertical')).toBeInTheDocument();
  });

  it('hides the sidebar when sidebarCollapsed is true, even though sidebar content is provided', () => {
    render(
      <DockLayout
        sidebar={<div data-testid="sidebar">Sidebar</div>}
        sidebarCollapsed
        main={<div data-testid="main">Main</div>}
      />
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('split-pane-horizontal')).not.toBeInTheDocument();
  });

  it('hides the bottom panel when bottomPanelCollapsed is true', () => {
    render(
      <DockLayout
        main={<div data-testid="main">Main</div>}
        bottomPanel={<div data-testid="bottom-panel">Bottom</div>}
        bottomPanelCollapsed
      />
    );

    expect(screen.queryByTestId('bottom-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('split-pane-vertical')).not.toBeInTheDocument();
  });

  it('hides the secondary sidebar when secondarySidebarCollapsed is true', () => {
    render(
      <DockLayout
        main={<div data-testid="main">Main</div>}
        secondarySidebar={<div data-testid="secondary-sidebar">Secondary</div>}
        secondarySidebarCollapsed
      />
    );

    expect(screen.queryByTestId('secondary-sidebar')).not.toBeInTheDocument();
  });

  it('passes the controlled sidebarWidth ratio and onSidebarWidthChange through to SplitPane', () => {
    const onSidebarWidthChange = vi.fn();
    render(
      <DockLayout
        sidebar={<div>Sidebar</div>}
        main={<div>Main</div>}
        sidebarWidth={35}
        onSidebarWidthChange={onSidebarWidthChange}
      />
    );

    const splitPane = screen.getByTestId('split-pane-horizontal');
    expect(splitPane).toHaveAttribute('data-ratio', '35');
    expect(splitPane).toHaveAttribute('data-has-on-ratio-change', 'true');
  });

  it('converts bottomPanelHeight into the top-pane ratio passed to the vertical SplitPane', () => {
    render(
      <DockLayout
        main={<div>Main</div>}
        bottomPanel={<div>Bottom</div>}
        bottomPanelHeight={30}
        onBottomPanelHeightChange={vi.fn()}
      />
    );

    const splitPane = screen.getByTestId('split-pane-vertical');
    expect(splitPane).toHaveAttribute('data-ratio', '70');
    expect(splitPane).toHaveAttribute('data-has-on-ratio-change', 'true');
  });
});
