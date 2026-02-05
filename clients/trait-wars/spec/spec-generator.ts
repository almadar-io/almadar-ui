// import * as fs from 'fs';
// import * as path from 'path';
// import { fileURLToPath } from 'url';
// import { parseOrbitalSchema } from '../types/schema.js';
// import { Trait, getTraitName, isInlineTrait } from '../types/trait.js';
// import { type Effect, isEffect, type PatternConfig } from '../types/effect.js';
// import { OrbitalSchema } from '../types/schema.js';
// import { Orbital, OrbitalDefinition, EntityRef, isEntityReference } from '../types/orbital.js';

// // TODO: This file needs major refactoring - see docs/Almadar_Builder_Gaps.md
// // The OrbitalReference type was removed. Visual spec generation needs to be
// // redesigned for the new import system using `uses` declarations.

// /**
//  * @deprecated OrbitalReference type no longer exists in the schema.
//  * This is a compatibility shim for the visual spec generator.
//  * The new type system uses `uses` declarations for imports instead.
//  */
// interface OrbitalReference {
//     name: string;
//     ref?: string;
//     description?: string;
//     visual_prompt?: string;
//     traits?: Array<{ ref?: string }>;
//     instances?: Array<{
//         id: string;
//         ref?: string;
//         position?: { x: number; y: number };
//         visual_prompt?: string;
//         traits?: Array<{ ref?: string }>;
//     }>;
// }

// /**
//  * Helper to collect all traits from orbitals (since schema no longer has top-level traits)
//  */
// function collectTraitsFromSchema(schema: OrbitalSchema): Trait[] {
//     const traits: Trait[] = [];
//     for (const orbital of schema.orbitals || []) {
//         if (isOrbitalDefinition(orbital)) {
//             for (const traitRef of orbital.traits || []) {
//                 if (isInlineTrait(traitRef)) {
//                     traits.push(traitRef);
//                 }
//             }
//         }
//     }
//     return traits;
// }

// /**
//  * Helper to get entity name from EntityRef (handles string references)
//  */
// function getEntityName(entity: EntityRef): string {
//     if (isEntityReference(entity)) {
//         // Reference format: "Alias.entity" - extract alias
//         return entity.replace('.entity', '');
//     }
//     return entity.name;
// }

// /**
//  * Helper to get entity description from EntityRef
//  */
// function getEntityDescription(entity: EntityRef): string | undefined {
//     if (isEntityReference(entity)) {
//         return undefined;
//     }
//     return entity.description;
// }

// /**
//  * Helper to get entity visual_prompt from EntityRef
//  */
// function getEntityVisualPrompt(entity: EntityRef): string | undefined {
//     if (isEntityReference(entity)) {
//         return undefined;
//     }
//     return entity.visual_prompt;
// }

// /**
//  * Generates a "Manuscript Futurism" visual specification prompt from an Orbital Trait schema.
//  * Visualizes the Trait as a "Holy Mechanism" (Trait Engine).
//  * 
//  * @param trait The full Orbital Trait object
//  * @param linkedEntity Optional name of the entity this trait is attached to
//  * @returns A descriptive prompt string suitable for image generation
//  */
// export function generateManuscriptSpec(trait: Trait, linkedEntity?: string): string {
//     const { name, stateMachine } = trait;

//     // Guard clause for traits without state machines
//     if (!stateMachine) {
//         return `Sci-Fi Symbol. Style: 'Illuminated Manuscript Futurism'. Subject: '${name}' Glyph. Visual: A geometric abstraction of the '${name}' concept in gold leaf.`;
//     }

//     const states = stateMachine.states;
//     const transitions = stateMachine.transitions;

//     // 1. Analyze for Active UI Effects to determine "Active Gear" and "Output"
//     const activeUIStates: { state: string, target: string, pattern: string }[] = [];

//     transitions.forEach(t => {
//         if (t.effects) {
//             t.effects.forEach(e => {
//                 // S-expression format: ['render-ui', target, pattern]
//                 if (isEffect(e) && e[0] === 'render-ui') {
//                     const target = e[1] as string;
//                     const pattern = e[2] as PatternConfig | null;
//                     if (pattern && pattern.type) {
//                         activeUIStates.push({
//                             state: t.to,
//                             target: target,
//                             pattern: pattern.type
//                         });
//                     }
//                 }
//             });
//         }
//     });

//     // 2. Build the Concept: THE ENGINE

//     // -- The Gearbox (States)
//     const stateNames = states.map(s => s.name).join(", ");
//     const stateCount = states.length;
//     // Map initial state to "Top Dead Center", others arranged radially

//     // -- The Flow (Transitions)
//     // Check for guards to add "Valves"
//     const guardedTransitions = transitions.filter(t => t.guard != null && (Array.isArray(t.guard) ? t.guard.length > 0 : true));
//     const valveDescription = guardedTransitions.length > 0
//         ? `Valves/Seals: Visible on the pipes, labeled with Logic Guards: [${guardedTransitions.map(t => `'${JSON.stringify(t.guard)}'`).join(", ")}].`
//         : "Pipes: Unobstructed tubes of Liquid Light connecting the gears.";

//     // -- The Output (Active Effect)
//     let activeOutput = "The Engine is in a dormant, potential state. Soft ambient hum.";
//     if (activeUIStates.length > 0) {
//         const ui = activeUIStates[0];
//         // "The 'Heal' gear is ACTIVELY VENTING a cloud of 'Golden Nanite Mist'..."
//         activeOutput = `Activity: The '${ui.state}' Gear is ACTIVELY VENTING/PROJECTING a ${getUiVisual(ui.target, ui.pattern)} (The UI) into the center of the ring.`;
//     }

//     // 3. Assemble the Prompt (The Holy Mechanism)
//     // Check if this is a HUMAN trait (starts with "Human")
//     if (name.startsWith('Human')) {
//         return `
// Sci-Fi Body Art Concept. "Dune" meets "Book of Kells". Style: 'Illuminated Manuscript Futurism'.
// Subject: The '${name}' Ability (Human Tattoo/Aura).

// Visual Overview:
// A glowing, bioluminescent TATTOO design on weathered human skin. It is not a machine, but a "Living Script" that changes state.

// 1. The Script (The States):
// Four distinct "Calligraphic Knots" arranged on the skin, labeled in Sci-Fi Kufic script: [${stateNames}].
// (The Idle knot is faint/dormant).

// 2. The Flow (Transitions):
// Lines of "Liquid Ink" connect the knots in a clockwise flow across the skin.
// ${valveDescription.replace('Pipes', 'Ink Lines').replace('Valves/Seals', 'Scarification Marks')}

