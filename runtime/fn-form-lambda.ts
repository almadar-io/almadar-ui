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
import type { EntityRow, RenderItemLambda } from "@almadar/core";
import type { AnyPatternConfig } from "@almadar/patterns";
import { createLogger } from "../lib/logger";

const lambdaLog = createLogger("almadar:ui:fn-form-lambda");

export function isFnFormLambda(value: unknown): value is RenderItemLambda {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value[0] === "fn" &&
    typeof value[1] === "string" &&
    value[2] !== null &&
    typeof value[2] === "object"
  );
}

/**
 * Walk a pattern body replacing every `@<argName>.path` string with the
 * value at `path` of `arg`. Mirrors the compiler's inline substitution
 * for `renderItem` lambda bodies.
 */
export function resolveLambdaBindings(
  body: unknown,
  argName: string,
  arg: EntityRow,
): unknown {
  const prefix = `@${argName}.`;
  const lookup = (path: string): unknown => {
    let cur: unknown = arg;
    for (const seg of path.split(".")) {
      if (cur === null || cur === undefined) return undefined;
      if (typeof cur !== "object") return undefined;
      cur = (cur as Record<string, unknown>)[seg];
    }
    return cur;
  };
  if (typeof body === "string") {
    if (body === `@${argName}`) return arg;
    if (body.startsWith(prefix)) {
      const v = lookup(body.slice(prefix.length));
      return v === undefined || v === null ? "" : v;
    }
    return body;
  }
  if (Array.isArray(body)) {
    return body.map((b) => resolveLambdaBindings(b, argName, arg));
  }
  if (body !== null && typeof body === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      out[k] = resolveLambdaBindings(v, argName, arg);
    }
    return out;
  }
  return body;
}

// Lazy import keeps `fn-form-lambda → UISlotRenderer → fn-form-lambda`
// from forming a module cycle at evaluation time.
type SlotContentRendererComponent = React.ComponentType<{
  content: {
    id: string;
    pattern: string;
    props: Record<string, unknown>;
    priority: number;
  };
  onDismiss?: () => void;
}>;

let _slotContentRenderer: SlotContentRendererComponent | null = null;
function getSlotContentRenderer(): SlotContentRendererComponent {
  if (_slotContentRenderer) return _slotContentRenderer;
  const mod = require("../components/organisms/UISlotRenderer") as {
    SlotContentRenderer: SlotContentRendererComponent;
  };
  _slotContentRenderer = mod.SlotContentRenderer;
  return _slotContentRenderer;
}

function makeLambdaFn(
  argName: string,
  lambdaBody: AnyPatternConfig,
  callerKey: string,
): (item: EntityRow, index: number) => React.ReactNode {
  return (item, index) => {
    const resolvedBody = resolveLambdaBindings(lambdaBody, argName, item);
    if (
      resolvedBody === null ||
      typeof resolvedBody !== "object" ||
      Array.isArray(resolvedBody)
    ) {
      return null;
    }
    const record = resolvedBody as Record<string, unknown>;
    if (typeof record.type !== "string") {
      return null;
    }
    const SlotContentRenderer = getSlotContentRenderer();
    const childContent = {
      id: `lambda-${callerKey}-${index}`,
      pattern: record.type,
      props: Object.fromEntries(
        Object.entries(record).filter(([k]) => k !== "type"),
      ),
      priority: 0,
    };
    return React.createElement(SlotContentRenderer, { content: childContent });
  };
}

// Recursively walks pattern trees so nested `renderItem` lambdas (e.g.
// `stack > data-grid > renderItem`) get converted, not just top-level
// props. Identity-preserving when nothing converts so memoised consumers
// downstream don't re-render needlessly.
function convertNode(node: unknown, callerKey: string): unknown {
  if (node === null || node === undefined) return node;
  if (Array.isArray(node)) {
    if (isFnFormLambda(node)) {
      const [, argName, body] = node;
      return makeLambdaFn(argName, body, callerKey);
    }
    let anyChanged = false;
    const mapped = node.map((item, i) => {
      const next = convertNode(item, `${callerKey}[${i}]`);
      if (next !== item) anyChanged = true;
      return next;
    });
    return anyChanged ? mapped : node;
  }
  if (typeof node === "object") {
    return convertObjectProps(node as Record<string, unknown>);
  }
  return node;
}

function convertObjectProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  let convertedAny = false;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (isFnFormLambda(value)) {
      convertedAny = true;
      const [, argName, body] = value;
      // `renderItem` is the schema-level alias; consumers (DataGrid,
      // DataList, Carousel) read the per-row render via React `children`.
      const targetKey = key === "renderItem" ? "children" : key;
      out[targetKey] = makeLambdaFn(argName, body, key);
      lambdaLog.debug(`convert key=${key} → ${targetKey}`);
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
export function convertFnFormLambdasInProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  return convertObjectProps(props);
}
