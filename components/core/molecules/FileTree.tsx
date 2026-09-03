'use client';

/**
 * FileTree Molecule
 *
 * A filesystem tree navigator with folder expand/collapse, file-type icons,
 * and click-to-select. Used by the Workspace tab to browse the agent's
 * workspace directory.
 *
 * Follows atomic design: composes Box, Icon, Typography atoms.
 */

import React, { useCallback, useRef, useState } from 'react';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { useDraggable, type DraggablePayload } from '../../../hooks/useDraggable';
import { useDropZone } from '../../../hooks/useDropZone';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FileTreeNode {
  /** File or directory name */
  name: string;
  /** Relative path from workspace root */
  path: string;
  /** 'file' or 'dir' */
  type: 'file' | 'dir';
  /** Children (only for directories) */
  children?: FileTreeNode[];
  /** File size in bytes (optional, for display) */
  size?: number;
  /** Detected language for syntax highlighting */
  language?: string;
}

/** Flat tree row for `items` mode — nested at render time by `parentId`. */
export interface FileTreeItem {
  /** Unique node id */
  id: string;
  /** Display label */
  label: string;
  /** Id of this node's parent; empty/absent marks a root */
  parentId?: string;
  /** Icon name override (falls back to folder/file by presence of children) */
  icon?: string;
}

export interface FileTreeProps {
  /** The tree data (pre-nested). Ignored when `items` is provided. */
  tree?: FileTreeNode[];
  /** Flat node list, nested by `parentId` at render time — takes precedence
   *  over `tree` when provided. A `parentId` with no matching row renders
   *  that node as a root rather than dropping it. */
  items?: FileTreeItem[];
  /** Currently selected file path */
  selectedPath?: string;
  /** Currently selected node id, in flat `items` mode: the row highlights
   *  and every ancestor auto-expands so the selection is always visible —
   *  the "you are here" a navigation tree needs. */
  selectedId?: string;
  /** Visual treatment for flat `items` mode: `files` (default) keeps the
   *  monospace file-browser look; `nav` renders a sidebar navigation tree —
   *  regular font, document icons, roomier hit areas. */
  look?: 'files' | 'nav';
  /** Called when a file is clicked */
  onFileSelect?: (path: string) => void;
  /** Called when a node is clicked, in flat `items` mode; carries the
   *  selected node's id. Presence-gated: binding this prop is what turns on
   *  the click-to-select affordance, mirroring Badge's `onRemove`.
   *  @offByDefault */
  onNodeSelect?: (id: string) => void;
  /** Called from the row's hover action button, in flat `items` mode;
   *  carries that node's id. Presence-gated: binding it renders the action.
   *  @offByDefault */
  onNodeAction?: (id: string) => void;
  /** Icon for the row hover action (default: plus). */
  nodeActionIcon?: string;
  /** Accessible label/tooltip for the row hover action. */
  nodeActionLabel?: string;
  /** Called when a row is dropped onto another, in flat `items` mode; carries
   *  the moved node's id, its new parent id (`null` for a root drop), and its
   *  index within the new parent's children. Presence-gated: binding this
   *  prop is what turns on row dragging.
   *  @offByDefault */
  onNodeReorder?: (id: string, newParentId: string | null, index: number) => void;
  /** CSS class */
  className?: string;
  /** Indent size per level in px (default: 16) */
  indent?: number;
}

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'ts': case 'tsx': return 'file-code';
    case 'js': case 'jsx': return 'file-code';
    case 'json': case 'orb': return 'file-json';
    case 'css': case 'scss': return 'file-text';
    case 'md': return 'file-text';
    case 'py': return 'file-code';
    case 'html': return 'file-code';
    default: return 'file';
  }
}

// ---------------------------------------------------------------------------
// TreeNode (recursive)
// ---------------------------------------------------------------------------