// 3. The Manifestation (Effects):
// ${activeOutput.replace('The Engine is', 'The Tattoo is').replace('Gear', 'Knot').replace('VENTING/PROJECTING', 'GLOWING/PULSING').replace('into the center of the ring', 'on the body')}

// 4. The Shell (Skin):
// The background is warm, textured human skin (scarred/weathered). The design looks like it is burning from within.

// Atmosphere:
// Organic, Spiritual, Resistance. "The Word made Flesh."
// `.trim();
//     }

//     return `
// Sci-Fi Technical Blueprint. "Dune" meets "Book of Kells". Style: 'Illuminated Manuscript Futurism'.
// Subject: The '${name}' Trait Engine.

// Visual Overview:
// A complex, golden clockwork mechanism floating against a dark, star-filled vellum background. The machine is circular, representing the cycle of the State Machine.

// 1. The Gearbox (The States):
// Four distinct "Planetary Gears" arranged in a ring, labeled in Sci-Fi Kufic script: [${stateNames}].
// (The Idle gear is at the top, closed and resting).

// 2. The Flow (Transitions):
// Tubes of "Liquid Light" (Ink-tubes) connect the gears in a clockwise flow.
// ${valveDescription}

// 3. The Output (Effects):
// ${activeOutput}

// 4. The Shell:
// The entire mechanism is encased in a bone-white casing with gold filigree. It looks like a holy relic that happens to be a functional fusion reactor.

// Atmosphere:
// Precision, Divine Engineering, The Healing Algorithm. "A machine that prays for you."
// `.trim();
// }

// /**
//  * Maps KFlow UI Slots to Visual Metaphors for the prompt.
//  */
// function getUiVisual(target: string, patternType: string): string {
//     switch (target) {
//         case 'modal': return `suspended rectangular frame of light (${patternType})`;
//         case 'drawer': return `slide-out scroll panel (${patternType})`;
//         case 'overlay': return `massive Holographic Projection (${patternType})`;
//         case 'toast': return `small floating wisp of text`;
//         case 'hud-top':
//         case 'hud-bottom':
//             return `floating header bar of light (${patternType})`;
//         case 'center': return `focused central mandala (${patternType})`;
//         default: return `holographic manifestation (${patternType})`;
//     }
// }

// /**
//  * Generates a visual specification for an Orbital Reference.
//  */
// function generateReferenceSpec(ref: OrbitalReference): string {
//     const traitCount = ref.traits ? ref.traits.length : 0;
//     const instanceCount = ref.instances ? ref.instances.length : 0;

//     if (!ref.ref) {
//         return `
// Sci-Fi Concept Art. "Dune" meets "Book of Kells". Style: 'Illuminated Manuscript Futurism'.
// Subject: The '${ref.name}' (Cast / Container).

// Visual Overview:
// A collection of specific instances defined within this group.
// Refer to the Instances list below for individual visual signatures.

// Context:
// - Type: Container Group
// - Instance Count: ${instanceCount}
// - Additional Traits: ${traitCount}

// Atmosphere:
// Assembly, Diversity, Collective Presence.
// `.trim();
//     }

//     return `
// Sci-Fi Concept Art. "Dune" meets "Book of Kells". Style: 'Illuminated Manuscript Futurism'.
// Subject: The '${ref.name}' (Orbital Reference -> ${ref.ref}).

// Visual Overview:
// An instantiation of the '${ref.ref}' archetype. 
// It inherits the visual signature of the referenced Orbital but may have context-specific variations.

// Context:
// - Source: ${ref.ref}
// - Instance Count: ${instanceCount}
// - Additional Traits: ${traitCount}

// Atmosphere:
// Replication, Deployment, Fractal Instantiation.
// `.trim();
// }

// /**
//  * Resolves a reference string to an OrbitalDefinition using the Global Index.
//  */
// function resolveRef(refString: string, index: Map<string, OrbitalDefinition>): OrbitalDefinition | undefined {
//     // Format: ./File.orb#Fragment or just File.orb#Fragment
//     // We strictly indexed by "Basename.orb#Name"

//     // 1. Extract Basename and Fragment
//     // Regex to handle ./path/to/File.orb#Fragment
//     const match = refString.match(/([^\/]+\.orb)(?:#(.*))?$/);

//     if (match) {
//         const filename = match[1]; // e.g. Physics.orb
//         const fragment = match[2]; // e.g. The Higgs Field

//         if (filename && fragment) {
//             const key = `${filename}#${fragment}`;
//             return index.get(key);
//         }
//     }
//     return undefined;
// }

// /**
//  * Enhanced Reference Spec Generator that tries to resolve the source visual.
//  */
// function generateResolvedReferenceSpec(ref: OrbitalReference, index: Map<string, OrbitalDefinition>, globalTraitIndex: Map<string, Trait>): string {
//     let visual = "";

//     // 1. Get base visual
//     // Priority: Explicit Visual Prompt > Resolved Entity > Generic Fallback
//     // 1. Get base visual
//     // Priority: Explicit Visual Prompt > Resolved Entity > Generic Fallback
//     if ((ref as any).visual_prompt) {
//         visual = (ref as any).visual_prompt;
//     } else {
//         const def = ref.ref ? resolveRef(ref.ref, index) : undefined;
//         if (def) {
//             if (def.visual_prompt) visual = def.visual_prompt;
//             else if (getEntityVisualPrompt(def.entity)) visual = getEntityVisualPrompt(def.entity)!;
//             else visual = generateOrbitalVisualSpec(def);
//         } else {
//             // Fallback to generic if no top-level ref and no explicit prompt
//             visual = generateReferenceSpec(ref);
//         }
//     }

//     // 2. Append Context (ref.description) if it exists
//     if (ref.description) {
//         visual += `\n\nContext / Location Specifics:\n${ref.description}`;
//     }

//     // 3. Append Instances
//     if (ref.instances && ref.instances.length > 0) {
//         visual += `\n\nInstances:\n`;
//         ref.instances.forEach((inst) => {
//             visual += `- ID: ${inst.id}`;
//             if (inst.position) visual += ` (Poss: ${inst.position.x}, ${inst.position.y})`;

//             // Resolve Instance Ref
//             let instVisual = "";

//             // 1. Check for explicit Instance Override
//             if ((inst as any).visual_prompt) {
//                 instVisual = (inst as any).visual_prompt;
//             }
//             // 2. Resolve from Reference
//             else if (inst.ref) {
//                 const instDef = resolveRef(inst.ref, index);
//                 if (instDef) {
//                     if (instDef.visual_prompt) instVisual = instDef.visual_prompt;
//                     else if (getEntityVisualPrompt(instDef.entity)) instVisual = getEntityVisualPrompt(instDef.entity)!;
//                     else instVisual = generateOrbitalVisualSpec(instDef);
//                 }
//             }

