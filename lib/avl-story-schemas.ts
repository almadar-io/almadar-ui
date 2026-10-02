/**
 * Shared test schemas for AVL V3 Storybook stories.
 *
 * Uses real behavior functions from @almadar/std to generate
 * OrbitalSchemas with actual state machines, fields, and pages.
 */

import type { OrbitalSchema } from '@almadar/core';
import { stdBrowse } from '@almadar/std/behaviors/functions';
import { stdConfirmation } from '@almadar/std/behaviors/functions';
import { schemaToFlowGraph } from './avl-flow-converter';
import { parseOrbitalLevel, parseTraitLevel } from './avl-schema-parser';

/**
 * Clinic schema: 2 orbitals with real state machines.
 * - PatientOrbital (std-browse): data grid with 5 fields
 * - QueueEntryOrbital (std-browse): data grid with 4 fields
 */
export const CLINIC_SCHEMA: OrbitalSchema = {
  name: 'Dermatology Clinic',
  description: 'Patient intake and reception queue',
  orbitals: [
    stdBrowse({
      entityName: 'Patient',
      fields: [
        { name: 'fullName', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'dateOfBirth', type: 'string' },
        { name: 'medicalHistory', type: 'string' },
        { name: 'insuranceProvider', type: 'string' },
      ],
      pagePath: '/intake',
    }),
    stdBrowse({
      entityName: 'QueueEntry',
      fields: [
        { name: 'patientName', type: 'string' },
        { name: 'waitMinutes', type: 'number' },
        { name: 'status', type: 'string', default: 'waiting' },
        { name: 'arrivalTime', type: 'string' },
      ],
    }),
  ],
};

/**
 * Task manager schema: 3 orbitals for a richer multi-module story.
 * - TaskOrbital (std-browse): task list
 * - FocusTimer (std-list): focus session list
 * - ArchiveOrbital (std-confirmation): archive confirmation
 */
export const TASK_SCHEMA: OrbitalSchema = {
  name: 'Task Manager',
  description: 'Task tracking with timer and archiving',
  orbitals: [
    stdBrowse({
      entityName: 'Task',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'priority', type: 'number' },
        { name: 'done', type: 'boolean' },
        { name: 'dueDate', type: 'string' },
        { name: 'assignee', type: 'string' },
      ],
    }),
    stdBrowse({
      entityName: 'FocusTimer',
      fields: [
        { name: 'label', type: 'string' },
        { name: 'duration', type: 'number' },
        { name: 'remaining', type: 'number' },
      ],
      pagePath: '/timer',
    }),
    stdConfirmation({
      entityName: 'ArchiveAction',
      fields: [
        { name: 'itemId', type: 'string' },
        { name: 'reason', type: 'string' },
      ],
      pagePath: '/archive',
    }),
  ],
};

/** Pre-computed React Flow graph for the clinic schema. */
export const CLINIC_GRAPH = schemaToFlowGraph(CLINIC_SCHEMA);

/** Pre-computed React Flow graph for the task schema. */
export const TASK_GRAPH = schemaToFlowGraph(TASK_SCHEMA);

/** First orbital's detail for ModuleCard/SystemNode stories. */
export const CLINIC_FIRST_ORBITAL = parseOrbitalLevel(CLINIC_SCHEMA, CLINIC_SCHEMA.orbitals[0].name);

/** First trait detail for BehaviorView/DetailView stories. */
export function getClinicFirstTrait() {
  const orbName = CLINIC_SCHEMA.orbitals[0].name;
  const orbital = parseOrbitalLevel(CLINIC_SCHEMA, orbName);
  if (!orbital || orbital.traits.length === 0) return null;
  return parseTraitLevel(CLINIC_SCHEMA, orbName, orbital.traits[0].name);
}
