/**
 * Example Trait Definitions
 * 
 * Pre-defined traits for Trait Wars demo.
 */

import { TraitDefinition } from '../molecules/TraitStateViewer';

export const WARRIOR_TRAIT: TraitDefinition = {
    name: 'Berserker',
    description: 'Aggressive melee fighter that powers up when wounded',
    states: ['idle', 'defending', 'enraged', 'exhausted'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'defending', event: 'DEFEND' },
        { from: 'idle', to: 'enraged', event: 'TAKE_DAMAGE', guardHint: 'HP < 50%' },
        { from: 'defending', to: 'idle', event: 'END_TURN' },
        { from: 'enraged', to: 'exhausted', event: 'ATTACK' },
        { from: 'exhausted', to: 'idle', event: 'TICK' },
    ],
};

export const MAGE_TRAIT: TraitDefinition = {
    name: 'Spellweaver',
    description: 'Channels powerful spells but needs recovery time',
    states: ['preparing', 'casting', 'recovering'],
    currentState: 'preparing',
    transitions: [
        { from: 'preparing', to: 'casting', event: 'CAST_SPELL', guardHint: 'Mana >= 20' },
        { from: 'casting', to: 'recovering', event: 'SPELL_COMPLETE' },
        { from: 'recovering', to: 'preparing', event: 'TICK', guardHint: '2 turns' },
    ],
};

export const HEALER_TRAIT: TraitDefinition = {
    name: 'Divine Grace',
    description: 'Heals allies but enters cooldown after powerful heals',
    states: ['ready', 'channeling', 'cooldown'],
    currentState: 'ready',
    transitions: [
        { from: 'ready', to: 'channeling', event: 'START_HEAL' },
        { from: 'channeling', to: 'cooldown', event: 'HEAL_COMPLETE' },
        { from: 'cooldown', to: 'ready', event: 'TICK', guardHint: '3 turns' },
    ],
};

// Default traits for unit types
export const DEFAULT_UNIT_TRAITS: Record<string, TraitDefinition> = {
    knight: WARRIOR_TRAIT,
    warrior: WARRIOR_TRAIT,
    mage: MAGE_TRAIT,
    healer: HEALER_TRAIT,
};
