/**
 * fn-form lambda → React render-prop conversion at the render-ui
 * dispatch site, before the pattern lands in `useUISlots`.
 *
 * `.lolo` authors per-row render functions for DataGrid/DataList/Carousel
 * as `["fn", argName, body]`. By converting them to functions here,
 * SlotContent's props match what consumer components expect (children =
 * real function) without depending on a render-time conversion pass.
 *
 * @packageDocumentation
 */

import React from "react";
import type { EntityRow, EventPayloadValue, RenderItemLambda } from "@almadar/core";
import type { AnyPatternConfig } from "@almadar/core/patterns";
import type { SlotProps, SlotPropValue } from "../hooks/useUISlots";
import { createLogger } from '@almadar/logger';

const lambdaLog = createLogger("almadar:ui:fn-form-lambda");

export function isFnFormLambda(value: SlotPropValue): value is RenderItemLambda {
  if (!Array.isArray(value)) return false;
  // After the runtime array guard, view it as a homogeneous prop-value list so
  // `[1]` types as `SlotPropValue`. (Indexing the narrowed `RenderItemLambda`
  // tuple types `[1]` as `string`, collapsing the grouped-array branch to
  // `never`.)
  const arr = value as ReadonlyArray<SlotPropValue>;
  if (arr.length !== 3 || arr[0] !== "fn" || arr[2] === null || typeof arr[2] !== "object") {
    return false;
  }
  // Single-param shorthand (`["fn","item",body]`) OR the grouped multi-param
  // form (`["fn",["item","index"],body]`) the compiler now canonicalizes to.
  const params = arr[1];
  return (
    typeof params === "string" ||
    (Array.isArray(params) && params.length > 0 && params.every((p) => typeof p === "string"))
  );
}

/** Lambda param names: `["fn","item",b]` → `["item"]`;
 *  `["fn",["item","index"],b]` → `["item","index"]`. */
function fnFormParams(value: ReadonlyArray<SlotPropValue>): string[] {
  const p = value[1];
  if (typeof p === "string") return [p];
  if (Array.isArray(p)) return p.filter((x): x is string => typeof x === "string");
  return [];
}

/**
 * Walk a pattern body replacing every `@<argName>.path` string with the
 * value at `path` of `arg`. Mirrors the compiler's inline substitution
 * for `renderItem` lambda bodies.
 */
export function resolveLambdaBindings(
  body: SlotPropValue,
  params: readonly string[],
  item: EntityRow,
  index: number,
): SlotPropValue {
  // params[0] = the row (`item`); params[1] (optional) = the loop position
  // (`index`). `@<item>` / `@<item>.path` resolve against the row; a bare
  // `@<index>` resolves to the numeric loop position.
  const itemName = params[0];
  const indexName = params[1];
  const itemPrefix = itemName ? `@${itemName}.` : null;
  const lookup = (path: string): EventPayloadValue => {
    let cur: EventPayloadValue = item as EventPayloadValue;
    for (const seg of path.split(".")) {
      if (cur === null || cur === undefined) return undefined;
      if (typeof cur !== "object" || Array.isArray(cur)) return undefined;
      cur = (cur as Record<string, EventPayloadValue>)[seg];
    }
    return cur;
  };
  const recur = (b: SlotPropValue): SlotPropValue => resolveLambdaBindings(b, params, item, index);
  if (typeof body === "string") {
    if (indexName && body === `@${indexName}`) return index;
    if (itemName && body === `@${itemName}`) return item as EventPayloadValue;
    if (itemPrefix && body.startsWith(itemPrefix)) {
      const v = lookup(body.slice(itemPrefix.length));
      return v === undefined || v === null ? "" : v;
    }
    return body;
  }
  if (Array.isArray(body)) {
    return body.map((b) => recur(b as SlotPropValue)) as SlotPropValue;
  }
  if (body !== null && typeof body === "object" && !React.isValidElement(body) && !(body instanceof Date) && typeof body !== "function") {
    const out: Record<string, SlotPropValue> = {};
    for (const [k, v] of Object.entries(body as Record<string, SlotPropValue>)) {
      out[k] = recur(v);
    }
    return out as SlotPropValue;
  }
  return body;
}

// Lazy import keeps `fn-form-lambda → UISlotRenderer → fn-form-lambda`
// from forming a module cycle at evaluation time.
type SlotContentRendererComponent = React.ComponentType<{
  content: {
    id: string;
    pattern: string;
    props: SlotProps;
    priority: number;
  };
  onDismiss?: () => void;
}>;

