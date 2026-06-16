'use client';
/**
 * RichBlockEditor Organism Component
 *
 * Notion / Lexical-style block authoring editor. Internal state owns the
 * block tree; contentEditable spans flow updates back through onInput.
 *
 * TODO(phase-11): collaboration / undo-redo / markdown export are out of
 * scope for the Phase 10 scaffold.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Type as TypeIcon,
} from "lucide-react";
import type { EntityRow, EventEmit, EventPayloadValue } from '@almadar/core';
import { cn } from "../../../lib/cn";
import { Card } from "../atoms/Card";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Box } from "../atoms/Box";
import { Divider } from "../atoms/Divider";
import { Input } from "../atoms/Input";
import { Icon } from "../atoms/Icon";
import { useEventBus } from "../../../hooks/useEventBus";
import { useTranslate } from "../../../hooks/useTranslate";

export type BlockType =
  | "paragraph"
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "bullet-list"
  | "numbered-list"
  | "quote"
  | "code"
  | "divider"
  | "image";

export interface RichBlock {
  id: string;
  type: BlockType;
  content?: string;
  metadata?: Record<string, string | number | boolean>;
  children?: RichBlock[];
  [key: string]: EventPayloadValue;
}

export interface RichBlockEditorProps {
  /**
   * Initial block payload — the rows that orb-bound traits emit. Items missing
   * id/type are normalized into paragraph blocks at mount.
   */
  initialBlocks?: readonly EntityRow[];
  onChange?: (blocks: RichBlock[]) => void;
  changeEvent?: EventEmit<{ blocks: RichBlock[] }>;
  readOnly?: boolean;
  placeholder?: string;
  /**
   * Opt-in to the Notion-style block authoring chrome (insert toolbar, per-row
   * +/menu gutter, turn-into menu). Off by default: the editor renders as a
   * plain rich text surface that edits block content inline without any
   * add-block affordances.
   */
  enableBlocks?: boolean;
  showToolbar?: boolean;
  className?: string;
}

