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

export interface FileTreeProps {
  /** The tree data */
  tree: FileTreeNode[];
  /** Currently selected file path */
  selectedPath?: string;
  /** Called when a file is clicked */
  onFileSelect?: (path: string) => void;
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
            ? 'bg-[var(--color-primary)] bg-opacity-15 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-muted)] hover:bg-opacity-30'
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
          className={isDir ? 'text-[var(--color-warning)]' : 'text-[var(--color-muted-foreground)]'}
        />
        <Typography
          variant="caption"
          className={`truncate font-mono text-[11px] ${isSelected ? 'font-semibold' : ''}`}
        >
          {node.name}
        </Typography>
        {!isDir && node.size !== undefined && (
          <Typography variant="caption" className="text-[var(--color-muted-foreground)] text-[9px] ml-auto flex-shrink-0">
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
// FileTree
// ---------------------------------------------------------------------------

export const FileTree: React.FC<FileTreeProps> = ({
  tree,
  selectedPath,
  onFileSelect,
  className,
  indent = 16,
}) => {
  if (tree.length === 0) {
    return (
      <Box className={`p-4 ${className ?? ''}`}>
        <Typography variant="caption" color="muted">No files</Typography>
      </Box>
    );
  }

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
