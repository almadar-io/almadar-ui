/**
 * The attribute namespaces a layout/text primitive forwards to its element:
 * `aria-*`, `data-*`, `role` and `id` (HTML's own global-attribute contract).
 * The runtime renderer spreads schema props onto components, so anything else
 * stays off the DOM.
 */
export type DomPassthrough = Record<string, string | number | boolean | undefined>;

export function domPassthrough(props: object): DomPassthrough {
  const out: DomPassthrough = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('aria-') || key.startsWith('data-') || key === 'role' || key === 'id') {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === undefined) {
        out[key] = value;
      }
    }
  }
  return out;
}
