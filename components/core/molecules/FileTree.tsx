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

import React, { useState, useCallback } from 'react';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

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
  /** Called when a file is clicked */
  onFileSelect?: (path: string) => void;
  /** Called when a node is clicked, in flat `items` mode; carries the
   *  selected node's id. Presence-gated: binding this prop is what turns on
   *  the click-to-select affordance, mirroring Badge's `onRemove`.
   *  @offByDefault */
  onNodeSelect?: (id: string) => void;
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
  onNodeSelect?: (id: string) => void;
  defaultExpanded?: boolean;
}

const FlatTreeNodeItem: React.FC<FlatTreeNodeItemProps> = ({
  item,
  depth,
  indent,
  childrenByParent,
  onNodeSelect,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded || depth < 1);
  const children = childrenByParent.get(item.id);
  const hasChildren = !!children && children.length > 0;

  const handleClick = useCallback(() => {
    if (hasChildren) setExpanded(prev => !prev);
    onNodeSelect?.(item.id);
  }, [hasChildren, item.id, onNodeSelect]);

  return (
    <>
      <Box
        className="flex items-center gap-1.5 py-0.5 px-2 cursor-pointer rounded-sm transition-colors hover:bg-muted"
        style={{ paddingLeft: depth * indent + 8 }}
        onClick={handleClick}
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {hasChildren ? (
          <Icon
            name={expanded ? 'chevron-down' : 'chevron-right'}
            size="xs"
            className="text-[var(--color-muted-foreground)] flex-shrink-0"
          />
        ) : (
          <Box style={{ width: 12, flexShrink: 0 }} />
        )}
        <Icon
          name={item.icon ?? (hasChildren ? (expanded ? 'folder-open' : 'folder') : 'file')}
          size="xs"
          className={hasChildren ? 'text-[var(--color-warning)]' : 'text-[var(--color-muted-foreground)]'}
        />
        <Typography variant="caption" className="truncate font-mono text-xs">
          {item.label}
        </Typography>
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
              onNodeSelect={onNodeSelect}
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

export const FileTree: React.FC<FileTreeProps> = ({
  tree,
  items,
  selectedPath,
  onFileSelect,
  onNodeSelect,
  className,
  indent = 16,
}) => {
  if (items) {
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
            onNodeSelect={onNodeSelect}
            defaultExpanded
          />
        ))}
      </Box>
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
