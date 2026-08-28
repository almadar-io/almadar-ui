'use client';
/**
 * DocumentPanel Molecule
 *
 * The document writing surface, shaped like the established editors
 * (Notion / Google Docs / Gutenberg's canvas): a big inline-editable title
 * with the content DIRECTLY beneath it — nothing sits between the title and
 * the words. The only chrome is a compact top-right cluster in the header
 * row: while reading it holds a quiet Edit and the "⋯" actions menu; while
 * editing it swaps to the autosave hint + Done. Document metadata lives in
 * a sibling DocumentDetails card (a Gutenberg-style settings rail), never
 * inside this surface.
 *
 * The title commits on blur/Enter (select-on-focus, so typing replaces a
 * placeholder name); the body autosaves through the embedded
 * RichTextEditor's change stream; clicking the read body starts an editing
 * session with the cursor in the text.
 */
import React, { useState } from 'react';
import type { EntityRow, EventKey, EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { Box } from '../atoms/Box';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';
import { Icon } from '../atoms/Icon';
import { Input } from '../atoms/Input';
import type { IconInput } from '../atoms/index';
import { Menu } from './Menu';
import { RichTextEditor } from './RichTextEditor';

export interface DocumentPanelAction {
  label: string;
  event?: EventKey;
  icon?: IconInput;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

/**
 * DocumentPanel — a record rendered as one continuous document: editable
 * title over the rich-text body, editing controls tucked into the header
 * corner.
 *
 * @capabilities document page, note editor, wiki page, article editor, writing surface, rich text document, content editing canvas
 */
export interface DocumentPanelProps {
  /** The loaded record — supplies the id every commit event carries. */
  entity?: EntityRow;
  /** Document title (falls back to "Untitled" for a blank draft) */
  title?: string;
  /** Muted byline under the title; hidden when empty */
  subtitle?: string;
  /** The document body as rich-text HTML */
  value?: string;
  /** Header actions (settings, history, …). At most one explicit primary
   *  stays inline; the rest live under a single "⋯" menu — the title owns
   *  its row. */
  actions?: readonly DocumentPanelAction[];
  /** 0 collapses even the primary action into the menu */
  maxInlineActions?: number;
  /** false = read surface with click-to-edit body; true = live editor */
  editing?: boolean;
  /** Emitted when the title commits: { title, id } */
  titleCommitEvent?: EventEmit<{ title: string; id: string }>;
  /** Forwarded to the embedded RichTextEditor's autosave stream: { value } */
  contentChangeEvent?: EventEmit<{ value: string }>;
  /** Emitted by the header Edit affordance and a click on the read body: { id } */
  editEvent?: EventEmit<{ id: string }>;
  /** Emitted by the Done button that ends the editing session: { id } */
  doneEvent?: EventEmit<{ id: string }>;
  editLabel?: string;
  doneLabel?: string;
  /** Muted caption beside Done telling the author work persists on its own */
  autosaveHint?: string;
  /** Placeholder for an empty body */
  placeholder?: string;
  className?: string;
}

function renderIconInput(icon: IconInput, props: React.ComponentProps<typeof Icon>): React.ReactElement {
  return typeof icon === 'string' ? <Icon name={icon} {...props} /> : <Icon icon={icon} {...props} />;
}

export function DocumentPanel({
  entity,
  title,
  subtitle,
  value,
  actions,
  maxInlineActions,
  editing = false,
  titleCommitEvent,
  contentChangeEvent,
  editEvent,
  doneEvent,
  editLabel,
  doneLabel,
  autosaveHint,
  placeholder,
  className,
}: DocumentPanelProps): React.ReactElement {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [titleDraft, setTitleDraft] = useState<string | null>(null);

  const recordId = entity?.id !== undefined && entity?.id !== null ? String(entity.id) : '';
  const actionDefs = actions ?? [];

  // Card rule: the title owns its row — one explicit primary inline at most,
  // everything else under the single "⋯" menu, danger-styled there.
  const inlineCap = Math.min(maxInlineActions ?? 1, 1);
  const inlineActions = actionDefs.filter((a) => a.variant === 'primary').slice(0, inlineCap);
  const menuActions = actionDefs.filter((a) => !inlineActions.includes(a));

  const fireAction = (action: DocumentPanelAction) => {
    if (!action.event) return;
    eventBus.emit(`UI:${action.event}`, { id: recordId, row: entity });
  };

  // Title commits on blur/Enter; a blank draft or an unchanged one closes the
  // editor without a commit, so a record is never silently renamed to "".
  const commitTitle = () => {
    if (!titleCommitEvent) return;
    const next = (titleDraft ?? '').trim();
    setTitleDraft(null);
    if (!next || next === title) return;
    eventBus.emit(`UI:${titleCommitEvent}`, { title: next, id: recordId });
  };

  const untitled = t('documentPanel.untitled') || 'Untitled';

  const titleNode =
    titleCommitEvent && titleDraft !== null ? (
      <Input
        value={titleDraft}
        autoFocus
        aria-label={t('common.title')}
        className="h-auto py-1 text-3xl font-bold tracking-tight"
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setTitleDraft(e.target.value)}
        onBlur={commitTitle}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitTitle();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            setTitleDraft(null);
          }
        }}
        data-testid="document-title-input"
      />
    ) : titleCommitEvent ? (
      <Box
        role="button"
        tabIndex={0}
        className="cursor-text rounded px-1 -mx-1 transition-colors hover:bg-muted/40"
        onClick={() => setTitleDraft(title ?? '')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setTitleDraft(title ?? '');
          }
        }}
        data-testid="document-title-editable"
      >
        <Typography variant="h2" weight="bold" className={cn(!title && 'text-muted-foreground')}>
          {title || untitled}
        </Typography>
      </Box>
    ) : (
      <Typography variant="h2" weight="bold">
        {title || untitled}
      </Typography>
    );

  const emitWithId = (event: EventKey | undefined) => () => {
    if (event) eventBus.emit(`UI:${event}`, { id: recordId });
  };

  return (
    <Card variant="elevated" className={cn('w-full', className)}>
      <VStack gap="sm" className="p-6 sm:p-8">
        {/* Header: identity left, the ONLY chrome right — Edit + ⋯ while
            reading, autosave hint + Done while editing. Nothing else sits
            between the title and the words. */}
        <HStack gap="sm" className="justify-between items-start">
          <VStack gap="xs" className="flex-1 min-w-0">
            {titleNode}
            {subtitle ? (
              <Typography variant="small" color="secondary">{subtitle}</Typography>
            ) : null}
          </VStack>
          <HStack gap="xs" className="flex-shrink-0 pt-1 items-center">
            {editing ? (
              <>
                <Typography variant="caption" color="muted" className="hidden sm:block">
                  {autosaveHint ?? (t('documentPanel.autosaveHint') || '')}
                </Typography>
                <Button variant="primary" size="sm" onClick={emitWithId(doneEvent)} data-testid="document-done">
                  {doneLabel ?? (t('documentPanel.done') || 'Done')}
                </Button>
              </>
            ) : (
              <>
                {editEvent && (
                  <Button variant="ghost" size="sm" onClick={emitWithId(editEvent)} data-testid="document-edit">
                    <Icon name="edit" size="xs" className="mr-1" />
                    {editLabel ?? (t('documentPanel.edit') || 'Edit')}
                  </Button>
                )}
                {inlineActions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant="primary"
                    size="sm"
                    onClick={() => fireAction(action)}
                    data-testid={`action-${action.event}`}
                  >
                    {action.icon && renderIconInput(action.icon, { size: 'xs', className: 'mr-1' })}
                    {action.label}
                  </Button>
                ))}
                {menuActions.length > 0 && (
                  <Menu
                    position="bottom-end"
                    trigger={
                      <Button variant="ghost" size="sm" aria-label={t('common.actions')} data-testid="action-overflow">
                        <Icon name="more-horizontal" size="xs" />
                      </Button>
                    }
                    items={menuActions.map((action) => ({
                      label: action.label,
                      icon: action.icon,
                      variant: action.variant === 'danger' ? ('danger' as const) : ('default' as const),
                      onClick: () => fireAction(action),
                    }))}
                  />
                )}
              </>
            )}
          </HStack>
        </HStack>

        {/* The document itself, front and center. */}
        {editing ? (
          <RichTextEditor value={value} changeEvent={contentChangeEvent} placeholder={placeholder} />
        ) : (
          <Box
            onClick={emitWithId(editEvent)}
            className={cn(
              'rounded-md px-1 -mx-1 min-h-[16rem]',
              editEvent && 'cursor-text transition-colors hover:bg-muted/30',
            )}
            data-testid="document-body"
          >
            {value && value !== '' ? (
              <RichTextEditor value={value} readOnly />
            ) : (
              <Typography variant="body" color="muted">
                {placeholder ?? (t('documentPanel.placeholder') || '')}
              </Typography>
            )}
          </Box>
        )}
      </VStack>
    </Card>
  );
}
