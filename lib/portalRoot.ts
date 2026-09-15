/**
 * Shared portal root — all portaled content (modals, menus, tooltips, slots)
 * mounts here so it inherits the app's data-theme instead of the host
 * document's. Kept in lib/ so UISlotRenderer and the molecules share it
 * without a circular import.
 */

/**
 * Last matching themed element in document order, excluding <html> (the host
 * shell theme) and the portal root itself (which we stamp, so reading it back
 * would freeze the theme). Compound names ("wireframe-light") are preferred
 * over simple ones ("light") which may come from the host page.
 */
function lastThemedElement(selector: string, portalRoot: HTMLElement): HTMLElement | null {
  const matches = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => el !== document.documentElement && el !== portalRoot,
  );
  return matches[matches.length - 1] ?? null;
}

export function getOrCreatePortalRoot(): HTMLElement {
  let root = document.getElementById("ui-slot-portal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "ui-slot-portal-root";
    // High z-index stacking context so portal content paints above host page
    root.style.position = "relative";
    root.style.zIndex = "9999";
    document.body.appendChild(root);
  }
  // Sync data-theme from the app-level themed element so CSS variables resolve.
  const themed =
    lastThemedElement('[data-theme*="-"]', root) ?? lastThemedElement("[data-theme]", root);
  if (themed) {
    const theme = themed.getAttribute("data-theme");
    if (theme && root.getAttribute("data-theme") !== theme) {
      root.setAttribute("data-theme", theme);
    }
  }
  return root;
}
