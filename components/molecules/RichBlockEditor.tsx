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
  MoreHorizontal,
  Plus,
  Quote,
  Trash,
  Type as TypeIcon,
} from "lucide-react";
import type { EntityRow, EventEmit, EventPayloadValue } from '@almadar/core';
import { cn } from "../../lib/cn";
import { Card } from "../atoms/Card";
import { Typography } from "../atoms/Typography";
import { Button } from "../atoms/Button";
import { Box } from "../atoms/Box";
import { Divider } from "../atoms/Divider";
import { Input } from "../atoms/Input";
import { useEventBus } from "../../hooks/useEventBus";

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
   * Initial block payload. Accepts strongly-typed RichBlock[] from native
   * callers and the wider EntityRow[] shape that orb-bound traits emit
   * (orb `[object]` lowers to `Record<string, FieldValue | undefined>[]`,
   * which is structurally EntityRow[]). Items missing id/type are normalized
   * into paragraph blocks at mount.
   */
  initialBlocks?: readonly RichBlock[] | readonly EntityRow[];
  onChange?: (blocks: RichBlock[]) => void;
  changeEvent?: EventEmit<{ blocks: RichBlock[] }>;
  readOnly?: boolean;
  placeholder?: string;
  showToolbar?: boolean;
  className?: string;
}

interface ToolbarEntry {
  type: BlockType;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

const TOOLBAR_ENTRIES: ToolbarEntry[] = [
  { type: "paragraph", label: "Text", icon: TypeIcon },
  { type: "heading-1", label: "H1", icon: Heading1 },
  { type: "heading-2", label: "H2", icon: Heading2 },
  { type: "heading-3", label: "H3", icon: Heading3 },
  { type: "bullet-list", label: "Bullet list", icon: List },
  { type: "numbered-list", label: "Numbered", icon: ListOrdered },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "code", label: "Code", icon: Code },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "image", label: "Image", icon: ImageIcon },
];