//             if (instVisual) {
//                 // Indent the prompt slightly
//                 visual += `\n  Visual Prompt: ${instVisual.replace(/\n/g, '\n  ')}`;
//             }
//             // Resolve Instance Traits
//             if (inst.traits && inst.traits.length > 0) {
//                 // visual += `\n  Traits:`; // Removed redundant header
//                 inst.traits.forEach((t: { ref?: string }) => {
//                     const traitRef = t.ref;

//                     // Resolve Trait Definition
//                     if (!traitRef) return;

//                     let traitDef = globalTraitIndex.get(traitRef);
//                     if (!traitDef && !traitRef.includes('#')) {
//                         traitDef = globalTraitIndex.get(`TraitEngine.orb#${traitRef}`) || globalTraitIndex.get(`ComplianceEngine.orb#${traitRef}`);
//                     } else if (!traitDef) {
//                         const fullKeys = Array.from(globalTraitIndex.keys());
//                         const match = fullKeys.find(k => k.endsWith('#' + traitRef) || k === traitRef);
//                         if (match) traitDef = globalTraitIndex.get(match);
//                     }

//                     if (traitDef) {
//                         const p = generateEnhancedManuscriptSpec(traitDef);
//                         if (p) {
//                             visual += `\n  --- INTEGRATED TRAIT ENGINE (${traitDef.name}) ---\n  ${p.replace(/\n/g, '\n  ')}\n`;
//                         }
//                     } else {
//                         visual += `\n  - ${traitRef} (Unresolved)`;
//                     }
//                 });
//             }
//             visual += `\n`;
//         });
//     }

//     return visual;
// }

// function isOrbitalDefinition(orbital: Orbital): orbital is OrbitalDefinition {
//     return 'entity' in orbital;
// }

// /**
//  * Generates a "Manuscript Futurism" visual specification prompt for an Orbital (Character/Entity).
//  * Maps Entity Roles (Knight, Healer, Sage, etc.) to specific visual cues.
//  */
// export function generateOrbitalVisualSpec(
//     orbital: Orbital,
//     globalIndex?: Map<string, OrbitalDefinition>,
//     traitIndex?: Map<string, Trait>, // Added traitIndex
//     peers?: Orbital[]
// ): string {
//     // 1. Handle References (no entity)
//     if (!isOrbitalDefinition(orbital)) {
//         return generateReferenceSpec(orbital);
//     }

//     // 2. Handle Definitions (has entity)
//     const entityDesc = getEntityDescription(orbital.entity);
//     // Check for Human Tag in description (Orbital or Entity)
//     if ((orbital.description && orbital.description.includes('[HUMAN]')) ||
//         (entityDesc && entityDesc.includes('[HUMAN]'))) {
//         return generateHumanSpec(orbital);
//     }

//     // Check for Shadow Tag
//     if ((orbital.description && orbital.description.includes('[SHADOW]')) ||
//         (entityDesc && entityDesc.includes('[SHADOW]'))) {
//         return generateShadowSpec(orbital);
//     }

//     const role = getEntityName(orbital.entity);
//     const traitNames = orbital.traits.map(t => getTraitName(t)).join(', ');

//     let style = "Style: 'Illuminated Manuscript Futurism'.";
//     let material = "Matte BONE/PARCHMENT colored plating (texture like ancient paper or ivory).";
//     let visual = `Subject: The '${role}' Android.`;
//     let detail = "Covered in intricate BLACK & GOLD CALLIGRAPHY (Sci-Fi Kufic script) that acts as circuitry.";
//     let face = "A smooth \"Blank Page\" mask with a single vertical INK-BLACK sensor stroke.";
//     let atmosphere = "Ancient, literary, mystical. \"The Written Word made Machine\".";

//     // (Inhabitant logic moved to resolveInhabitants helper)

//     switch (role.toLowerCase()) {
//         case 'innocent':
//             material = "Pristine BONE/IVORY.";
//             detail = "Faint GOLD CALLIGRAPHY.";
//             atmosphere = "The Blank Page.";
//             break;
//         case 'orphan':
//             material = "Stained, cracked BONE.";
//             detail = "Mismatched armor.";
//             atmosphere = "The Palimpsest.";
//             break;
//         case 'caregiver':
//         case 'healer':
//         case 'mend':
//             material = "Warm IVORY.";
//             detail = "Harness of SCROLL tubes.";
//             atmosphere = "Healing Texts.";
//             break;
//         case 'hero':
//         case 'knight':
//         case 'defend':
//             material = "Reinforced BONE plate.";
//             detail = "Tablet Shield.";
//             atmosphere = "War Chants.";
//             break;
//         case 'explorer':
//         case 'pathfind':
//             material = "Weathered BONE.";
//             detail = "MAPS and STAR CHARTS.";
//             atmosphere = "The Navigator.";
//             break;
//         case 'rebel':
//         case 'disrupt':
//             material = "Rough jagged BONE.";
//             detail = "CROSSED OUT script.";
//             atmosphere = "The Heretic.";
//             break;
//         case 'lover':
//             material = "Polished IVORY and ROSE GOLD.";
//             detail = "POETRY script.";
//             atmosphere = "The Poet.";
//             break;
//         case 'creator':
//         case 'architect':
//         case 'fabricate':
//             material = "BONE with BRASS tools.";
//             detail = "ARCHITECTURAL PLANS.";
//             atmosphere = "The Builder.";
//             break;
//         case 'jester':
//             material = "Patchwork BONE.";
//             detail = "Chaotic scripts.";
//             atmosphere = "The Riddle.";
//             break;
//         case 'sage':
//         case 'archive':
//             material = "Yellowed PARCHMENT.";
//             detail = "AMBER GLASS INKWELL Head.";
//             atmosphere = "The Living Library.";
//             break;
//         case 'magician':
//         case 'mystic':
//         case 'transmute':
//             material = "Polished IVORY.";
//             detail = "Levitating BONE TILES.";
//             atmosphere = "Forbidden Texts.";
//             break;
//         case 'ruler':
//         case 'commander':
//         case 'command':
//         case 'order':
//             material = "Gilded BONE.";
//             detail = "GOLD SCRIPT.";
//             atmosphere = "The Emperor's Decree.";
//             break;
//         case 'npc':
//         case 'shopkeeper':
//             material = "Standard PARCHMENT plating.";
//             detail = "Ledger script and trade seals.";
//             atmosphere = "Mercantile, Busy.";
//             break;
//         case 'enemy':
//             material = "Darkened OBFUSCATED plating.";
//             detail = "Jagged red script.";
//             atmosphere = "Threatening, Unknown.";
//             break;
//         case 'player':
//             material = "Evolving BONE armor.";
//             detail = "The Hero's Journey written on the shell.";
//             atmosphere = "Protagonist, Potential.";
//             break;
//     }

