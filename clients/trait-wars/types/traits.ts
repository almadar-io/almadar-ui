/**
 * Trait Wars - Complete 12 Jungian Archetype Traits
 * 
 * Each archetype maps to a unique trait state machine.
 * Shell categories: s-Shell (foundation), p-Shell (interaction), d-Shell (mind), f-Shell (transcendence)
 */

import { TraitDefinition } from '../molecules/TraitStateViewer';

// =============================================================================
// s-Shell Traits (Foundation: Green/Yellow)
// =============================================================================

/** The Innocent - Trust: Projects pure white aura of potential */
export const TRUST_TRAIT: TraitDefinition = {
    name: 'Trust',
    description: 'Projects a pure white aura of hope and potential',
    states: ['idle', 'believing', 'inspiring'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'believing', event: 'HOPE' },
        { from: 'believing', to: 'inspiring', event: 'SHINE', guardHint: 'Hope > 0' },
        { from: 'inspiring', to: 'idle', event: 'RESET' },
    ],
};

/** The Orphan - Endure: Hardens armor from refuse */
export const ENDURE_TRAIT: TraitDefinition = {
    name: 'Endure',
    description: 'Hardens armor from refuse, survives through adaptation',
    states: ['idle', 'scavenging', 'adapting', 'surviving'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'scavenging', event: 'FIND_SCRAP' },
        { from: 'scavenging', to: 'adapting', event: 'INTEGRATE', guardHint: 'Scrap >= 5' },
        { from: 'adapting', to: 'surviving', event: 'WITHSTAND' },
        { from: 'surviving', to: 'idle', event: 'REST' },
    ],
};

/** The Caregiver - Mend: Projects golden nanite-mist */
export const MEND_TRAIT: TraitDefinition = {
    name: 'Mend',
    description: 'Projects golden nanite-mist to heal allies',
    states: ['idle', 'scanning', 'diagnosing', 'healing'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'scanning', event: 'START_SCAN' },
        { from: 'scanning', to: 'diagnosing', event: 'DIAGNOSE', guardHint: 'Target found' },
        { from: 'diagnosing', to: 'healing', event: 'ACTIVATE_HEAL' },
        { from: 'healing', to: 'idle', event: 'COMPLETE' },
    ],
};

// =============================================================================
// p-Shell Traits (Interaction: Red/Orange)
// =============================================================================

/** The Hero - Defend: Projects massive hard-light wall */
export const DEFEND_TRAIT: TraitDefinition = {
    name: 'Defend',
    description: 'Projects a massive hard-light wall to protect allies',
    states: ['idle', 'shielding', 'countering'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'shielding', event: 'SUMMON_SHIELD' },
        { from: 'shielding', to: 'countering', event: 'ABSORB_IMPACT', guardHint: 'Shield > 20%' },
        { from: 'countering', to: 'idle', event: 'LOWER_SHIELD' },
        { from: 'shielding', to: 'idle', event: 'LOWER_SHIELD' },
    ],
};

/** The Explorer - Pathfind: Manipulates gravity, walks on air/walls */
export const PATHFIND_TRAIT: TraitDefinition = {
    name: 'Pathfind',
    description: 'Manipulates gravity, can traverse any terrain',
    states: ['idle', 'surveying', 'plotting', 'traversing'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'surveying', event: 'SCAN_AREA' },
        { from: 'surveying', to: 'plotting', event: 'CALCULATE_ROUTE', guardHint: 'Scan complete' },
        { from: 'plotting', to: 'traversing', event: 'MOVE' },
        { from: 'traversing', to: 'idle', event: 'ARRIVE' },
    ],
};

/** The Rebel - Disrupt: Generates logical viruses */
export const DISRUPT_TRAIT: TraitDefinition = {
    name: 'Disrupt',
    description: 'Generates logical viruses to shatter enemy systems',
    states: ['idle', 'infiltrating', 'overloading', 'breaking'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'infiltrating', event: 'CONNECT' },
        { from: 'infiltrating', to: 'overloading', event: 'INJECT', guardHint: 'Firewall breached' },
        { from: 'overloading', to: 'breaking', event: 'SHATTER' },
        { from: 'breaking', to: 'idle', event: 'DISCONNECT' },
    ],
};

