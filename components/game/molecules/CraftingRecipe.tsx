'use client';
import * as React from 'react';
import type { EventEmit } from '@almadar/core';
import { cn } from '../../../lib/cn';
import { useEventBus } from '../../../hooks/useEventBus';
import { ItemSlot } from '../atoms/ItemSlot';
import { Button } from '../../core/atoms/Button';
import { Box } from '../../core/atoms/Box';
import { HStack } from '../../core/atoms/Stack';
import { Icon, type IconInput } from '../../core/atoms/Icon';

export type CraftingIngredient = {
  /** Icon component or emoji */
  icon?: IconInput;
  /** Ingredient label */
  label: string;
  /** Number required for the recipe */
  required: number;
  /** Number currently available */
  available: number;
};

export type CraftingOutput = {
  /** Icon component or emoji */
  icon?: IconInput;
  /** Output item label */
  label: string;
  /** Rarity tier */
  rarity?: string;
};

export interface CraftingRecipeProps {
  /** Input ingredients for the recipe */
  inputs: CraftingIngredient[];
  /** Output item produced by the recipe */
  output: CraftingOutput;
  /** Whether the player has enough ingredients to craft */
  canCraft?: boolean;
  /** Callback when the craft button is clicked */
  onCraft?: () => void;
  /** Event bus event name for crafting */
  craftEvent?: EventEmit<{ output: string }>;
  /** Additional CSS classes */
  className?: string;
}

const rarityValues = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
type RarityValue = typeof rarityValues[number];

function isValidRarity(value: string | undefined): value is RarityValue {
  if (!value) return false;
  return (rarityValues as readonly string[]).includes(value);
}

export function CraftingRecipe({
  inputs,
  output,
  canCraft = false,
  onCraft,
  craftEvent,
  className,
}: CraftingRecipeProps) {
  const eventBus = useEventBus();

  const handleCraft = React.useCallback(() => {
    onCraft?.();
    if (craftEvent) {
      eventBus.emit(craftEvent, { output: output.label });
    }
  }, [onCraft, craftEvent, eventBus, output.label]);

  const outputRarity = isValidRarity(output.rarity) ? output.rarity : 'common';

  return (
    <Box
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-container bg-muted/50 border border-border/50 p-3',
        className,
      )}
    >
      {/* Input ingredients */}
      <HStack gap="xs" className="flex-wrap items-center">
        {inputs.map((ingredient, index) => {
          const hasSufficient = ingredient.available >= ingredient.required;
          return (
            <React.Fragment key={index}>
              <Box className="relative">
                <ItemSlot
                  icon={ingredient.icon}
                  label={ingredient.label}
                  quantity={ingredient.required}
                  size="md"
                  className={cn(!hasSufficient && 'opacity-50')}
                />
              </Box>
              {index < inputs.length - 1 && (
                <Icon name="plus" size="sm" className="text-muted-foreground" />
              )}
            </React.Fragment>
          );
        })}
      </HStack>

      {/* Arrow separator */}
      <Icon name="arrow-right" size="md" className="text-muted-foreground" />

      {/* Output item */}
      <ItemSlot
        icon={output.icon}
        label={output.label}
        rarity={outputRarity}
        size="md"
      />

      {/* Craft button */}
      <Button
        onClick={handleCraft}
        disabled={!canCraft}
        variant={canCraft ? 'primary' : 'secondary'}
        size="sm"
      >
        Craft
      </Button>
    </Box>
  );
}

CraftingRecipe.displayName = 'CraftingRecipe';