interface ToolbarEntry {
  type: BlockType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const TOOLBAR_ENTRIES: ToolbarEntry[] = [
  { type: "paragraph", labelKey: "richBlockEditor.toolbar.text", icon: TypeIcon },
  { type: "heading-1", labelKey: "richBlockEditor.toolbar.h1", icon: Heading1 },
  { type: "heading-2", labelKey: "richBlockEditor.toolbar.h2", icon: Heading2 },
  { type: "heading-3", labelKey: "richBlockEditor.toolbar.h3", icon: Heading3 },
  { type: "bullet-list", labelKey: "richBlockEditor.toolbar.bulletList", icon: List },
  { type: "numbered-list", labelKey: "richBlockEditor.toolbar.numbered", icon: ListOrdered },
  { type: "quote", labelKey: "richBlockEditor.toolbar.quote", icon: Quote },
  { type: "code", labelKey: "richBlockEditor.toolbar.code", icon: Code },
  { type: "divider", labelKey: "richBlockEditor.toolbar.divider", icon: Minus },
  { type: "image", labelKey: "richBlockEditor.toolbar.image", icon: ImageIcon },
];

const BLOCK_TYPE_LABEL_KEY: Record<BlockType, string> = {
  paragraph: "richBlockEditor.blockType.paragraph",
  "heading-1": "richBlockEditor.blockType.heading1",
  "heading-2": "richBlockEditor.blockType.heading2",
  "heading-3": "richBlockEditor.blockType.heading3",
  "bullet-list": "richBlockEditor.blockType.bulletList",
  "numbered-list": "richBlockEditor.blockType.numberedList",
  quote: "richBlockEditor.blockType.quote",
  code: "richBlockEditor.blockType.code",
  divider: "richBlockEditor.blockType.divider",
  image: "richBlockEditor.blockType.image",
};

const CHANGEABLE_TYPES: BlockType[] = [
  "paragraph",
  "heading-1",
  "heading-2",
  "heading-3",
  "bullet-list",
  "numbered-list",
  "quote",
  "code",
];

let _idSeq = 0;
function nextBlockId(prefix = "blk"): string {
  _idSeq += 1;
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${_idSeq}-${random}`;
}

const BLOCK_TYPES = new Set<BlockType>([
  "paragraph",
  "heading-1",
  "heading-2",
  "heading-3",
  "bullet-list",
  "numbered-list",
  "quote",
  "code",
  "divider",
  "image",
]);

function normalizeBlocks(
  raw: readonly RichBlock[] | readonly EntityRow[] | undefined,
): RichBlock[] {
  // Defensive guard: mock data can seed array-typed entity fields as a
  // stringified JSON (or `null`) rather than a real array. Without this
  // check the next `.map()` crashes with `TypeError: t.map is not a
  // function`. The atom type system says `[BlockSpec]`; this just defends
  // against runtime-seeding drift.
  if (!Array.isArray(raw) || raw.length === 0) return [createBlock("paragraph")];
  return raw.map((row): RichBlock => {
    const r = row as Record<string, unknown>;
    const rawType = r.type;
    const type: BlockType =
      typeof rawType === "string" && BLOCK_TYPES.has(rawType as BlockType)
        ? (rawType as BlockType)
        : "paragraph";
    const id = typeof r.id === "string" && r.id ? r.id : nextBlockId(type);
    return { ...(r as Record<string, EventPayloadValue>), id, type };
  });
}

function createBlock(type: BlockType): RichBlock {
  switch (type) {
    case "bullet-list":
    case "numbered-list":
      return {
        id: nextBlockId(type),
        type,
        children: [
          { id: nextBlockId("li"), type: "paragraph", content: "" },
        ],
      };
    case "image":
      return {
        id: nextBlockId(type),
        type,
        content: "",
        metadata: { url: "", caption: "" },
      };
    case "code":
      return {
        id: nextBlockId(type),
        type,
        content: "",
        metadata: { language: "plaintext" },
      };
    case "divider":
      return { id: nextBlockId(type), type };
    default:
      return { id: nextBlockId(type), type, content: "" };
  }
}

function replaceBlock(
  blocks: RichBlock[],
  id: string,
  updater: (block: RichBlock) => RichBlock,
): RichBlock[] {
  return blocks.map((block) => (block.id === id ? updater(block) : block));
}

function removeBlock(blocks: RichBlock[], id: string): RichBlock[] {
  return blocks.filter((block) => block.id !== id);
}

function duplicateBlock(block: RichBlock): RichBlock {
  return {
    ...block,
    id: nextBlockId(block.type),
    children: block.children?.map((child) => ({
      ...child,
      id: nextBlockId("li"),
    })),
    metadata: block.metadata ? { ...block.metadata } : undefined,
  };
}

function insertAfter(
  blocks: RichBlock[],
  targetId: string,
  inserted: RichBlock,
): RichBlock[] {
  const idx = blocks.findIndex((b) => b.id === targetId);
  if (idx === -1) return [...blocks, inserted];
  const next = blocks.slice();
  next.splice(idx + 1, 0, inserted);
  return next;
}

function changeBlockType(block: RichBlock, type: BlockType): RichBlock {
  if (block.type === type) return block;
  if (type === "bullet-list" || type === "numbered-list") {
    if (block.children && block.children.length > 0) {
      return { ...block, type };
    }
    const seed = block.content ?? "";
    return {
      id: block.id,
      type,
      children: [
        { id: nextBlockId("li"), type: "paragraph", content: seed },
      ],
    };
  }
  if (type === "divider") {
    return { id: block.id, type };
  }
  if (type === "image") {
    return {
      id: block.id,
      type,
      content: "",
      metadata: { url: "", caption: block.content ?? "" },
    };
  }
  if (type === "code") {
    return {
      id: block.id,
      type,
      content: block.content ?? "",
      metadata: { language: "plaintext" },
    };
  }
  // paragraph / heading-* — preserve content, drop list children
  const seed = block.children?.[0]?.content ?? block.content ?? "";
  return { id: block.id, type, content: seed };
}

interface BlockMenuProps {
  block: RichBlock;
  readOnly: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onChangeType: (type: BlockType) => void;
}

function BlockMenu({ block, readOnly, onDelete, onDuplicate, onChangeType }: BlockMenuProps) {
  const { t } = useTranslate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (readOnly) return null;

  return (
    <Box ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        aria-label={t('richBlockEditor.blockActions')}
        className={cn(
          "inline-flex items-center justify-center",
          "h-6 w-6 rounded-sm p-0 gap-0",
          "text-muted-foreground hover:bg-muted hover:text-foreground",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          "transition-opacity",
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="more-horizontal" className="w-3.5 h-3.5" />
      </Button>
      {open && (
        <Box
          role="menu"
          className={cn(
            "absolute right-0 z-10 mt-1 w-44",
            "rounded-container border border-border bg-popover shadow-elevation-popover",
            "py-1 text-sm",
          )}
        >
          <Box className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t(BLOCK_TYPE_LABEL_KEY[block.type])}
          </Box>
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            className="flex w-full items-center gap-2 px-2 py-1.5 text-left justify-start rounded-none"
            onClick={() => {
              onDuplicate();
              setOpen(false);
            }}
          >
            <Icon name="plus" className="w-3.5 h-3.5" /> {t('richBlockEditor.duplicate')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            role="menuitem"
            className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-destructive hover:bg-muted justify-start rounded-none"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            <Icon name="trash" className="w-3.5 h-3.5" /> {t('common.delete')}
          </Button>
          {CHANGEABLE_TYPES.includes(block.type) && (
            <>
              <Box className="my-1 border-t border-border" />
              <Box className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                {t('richBlockEditor.turnInto')}
              </Box>
              {CHANGEABLE_TYPES.filter((bt) => bt !== block.type).map((bt) => (
                <Button
                  type="button"
                  variant="ghost"
                  role="menuitem"
                  key={bt}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left justify-start rounded-none"
                  onClick={() => {
                    onChangeType(bt);
                    setOpen(false);
                  }}
                >
                  {t(BLOCK_TYPE_LABEL_KEY[bt])}
                </Button>
              ))}
            </>
          )}
        </Box>
      )}
    </Box>
  );
}

interface EditableProps {
  tag: keyof React.JSX.IntrinsicElements;
  value: string;
  readOnly: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  onValueChange: (next: string) => void;
}

function Editable({
  tag,
  value,
  readOnly,
  placeholder,
  className,
  ariaLabel,
  onValueChange,
}: EditableProps) {
  const ref = useRef<HTMLElement | null>(null);

  // Sync DOM when external value changes and the element isn't focused.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isFocused = document.activeElement === el;
    if (!isFocused && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      onValueChange(e.currentTarget.textContent ?? "");
    },
    [onValueChange],
  );

  return (
    <Box
      as={tag}
      ref={ref as React.Ref<HTMLDivElement>}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      role={readOnly ? undefined : "textbox"}
      aria-label={ariaLabel}
      aria-multiline="true"
      data-placeholder={placeholder}
      className={cn(
        "outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm",
        "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60",
        className,
      )}
      onInput={handleInput}
    />
  );
}

interface BlockRowProps {
  block: RichBlock;
  readOnly: boolean;
  showAffordances: boolean;
  placeholder?: string;
  onUpdate: (updater: (block: RichBlock) => RichBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onChangeType: (type: BlockType) => void;
}

function BlockRow({
  block,
  readOnly,
  showAffordances,
  placeholder,
  onUpdate,
  onDelete,
  onDuplicate,
  onChangeType,
}: BlockRowProps) {
  const { t } = useTranslate();
  const setContent = useCallback(
    (next: string) => onUpdate((b) => ({ ...b, content: next })),
    [onUpdate],
  );

  const setMetadata = useCallback(
    (key: string, value: string | number | boolean) =>
      onUpdate((b) => ({
        ...b,
        metadata: { ...(b.metadata ?? {}), [key]: value },
      })),
    [onUpdate],
  );

  const setChildContent = useCallback(
    (childId: string, next: string) =>
      onUpdate((b) => ({
        ...b,
        children: (b.children ?? []).map((c) =>
          c.id === childId ? { ...c, content: next } : c,
        ),
      })),
    [onUpdate],
  );

  const addListItem = useCallback(
    () =>
      onUpdate((b) => ({
        ...b,
        children: [
          ...(b.children ?? []),
          { id: nextBlockId("li"), type: "paragraph", content: "" },
        ],
      })),
    [onUpdate],
  );

  const removeListItem = useCallback(
    (childId: string) =>
      onUpdate((b) => {
        const remaining = (b.children ?? []).filter((c) => c.id !== childId);
        return {
          ...b,
          children:
            remaining.length === 0
              ? [{ id: nextBlockId("li"), type: "paragraph", content: "" }]
              : remaining,
        };
      }),
    [onUpdate],
  );

  const renderBody = (): React.ReactNode => {
    switch (block.type) {
      case "heading-1":
        return (
          <Editable
            tag="h1"
            value={block.content ?? ""}
            readOnly={readOnly}
            placeholder={placeholder ?? t('richBlockEditor.placeholder.heading1')}
            ariaLabel={t('richBlockEditor.aria.heading1Block')}
            className="text-3xl font-bold leading-tight"
            onValueChange={setContent}
          />
        );
      case "heading-2":
        return (
          <Editable
            tag="h2"
            value={block.content ?? ""}
            readOnly={readOnly}
            placeholder={placeholder ?? t('richBlockEditor.placeholder.heading2')}
            ariaLabel={t('richBlockEditor.aria.heading2Block')}
            className="text-2xl font-semibold leading-tight"
            onValueChange={setContent}
          />
        );
      case "heading-3":
        return (
          <Editable
            tag="h3"
            value={block.content ?? ""}
            readOnly={readOnly}
            placeholder={placeholder ?? t('richBlockEditor.placeholder.heading3')}
            ariaLabel={t('richBlockEditor.aria.heading3Block')}
            className="text-xl font-semibold leading-tight"
            onValueChange={setContent}
          />
        );
      case "quote":
        return (
          <Editable
            tag="blockquote"
            value={block.content ?? ""}
            readOnly={readOnly}
            placeholder={placeholder ?? t('richBlockEditor.placeholder.quote')}
            ariaLabel={t('richBlockEditor.aria.quoteBlock')}
            className="border-l-4 border-primary/60 pl-4 italic text-muted-foreground"
            onValueChange={setContent}
          />
        );
      case "code":
        return (
          <Box className="rounded-md border border-border bg-muted/40">
            <Box className="flex items-center justify-between border-b border-border px-3 py-1 text-xs text-muted-foreground">
              <Typography as="span" variant="caption" className="uppercase tracking-wide">{t('richBlockEditor.blockType.code')}</Typography>
              {!readOnly && (
                <Input
                  inputType="text"
                  value={String(block.metadata?.language ?? "plaintext")}
                  aria-label={t('richBlockEditor.aria.codeLanguage')}
                  className={cn(
                    "h-6 w-32 rounded-sm border border-border bg-background",
                    "px-2 text-xs outline-none focus:ring-1 focus:ring-ring",
                  )}
                  onChange={(e) => setMetadata("language", e.target.value)}
                />
              )}
              {readOnly && (
                <Typography as="span" variant="caption" className="text-xs">
                  {String(block.metadata?.language ?? "plaintext")}
                </Typography>
              )}
            </Box>
            <Editable
              tag="pre"
              value={block.content ?? ""}
              readOnly={readOnly}
              placeholder={placeholder ?? t('richBlockEditor.placeholder.code')}
              ariaLabel={t('richBlockEditor.aria.codeBlock')}
              className="block whitespace-pre-wrap p-3 font-mono text-sm leading-relaxed"
              onValueChange={setContent}
            />
          </Box>
        );
      case "divider":
        return <Divider className="my-2" />;
      case "image": {
        const url = String(block.metadata?.url ?? "");
        const caption = String(block.metadata?.caption ?? "");
        const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
          src: url,
          alt: caption || t('richBlockEditor.embeddedImage'),
          className: "max-h-96 w-full rounded-md border border-border object-contain",
        };
        return (
          <Box className="space-y-2">
            {url ? (
              <Box as="img" {...imgProps} />
            ) : (
              <Box
                className={cn(
                  "flex h-32 items-center justify-center",
                  "rounded-md border border-dashed border-border",
                  "text-sm text-muted-foreground",
                )}
              >
                <Icon name="image" className="mr-2 w-4 h-4" /> {t('richBlockEditor.noImageUrl')}
              </Box>
            )}
            {!readOnly && (
              <Box className="flex flex-col gap-2 sm:flex-row">
                <Input
                  inputType="url"
                  value={url}
                  placeholder="https://example.com/image.png"
                  aria-label={t('richBlockEditor.aria.imageUrl')}
                  className={cn(
                    "h-8 flex-1 rounded-sm border border-border bg-background",
                    "px-2 text-sm outline-none focus:ring-1 focus:ring-ring",
                  )}
                  onChange={(e) => setMetadata("url", e.target.value)}
                />
                <Input
                  inputType="text"
                  value={caption}
                  placeholder={t('richBlockEditor.placeholder.caption')}
                  aria-label={t('richBlockEditor.aria.imageCaption')}
                  className={cn(
                    "h-8 flex-1 rounded-sm border border-border bg-background",
                    "px-2 text-sm outline-none focus:ring-1 focus:ring-ring",
                  )}
                  onChange={(e) => setMetadata("caption", e.target.value)}
                />
              </Box>
            )}
            {readOnly && caption && (
              <Typography variant="caption" className="text-center text-muted-foreground">
                {caption}
              </Typography>
            )}
          </Box>
        );
      }
      case "bullet-list":
      case "numbered-list": {
        const items = block.children ?? [];
        return (
          <Box
            as={block.type === "bullet-list" ? "ul" : "ol"}
            className={cn(
              "space-y-1 pl-6",
              block.type === "bullet-list" ? "list-disc" : "list-decimal",
            )}
          >
            {items.map((child) => (
              <Box as="li" key={child.id} className="group/item flex items-start gap-2">
                <Editable
                  tag="span"
                  value={child.content ?? ""}
                  readOnly={readOnly}
                  placeholder={t('richBlockEditor.placeholder.listItem')}
                  ariaLabel={t('richBlockEditor.aria.listItem')}
                  className="inline-block min-w-[1ch] flex-1"
                  onValueChange={(next) => setChildContent(child.id, next)}
                />
                {!readOnly && showAffordances && (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={t('richBlockEditor.aria.removeListItem')}
                    className={cn(
                      "h-5 w-5 shrink-0 rounded-sm text-muted-foreground p-0 gap-0",
                      "opacity-0 group-hover/item:opacity-100 hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => removeListItem(child.id)}
                  >
                    <Icon name="trash" className="w-3 h-3" />
                  </Button>
                )}
              </Box>
            ))}
            {!readOnly && showAffordances && (
              <Box as="li" className="list-none pl-0">
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "inline-flex items-center gap-1 text-xs text-muted-foreground",
                    "hover:text-foreground p-0 h-auto",
                  )}
                  onClick={addListItem}
                >
                  <Icon name="plus" className="w-3 h-3" /> {t('richBlockEditor.addItem')}
                </Button>
              </Box>
            )}
          </Box>
        );
      }
      case "paragraph":
      default:
        return (
          <Editable
            tag="p"
            value={block.content ?? ""}
            readOnly={readOnly}
            placeholder={placeholder ?? t('richBlockEditor.placeholder.paragraph')}
            ariaLabel={t('richBlockEditor.aria.paragraphBlock')}
            className="leading-7"
            onValueChange={setContent}
          />
        );
    }
  };

  return (
    <Box
      className={cn(
        "group relative flex items-start gap-2 rounded-sm",
        "px-2 py-1 hover:bg-muted/30",
      )}
      data-block-id={block.id}
      data-block-type={block.type}
    >
      {!readOnly && showAffordances && (
        <Box className="flex w-8 shrink-0 items-center pt-1">
          <BlockMenu
            block={block}
            readOnly={readOnly}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onChangeType={onChangeType}
          />
        </Box>
      )}
      <Box className="min-w-0 flex-1">{renderBody()}</Box>
    </Box>
  );
}

export const RichBlockEditor: React.FC<RichBlockEditorProps> = ({
  initialBlocks,
  onChange,
  changeEvent,
  readOnly = false,
  placeholder,
  enableBlocks = false,
  showToolbar = true,
  className,
}) => {
  const { t } = useTranslate();
  const [blocks, setBlocks] = useState<RichBlock[]>(
    () => normalizeBlocks(initialBlocks),
  );
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const eventBus = useEventBus();
  const changeEventRef = useRef(changeEvent);
  useEffect(() => {
    changeEventRef.current = changeEvent;
  }, [changeEvent]);

  const commit = useCallback((next: RichBlock[]) => {
    setBlocks(next);
    onChangeRef.current?.(next);
    const evt = changeEventRef.current;
    if (evt) eventBus.emit(`UI:${evt}`, { blocks: next });
  }, [eventBus]);

  const handleAppend = useCallback(
    (type: BlockType) => {
      if (readOnly) return;
      commit([...blocks, createBlock(type)]);
    },
    [blocks, commit, readOnly],
  );

  const handleUpdate = useCallback(
    (id: string, updater: (block: RichBlock) => RichBlock) => {
      commit(replaceBlock(blocks, id, updater));
    },
    [blocks, commit],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = removeBlock(blocks, id);
      commit(next.length > 0 ? next : [createBlock("paragraph")]);
    },
    [blocks, commit],
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const target = blocks.find((b) => b.id === id);
      if (!target) return;
      commit(insertAfter(blocks, id, duplicateBlock(target)));
    },
    [blocks, commit],
  );

