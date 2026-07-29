'use client';
/**
 * EmojiPicker Molecule Component
 *
 * Emoji chooser for composers and reaction bars: a trigger icon button that
 * opens a popover holding a searchable, categorized grid of the full emojilib
 * set, built on GridPicker + Popover with a Button trigger. Picking an emoji
 * emits `UI:{pickEvent}` with `{ emoji }` on the event bus and closes the
 * panel — one declarative contract, mirroring TableView's `itemClickEvent`.
 */

import React, { useState } from 'react';
import { lib, ordered } from 'emojilib';
import type { EventKey } from '@almadar/core';
import type { EmojiPickPayload } from '@almadar/core/patterns';
import { useEventBus } from '../../../hooks/useEventBus';
import { Button } from '../atoms/Button';
import type { IconInput } from '../atoms/index';
import { GridPicker, type PickerItem } from './GridPicker';
import { Popover } from './Popover';

/**
 * Build the item list once at module scope (mirrors IconPicker's lucide
 * enumeration). `ordered` keeps emojilib's curated display order, which
 * groups the set by category; the glyph itself is the stable id.
 */
const EMOJI_ITEMS: PickerItem[] = (() => {
  const items: PickerItem[] = [];
  for (const name of ordered) {
    const entry = lib[name];
    if (entry === undefined || entry.char === null || entry.char === '') continue;
    items.push({
      id: entry.char,
      label: name.replace(/_/g, ' '),
      category: entry.category.replace(/_/g, ' '),
      keywords: entry.keywords,
    });
  }
  return items;
})();

export type EmojiPickerPosition = 'top' | 'bottom';

export interface EmojiPickerProps {
  /**
   * Declarative event name — picking an emoji emits UI:{pickEvent} with { emoji } via eventBus
   */
  pickEvent?: EventKey;

  /**
   * Which side of the trigger the panel opens on
   * @default 'top'
   */
  position?: EmojiPickerPosition;

  /**
   * Icon shown on the trigger button
   * @default 'smile'
   */
  triggerIcon?: IconInput;

  /**
   * Accessible label for the trigger button
   * @default 'Add emoji'
   */
  triggerLabel?: string;

  /**
   * Additional CSS classes applied to the trigger button
   */
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  pickEvent,
  position = 'top',
  triggerIcon = 'smile',
  triggerLabel = 'Add emoji',
  className,
}) => {
  const eventBus = useEventBus();
  const [open, setOpen] = useState(false);

  const handlePick = (glyph: string) => {
    if (pickEvent !== undefined) {
      const payload: EmojiPickPayload = { emoji: glyph };
      eventBus.emit(`UI:${pickEvent}`, payload);
    }
    setOpen(false);
  };

  return (
    <Popover
      position={position}
      trigger="click"
      showArrow={false}
      open={open}
      onOpenChange={setOpen}
      content={
        <GridPicker
          items={EMOJI_ITEMS}
          onChange={handlePick}
          searchPlaceholder="Search emoji…"
          renderThumbnail={(item) => (
            <span className="text-xl leading-none" aria-hidden="true">
              {item.id}
            </span>
          )}
          cellSize={32}
          className="w-80"
        />
      }
    >
      <Button
        variant="ghost"
        icon={triggerIcon}
        aria-label={triggerLabel}
        title={triggerLabel}
        className={className}
        data-testid="emoji-picker-trigger"
      />
    </Popover>
  );
};

EmojiPicker.displayName = 'EmojiPicker';