interface TreeNodeItemProps {
  node: FileTreeNode;
  depth: number;
  indent: number;
  selectedPath?: string;
  onFileSelect?: (path: string) => void;
  defaultExpanded?: boolean;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  depth,
  indent,
  selectedPath,
  onFileSelect,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded || depth < 1);
  const isDir = node.type === 'dir';
  const isSelected = node.path === selectedPath;

  const handleClick = useCallback(() => {
    if (isDir) {
      setExpanded(prev => !prev);
    } else {
      onFileSelect?.(node.path);
    }
  }, [isDir, node.path, onFileSelect]);

  return (
    <>
      <Box
        className={`flex items-center gap-1.5 py-0.5 px-2 cursor-pointer rounded-sm transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        }`}
        style={{ paddingLeft: depth * indent + 8 }}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={isDir ? expanded : undefined}
      >
        {isDir ? (
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size="xs"
            className="text-[var(--color-muted-foreground)] flex-shrink-0"
          />
        ) : (
          <Box style={{ width: 12, flexShrink: 0 }} />
        )}
        <Icon
          name={isDir ? (expanded ? 'folder-open' : 'folder') : fileIcon(node.name)}
          size="xs"
          className={isSelected
            ? 'text-inherit'
            : isDir ? 'text-[var(--color-warning)]' : 'text-[var(--color-muted-foreground)]'}
        />
        <Typography
          variant="caption"
          className={`truncate font-mono text-xs !text-inherit ${isSelected ? 'font-semibold' : ''}`}
        >
          {node.name}
        </Typography>
        {!isDir && node.size !== undefined && (
          <Typography
            variant="caption"
            className={`text-[9px] ml-auto flex-shrink-0 ${isSelected ? '!text-inherit opacity-80' : 'text-[var(--color-muted-foreground)]'}`}
          >
            {node.size < 1024 ? `${node.size}B` : `${Math.round(node.size / 1024)}KB`}
          </Typography>
        )}
      </Box>
      {isDir && expanded && node.children && (
        <Box role="group">
          {node.children.map(child => (
            <TreeNodeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              indent={indent}
              selectedPath={selectedPath}
              onFileSelect={onFileSelect}
              defaultExpanded={depth < 0}
            />
          ))}
        </Box>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// FlatTreeNodeItem (recursive) — `items` mode
// ---------------------------------------------------------------------------

interface FlatTreeNodeItemProps {
  item: FileTreeItem;
  depth: number;
  indent: number;
  childrenByParent: Map<string, FileTreeItem[]>;
  /** Root-level items, in render order — a target row's own sibling list
   *  when it has no valid parent. Used to resolve drop index/parent. */
  roots: FileTreeItem[];
  onNodeSelect?: (id: string) => void;
  onNodeAction?: (id: string) => void;
  nodeActionIcon?: string;
  nodeActionLabel?: string;
  onNodeReorder?: (id: string, newParentId: string | null, index: number) => void;
  selectedId?: string;
  look: 'files' | 'nav';
  isExpanded: (id: string, depth: number) => boolean;
  onToggle: (id: string, effective: boolean) => void;
}

/** The list `target` renders alongside — `roots` when it has no valid parent row. */
function siblingsOf(
  target: FileTreeItem,
  roots: FileTreeItem[],
  childrenByParent: Map<string, FileTreeItem[]>,
): FileTreeItem[] {
  if (target.parentId) {
    const parentSiblings = childrenByParent.get(target.parentId);
    if (parentSiblings?.some(sibling => sibling.id === target.id)) return parentSiblings;
  }
  return roots;
}

const FlatTreeNodeItem: React.FC<FlatTreeNodeItemProps> = ({
  item,
  depth,
  indent,
  childrenByParent,
  roots,
  onNodeSelect,
  onNodeAction,
  nodeActionIcon,
  nodeActionLabel,
  onNodeReorder,
  selectedId,
  look,
  isExpanded,
  onToggle,
}) => {
  const children = childrenByParent.get(item.id);
  const hasChildren = !!children && children.length > 0;
  const expanded = hasChildren && isExpanded(item.id, depth);
  const isSelected = selectedId !== undefined && selectedId !== '' && item.id === selectedId;
  const nav = look === 'nav';
  const rowRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (hasChildren && !onNodeSelect) onToggle(item.id, expanded);
    onNodeSelect?.(item.id);
  }, [hasChildren, expanded, item.id, onNodeSelect, onToggle]);

  const handleChevron = useCallback((e: React.MouseEvent) => {
    // The chevron only folds; navigation stays on the row itself.
    e.stopPropagation();
    onToggle(item.id, expanded);
  }, [item.id, expanded, onToggle]);

  const handleAction = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeAction?.(item.id);
  }, [item.id, onNodeAction]);

  const { dragProps } = useDraggable({
    payload: { kind: 'tree-node', data: { id: item.id } },
    disabled: !onNodeReorder,
  });

  const handleRowDrop = useCallback(
    (payload: DraggablePayload, position: { x: number; y: number }) => {
      if (!onNodeReorder) return;
      const draggedId = typeof payload.data.id === 'string' ? payload.data.id : undefined;
      if (!draggedId || draggedId === item.id) return;

      const rect = rowRef.current?.getBoundingClientRect();
      if (!rect || rect.height === 0) return;

      // Top third: drop before. Bottom third: drop after. Middle third: drop into.
      const relY = position.y - rect.top;
      const third = rect.height / 3;

      if (relY >= third && relY <= third * 2) {
        const existingChildren = childrenByParent.get(item.id);
        onNodeReorder(draggedId, item.id, existingChildren ? existingChildren.length : 0);
        return;
      }

      const siblings = siblingsOf(item, roots, childrenByParent);
      const newParentId = siblings === roots ? null : (item.parentId ?? null);
      const targetIndex = siblings.findIndex(sibling => sibling.id === item.id);
      const index = relY < third
        ? (targetIndex < 0 ? 0 : targetIndex)
        : (targetIndex < 0 ? siblings.length : targetIndex + 1);
      onNodeReorder(draggedId, newParentId, index);
    },
    [onNodeReorder, item, roots, childrenByParent],
  );

  const { dropProps } = useDropZone({
    accepts: ['tree-node'],
    onDrop: handleRowDrop,
    disabled: !onNodeReorder,
  });

  return (
    <>
      <Box
        ref={rowRef}
        className={`group/treerow flex items-center gap-1.5 px-2 cursor-pointer rounded-sm transition-colors ${
          nav ? 'py-1' : 'py-0.5'
        } ${isSelected ? 'bg-primary text-primary-foreground' : nav ? 'text-foreground hover:bg-muted' : 'hover:bg-muted'}`}
        style={{ paddingLeft: depth * indent + 8 }}
        onClick={handleClick}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? expanded : undefined}
        {...dragProps}
        {...dropProps}
      >
        {hasChildren ? (
          <Box onClick={handleChevron} className="flex items-center flex-shrink-0" role="button" aria-label={expanded ? 'Collapse' : 'Expand'}>
            <Icon
              name={expanded ? 'chevron-down' : 'chevron-right'}
              size="xs"
              className={isSelected ? 'text-inherit' : 'text-[var(--color-muted-foreground)]'}
            />
          </Box>
        ) : (
          <Box style={{ width: 12, flexShrink: 0 }} />
        )}
        <Icon
          name={item.icon || (nav ? 'file-text' : hasChildren ? (expanded ? 'folder-open' : 'folder') : 'file')}
          size="xs"
          className={isSelected
            ? 'text-inherit'
            : nav || !hasChildren ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-warning)]'}
        />
        <Typography
          variant="caption"
          className={`truncate ${nav ? 'text-sm' : 'font-mono text-xs'} !text-inherit ${isSelected ? 'font-semibold' : ''}`}
        >
          {item.label}
        </Typography>
        {onNodeAction && (
          <Box
            onClick={handleAction}
            role="button"
            aria-label={nodeActionLabel ?? 'Node action'}
            title={nodeActionLabel}
            className={`ml-auto flex-shrink-0 rounded-sm p-0.5 opacity-0 group-hover/treerow:opacity-100 transition-opacity ${
              isSelected ? 'hover:bg-primary-foreground/20' : 'hover:bg-border'
            }`}
          >
            <Icon name={nodeActionIcon ?? 'plus'} size="xs" className="text-inherit" />
          </Box>
        )}
      </Box>
      {hasChildren && expanded && (
        <Box role="group">
          {children!.map(child => (
            <FlatTreeNodeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              indent={indent}
              childrenByParent={childrenByParent}
              roots={roots}
              onNodeSelect={onNodeSelect}
              onNodeAction={onNodeAction}
              nodeActionIcon={nodeActionIcon}
              nodeActionLabel={nodeActionLabel}
              onNodeReorder={onNodeReorder}
              selectedId={selectedId}
              look={look}
              isExpanded={isExpanded}
              onToggle={onToggle}
            />
          ))}
        </Box>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------
// FileTree
// ---------------------------------------------------------------------------

/** Ancestor chain of `id` following parentId links (cycle-safe). */
function ancestorsOf(id: string | undefined, byId: Map<string, FileTreeItem>): Set<string> {
  const out = new Set<string>();
  if (!id) return out;
  let cur = byId.get(id)?.parentId;
  while (cur && byId.has(cur) && !out.has(cur)) {
    out.add(cur);
    cur = byId.get(cur)?.parentId;
  }
  return out;
}

const FlatFileTree: React.FC<Omit<FileTreeProps, 'tree' | 'selectedPath' | 'onFileSelect'> & { items: FileTreeItem[] }> = ({
  items,
  selectedId,
  look = 'files',
  onNodeSelect,
  onNodeAction,
  nodeActionIcon,
  nodeActionLabel,
  onNodeReorder,
  className,
  indent = 16,
}) => {
  // Fold state: explicit per-node overrides on top of the derived default
  // (roots open, deeper closed, the selection's ancestors open). A changed
  // selection clears overrides on its new ancestors so "where am I" always
  // wins over a stale manual collapse.
  const [overrides, setOverrides] = useState<Map<string, boolean>>(() => new Map());
  const byId = React.useMemo(() => new Map(items.map(node => [node.id, node])), [items]);
  const selectedAncestors = React.useMemo(() => ancestorsOf(selectedId, byId), [selectedId, byId]);
  const lastSelectedRef = React.useRef(selectedId);
  React.useEffect(() => {
    if (selectedId === lastSelectedRef.current) return;
    lastSelectedRef.current = selectedId;
    setOverrides(prev => {
      if (![...selectedAncestors].some(a => prev.get(a) === false)) return prev;
      const next = new Map(prev);
      for (const a of selectedAncestors) if (next.get(a) === false) next.delete(a);
      return next;
    });
  }, [selectedId, selectedAncestors]);

  const isExpanded = useCallback(
    (id: string, depth: number) => overrides.get(id) ?? (depth < 1 || selectedAncestors.has(id)),
    [overrides, selectedAncestors],
  );
  const onToggle = useCallback((id: string, effective: boolean) => {
    setOverrides(prev => {
      const next = new Map(prev);
      next.set(id, !effective);
      return next;
    });
  }, []);

  if (items.length === 0) return null;

  // Flat -> nested: group by parentId; a parentId with no matching row
  // (orphan) renders that node as a root instead of vanishing.
  const ids = new Set(items.map(node => node.id));
  const childrenByParent = new Map<string, FileTreeItem[]>();
  const roots: FileTreeItem[] = [];
  for (const item of items) {
    if (item.parentId && ids.has(item.parentId)) {
      const siblings = childrenByParent.get(item.parentId);
      if (siblings) siblings.push(item);
      else childrenByParent.set(item.parentId, [item]);
    } else {
      roots.push(item);
    }
  }

  return (
    <Box className={`py-1 overflow-y-auto ${className ?? ''}`} role="tree">
      {roots.map(item => (
        <FlatTreeNodeItem
          key={item.id}
          item={item}
          depth={0}
          indent={indent}
          childrenByParent={childrenByParent}
          roots={roots}
          onNodeSelect={onNodeSelect}
          onNodeAction={onNodeAction}
          nodeActionIcon={nodeActionIcon}
          nodeActionLabel={nodeActionLabel}
          onNodeReorder={onNodeReorder}
          selectedId={selectedId}
          look={look}
          isExpanded={isExpanded}
          onToggle={onToggle}
        />
      ))}
    </Box>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({
  tree,
  items,
  selectedPath,
  selectedId,
  look = 'files',
  onFileSelect,
  onNodeSelect,
  onNodeAction,
  nodeActionIcon,
  nodeActionLabel,
  onNodeReorder,
  className,
  indent = 16,
}) => {
  if (items) {
    return (
      <FlatFileTree
        items={items}
        selectedId={selectedId}
        look={look}
        onNodeSelect={onNodeSelect}
        onNodeAction={onNodeAction}
        nodeActionIcon={nodeActionIcon}
        nodeActionLabel={nodeActionLabel}
        onNodeReorder={onNodeReorder}
        className={className}
        indent={indent}
      />
    );
  }

  // An optional tree region renders nothing when empty rather than an empty-state
  // block: consumers that don't supply a tree (std-wiki) otherwise get a dead
  // ~100px "No files" panel under a heading that reports a non-zero count.
  if (!tree || tree.length === 0) return null;

  return (
    <Box className={`py-1 overflow-y-auto ${className ?? ''}`} role="tree">
      {tree.map(node => (
        <TreeNodeItem
          key={node.path}
          node={node}
          depth={0}
          indent={indent}
          selectedPath={selectedPath}
          onFileSelect={onFileSelect}
          defaultExpanded
        />
      ))}
    </Box>
  );
};

FileTree.displayName = 'FileTree';