// =============================================================================
// d-Shell Traits (Mind: Blue/Cyan)
// =============================================================================

/** The Lover - Connect: Projects empathy waves */
export const CONNECT_TRAIT: TraitDefinition = {
    name: 'Connect',
    description: 'Projects empathy waves to bond with allies',
    states: ['idle', 'empathizing', 'bonding', 'harmonizing'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'empathizing', event: 'LISTEN' },
        { from: 'empathizing', to: 'bonding', event: 'LINK', guardHint: 'Resonance matches' },
        { from: 'bonding', to: 'harmonizing', event: 'SYNC' },
        { from: 'harmonizing', to: 'idle', event: 'RELEASE' },
    ],
};

/** The Creator - Fabricate: 3D-prints matter from light */
export const FABRICATE_TRAIT: TraitDefinition = {
    name: 'Fabricate',
    description: '3D-prints matter from pure light energy',
    states: ['idle', 'designing', 'gathering', 'building'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'designing', event: 'BLUEPRINT' },
        { from: 'designing', to: 'gathering', event: 'COLLECT_MATTER', guardHint: 'Blueprint valid' },
        { from: 'gathering', to: 'building', event: 'CONSTRUCT' },
        { from: 'building', to: 'idle', event: 'FINISH' },
    ],
};

/** The Jester - Trick: Projects chaotic holograms */
export const TRICK_TRAIT: TraitDefinition = {
    name: 'Trick',
    description: 'Projects chaotic holograms to confuse enemies',
    states: ['idle', 'distracting', 'confusing', 'mocking'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'distracting', event: 'JUGGLE' },
        { from: 'distracting', to: 'confusing', event: 'MIRROR', guardHint: 'Target distracted' },
        { from: 'confusing', to: 'mocking', event: 'LAUGH' },
        { from: 'mocking', to: 'idle', event: 'HIDE' },
    ],
};

// =============================================================================
// f-Shell Traits (Transcendence: Violet/Gold)
// =============================================================================

/** The Sage - Archive: Projects floating holographic scrolls */
export const ARCHIVE_TRAIT: TraitDefinition = {
    name: 'Archive',
    description: 'Projects floating holographic scrolls of knowledge',
    states: ['idle', 'observing', 'recording', 'synthesizing'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'observing', event: 'OPEN_EYE' },
        { from: 'observing', to: 'recording', event: 'CAPTURE', guardHint: 'Phenomenon unknown' },
        { from: 'recording', to: 'synthesizing', event: 'ANALYZE' },
        { from: 'synthesizing', to: 'idle', event: 'CLOSE' },
    ],
};

/** The Magician - Transmute: Absorbs energy and redirects it */
export const TRANSMUTE_TRAIT: TraitDefinition = {
    name: 'Transmute',
    description: 'Absorbs energy attacks and redirects them',
    states: ['idle', 'absorbing', 'converting', 'releasing'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'absorbing', event: 'CATCH' },
        { from: 'absorbing', to: 'converting', event: 'TRANSFORM', guardHint: 'Energy != VOID' },
        { from: 'converting', to: 'releasing', event: 'CAST' },
        { from: 'releasing', to: 'idle', event: 'RESET' },
    ],
};

/** The Ruler - Command: Projects tactical BattleNet aura */
export const COMMAND_TRAIT: TraitDefinition = {
    name: 'Command',
    description: 'Projects a tactical BattleNet aura to coordinate allies',
    states: ['idle', 'assessing', 'directing', 'coordinating'],
    currentState: 'idle',
    transitions: [
        { from: 'idle', to: 'assessing', event: 'TACTICAL_VIEW' },
        { from: 'assessing', to: 'directing', event: 'ISSUE_ORDER', guardHint: 'Squad ready' },
        { from: 'directing', to: 'coordinating', event: 'SYNC_SQUAD' },
        { from: 'coordinating', to: 'idle', event: 'STAND_DOWN' },
    ],
};