//     // --- INTEGRATED ENGINE VISUALS ---
//     // Resolve traits to see if we have a "Trait Engine" with a visual prompt
//     let engineVisuals = "";
//     if (traitIndex && orbital.traits) {
//         orbital.traits.forEach(t => {
//             const ref = getTraitName(t);
//             let traitDef = traitIndex.get(ref);
//             if (!traitDef) {
//                 // Try to resolve "File.orb#Trait" if local alias fails, or just iterate index?
//                 // Simple approach: Iterate global index to find match if not exact
//                 // Actually, simpler: if ref contains '#', use it. If not, maybe it's just the name?
//                 // Let's just trust the index lookup for now or try "TraitEngine.orb#" + ref
//                 if (!ref.includes('#')) {
//                     // Try standard locations
//                     traitDef = traitIndex.get(`TraitEngine.orb#${ref}`) || traitIndex.get(`ComplianceEngine.orb#${ref}`);
//                 }
//             }

//             if (traitDef && 'description_visual_prompt' in traitDef) {
//                 const p = (traitDef as any).description_visual_prompt;
//                 if (typeof p === 'string' && p.length > 0) {
//                     engineVisuals += `\n\n--- INTEGRATED TRAIT ENGINE (${traitDef.name}) ---\n${p}\n`;
//                 }
//             }
//         });
//     }

//     return `
// Sci-Fi Concept Art. "Dune" meets "Book of Kells". ${style}
// ${visual}
// Material: ${material}
// Detail: ${detail}
// Face: ${face}
// Atmosphere: ${atmosphere}
// Traits: [${traitNames}].
// ${engineVisuals}
// `.trim();
// }

// /**
//  * Maps Human Traits to physical tools/weapons/gear.
//  */
// function getHumanGear(traitName: string): string {
//     switch (traitName) {
//         case 'HumanTrust': return "Carrying a LANTERN OF PURE LIGHT (Bio-luminescent glass).";
//         case 'HumanEndure': return "Wearing HEAVY SCAVENGED PLATE ARMOR made from spaceship debris.";
//         case 'HumanMend': return "Holding a MEDICAL STAFF entwined with tubing and glowing fluid.";
//         case 'HumanDefend': return "Holding a MASSIVE TOWER SHIELD made of reinforced door panels.";
//         case 'HumanPathfind': return "Holding a COMPASS STAFF and wearing complex SURVEYOR GOGGLES.";
//         case 'HumanDisrupt': return "Holding an IMPROVISED EMP DEVICE (wired brick) and wearing a stealth hood.";
//         case 'HumanConnect': return "Wearing a VOCAL AMPLIFIER RIG around the neck and holding a TRANSMITTER STAFF.";
//         case 'HumanFabricate': return "Wielding a MULTI-TOOL WRENCH and wearing a MECHANICAL EXOSKELETON ARM.";
//         case 'HumanTrick': return "Wearing a HOLOGRAPHIC MASK that is glitching/shifting.";
//         case 'HumanArchive': return "Carrying a massive SCROLL CASE on the back and holding a DATA-QUILL.";
//         case 'HumanTransmute': return "Holding a FLASK of glowing reactant and wearing ALCHEMICAL GLOVES.";
//         case 'HumanCommand': return "Holding a COMMANDER'S BATON and wearing a tattered CAPE.";
//         case 'ImperialAuthority': return "Holding a heavy SCEPTRE OF CONTROL (or Empty Hands for the Emperor).";
//         default: return "Holding a standard tool.";
//     }
// }

// /**
//  * Generates a "Manuscript Citizen" visual specification for Human characters.
//  * Style: "The Inked & The Erased".
//  */
// export function generateHumanSpec(orbital: OrbitalDefinition): string {
//     const role = getEntityName(orbital.entity);
//     const traitNames = orbital.traits.map(t => getTraitName(t)).join(', ');
//     const primaryTrait = orbital.traits.length > 0 ? getTraitName(orbital.traits[0]) : '';
//     const gear = getHumanGear(primaryTrait);

//     let visual = `Subject: The '${role}'(Human Citizen).Full Body Frontal View.`;
//     let style = "Style: 'Illuminated Manuscript Futurism'.";
//     let skin = "Skin like WEATHERED PARCHMENT.";
//     let tattoo = "CROSSED-OUT calligraphy (The Erased).";
//     let clothing = "Rags like torn pages.";
//     let atmosphere = "Survival, Resistance, The Human Element.";