let _slotContentRenderer: SlotContentRendererComponent | null = null;
function getSlotContentRenderer(): SlotContentRendererComponent {
  if (_slotContentRenderer) return _slotContentRenderer;
  const mod = require("../components/core/organisms/UISlotRenderer") as {
    SlotContentRenderer: SlotContentRendererComponent;
  };
  _slotContentRenderer = mod.SlotContentRenderer;
  return _slotContentRenderer;
}

function makeLambdaFn(
  params: readonly string[],
  lambdaBody: AnyPatternConfig,
  callerKey: string,
): (item: EntityRow, index: number) => React.ReactNode {
  return (item, index) => {
    const resolvedBody = resolveLambdaBindings(lambdaBody as SlotPropValue, params, item, index);
    if (
      resolvedBody === null ||
      typeof resolvedBody !== "object" ||
      Array.isArray(resolvedBody) ||
      typeof resolvedBody === "function" ||
      React.isValidElement(resolvedBody) ||
      resolvedBody instanceof Date
    ) {
      return null;
    }
    const record = resolvedBody as Record<string, SlotPropValue>;
    if (typeof record.type !== "string") {
      return null;
    }
    const SlotContentRenderer = getSlotContentRenderer();
    const rawChildProps: SlotProps = {};
    for (const [k, v] of Object.entries(record)) {
      if (k !== "type") rawChildProps[k] = v;
    }
    // Nested fn-form lambdas (e.g. a `data-list` inside this lambda's body
    // with its OWN `renderItem`) must be compiled here, not deferred — the
    // top-level `convertFnFormLambdasInProps` call only runs once at the
    // render-ui dispatch site and cannot see inside per-row lambda bodies.
    // Without this, the inner data-list receives a raw `["fn", ...]` array
    // and falls back to fields-based rendering with no fields, silently
    // dropping the children.
    const childProps = convertObjectProps(rawChildProps);
    const childContent = {
      id: `lambda-${callerKey}-${index}`,
      pattern: record.type,
      props: childProps,
      priority: 0,
    };
    return React.createElement(SlotContentRenderer, { content: childContent });
  };
}

// Recursively walks pattern trees so nested `renderItem` lambdas (e.g.
// `stack > data-grid > renderItem`) get converted, not just top-level
// props. Identity-preserving when nothing converts so memoised consumers
// downstream don't re-render needlessly.
function convertNode(node: SlotPropValue, callerKey: string): SlotPropValue {
  if (node === null || node === undefined) return node;
  if (Array.isArray(node)) {
    if (isFnFormLambda(node)) {
      const arr = node as ReadonlyArray<SlotPropValue>;
      return makeLambdaFn(fnFormParams(arr), arr[2] as AnyPatternConfig, callerKey);
    }
    const arr = node as ReadonlyArray<SlotPropValue>;
    let anyChanged = false;
    const mapped: SlotPropValue[] = arr.map((item, i) => {
      const next = convertNode(item, `${callerKey}[${i}]`);
      if (next !== item) anyChanged = true;
      return next;
    });
    return anyChanged ? mapped : node;
  }
  if (typeof node === "object" && !React.isValidElement(node) && !(node instanceof Date)) {
    return convertObjectProps(node as SlotProps);
  }
  return node;
}

function convertObjectProps(props: SlotProps): SlotProps {
  let convertedAny = false;
  const out: Record<string, SlotPropValue> = {};
  for (const [key, value] of Object.entries(props)) {
    if (isFnFormLambda(value)) {
      convertedAny = true;
      const arr = value as ReadonlyArray<SlotPropValue>;
      const compiled = makeLambdaFn(fnFormParams(arr), arr[2] as AnyPatternConfig, key);
      // `renderItem` is the schema-level alias: most consumers (DataGrid/DataList/
      // Carousel) read the per-row render via React `children`, but some
      // (RepeatableFormSection) read `renderItem` directly — set BOTH so either
      // reader gets the callable (else the latter throws "renderItem is not a function").
      out[key] = compiled;
      if (key === "renderItem") out.children = compiled;
      lambdaLog.debug(`convert key=${key}${key === "renderItem" ? " (+children)" : ""}`);
      continue;
    }
    const next = convertNode(value, key);
    if (next !== value) convertedAny = true;
    out[key] = next;
  }
  return convertedAny ? out : props;
}

/**
 * Walk a pattern's props (and recursively their nested children),
 * converting every fn-form lambda value into a React render-prop
 * function. Pure on inputs without lambdas: returns the props object
 * unchanged by reference.
 */
export function convertFnFormLambdasInProps(props: SlotProps): SlotProps {
  return convertObjectProps(props);
}