// =============================================================================
// Combat-focused Traits (from existing implementation)
// =============================================================================

/** Berserker - Aggressive melee fighter */
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

/** Spellweaver - Channels powerful spells */
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

/** Divine Grace - Heals allies with cooldown */
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

// =============================================================================
// Trait Mappings by Archetype
// =============================================================================

/** Complete mapping of all 12 Jungian archetypes to their traits */
export const ARCHETYPE_TRAITS: Record<string, TraitDefinition> = {
    // s-Shell (Foundation)
    innocent: TRUST_TRAIT,
    orphan: ENDURE_TRAIT,
    caregiver: MEND_TRAIT,
    // p-Shell (Interaction)
    hero: DEFEND_TRAIT,
    explorer: PATHFIND_TRAIT,
    rebel: DISRUPT_TRAIT,
    // d-Shell (Mind)
    lover: CONNECT_TRAIT,
    creator: FABRICATE_TRAIT,
    jester: TRICK_TRAIT,
    // f-Shell (Transcendence)
    sage: ARCHIVE_TRAIT,
    magician: TRANSMUTE_TRAIT,
    ruler: COMMAND_TRAIT,
};

/** Default traits for unit types (backwards compatible) */
export const DEFAULT_UNIT_TRAITS: Record<string, TraitDefinition> = {
    knight: WARRIOR_TRAIT,
    warrior: WARRIOR_TRAIT,
    mage: MAGE_TRAIT,
    healer: HEALER_TRAIT,
    // Archetype-based units
    innocent: TRUST_TRAIT,
    orphan: ENDURE_TRAIT,
    caregiver: MEND_TRAIT,
    hero: DEFEND_TRAIT,
    explorer: PATHFIND_TRAIT,
    rebel: DISRUPT_TRAIT,
    lover: CONNECT_TRAIT,
    creator: FABRICATE_TRAIT,
    jester: TRICK_TRAIT,
    sage: ARCHIVE_TRAIT,
    magician: TRANSMUTE_TRAIT,
    ruler: COMMAND_TRAIT,
};

// =============================================================================
// Hero Entity Type
// =============================================================================

/** Hero entity with multiple trait slots, XP, and level */
export interface Hero {
    id: string;
    name: string;
    archetype: keyof typeof ARCHETYPE_TRAITS;
    level: number;
    xp: number;
    xpToNextLevel: number;

    // Stats
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    movement: number;

    // Trait slots (Heroes can equip up to 3 traits)
    traits: TraitDefinition[];
    maxTraitSlots: 3;

    // Visual
    visual_prompt?: string;
    portraitUrl?: string;
}

/** Create a new hero from an archetype */
export function createHero(
    id: string,
    name: string,
    archetype: keyof typeof ARCHETYPE_TRAITS,
    level: number = 1
): Hero {
    const baseTrait = ARCHETYPE_TRAITS[archetype];
    return {
        id,
        name,
        archetype,
        level,
        xp: 0,
        xpToNextLevel: level * 100,
        health: 100 + level * 10,
        maxHealth: 100 + level * 10,
        attack: 10 + level * 2,
        defense: 10 + level * 2,
        movement: 3,
        traits: [baseTrait],
        maxTraitSlots: 3,
    };
}

/** Predefined story heroes */
export const STORY_HEROES = {
    unit734: createHero('unit_734', 'Unit 734 (Valence)', 'sage', 1),
    zahra: createHero('zahra', 'Zahra', 'lover', 1),
    hareth: createHero('hareth', 'Captain Hareth', 'hero', 1),
    kael: createHero('kael', 'Kael', 'orphan', 1),
    samira: createHero('samira', 'Samira', 'rebel', 1),
    omar: createHero('omar', 'Omar', 'creator', 1),
    layla: createHero('layla', 'Layla', 'caregiver', 1),
    jara: createHero('jara', 'Jara', 'explorer', 1),
} as const;

