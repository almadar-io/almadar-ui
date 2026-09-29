/**
 * AVL event wires — which trait hears which, decided by the runtime's own
 * `listens {}` source matcher (`@almadar/runtime` `parseListenSource`), so a
 * drawn wire is a delivery the running app makes, never a name coincidence.
 */

import type { OrbitalId, OrbitalSchema, Trait, TraitRef } from '@almadar/core';
import { isInlineTrait } from '@almadar/core';
import { parseListenSource } from '@almadar/runtime';

export interface TraitEventWire {
  emitterOrbital: string;
  emitterTrait: string;
  listenerOrbital: string;
  listenerTrait: string;
  event: string;
}

interface TraitInstance {
  orbital: string;
  orbitalId?: OrbitalId;
  name: string;
  trait: Trait;
}

function instanceOf(orbital: string, orbitalId: OrbitalId | undefined, ref: TraitRef): TraitInstance | null {
  const at = orbitalId === undefined ? { orbital } : { orbital, orbitalId };
  if (isInlineTrait(ref)) return { ...at, name: ref.name, trait: ref };
  if (typeof ref === 'object' && ref._resolved) return { ...at, name: ref.name ?? ref._resolved.name, trait: ref._resolved };
  return null;
}

/** Every emitter → listener delivery between two different traits, in schema order. */
export function traitEventWires(schema: OrbitalSchema): TraitEventWire[] {
  const instances = (schema.orbitals ?? []).flatMap((o) =>
    (o.traits ?? []).map((ref) => instanceOf(o.name, o.id, ref)).filter((i): i is TraitInstance => i !== null),
  );
  const wires: TraitEventWire[] = [];
  for (const emitter of instances) {
    for (const emit of emitter.trait.emits ?? []) {
      for (const listener of instances) {
        if (listener.orbital === emitter.orbital && listener.name === emitter.name) continue;
        for (const listen of listener.trait.listens ?? []) {
          const { bareEvent, matcher } = parseListenSource(listen, listener.orbital);
          // The emitter's ids go with its names: a listen that names its source by id matches by id only.
          const source = { orbital: emitter.orbital, trait: emitter.name, ...(emitter.orbitalId ? { orbitalId: emitter.orbitalId } : {}), ...(emitter.trait.id ? { traitId: emitter.trait.id } : {}) };
          if (bareEvent !== emit.event || !matcher(source)) continue;
          wires.push({
            emitterOrbital: emitter.orbital,
            emitterTrait: emitter.name,
            listenerOrbital: listener.orbital,
            listenerTrait: listener.name,
            event: emit.event,
          });
        }
      }
    }
  }
  return wires;
}
