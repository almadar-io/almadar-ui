/**
 * fn-form lambda → React render-prop conversion at the render-ui
 * dispatch site.
 *
 * `.lolo` authors per-row render functions for DataGrid/DataList/Carousel
 * as the sExpression lambda `["fn", argName, body]`. The compiled path's
 * codegen converts these into real `(item: T) => <JSX>` functions at
 * build time. The runtime path needs an equivalent conversion that
 * happens BEFORE the pattern lands in `useUISlots` SlotContent, so by
 * the time `<SlotContentRenderer>` mounts the consumer (DataGrid, etc.)
 * the prop is already a callable React render function.
 *
 * Why upstream — earlier attempts to detect-and-convert inside
 * `renderPatternProps` proved unreliable: the converted function's
 * return value didn't reach the DOM in some flows we couldn't fully
 * trace. Moving the conversion to the dispatch boundary makes the
 * SlotContent's props shape match what consumer components have always
 * expected (children = real function), so they behave identically to
 * the compiled path.
 *
 * @packageDocumentation
 */

import React from "react";
import type { EntityRow, RenderItemLambda } from "@almadar/core";
import type { AnyPatternConfig } from "@almadar/patterns";
import { createLogger } from "../lib/logger";

const lambdaLog = createLogger("almadar:ui:fn-form-lambda");

/**
 * Detect the canonical `RenderItemLambda` shape from `@almadar/core`:
 * head is the literal `"fn"`, second slot is the per-item argument name,
 * third slot is an `AnyPatternConfig` body. Strict by design — typed
 * forms outside this exact shape pass through unchanged.
 */
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
 * Walk a pattern body, replacing every `@<argName>.path.to.field` string
 * with the value at `path.to.field` of `arg`. Mirrors the compiler's
 * inline substitution for `renderItem` lambda bodies.
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

/**
 * Lazy module accessor for `<SlotContentRenderer>` so this file doesn't
 * close the cycle `runtime → UISlotRenderer → renderer/* → runtime`.
 * The consumer of the converted function is React render-time, well
 * after both modules have finished initialising.
 */
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

/**
 * Build the per-item render-prop function from a `RenderItemLambda` body.
 */
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
    const itemName =
      item && typeof item === "object"
        ? String((item as Record<string, unknown>).name ?? "")
        : "";
    lambdaLog.info(
      `fn-lambda:invoke key=${callerKey} idx=${index} type=${record.type} name=${itemName}`,
    );
    // Wrap SlotContentRenderer in a marker div so we can confirm via
    // page.evaluate whether React mounts our return value into the DOM.
    return React.createElement(
      "div",
      {
        "data-fn-marker": "true",
        "data-fn-key": callerKey,
        "data-fn-idx": String(index),
        style: { width: "100%" },
      },
      React.createElement(SlotContentRenderer, { content: childContent }),
    );
  };
}

/**
 * Recursively walk a pattern node — props object, child array, or any
 * deeper SExpression body — converting every `["fn", argName, body]`
 * lambda into a React render-prop function.
 *
 * Why recursion is required: render-ui dispatches a TOP-LEVEL pattern
 * whose children array contains nested pattern configs (e.g. a
 * `stack > data-grid > renderItem: ["fn", ...]`). The lambda lives
 * inside `children[i].renderItem`, not at the dispatched pattern's
 * top-level props. A shallow scan misses it. We walk every nested
 * pattern config the same way (substituting renderItem with `children`
 * key per the consumer-side aliasing rule).
 *
 * Identity-preserving: returns the input unchanged by reference if no
 * lambdas were found anywhere in the subtree, so memoised consumers
 * downstream don't re-render needlessly.
 */
function convertNode(node: unknown, callerKey: string): unknown {
  if (node === null || node === undefined) return node;
  if (Array.isArray(node)) {
    // SExpression lambda? — at this position the array IS the value
    // (e.g. inside a `renderItem` prop slot). Convert to a function.
    if (isFnFormLambda(node)) {
      const [, argName, body] = node;
      lambdaLog.info(
        `fn-lambda:upstream-convert key=${callerKey} targetKey=${callerKey === "renderItem" ? "children" : callerKey} argName=${argName}`,
      );
      return makeLambdaFn(argName, body as AnyPatternConfig, callerKey);
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
      const lambdaBody: AnyPatternConfig = body;
      const targetKey = key === "renderItem" ? "children" : key;
      out[targetKey] = makeLambdaFn(argName, lambdaBody, key);
      lambdaLog.info(
        `fn-lambda:upstream-convert key=${key} targetKey=${targetKey} argName=${argName}`,
      );
      continue;
    }
    const next = convertNode(value, key);
    if (next !== value) convertedAny = true;
    out[key] = next;
  }
  return convertedAny ? out : props;
}

/**
 * Public entry point: walk a pattern's props (and recursively their
 * nested children) once, converting every fn-form lambda value into a
 * React render-prop function. The `renderItem` prop alias lands the
 * function at `children` (DataGrid/DataList/Carousel consume their
 * per-item render via the React children slot — `renderItem` is a
 * documented deprecated alias the compiler would have already
 * rewritten). Lambdas under any other key keep that key.
 *
 * Pure on inputs without lambdas: returns the props object unchanged
 * by reference, so React's prop-equality memoisation isn't disturbed.
 */
export function convertFnFormLambdasInProps(
  props: Record<string, unknown>,
): Record<string, unknown> {
  return convertObjectProps(props);
}