//     switch (role.toLowerCase()) {
//         case 'innocent': // Dross
//         case 'rumi':
//             skin = "Skin like CRUMPLED PAPER.";
//             tattoo = "SMEARED ink (The Unwritten).";
//             clothing = "Makeshift wraps from discarded books.";
//             atmosphere = "Hope in the dirt. The Child.";
//             break;
//         case 'orphan': // Dross
//         case 'kael':
//             skin = "Scarred, LEATHER-like skin.";
//             tattoo = "JAGGED black text (The Survivor).";
//             clothing = "Scavenged armor plates over rags.";
//             atmosphere = "Resilience. The Scavenger.";
//             break;
//         case 'caregiver': // Tech
//         case 'layla':
//             skin = "Pale, translucent skin.";
//             tattoo = "Golden HEALING SUTRAS on hands.";
//             clothing = "Medic robes with many pouches.";
//             atmosphere = "Compassion. The Medic.";
//             break;
//         case 'hero': // Shield
//         case 'captain hareth':
//         case 'hareth':
//             skin = "Weathered, TOUGH leather skin.";
//             tattoo = "Faded RANK INSIGNIA (The Defector).";
//             clothing = "Cracked tactical armor with removed sigils.";
//             atmosphere = "Honor. The Soldier.";
//             break;
//         case 'explorer': // Tech
//         case 'jara':
//             skin = "Sun-bleached skin.";
//             tattoo = "MAP COORDINATES running up arms.";
//             clothing = "Dust-covered surveyor robes, Goggles.";
//             atmosphere = "Curiosity. The Scout.";
//             break;
//         case 'rebel': // Dross
//         case 'zain':
//             skin = "Rough, CHARCOAL-stained skin.";
//             tattoo = "Bold REDACTED bars over old text.";
//             clothing = "Hooded stealth gear, bandoliers.";
//             atmosphere = "Revolution. The Saboteur.";
//             break;
//         case 'lover': // Elite
//         case 'samira':
//             skin = "Dusted with faded GOLD LEAF.";
//             tattoo = "Elegant POETRY script (The Forbidden Verse).";
//             clothing = "Torn silk robes, hidden luxury.";
//             atmosphere = "Passion. The Poet.";
//             break;
//         case 'creator': // Tech
//         case 'omar':
//             skin = "INK-STAINED fingers and arms.";
//             tattoo = "BLUEPRINT DIAGRAMS (The Architect).";
//             clothing = "Work apron full of tools and mechanical parts.";
//             atmosphere = "Innovation. The Engineer.";
//             break;
//         case 'jester': // Dross
//         case 'tariq':
//             skin = "Patchwork skin tone.";
//             tattoo = "GLITCHING pixel-art tattoos.";
//             clothing = "Neon-accented rags, Digital Mask.";
//             atmosphere = "Chaos. The Glitch.";
//             break;
//         case 'sage': // Tech
//         case 'fatima':
//             skin = "Paper-thin, delicate skin.";
//             tattoo = "Dense COLUMNS OF TEXT (The Archive).";
//             clothing = "Layers of shawls looking like book pages.";
//             atmosphere = "Wisdom. The Historian.";
//             break;
//         case 'magician': // Elite
//         case 'dr. aris':
//         case 'aris':
//             skin = "Glowing, bioluminescent veins.";
//             tattoo = "Floating GEOMETRIC FIGURES (Holographic).";
//             clothing = "Lab coat meeting High Priest robes.";
//             atmosphere = "Science as Magic. The Alchemist.";
//             break;
//         case 'ruler': // Shield
//         case 'amir':
//             skin = "Regal, scarred skin.";
//             tattoo = "The SEAL of Leadership (Broken).";
//             clothing = "Officer's coat worn as a cape. Command presence.";
//             atmosphere = "Authority. The True Heir.";
//             break;
//         case 'emperor': // Empire
//             skin = "UNBLEMISHED, glowing with LIVING GOLD SCRIPT.";
//             tattoo = "The SOURCE CODE moving across the skin.";
//             clothing = "Immaculate WHITE ROBES, floating GOLD HALOS.";
//             atmosphere = "Divinity. The Illuminated Man.";
//             break;
//         case 'commander': // Empire
//         case 'vane':
//             skin = "Pale, barely visible under armor.";
//             tattoo = "INTEGRATED PORTS for Command Link.";
//             clothing = "Massive 'COMPLIANCE ARMOR' (Life Support).";
//             atmosphere = "Tyranny. The Iron Voice.";
//             break;
//         default:
//             skin = "Standard PARCHMENT skin.";
//             tattoo = "Identification Barcode.";
//             clothing = "Standard Grey Compliance Suit.";
//             atmosphere = "The Citizen.";
//             break;
//     }

//     return `
//     Sci - Fi Character Concept. "Dune" meets "Book of Kells".${style}
// ${visual}
//     Skin / Texture: ${skin}
// Body Art(The Script): ${tattoo}
//     Clothing: ${clothing}
//     Gear(The Trait): ${gear}
//     Atmosphere: ${atmosphere}
//     Traits: [${traitNames}].
// `.trim();
// }

// /**
//  * Generates "Shadow Legion" visual specification.
//  * Style: "Dark Ancient Tech".
//  */
// export function generateShadowSpec(orbital: OrbitalDefinition): string {
//     const role = getEntityName(orbital.entity);
//     const traitNames = orbital.traits.map(t => getTraitName(t)).join(', ');

//     return `
//     Sci - Fi Character Concept. "Dune" meets "H.R. Giger".Style: 'Dark Ancient Tech'.
//         Subject: The '${role}'(Shadow Legion Unit).Full Body Frontal View.
// Visual Overview: An imposing, anti - humanoid machine built for destruction.
//         Material: OBSIDIAN VOID - METAL(Absorbs light).
//             Detail: Glowing CRIMSON circuitry and jagged vents.
//                 Face: A smooth BLACK VISOR with a single horizontal RED scanner.
//                     Atmosphere: Fear, Silence, The Void.
//                         Traits: [${traitNames}].
// `.trim();
// }

// /**
//  * Generates the "Compliance Engine" implant visual.
//  */
// export function generateBaseEngineSpec(): string {
//     return `
//     Sci - Fi Bio - Mechanical Spec. "Dune" meets "Book of Kells".Style: 'Illuminated Manuscript Futurism'.
//         Subject: 'The Compliance Engine'(Base Implant).
// Visual Overview: A complex SPINAL IMPLANT that looks like a holy relic fused to the vertebrae.
//         Components:
//     - The Core: A vertical column of INTERLOCKING BRASS GEARS running down the spine, replacing or covering the bone.
// - The Governor: A heavy "Governance Flywheel" at the base of the neck, etched with the law "SUBMIT".
// - The Linkages: Hydraulic pistons made of white ceramic(Bone) connecting the gears to the shoulder blades.
// - The Script: Sci - Fi Kufic warnings("RESTRICT", "DAMPEN") glowing faintly on the brass components.
//         Atmosphere: Heavy, Restrictive, Ancient Tech. "The weight of the law physically grafted to the soul."
// `.trim();
// }

// /**
//  * Helper to index traits for easy lookup
//  */
// function createTraitIndex(schema: OrbitalSchema): Map<string, Trait> {
//     const index = new Map<string, Trait>();

//     // Note: OrbitalSchema no longer has top-level traits - they are inside orbitals

//     // Index inline traits from orbitals
//     if (schema.orbitals) {
//         schema.orbitals.forEach(o => {
//             if ('traits' in o && o.traits) {
//                 o.traits.forEach(t => {
//                     if (typeof t !== 'string' && 'name' in t) {
//                         const traitName = (t as any).name;
//                         if (typeof traitName === 'string') {
//                             index.set(traitName, t as Trait);
//                         }
//                     }
//                 });
//             }
//         });
//     }
//     return index;
// }

// /**
//  * Resolves and formats inhabitants for a given orbital based on peer naming conventions.
//  */
// function resolveInhabitants(
//     orbital: OrbitalDefinition,
//     peers: Orbital[],
//     globalIndex: Map<string, OrbitalDefinition>
// ): string {
//     const myName = orbital.name;
//     let section = "";

//     const inhabitants = peers.filter(p => {
//         if (p.name === myName) return false;

//         // Regex match for "District X"
//         const districtRegex = /(District\s+\d+)/i;
//         const myMatch = myName.match(districtRegex);
//         const peerMatch = p.name.match(districtRegex);

//         if (myMatch && peerMatch) {
//             return myMatch[1] === peerMatch[1] && (p.name.includes("Population") || p.name.includes("Security"));
//         }

//         return p.name.includes(myName) && (p.name.includes("Population") || p.name.includes("Security"));
//     });