  const handleChangeType = useCallback(
    (id: string, type: BlockType) => {
      commit(
        replaceBlock(blocks, id, (b) => changeBlockType(b, type)),
      );
    },
    [blocks, commit],
  );

  return (
    <Card
      variant="bordered"
      padding="none"
      className={cn("flex flex-col", className)}
    >
      {enableBlocks && showToolbar && !readOnly && (
        <Box
          role="toolbar"
          aria-label={t('richBlockEditor.editorToolbar')}
          className={cn(
            "flex flex-wrap items-center gap-1",
            "border-b border-border bg-muted/30 px-2 py-2",
          )}
        >
          {TOOLBAR_ENTRIES.map((entry) => {
            const Icon = entry.icon;
            const entryLabel = t(entry.labelKey);
            return (
              <Button
                key={entry.type}
                type="button"
                variant="ghost"
                size="sm"
                aria-label={t('richBlockEditor.insertEntry', { label: entryLabel })}
                title={entryLabel}
                onClick={() => handleAppend(entry.type)}
              >
                <Icon size={14} />
                <Typography as="span" variant="caption" className="ml-1 hidden text-xs sm:inline">{entryLabel}</Typography>
              </Button>
            );
          })}
        </Box>
      )}
      <Box className="flex flex-col gap-1 px-3 py-3">
        {blocks.map((block) => (
          <BlockRow
            key={block.id}
            block={block}
            readOnly={readOnly}
            showAffordances={enableBlocks}
            placeholder={placeholder}
            onUpdate={(updater) => handleUpdate(block.id, updater)}
            onDelete={() => handleDelete(block.id)}
            onDuplicate={() => handleDuplicate(block.id)}
            onChangeType={(type) => handleChangeType(block.id, type)}
          />
        ))}
      </Box>
    </Card>
  );
};

RichBlockEditor.displayName = "RichBlockEditor";