const BLOCK_TYPE_LABEL: Record<BlockType, string> = {
  paragraph: "Text",
  "heading-1": "Heading 1",
  "heading-2": "Heading 2",
  "heading-3": "Heading 3",
  "bullet-list": "Bullet list",
  "numbered-list": "Numbered list",
  quote: "Quote",
  code: "Code",
  divider: "Divider",
  image: "Image",
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
  if (!raw || raw.length === 0) return [createBlock("paragraph")];
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
        aria-label="Block actions"
        className={cn(
          "inline-flex items-center justify-center",
          "h-6 w-6 rounded-sm p-0 gap-0",
          "text-muted-foreground hover:bg-muted hover:text-foreground",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          "transition-opacity",
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal size={14} />
      </Button>
      {open && (
        <Box
          role="menu"
          className={cn(
            "absolute right-0 z-10 mt-1 w-44",
            "rounded-md border border-border bg-popover shadow-md",
            "py-1 text-sm",
          )}
        >
          <Box className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
            {BLOCK_TYPE_LABEL[block.type]}
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
            <Plus size={14} /> Duplicate
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
            <Trash size={14} /> Delete
          </Button>
          {CHANGEABLE_TYPES.includes(block.type) && (
            <>
              <Box className="my-1 border-t border-border" />
              <Box className="px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                Turn into
              </Box>
              {CHANGEABLE_TYPES.filter((t) => t !== block.type).map((t) => (
                <Button
                  type="button"
                  variant="ghost"
                  role="menuitem"
                  key={t}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-left justify-start rounded-none"
                  onClick={() => {
                    onChangeType(t);
                    setOpen(false);
                  }}
                >
                  {BLOCK_TYPE_LABEL[t]}
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
  placeholder?: string;
  onUpdate: (updater: (block: RichBlock) => RichBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onInsertAfter: (type: BlockType) => void;
  onChangeType: (type: BlockType) => void;
}

function BlockRow({
  block,
  readOnly,
  placeholder,
  onUpdate,
  onDelete,
  onDuplicate,
  onInsertAfter,
  onChangeType,
}: BlockRowProps) {
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
            placeholder={placeholder ?? "Heading 1"}
            ariaLabel="Heading 1 block"
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
            placeholder={placeholder ?? "Heading 2"}
            ariaLabel="Heading 2 block"
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
            placeholder={placeholder ?? "Heading 3"}
            ariaLabel="Heading 3 block"
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
            placeholder={placeholder ?? "Quote"}
            ariaLabel="Quote block"
            className="border-l-4 border-primary/60 pl-4 italic text-muted-foreground"
            onValueChange={setContent}
          />
        );
      case "code":
        return (
          <Box className="rounded-md border border-border bg-muted/40">
            <Box className="flex items-center justify-between border-b border-border px-3 py-1 text-xs text-muted-foreground">
              <Typography as="span" variant="caption" className="uppercase tracking-wide">Code</Typography>
              {!readOnly && (
                <Input
                  inputType="text"
                  value={String(block.metadata?.language ?? "plaintext")}
                  aria-label="Code language"
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
              placeholder={placeholder ?? "Enter code"}
              ariaLabel="Code block"
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
          alt: caption || "Embedded image",
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
                <ImageIcon className="mr-2" size={16} /> No image URL set
              </Box>
            )}
            {!readOnly && (
              <Box className="flex flex-col gap-2 sm:flex-row">
                <Input
                  inputType="url"
                  value={url}
                  placeholder="https://example.com/image.png"
                  aria-label="Image URL"
                  className={cn(
                    "h-8 flex-1 rounded-sm border border-border bg-background",
                    "px-2 text-sm outline-none focus:ring-1 focus:ring-ring",
                  )}
                  onChange={(e) => setMetadata("url", e.target.value)}
                />
                <Input
                  inputType="text"
                  value={caption}
                  placeholder="Caption (optional)"
                  aria-label="Image caption"
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
                  placeholder="List item"
                  ariaLabel="List item"
                  className="inline-block min-w-[1ch] flex-1"
                  onValueChange={(next) => setChildContent(child.id, next)}
                />
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label="Remove list item"
                    className={cn(
                      "h-5 w-5 shrink-0 rounded-sm text-muted-foreground p-0 gap-0",
                      "opacity-0 group-hover/item:opacity-100 hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => removeListItem(child.id)}
                  >
                    <Trash size={12} />
                  </Button>
                )}
              </Box>
            ))}
            {!readOnly && (
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
                  <Plus size={12} /> Add item
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
            placeholder={placeholder ?? "Start writing..."}
            ariaLabel="Paragraph block"
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
      {!readOnly && (
        <Box className="flex w-12 shrink-0 items-center gap-0.5 pt-1">
          <Button
            type="button"
            variant="ghost"
            aria-label="Insert paragraph below"
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded-sm p-0 gap-0",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
              "transition-opacity",
            )}
            onClick={() => onInsertAfter("paragraph")}
          >
            <Plus size={14} />
          </Button>
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
  showToolbar = true,
  className,
}) => {
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

  const handleInsertAfter = useCallback(
    (id: string, type: BlockType) => {
      commit(insertAfter(blocks, id, createBlock(type)));
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
      {showToolbar && !readOnly && (
        <Box
          role="toolbar"
          aria-label="Block editor toolbar"
          className={cn(
            "flex flex-wrap items-center gap-1",
            "border-b border-border bg-muted/30 px-2 py-2",
          )}
        >
          {TOOLBAR_ENTRIES.map((entry) => {
            const Icon = entry.icon;
            return (
              <Button
                key={entry.type}
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Insert ${entry.label}`}
                title={entry.label}
                onClick={() => handleAppend(entry.type)}
              >
                <Icon size={14} />
                <Typography as="span" variant="caption" className="ml-1 hidden text-xs sm:inline">{entry.label}</Typography>
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
            placeholder={placeholder}
            onUpdate={(updater) => handleUpdate(block.id, updater)}
            onDelete={() => handleDelete(block.id)}
            onDuplicate={() => handleDuplicate(block.id)}
            onInsertAfter={(type) => handleInsertAfter(block.id, type)}
            onChangeType={(type) => handleChangeType(block.id, type)}
          />
        ))}
      </Box>
    </Card>
  );
};

RichBlockEditor.displayName = "RichBlockEditor";
