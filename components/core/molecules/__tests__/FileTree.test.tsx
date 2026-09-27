/**
 * FileTree Component Tests — `items` mode reorder seam.
 *
 * jsdom has neither DragEvent nor DataTransfer, so both are polyfilled below:
 * DragEventPolyfill extends MouseEvent (for clientX/clientY support), and a
 * minimal DataTransferPolyfill instance is shared across the dragStart/drop
 * pair to carry the ALMADAR_DND_MIME payload the way a real drag operation
 * would. Row rects are mocked per test (thirds math needs real geometry).
 */
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileTree, type FileTreeItem } from '../FileTree';

class DataTransferPolyfill {
  private store = new Map<string, string>();
  dropEffect = 'none';
  effectAllowed = 'uninitialized';
  setData(format: string, value: string) {
    this.store.set(format, value);
  }
  getData(format: string) {
    return this.store.get(format) ?? '';
  }
  get types() {
    return Array.from(this.store.keys());
  }
}

class DragEventPolyfill extends MouseEvent {}

beforeAll(() => {
  if (typeof window.DragEvent === 'undefined') {
    Object.defineProperty(window, 'DragEvent', {
      configurable: true,
      writable: true,
      value: DragEventPolyfill,
    });
  }
});

const items: FileTreeItem[] = [
  { id: 'root1', label: 'Root 1' },
  { id: 'root2', label: 'Root 2' },
  { id: 'child1', label: 'Child 1', parentId: 'root1' },
  { id: 'child2', label: 'Child 2', parentId: 'root1' },
];

/** Mocks the given row's rect: top=0, height=30 (thirds at 10 and 20). */
function mockRowRect(row: HTMLElement) {
  row.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    right: 200,
    bottom: 30,
    width: 200,
    height: 30,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

function getRow(label: string): HTMLElement {
  return screen.getByText(label).closest('[role="treeitem"]') as HTMLElement;
}

function drag(sourceLabel: string, targetLabel: string, clientY: number) {
  const dataTransfer = new DataTransferPolyfill();
  const source = getRow(sourceLabel);
  const target = getRow(targetLabel);
  mockRowRect(target);

  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer, clientX: 0, clientY });
}

describe('FileTree reorder (items mode)', () => {
  it('drops in the top third: reorders before the target, within the same parent', () => {
    const onNodeReorder = vi.fn();
    render(<FileTree items={items} onNodeReorder={onNodeReorder} />);

    drag('Child 2', 'Child 1', 5);

    expect(onNodeReorder).toHaveBeenCalledWith('child2', 'root1', 0);
  });

  it('drops in the bottom third: reorders after the target, within the same parent', () => {
    const onNodeReorder = vi.fn();
    render(<FileTree items={items} onNodeReorder={onNodeReorder} />);

    drag('Child 1', 'Child 2', 25);

    expect(onNodeReorder).toHaveBeenCalledWith('child1', 'root1', 2);
  });

  it('drops in the middle third: moves into the target as its last child', () => {
    const onNodeReorder = vi.fn();
    render(<FileTree items={items} onNodeReorder={onNodeReorder} />);

    drag('Root 2', 'Root 1', 15);

    expect(onNodeReorder).toHaveBeenCalledWith('root2', 'root1', 2);
  });

  it('drops at the root level: newParentId is null', () => {
    const onNodeReorder = vi.fn();
    render(<FileTree items={items} onNodeReorder={onNodeReorder} />);

    drag('Child 1', 'Root 2', 5);

    expect(onNodeReorder).toHaveBeenCalledWith('child1', null, 1);
  });

  it('is presence-gated: rows are not draggable when onNodeReorder is absent', () => {
    render(<FileTree items={items} />);
    const row = getRow('Root 1');
    expect(row.getAttribute('draggable')).toBe('false');
  });

  it('rows are draggable when onNodeReorder is provided', () => {
    render(<FileTree items={items} onNodeReorder={vi.fn()} />);
    const row = getRow('Root 1');
    expect(row.getAttribute('draggable')).toBe('true');
  });
});

describe('FileTree — a file nests the files derived from it (a `.lolo` source over its `.orb`)', () => {
  const tree = [{
    name: 'orbitals', path: 'orbitals', type: 'dir' as const,
    children: [
      { name: 'Note.lolo', path: 'orbitals/Note.lolo', type: 'file' as const, note: 'generated', children: [{ name: 'Note.orb', path: 'orbitals/Note.orb', type: 'file' as const }] },
      { name: 'Plain.orb', path: 'orbitals/Plain.orb', type: 'file' as const },
    ],
  }];

  it('clicking the source opens it; its toggle shows the derived file, which opens too', () => {
    const onFileSelect = vi.fn();
    render(<FileTree tree={tree} onFileSelect={onFileSelect} />);
    fireEvent.click(screen.getByText('Note.lolo'));
    expect(onFileSelect).toHaveBeenLastCalledWith('orbitals/Note.lolo');
    expect(screen.queryByText('Note.orb')).toBeNull();
    fireEvent.click(screen.getByTestId('file-tree-toggle-orbitals/Note.lolo'));
    fireEvent.click(screen.getByText('Note.orb'));
    expect(onFileSelect).toHaveBeenLastCalledWith('orbitals/Note.orb');
    expect(screen.getByText('generated')).toBeTruthy();
  });

  it('control: a file with no derived files has no toggle; a directory still toggles on click', () => {
    const onFileSelect = vi.fn();
    render(<FileTree tree={tree} onFileSelect={onFileSelect} />);
    expect(screen.queryByTestId('file-tree-toggle-orbitals/Plain.orb')).toBeNull();
    fireEvent.click(screen.getByText('orbitals'));
    expect(screen.queryByText('Plain.orb')).toBeNull();
    expect(onFileSelect).not.toHaveBeenCalled();
  });

  it("edge: the derived file's toggle doesn't open the source", () => {
    const onFileSelect = vi.fn();
    render(<FileTree tree={tree} onFileSelect={onFileSelect} />);
    fireEvent.click(screen.getByTestId('file-tree-toggle-orbitals/Note.lolo'));
    fireEvent.click(screen.getByTestId('file-tree-toggle-orbitals/Note.lolo'));
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(screen.queryByText('Note.orb')).toBeNull();
  });
});