//     if (inhabitants.length > 0) {
//         section += "\n\n## Inhabitants / Security\n";
//         inhabitants.forEach(inh => {
//             section += `\n### ${inh.name} \n`;
//             if (!isOrbitalDefinition(inh)) {
//                 const resolved = generateResolvedReferenceSpec(inh, globalIndex, (globalIndex as any)._globalTraitIndex || new Map());
//                 section += resolved.split('\n').map(l => `> ${l} `).join('\n') + "\n";
//             }
//         });
//     }
//     return section;
// }

// // ============================================================================
// // Script Execution (Runner)
// // ============================================================================

// /**
//  * Generates specific "Human Trait Engine" specs (Variations of the Implant).
//  */
// export function generateHumanEngineSpec(trait: Trait): string {
//     // Check if the trait has a pre-defined visual prompt in the schema
//     if ('description_visual_prompt' in trait && typeof (trait as any).description_visual_prompt === 'string') {
//         return (trait as any).description_visual_prompt;
//     }

//     const name = trait.name.replace('Human', ''); // Trust, Endure, etc.
//     let modifications = "";

//     switch (name) {
//         case 'Trust': modifications = "The gears turn in perfect silence, leaking LIQUID GOLD (Trust) that glows warmly."; break;
//         case 'Endure': modifications = "The spinal column is reinforced with RUSTED IRON plating. The gears grind but never stop."; break;
//         case 'Mend': modifications = "The engine has extra FILTRATION VALVES and injection needles branching into the blood."; break;
//         case 'Defend': modifications = "Segments of the spine are armored with BLACK CERAMIC overlapping plates."; break;
//         case 'Pathfind': modifications = "A spinning GYROSCOPE/COMPASS mechanism is visible at the neck base."; break;
//         case 'Disrupt': modifications = "The engine vibrates violently. Arcs of STATIC ELECTRICITY jump between misaligned gears."; break;
//         case 'Connect': modifications = "FIBER-OPTIC CABLES weave through the brass gears, pulsing with blue data light."; break;
//         case 'Fabricate': modifications = "Small MECHANICAL ARMS (manipulators) are folded against the spine."; break;
//         case 'Trick': modifications = "The engine FLICKERS like a hologram. It's unclear what is real brass and what is light."; break;
//         case 'Archive': modifications = "SCROLL CASES are integrated into the vertebrae. The 'Governor' is a data-crystal."; break;
//         case 'Transmute': modifications = "The fluid in the pistons changes color (Lead to Gold) as it pumps."; break;
//         case 'Command': modifications = "The Governance Flywheel is elaborate, forming a HALO/CROWN shape at the neck."; break;
//         default: modifications = "Standard compliance fittings."; break;
//     }

//     return `
//     Sci - Fi Bio - Mechanical Spec. "Dune" meets "Book of Kells".Style: 'Illuminated Manuscript Futurism'.
//         Subject: 'The ${name} Engine'(Human Trait Implant).
// Visual Overview: A customized SPINAL IMPLANT, based on the standard Compliance Engine but MODIFIED by the user's role.
//     Components:
//     - Core: The standard BRASS GEAR column fused to the spine.
// - Modification: ${modifications}
//     - Script: Kufic glyphs for "${name.toUpperCase()}" glowing on the mechanism.
//         Atmosphere: Mechanical Symbiosis, Forbidden Upgrade, Functional Art.
// `.trim();
// }

// /**
//  * Enhanced Manuscript Spec Generator that checks for existing prompts first
//  */
// export function generateEnhancedManuscriptSpec(trait: Trait, linkedEntity?: string): string {
//     // 1. Calculate State Machine Logic (Shared with generateManuscriptSpec)
//     let stateLogic = "";
//     if (trait.stateMachine) {
//         const states = trait.stateMachine.states;
//         const transitions = trait.stateMachine.transitions;
//         const stateNames = states.map(s => s.name).join(", ");

//         // Analyze Active UI
//         const activeUIStates: { state: string, target: string, pattern: string }[] = [];
//         transitions.forEach(t => {
//             if (t.effects) {
//                 t.effects.forEach(e => {
//                     // S-expression format: ['render-ui', target, pattern]
//                     if (isEffect(e) && e[0] === 'render-ui') {
//                         const target = e[1] as string;
//                         const pattern = e[2] as PatternConfig | null;
//                         if (pattern && pattern.type) {
//                             activeUIStates.push({
//                                 state: t.to,
//                                 target: target,
//                                 pattern: pattern.type
//                             });
//                         }
//                     }
//                 });
//             }
//         });

//         // Flow Description
//         const guardedTransitions = transitions.filter(t => t.guard != null && (Array.isArray(t.guard) ? t.guard.length > 0 : true));
//         const valveDescription = guardedTransitions.length > 0
//             ? `Valves/Seals: Visible logic gates labeled: [${guardedTransitions.map(t => `'${JSON.stringify(t.guard)}'`).join(", ")}].`
//             : "Flow: Unobstructed liquid light.";

//         // Output Description
//         let activeOutput = "Dormant/Potential state.";
//         if (activeUIStates.length > 0) {
//             const ui = activeUIStates[0];
//             activeOutput = `State '${ui.state}' projects ${getUiVisual(ui.target, ui.pattern)}.`;
//         }

//         // Format for "Human" vs "Machine"
//         if (trait.name.startsWith('Human')) {
//             stateLogic = `
// 1. The Script (The States):
//    Knots/Glyphs: [${stateNames}].

// 2. The Flow (Transitions):
//    ${valveDescription}

// 3. The Manifestation (Effects):
//    ${activeOutput}
// `.trim();
//         } else {
//             stateLogic = `
// 1. The Gearbox (The States):
//    Gears: [${stateNames}].

// 2. The Flow (Transitions):
//    ${valveDescription}

// 3. The Output (Effects):
//    ${activeOutput}
// `.trim();
//         }
//     }

//     // 2. Return Combined Spec
//     if ('description_visual_prompt' in trait && typeof (trait as any).description_visual_prompt === 'string') {
//         // Merge Custom Prompt + State Logic
//         return `${(trait as any).description_visual_prompt}\n\n${stateLogic}`.trim();
//     }

//     // 3. Fallback to standard generation
//     return generateManuscriptSpec(trait, linkedEntity);
// }

// // Get current directory properly in ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Run if main module (executed directly via node/tsx spec-generator.ts)
// if (process.argv[1] === __filename) {
//     const SPEC_DIR = path.join(__dirname, 'spec');
//     const OUTPUT_DIR = path.join(__dirname, 'spec/generated_characters');

//     // Create base output directory if it doesn't exist
//     if (!fs.existsSync(OUTPUT_DIR)) {
//         fs.mkdirSync(OUTPUT_DIR, { recursive: true });
//     }

