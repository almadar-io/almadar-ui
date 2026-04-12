/**
 * CodeBlock Molecule Component
 *
 * A syntax-highlighted code block with copy-to-clipboard functionality.
 * Preserves scroll position during re-renders.
 *
 * Event Contract:
 * - Emits: UI:COPY_CODE { language, success }
 */

import React, { useState, useRef, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';
// GAP-78: explicit `.js` extensions on every react-syntax-highlighter deep
// import. The package ships ESM files with no `package.json#exports` map and
// no implicit-extension resolution, so Node ESM (used by vitest's externalized
// loader) can't resolve `.../prism-light` without the extension. Vite/dev mode
// handles it via legacy directory resolution but vitest doesn't. Adding the
// extensions here makes both code paths work.
// @ts-expect-error — @types/react-syntax-highlighter declares the module
// without the `.js` suffix; the JS resolution succeeds either way.
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light.js';
// @ts-expect-error — same as above for the styles module.
import dark from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js';
import { orbLanguage, loloLanguage, ORB_COLORS } from '@almadar/syntax';
import { Copy, Check } from 'lucide-react';

// PrismLight requires explicit language registration.
// Import common languages used in markdown code blocks.
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langJson from 'react-syntax-highlighter/dist/esm/languages/prism/json.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langJavascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langTypescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langJsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langTsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langCss from 'react-syntax-highlighter/dist/esm/languages/prism/css.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langMarkdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langBash from 'react-syntax-highlighter/dist/esm/languages/prism/bash.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langYaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langRust from 'react-syntax-highlighter/dist/esm/languages/prism/rust.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langPython from 'react-syntax-highlighter/dist/esm/languages/prism/python.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langSql from 'react-syntax-highlighter/dist/esm/languages/prism/sql.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langDiff from 'react-syntax-highlighter/dist/esm/languages/prism/diff.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langToml from 'react-syntax-highlighter/dist/esm/languages/prism/toml.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langGo from 'react-syntax-highlighter/dist/esm/languages/prism/go.js';
// @ts-expect-error — language modules are untyped at the deep `.js` path.
import langGraphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql.js';

// Register built-in languages
SyntaxHighlighter.registerLanguage('json', langJson);
SyntaxHighlighter.registerLanguage('javascript', langJavascript);
SyntaxHighlighter.registerLanguage('js', langJavascript);
SyntaxHighlighter.registerLanguage('typescript', langTypescript);
SyntaxHighlighter.registerLanguage('ts', langTypescript);
SyntaxHighlighter.registerLanguage('jsx', langJsx);
SyntaxHighlighter.registerLanguage('tsx', langTsx);
SyntaxHighlighter.registerLanguage('css', langCss);
SyntaxHighlighter.registerLanguage('markdown', langMarkdown);
SyntaxHighlighter.registerLanguage('md', langMarkdown);
SyntaxHighlighter.registerLanguage('bash', langBash);
SyntaxHighlighter.registerLanguage('shell', langBash);
SyntaxHighlighter.registerLanguage('sh', langBash);
SyntaxHighlighter.registerLanguage('yaml', langYaml);
SyntaxHighlighter.registerLanguage('yml', langYaml);
SyntaxHighlighter.registerLanguage('rust', langRust);
SyntaxHighlighter.registerLanguage('python', langPython);
SyntaxHighlighter.registerLanguage('py', langPython);
SyntaxHighlighter.registerLanguage('sql', langSql);
SyntaxHighlighter.registerLanguage('diff', langDiff);
SyntaxHighlighter.registerLanguage('toml', langToml);
SyntaxHighlighter.registerLanguage('go', langGo);
SyntaxHighlighter.registerLanguage('graphql', langGraphql);

// Register .orb and .lolo languages from @almadar/syntax (refractor-compatible)
SyntaxHighlighter.registerLanguage('orb', orbLanguage);
SyntaxHighlighter.registerLanguage('lolo', loloLanguage);

// AVL-aligned style overrides for .orb token classes
const orbStyleOverrides: Record<string, React.CSSProperties> = {
  'orb-binding':     { color: ORB_COLORS.dark.binding, fontWeight: 'bold' },
  'orb-effect':      { color: ORB_COLORS.dark.effect, fontWeight: 'bold' },
  'orb-event':       { color: ORB_COLORS.dark.event },
  'orb-slot':        { color: ORB_COLORS.dark.uiSlot },
  'orb-structural':  { color: ORB_COLORS.dark.structural },
  'orb-field-type':  { color: ORB_COLORS.dark.fieldType },
  'orb-persistence': { color: ORB_COLORS.dark.persistence },
  'orb-pattern':     { color: ORB_COLORS.dark.pattern },
  'orb-behavior':    { color: ORB_COLORS.dark.behavior },
  'orb-unknown-op':  { color: ORB_COLORS.dark.error, textDecoration: 'wavy underline' },
  'orb-op-arithmetic': { color: ORB_COLORS.dark.arithmetic, fontWeight: 'bold' },
  'orb-op-comparison': { color: ORB_COLORS.dark.comparison },
  'orb-op-logic':    { color: ORB_COLORS.dark.logic },
  'orb-op-string':   { color: ORB_COLORS.dark.string },
  'orb-op-collection': { color: ORB_COLORS.dark.collection },
  'orb-op-time':     { color: ORB_COLORS.dark.time },
  'orb-op-control':  { color: ORB_COLORS.dark.control },
  'orb-op-async':    { color: ORB_COLORS.dark.async },
};

const orbStyle: Record<string, React.CSSProperties> = { ...dark, ...orbStyleOverrides };

// AVL-aligned style overrides for .lolo token classes (Haskell-inspired palette)
const loloStyleOverrides: Record<string, React.CSSProperties> = {
  'lolo-binding':       { color: ORB_COLORS.dark.binding, fontWeight: 'bold' },
  'lolo-event':         { color: ORB_COLORS.dark.event },
  'lolo-effect':        { color: ORB_COLORS.dark.effect, fontWeight: 'bold' },
  'keyword':            { color: ORB_COLORS.dark.loloKeyword },
  'lolo-constructor':   { color: ORB_COLORS.dark.loloConstructor },
  'lolo-arrow':         { color: ORB_COLORS.dark.loloArrow },
  'lolo-reference':     { color: ORB_COLORS.dark.loloReference },
  'lolo-type':          { color: ORB_COLORS.dark.fieldType },
  'lolo-persistence':   { color: ORB_COLORS.dark.persistence },
  'lolo-unknown-op':    { color: ORB_COLORS.dark.error },
  'lolo-op-arithmetic': { color: ORB_COLORS.dark.arithmetic, fontWeight: 'bold' },
  'lolo-op-comparison': { color: ORB_COLORS.dark.comparison },
  'lolo-op-logic':      { color: ORB_COLORS.dark.logic },
  'lolo-op-string':     { color: ORB_COLORS.dark.string },
  'lolo-op-collection': { color: ORB_COLORS.dark.collection },
  'lolo-op-time':       { color: ORB_COLORS.dark.time },
  'lolo-op-control':    { color: ORB_COLORS.dark.control },
  'lolo-op-async':      { color: ORB_COLORS.dark.async },
};
const loloStyle: Record<string, React.CSSProperties> = { ...dark, ...loloStyleOverrides };

// ── Fold region computation ──────────────────────────────────────────

interface FoldRegion {
  start: number;
  end: number;
  closeBracket: string;
}

/** Find matching bracket pairs that span multiple lines (respects JSON strings). */
function computeFoldRegions(code: string): FoldRegion[] {
  const lines = code.split('\n');
  const regions: FoldRegion[] = [];
  const stack: { line: number; bracket: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let inString = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '\\' && inString) { j++; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{' || ch === '[') {
        stack.push({ line: i, bracket: ch });
      } else if (ch === '}' || ch === ']') {
        const open = stack.pop();
        if (open && open.line < i) {
          regions.push({
            start: open.line,
            end: i,
            closeBracket: ch,
          });
        }
      }
    }
  }
  return regions.sort((a, b) => a.start - b.start);
}

import { Box } from '../../atoms/Box';
import { Button } from '../../atoms/Button';
import { Badge } from '../../atoms/Badge';
import { HStack } from '../../atoms/Stack';
import { Textarea } from '../../atoms/Textarea';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';

export interface CodeBlockProps {
  /** The code content to display */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Show the copy button */
  showCopyButton?: boolean;
  /** Show the language badge */
  showLanguageBadge?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: string;
  /** Enable JSON-style code folding (default: true for json/orb) */
  foldable?: boolean;
  /** Additional CSS classes */
  className?: string;
  /**
   * When true, render an editable surface that composes a transparent `Textarea`
   * over a Prism-highlighted overlay. The overlay re-tokenizes on each keystroke
   * (driven from a local mirror of the textarea value), so users see syntax-highlighted
   * code while still being able to type. Folding is skipped in editable mode.
   *
   * History: GAP-51 first-cut shipped plain (no-highlighting) editable text;
   * GAP-77 (2026-04-12) added the Prism overlay layer.
   *
   * Default: false (existing read-only behavior unchanged).
   */
  editable?: boolean;
  /**
   * GAP-51: called with the new code on every keystroke when `editable === true`.
   * Consumers should debounce + parse downstream — `CodeBlock` does not.
   */
  onChange?: (code: string) => void;
  /**
   * GAP-80: line-level error/warning highlights for editable mode.
   * Map of 1-based line number → severity. The overlay paints a colored
   * background on each line: error = red, warning = yellow. Pass undefined
   * (default) to disable. The consumer is responsible for computing the
   * path → line map from the schema + validation results.
   */
  errorLines?: Map<number, 'error' | 'warning'>;
}

// Stable lineProps function (never changes, safe for memoized element)
const LINE_PROPS_FN = (n: number): React.HTMLProps<HTMLElement> => ({ 'data-line': String(n - 1) } as React.HTMLProps<HTMLElement>);
const HIDDEN_LINE_NUMBERS: React.CSSProperties = { display: 'none' };

export const CodeBlock = React.memo<CodeBlockProps>(
  ({
    code: rawCode,
    language = 'text',
    showCopyButton = true,
    showLanguageBadge = true,
    maxHeight = '60vh',
    foldable: foldableProp,
    className,
    editable = false,
    onChange,
    errorLines,
  }) => {
    const code = typeof rawCode === 'string' ? rawCode : String(rawCode ?? '');
    const isOrb = language === 'orb';
    const isLolo = language === 'lolo';
    const activeStyle = isOrb ? orbStyle : isLolo ? loloStyle : dark;
    const eventBus = useEventBus();
    const { t: _t } = useTranslate();
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const codeRef = useRef<HTMLDivElement | null>(null);
    const savedScrollLeftRef = useRef<number>(0);
    const [copied, setCopied] = useState(false);

    // ── Editable mode (GAP-77): Prism overlay under transparent textarea ──
    // `editableValue` mirrors the textarea contents so the overlay re-renders
    // on each keystroke. Textarea stays uncontrolled (defaultValue + key) to
    // avoid cursor jumps caused by parent debounce + re-stringify round trips.
    // `lastPropCodeRef` distinguishes "user typed" (overlay updates only) from
    // "parent gave us a new code prop" (re-mount textarea + reset overlay).
    const [editableValue, setEditableValue] = useState(code);
    const [editableTextareaKey, setEditableTextareaKey] = useState(0);
    const lastPropCodeRef = useRef(code);
    const editableTextareaRef = useRef<HTMLTextAreaElement | null>(null);
    const editableOverlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (code !== lastPropCodeRef.current) {
        lastPropCodeRef.current = code;
        setEditableValue(code);
        setEditableTextareaKey((k) => k + 1);
      }
    }, [code]);

    const handleEditableScroll = useCallback(() => {
      const ta = editableTextareaRef.current;
      const ov = editableOverlayRef.current;
      if (ta && ov) {
        ov.scrollTop = ta.scrollTop;
        ov.scrollLeft = ta.scrollLeft;
      }
    }, []);

    // GAP-80: line-level error highlights. SyntaxHighlighter calls this for
    // each line when `wrapLines` is true; we paint a colored background per
    // severity. Memoized so its identity is stable across renders.
    const errorLineProps = useMemo(() => {
      if (!errorLines || errorLines.size === 0) {
        return LINE_PROPS_FN;
      }
      return (lineNumber: number): React.HTMLProps<HTMLElement> => {
        const severity = errorLines.get(lineNumber);
        if (!severity) {
          return { 'data-line': String(lineNumber - 1) } as React.HTMLProps<HTMLElement>;
        }
        return {
          'data-line': String(lineNumber - 1),
          style: {
            display: 'block',
            backgroundColor: severity === 'error'
              ? 'rgba(248, 113, 113, 0.18)'  // red-400 @ 18%
              : 'rgba(251, 191, 36, 0.18)',  // amber-400 @ 18%
            borderLeft: `3px solid ${severity === 'error' ? '#ef4444' : '#f59e0b'}`,
            paddingLeft: '0.5rem',
            marginLeft: '-0.5rem',
          },
        } as React.HTMLProps<HTMLElement>;
      };
    }, [errorLines]);

    // ── Fold state ──
    const isFoldable = foldableProp ?? (language === 'orb' || language === 'json');
    const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());

    const foldRegions = useMemo(
      () => (isFoldable ? computeFoldRegions(code) : []),
      [code, isFoldable],
    );
    const foldStartMap = useMemo(() => {
      const m = new Map<number, FoldRegion>();
      for (const r of foldRegions) m.set(r.start, r);
      return m;
    }, [foldRegions]);

    const hiddenLines = useMemo(() => {
      const h = new Set<number>();
      for (const r of foldRegions) {
        if (!collapsed.has(r.start)) continue;
        for (let i = r.start + 1; i <= r.end; i++) h.add(i);
      }
      return h;
    }, [foldRegions, collapsed]);

    // Keep refs current so DOM click handlers can read latest state
    const collapsedRef = useRef(collapsed);
    collapsedRef.current = collapsed;
    const foldStartMapRef = useRef(foldStartMap);
    foldStartMapRef.current = foldStartMap;

    const toggleFold = useCallback((lineNum: number) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(lineNum)) next.delete(lineNum);
        else next.add(lineNum);
        return next;
      });
    }, []);
    const toggleFoldRef = useRef(toggleFold);
    toggleFoldRef.current = toggleFold;

    useEffect(() => { setCollapsed(new Set()); }, [code]);

    // ── Memoized highlight (never re-tokenizes on fold toggle) ──
    // showLineNumbers + showInlineLineNumbers=false gives proper data-line
    // without rendering inline numbers. lineNumberContainerStyle hides the gutter.
    const highlightedElement = useMemo(
      () => (
        <SyntaxHighlighter
          PreTag="div"
          language={language}
          style={activeStyle}
          wrapLines
          showLineNumbers
          showInlineLineNumbers={false}
          lineNumberContainerStyle={HIDDEN_LINE_NUMBERS}
          lineProps={LINE_PROPS_FN}
          customStyle={{
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            margin: 0,
            whiteSpace: 'pre',
            minWidth: '100%',
          }}
        >
          {code}
        </SyntaxHighlighter>
      ),
      [code, language, activeStyle],
    );

    // ── DOM-level fold UI (no re-tokenization, just style + element injection) ──
    useLayoutEffect(() => {
      const container = codeRef.current;
      if (!container) return;

      // Clean previous fold UI
      container.querySelectorAll('.fold-toggle, .fold-summary').forEach((el) => el.remove());

      // Reset all line styles
      const lineEls = container.querySelectorAll<HTMLElement>('[data-line]');
      if (!isFoldable || foldRegions.length === 0) {
        lineEls.forEach((el) => { el.style.display = ''; el.style.position = ''; el.style.paddingLeft = ''; });
        return;
      }

      // Uniform left padding on ALL lines for aligned fold gutter
      lineEls.forEach((el) => {
        const num = parseInt(el.getAttribute('data-line') ?? '-1', 10);

        if (hiddenLines.has(num)) {
          el.style.display = 'none';
          return;
        }

        el.style.display = '';
        el.style.position = 'relative';
        el.style.paddingLeft = '1.2em';

        const region = foldStartMap.get(num);
        if (!region) return;

        const isCollapsed = collapsed.has(num);

        // Fold toggle — positioned in the left padding area
        const toggle = document.createElement('span');
        toggle.className = 'fold-toggle';
        toggle.textContent = isCollapsed ? '▶' : '▼';
        toggle.style.cssText =
          'position:absolute;left:0;top:0;width:1.2em;text-align:center;' +
          'cursor:pointer;color:#858585;font-size:10px;user-select:none;' +
          'line-height:inherit;height:100%';
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleFoldRef.current(num);
        });
        el.insertBefore(toggle, el.firstChild);

        // Fold summary for collapsed regions
        if (isCollapsed) {
          const summary = document.createElement('span');
          summary.className = 'fold-summary';
          summary.style.cssText = 'color:#858585;font-style:italic';
          const count = region.end - region.start - 1;
          summary.textContent = ` ... ${count} line${count !== 1 ? 's' : ''} ${region.closeBracket}`;
          el.appendChild(summary);
        }
      });
    }, [collapsed, hiddenLines, foldStartMap, foldRegions, isFoldable]);

    // Save scrollLeft before updates
    useLayoutEffect(() => {
      const el = scrollRef.current;
      return () => { if (el) savedScrollLeftRef.current = el.scrollLeft; };
    }, [language, code]);

    // Restore scrollLeft after updates
    useLayoutEffect(() => {
      const el = scrollRef.current;
      if (el) el.scrollLeft = savedScrollLeftRef.current;
    }, [language, code]);

    // Native scroll listener to keep position updated
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const handle = () => { savedScrollLeftRef.current = el.scrollLeft; };
      el.addEventListener('scroll', handle, { passive: true });
      return () => el.removeEventListener('scroll', handle);
    }, [language, code]);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        eventBus.emit('UI:COPY_CODE', { language, success: true });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
        eventBus.emit('UI:COPY_CODE', { language, success: false });
      }
    };

    const hasHeader = showLanguageBadge || showCopyButton;

    return (
      <Box className={`relative group ${className || ''}`}>
        {hasHeader && (
          <HStack
            justify="between"
            align="center"
            className="px-3 py-2 bg-[var(--color-card)] rounded-t-lg border-b border-gray-700"
          >
            {showLanguageBadge && (
              <Badge variant="default" size="sm">
                {language}
              </Badge>
            )}
            {showCopyButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-white"
                aria-label="Copy code"
              >
                {copied ? (
                  <Check size={16} className="text-green-400" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            )}
          </HStack>
        )}

        {/* Code content */}
        {editable ? (
          /* GAP-77 / GAP-82 / GAP-83: editable mode = transparent textarea on
             top of a Prism-highlighted SyntaxHighlighter overlay.

             Layout: BOTH children are `position: absolute, inset: 0` so neither
             contributes to flow. The parent Box has `height: 100%` so it fills
             whatever container the consumer provides (the consumer is
             responsible for giving the parent a real height — usually via flex
             column with `minHeight: 0`).

             Stacking: the overlay is FIRST in DOM order so it paints first
             (behind), the textarea is SECOND so it paints second (on top). No
             explicit z-index — DOM order alone determines stacking inside the
             parent's stacking context. The textarea has `color: transparent`
             plus `WebkitTextFillColor: transparent` (Safari) so its glyphs
             never paint, but the caret stays visible via `caretColor`.

             Scroll sync: textarea scrolls naturally; `handleEditableScroll`
             mirrors its scrollTop/scrollLeft onto the overlay div so the
             highlighted spans stay aligned with the textarea content.

             Error highlights (GAP-80): `errorLines` prop accepts a Map of
             1-based line numbers → severity. The overlay's SyntaxHighlighter
             uses `wrapLines` + `lineProps` to paint a colored background on
             those lines. */
          <Box
            style={{
              position: 'relative',
              height: '100%',
              minHeight: '160px',
              maxHeight,
              backgroundColor: '#1e1e1e',
              borderRadius: hasHeader ? '0 0 0.5rem 0.5rem' : '0.5rem',
              overflow: 'hidden',
            }}
          >
            <div
              ref={editableOverlayRef}
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <SyntaxHighlighter
                PreTag="div"
                language={language}
                style={activeStyle}
                wrapLines={errorLines && errorLines.size > 0}
                lineProps={errorLineProps}
                customStyle={{
                  backgroundColor: 'transparent',
                  borderRadius: 0,
                  padding: '1rem',
                  margin: 0,
                  whiteSpace: 'pre',
                  minWidth: '100%',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Courier New", monospace',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Courier New", monospace',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  },
                }}
              >
                {editableValue || ' '}
              </SyntaxHighlighter>
            </div>
            <Textarea
              key={editableTextareaKey}
              ref={editableTextareaRef}
              defaultValue={code}
              onChange={(e) => {
                setEditableValue(e.target.value);
                onChange?.(e.target.value);
              }}
              onScroll={handleEditableScroll}
              spellCheck={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: '1rem',
                margin: 0,
                border: 'none',
                outline: 'none',
                resize: 'none',
                backgroundColor: 'transparent',
                color: 'transparent',
                caretColor: '#e6e6e6',
                WebkitTextFillColor: 'transparent',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Mono", "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflow: 'auto',
              }}
            />
          </Box>
        ) : (
          <div
            ref={scrollRef}
            style={{
              overflowX: 'auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              maxHeight,
              overscrollBehavior: 'auto',
              touchAction: 'pan-x pan-y',
              contain: 'paint',
              backgroundColor: '#1e1e1e',
              borderRadius: hasHeader ? '0 0 0.5rem 0.5rem' : '0.5rem',
            }}
          >
            <div ref={codeRef} style={{ padding: '1rem' }}>
              {highlightedElement}
            </div>
          </div>
        )}
      </Box>
    );
  },
  (prev, next) =>
    prev.language === next.language &&
    prev.code === next.code &&
    prev.showCopyButton === next.showCopyButton &&
    prev.maxHeight === next.maxHeight &&
    prev.foldable === next.foldable &&
    prev.editable === next.editable &&
    prev.onChange === next.onChange &&
    prev.errorLines === next.errorLines,
);

CodeBlock.displayName = 'CodeBlock';
