/**
 * Per-row condition on a list action item.
 *
 * `.lolo` authors it on the action item itself:
 *
 * ```lolo
 * itemActions: [{ event: EDIT, label: Edit, when: (fn row (= (object/get @row ownerId) @user.id)) }]
 * ```
 *
 * The lambda arrives as the S-expression `["fn", "row", body]` on BOTH
 * execution paths (the interpreter delivers it raw through the slot content;
 * the compiled shell emits it as the item's data), so this is the only
 * evaluator: every list component asks `isActionShownForRow` / `actionsShownForRow`
 * (via `useRowActions`) instead of carrying its own copy. An action with no
 * `when` is always shown. This is the explicit per-row rule; it is never
 * derived from anything else and composes with the `roles` filter.
 *
 * @packageDocumentation
 */

import type { EntityRow, RuntimeValue, SExpr, TraitConfig, UserContext } from '@almadar/core';
import { ANONYMOUS_USER } from '@almadar/core';
import { createChildContext, createMinimalContext, evaluate } from '@almadar/evaluator';
import { createLogger } from '@almadar/logger';

const whenLog = createLogger('almadar:ui:row-action-when');

/** The declared action-item member that carries the row condition. */
export const ACTION_WHEN_KEY = 'when';

/**
 * What an action item's `when` holds. The interpreter delivers the authored
 * `(fn row …)` S-expression; the compiled shell lowers the same lambda to a
 * `(row) => boolean` closure over the ambient viewer. Both are accepted here,
 * evaluated by the one helper below.
 */
export type RowActionCondition = SExpr | ((row: EntityRow) => boolean);

/** An action item that may carry a per-row condition. */
export interface RowConditionalAction {
  readonly when?: RowActionCondition;
}

/** What a `when` body may read besides `@row`: the viewer, and host-supplied `@entity` / `@config`. */
export interface RowActionBindings {
  /** The signed-in viewer; null/absent binds `@user` as the anonymous viewer. */
  readonly user?: UserContext | null;
  readonly entity?: EntityRow;
  readonly config?: TraitConfig;
}

function lambdaParts(when: SExpr): { param: string; body: SExpr } | null {
  if (!Array.isArray(when) || when.length !== 3 || when[0] !== 'fn') return null;
  const params = when[1];
  const param = typeof params === 'string' ? params : Array.isArray(params) && params.length === 1 ? params[0] : null;
  if (typeof param !== 'string' || param.length === 0) return null;
  return { param: param.startsWith('@') ? param.slice(1) : param, body: when[2] as SExpr };
}

/**
 * Is `action` drawn for `row`? True when it has no `when`, otherwise only when
 * the lambda returns boolean `true`. A malformed or throwing `when` hides the
 * action (an unreadable rule never widens access) and is logged.
 */
export function isActionShownForRow(
  action: RowConditionalAction,
  row: EntityRow,
  bindings: RowActionBindings,
): boolean {
  const when = action.when;
  if (when === undefined) return true;
  if (typeof when === 'function') {
    try {
      return when(row) === true;
    } catch (error) {
      whenLog.warn('when-threw', { message: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }
  const lambda = lambdaParts(when);
  if (lambda === null) {
    whenLog.warn('malformed-when', { when: JSON.stringify(when) });
    return false;
  }
  const base = createMinimalContext(bindings.entity ?? {}, {}, 'idle');
  base.user = bindings.user ?? ANONYMOUS_USER;
  if (bindings.config !== undefined) base.config = bindings.config;
  const locals = new Map<string, RuntimeValue>([[lambda.param, row]]);
  try {
    return evaluate(lambda.body, createChildContext(base, locals)) === true;
  } catch (error) {
    whenLog.warn('when-threw', { message: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/**
 * The subset of `actions` drawn for `row`, in order. Returns the SAME array
 * when no action carries a `when`, so memoised consumers keep their identity.
 */
export function actionsShownForRow<A extends RowConditionalAction>(
  actions: readonly A[],
  row: EntityRow,
  bindings: RowActionBindings,
): readonly A[] {
  if (!actions.some((a) => a.when !== undefined)) return actions;
  return actions.filter((a) => isActionShownForRow(a, row, bindings));
}
