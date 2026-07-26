'use client';
/**
 * ImportSourcePicker Molecule
 *
 * Source-selection menu for importing external data: paste text, markdown
 * file upload, and a generic "more sources" slot. Pure render — props in,
 * events out. Follows atomic design: composes Box, Icon, Typography atoms.
 */

import React, { useRef } from 'react';
import { Box } from '../../atoms/Box';
import { Icon } from '../../atoms/Icon';
import type { IconInput } from '../../atoms/index';
import { Typography } from '../../atoms/Typography';
import { cn } from '../../../../lib/cn';

export interface ImportSourceOption {
  /** Source identifier passed to onSelect */
  id: string;
  /** Option label */
  label: string;
  /** Description below the label */
  description?: string;
  /** Lucide icon name or component */
  icon?: IconInput;
  /** 'action' calls onSelect; 'file' opens a file picker and calls onFilesSelected */
  kind?: 'action' | 'file';
  /** Accepted file types for kind='file' (e.g. ".md,text/markdown") */
  accept?: string;
  /** Allow multiple files for kind='file' */
  multiple?: boolean;
  /** Disable the option */
  disabled?: boolean;
}

export interface ImportSourcePickerProps {
  /** Source options to render */
  sources: ImportSourceOption[];
  /** Called with the source id when an 'action' option is picked */
  onSelect?: (sourceId: string) => void;
  /** Called with the chosen files when a 'file' option resolves */
  onFilesSelected?: (files: File[]) => void;
  /** Optional heading above the options */
  title?: string;
  /** Generic slot for additional sources rendered below the options */
  moreSources?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export const ImportSourcePicker: React.FC<ImportSourcePickerProps> = ({
  sources,
  onSelect,
  onFilesSelected,
  title,
  moreSources,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePick = (source: ImportSourceOption) => {
    if (source.disabled) return;
    if (source.kind === 'file') {
      const input = fileInputRef.current;
      if (!input) return;
      input.accept = source.accept ?? '';
      input.multiple = source.multiple ?? false;
      input.click();
      return;
    }
    onSelect?.(source.id);
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    if (files.length > 0) onFilesSelected?.(files);
  };

  return (
    <Box className={cn('flex flex-col gap-2', className)}>
      {title ? <Typography variant="h4">{title}</Typography> : null}
      {sources.map((source) => (
        <Box
          key={source.id}
          role="button"
          tabIndex={source.disabled ? -1 : 0}
          aria-disabled={source.disabled}
          onClick={() => handlePick(source)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handlePick(source);
            }
          }}
          className={cn(
            'flex items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-left',
            source.disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
          )}
        >
          {source.icon ? <Icon icon={source.icon} size="md" /> : null}
          <Box className="flex flex-col">
            <Typography variant="label">{source.label}</Typography>
            {source.description ? (
              <Typography variant="caption" className="text-muted-foreground">
                {source.description}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ))}
      {moreSources}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFiles}
        data-testid="import-source-file-input"
      />
    </Box>
  );
};

export default ImportSourcePicker;
