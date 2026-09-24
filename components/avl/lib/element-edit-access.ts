/**
 * What the host says an element on the canvas lets the user change. The host
 * knows the language (an embedded behavior's knobs, data bindings, topology an
 * atom owns); the canvas only asks. With no host answer every prop is
 * editable — an inline render-ui is the canvas's to edit.
 */
import { createContext } from 'react';
import type { EditFocus } from '@almadar/core';

export type ElementPropAccess =
  | { editable: true }
  | { editable: false; reason: 'bound' | 'fixed' | 'loading'; detail: string };

export interface ElementEditAccess {
  prop: (name: string) => ElementPropAccess;
  /** The behavior an embedded element belongs to — shown as "Part of <behavior>". */
  partOf?: string;
}

export type ElementEditAccessResolver = (focus: EditFocus) => ElementEditAccess;

export const EDITABLE: ElementPropAccess = { editable: true };

export const ElementEditAccessContext = createContext<ElementEditAccessResolver | null>(null);

/** A prop's access at the element, editable when the host gives no answer. */
export function propAccessAt(
  resolver: ElementEditAccessResolver | null,
  focus: EditFocus | null | undefined,
  prop: string,
): ElementPropAccess {
  if (!resolver || !focus) return EDITABLE;
  return resolver(focus).prop(prop);
}