//     // List of .orb files to process
//     const ORB_FILES = [
//         'resonator_roles.orb',
//         'keepers.orb',
//         'iram-empire.orb',
//         'Physics.orb',
//         'Orbital.orb',
//         'Vessels.orb',
//         'Weapons.orb',
//         'Iram.orb',
//         'Citizens.orb',
//         'TraitEngine.orb',
//         'ComplianceEngine.orb',
//         'KeeperEngine.orb',
//         'Arch.orb'
//     ];

//     console.log('Generating specs from: ' + SPEC_DIR);
//     console.log('Output directory: ' + OUTPUT_DIR);

//     // Global Index for Reference Resolution
//     const globalIndex = new Map<string, OrbitalDefinition>();
//     const globalTraitIndex = new Map<string, Trait>(); // New Global Trait Index

//     // --- PASS 1: Indexing ---
//     console.log('Building Global Index...');

//     ORB_FILES.forEach(filename => {
//         try {
//             const filePath = path.join(SPEC_DIR, filename);
//             if (!fs.existsSync(filePath)) {
//                 console.warn('Warning: File not found: ' + filename);
//                 return;
//             }

//             const content = fs.readFileSync(filePath, 'utf-8');
//             const schema = JSON.parse(content);

//             // Validate schema
//             const parsedSchema = parseOrbitalSchema(schema);

//             // --- PASS 1: Index Definitions ---
//             if (parsedSchema.orbitals) {
//                 parsedSchema.orbitals.forEach(orbital => {
//                     if (isOrbitalDefinition(orbital)) {
//                         const key = `${filename}#${orbital.name}`;
//                         globalIndex.set(key, orbital);
//                         console.log(`Indexed Orbital: ${key}`);
//                     }
//                 });
//             }

//             // --- PASS 1: Index Traits (collected from orbitals) ---
//             const schemaTraits = collectTraitsFromSchema(parsedSchema);
//             schemaTraits.forEach(trait => {
//                 const key = `${filename}#${trait.name}`;
//                 globalTraitIndex.set(key, trait);
//                 console.log(`Indexed Trait: ${key}`);
//             });
//         } catch (e) {
//             console.warn(`Skipping index for ${filename}: ${(e as any).message}`);
//         }
//     });

//     // --- PASS 2: Generation ---
//     ORB_FILES.forEach(filename => {
//         try {
//             const filePath = path.join(SPEC_DIR, filename);
//             if (!fs.existsSync(filePath)) return;

//             const content = fs.readFileSync(filePath, 'utf-8');
//             const schema = JSON.parse(content);
//             const parsedSchema = parseOrbitalSchema(schema);

//             // Build Trait Index (Global for this file)
//             const traitIndex = createTraitIndex(parsedSchema);

//             // Handle Orbitals
//             if (parsedSchema.orbitals) {
//                 parsedSchema.orbitals.forEach(orbital => {
//                     // Check for pre-existing prompts
//                     let generatedSpec = "";

//                     // 1. Orbital Definition Processing
//                     if (isOrbitalDefinition(orbital)) {
//                         const entityVisualPrompt = getEntityVisualPrompt(orbital.entity);
//                         if (orbital.visual_prompt) {
//                             generatedSpec = orbital.visual_prompt;
//                         } else if (entityVisualPrompt) {
//                             generatedSpec = entityVisualPrompt;
//                         } else {
//                             generatedSpec = generateOrbitalVisualSpec(orbital, globalIndex, globalTraitIndex, parsedSchema.orbitals);
//                         }
//                     }
//                     // Note: OrbitalReference processing removed - Orbital is now always OrbitalDefinition
//                     // The new type system uses `uses` declarations for imports instead of OrbitalReference


//                     // --- APPEND ENGINE VISUALS (Universal) ---
//                     console.log(`[DEBUG] Processing Visuals for ${orbital.name}. Traits: ${JSON.stringify(orbital.traits)}`);
//                     if (orbital.traits && orbital.traits.length > 0) {
//                         let engineVisuals = "";
//                         orbital.traits.forEach(t => {
//                             const ref = getTraitName(t);
//                             console.log(`[DEBUG] Resolving ref: ${ref}`);

//                             let traitDef = globalTraitIndex.get(ref) || traitIndex.get(ref); // Try global then local

//                             // Try resolve with filename prefix if simple name
//                             if (!traitDef && !ref.includes('#')) {
//                                 traitDef = globalTraitIndex.get(`TraitEngine.orb#${ref}`) || globalTraitIndex.get(`ComplianceEngine.orb#${ref}`);
//                             } else if (!traitDef) {
//                                 // Try direct full match from map keys
//                                 const fullKeys = Array.from(globalTraitIndex.keys());
//                                 const match = fullKeys.find(k => k.endsWith('#' + ref) || k === ref);
//                                 if (match) traitDef = globalTraitIndex.get(match);
//                             }

//                             if (traitDef) {
//                                 let p = generateEnhancedManuscriptSpec(traitDef);

//                                 if (typeof p === 'string' && p.length > 0) {
//                                     engineVisuals += `\n\n--- INTEGRATED TRAIT ENGINE (${traitDef.name}) ---\n${p}\n`;
//                                 }
//                             } else {
//                                 console.log(`[DEBUG] Failed to resolve trait ref: ${ref}`);
//                             }
//                         });
//                         if (engineVisuals) {
//                             generatedSpec += engineVisuals;
//                         }
//                     }

//                     // 5. Append Inhabitants (if any)
//                     if (isOrbitalDefinition(orbital)) {
//                         const inhabitants = resolveInhabitants(orbital, parsedSchema.orbitals || [], globalIndex);
//                         if (inhabitants) {
//                             generatedSpec += inhabitants;
//                         }
//                     }

//                     // Determine Orbital Name safely
//                     const orbitalName = orbital.name;
//                     // Determine Entity Name safely
//                     let entityName = orbitalName;
//                     if (isOrbitalDefinition(orbital)) {
//                         entityName = getEntityName(orbital.entity);
//                     }

//                     // Determine Category
//                     let category = 'Robots'; // Default

//                     // 1. File-based assignment
//                     if (['Physics.orb', 'Orbital.orb', 'Weapons.orb', 'Vessels.orb', 'Iram.orb'].includes(filename)) {
//                         category = 'World';
//                     }
//                     else if (['keepers.orb', 'Citizens.orb'].includes(filename)) {
//                         category = 'Citizens';
//                     }
//                     else if (filename === 'Arch.orb') {
//                         category = 'Archs';
//                     }
//                     // 2. Tag-based assignment (overrides file-based if specific)
//                     else {
//                         const desc = (orbital.description || '') + (isOrbitalDefinition(orbital) ? getEntityDescription(orbital.entity) || '' : '');
//                         if (desc.includes('[HUMAN]')) {
//                             category = 'Citizens';
//                         } else if (desc.includes('[SHADOW]')) {
//                             category = 'Robots';
//                         }
//                     }

//                     // Create Encapsulated Folder: spec/generated_characters/[Category]/[OrbitalName]
//                     const categoryDir = path.join(OUTPUT_DIR, category);
//                     const orbitalDir = path.join(categoryDir, orbitalName);

//                     if (!fs.existsSync(categoryDir)) {
//                         fs.mkdirSync(categoryDir, { recursive: true });
//                     }
//                     if (!fs.existsSync(orbitalDir)) {
//                         fs.mkdirSync(orbitalDir, { recursive: true });
//                     }

//                     // Create Traits Subfolder: spec/generated_characters/[OrbitalName]/traits
//                     const orbitalTraitsDir = path.join(orbitalDir, 'traits');
//                     if (!fs.existsSync(orbitalTraitsDir)) {
//                         fs.mkdirSync(orbitalTraitsDir, { recursive: true });
//                     }

//                     // Write Character Spec
//                     let fileContent = `# Visual Spec: ${orbitalName} \n\n`;
//                     fileContent += `## Entity: ${entityName} \n\n`;
//                     fileContent += '> ' + generatedSpec + '\n\n';

//                     // Process Traits for this Orbital
//                     if (orbital.traits && orbital.traits.length > 0) {
//                         fileContent += `## Associated Traits\n\n`;
//                         fileContent += `* This character utilizes the following Trait Engines(see 'traits/' folder for full schematics):*\n\n`;

//                         orbital.traits.forEach(traitRef => {
//                             const traitName = getTraitName(traitRef);

//                             // Find the trait definition definition (Global Lookup)
//                             let traitDef = traitIndex.get(traitName) || globalTraitIndex.get(traitName);
//                             // Try filename resolution again if needed (only for ref-style trait references)
//                             if (!traitDef && !traitName.includes('#') && typeof traitRef !== 'string' && !isInlineTrait(traitRef)) {
//                                 const refName = traitRef.ref;
//                                 traitDef = globalTraitIndex.get(`TraitEngine.orb#${refName}`) || globalTraitIndex.get(`ComplianceEngine.orb#${refName}`);
//                             }

//                             if (traitDef) {
//                                 // Generate Trait Spec
//                                 let traitSpecContentStr = generateEnhancedManuscriptSpec(traitDef);

//                                 const traitFileContent = `# Visual Spec: Trait - ${traitName} \n\n` +
//                                     `> ` + traitSpecContentStr + `\n`;

//                                 // Write Trait File in the subfolder
//                                 const traitOutPath = path.join(orbitalTraitsDir, `${traitName}.md`);
//                                 fs.writeFileSync(traitOutPath, traitFileContent);

//                                 // Link in main file
//                                 fileContent += `- ** [${traitName}](./traits/${traitName}.md) **\n`;
//                             } else {
//                                 fileContent += `- ** ${traitName} (External / Missing Ref) **\n`;
//                             }
//                         });
//                     }

//                     // Write Main Spec File
//                     const outPath = path.join(orbitalDir, `character.md`);
//                     fs.writeFileSync(outPath, fileContent);
//                     console.log(`Generated Encapsulated Spec: ${orbitalName} -> ${outPath} `);
//                 });
//             } else {
//                 console.log('No orbitals found in ' + filename);
//             }

//             // --- PASS 3: Handle Top-Level Traits (Engines) ---
//             // Note: OrbitalSchema no longer has top-level traits - collect from orbitals
//             const topLevelTraits = collectTraitsFromSchema(parsedSchema);
//             if (topLevelTraits.length > 0) {
//                 console.log(`Found ${topLevelTraits.length} traits in ${filename}`);

//                 // create Traits output dir
//                 const traitsOutputDir = path.join(OUTPUT_DIR, 'Traits');
//                 if (!fs.existsSync(traitsOutputDir)) {
//                     fs.mkdirSync(traitsOutputDir, { recursive: true });
//                 }

//                 topLevelTraits.forEach((trait: Trait) => {
//                     const traitName = trait.name;
//                     const traitDir = path.join(traitsOutputDir, traitName);
//                     if (!fs.existsSync(traitDir)) {
//                         fs.mkdirSync(traitDir, { recursive: true });
//                     }

//                     let specContent = "";

//                     // Determine generation strategy based on file or name
//                     if (filename.includes('Compliance')) {
//                         // Generate Compliance Engine Spec
//                         // We can create a specific helper or reuse basics
//                         specContent = generateComplianceSpec(trait);
//                     } else {
//                         // Standard Trait Engine (Manuscript) (Includes Human)
//                         specContent = generateEnhancedManuscriptSpec(trait);
//                     }

//                     const fileContent = `# Visual Spec: ${traitName} \n\n` +
//                         `## Engine: ${traitName} \n\n` +
//                         `> ${specContent}\n`;

//                     const outPath = path.join(traitDir, `character.md`); // Keeping 'character.md' convention for consistency
//                     fs.writeFileSync(outPath, fileContent);
//                     console.log(`Generated Engine Spec: ${traitName} -> ${outPath}`);
//                 });
//             }

//         } catch (error: any) {
//             console.error('Error processing ' + filename + ':', error instanceof Error ? error.message : String(error));
//             if (error.issues) {
//                 console.error('Validation issues:', JSON.stringify(error.issues, null, 2));
//             }
//         }
//     });

//     console.log('\nGeneration Complete.');
// }

// /**
//  * Generates specific "Compliance Engine" specs.
//  */
// function generateComplianceSpec(trait: Trait): string {
//     const { name, stateMachine } = trait;

//     // Build state list
//     const stateNames = stateMachine ? stateMachine.states.map(s => s.name).join(", ") : "Active";
//     const guardList = stateMachine && stateMachine.transitions
//         ? stateMachine.transitions.filter(t => t.guard).map(t => `'${t.guard}'`).join(", ")
//         : "None";

//     return `
// Sci-Fi Bio-Mechanical Spec. "Dune" meets "Book of Kells". Style: 'Illuminated Manuscript Futurism'.
// Subject: The '${name}' (Compliance Engine).

// Visual Overview:
// A heavy, oppressive SPINAL IMPLANT that looks like a holy relic fused to the vertebrae.
// It is designed to SUPPRESS and REGULATE.

// Components:
// 1. The Core: A vertical column of INTERLOCKING BRASS GEARS running down the spine.
// 2. The Governor: A heavy "Governance Flywheel" at the base of the neck, etched with the law.
// 3. The Script: Glows with RED/AMBER warning glyphs when active.

// State Logic (The Law):
// - Cycles: [${stateNames}]
// - Enforcement Triggers: [${guardList}]

// Atmosphere:
// Heavy, Restrictive, Ancient Law. "The weight of the Empire."
// `.trim();
// }
