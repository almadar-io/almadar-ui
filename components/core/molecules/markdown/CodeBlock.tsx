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
import { cn } from '../../../../lib/cn';
import { Card, Typography } from '../../atoms/index';
import { Tabs, type TabItem } from '../Tabs';
import { LoadingState } from '../LoadingState';
import { ErrorState } from '../ErrorState';
import { EmptyState } from '../EmptyState';
import { Copy, Check, FileText, Code as CodeIcon, WrapText } from 'lucide-react';
import type { UiError } from '../../atoms/types';
// GAP-78: explicit `.js` extensions on every react-syntax-highlighter deep
// import. The package ships ESM files with no `package.json#exports` map and
// no implicit-extension resolution, so Node ESM (used by vitest's externalized
// loader) can't resolve `.../prism-light` without the extension. Vite/dev mode
// handles it via legacy directory resolution but vitest doesn't. Adding the
// extensions here makes both code paths work.
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light.js';
import dark from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus.js';
import { orbLanguage, loloLanguage, ORB_COLORS } from '@almadar/syntax';

// PrismLight requires explicit language registration.
// Import common languages used in markdown code blocks.
import langJson from 'react-syntax-highlighter/dist/esm/languages/prism/json.js';
import langJavascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript.js';
import langTypescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript.js';
import langJsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx.js';
import langTsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx.js';
import langCss from 'react-syntax-highlighter/dist/esm/languages/prism/css.js';
import langMarkdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown.js';
import langBash from 'react-syntax-highlighter/dist/esm/languages/prism/bash.js';
import langYaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml.js';
import langRust from 'react-syntax-highlighter/dist/esm/languages/prism/rust.js';
import langPython from 'react-syntax-highlighter/dist/esm/languages/prism/python.js';
import langSql from 'react-syntax-highlighter/dist/esm/languages/prism/sql.js';
import langDiff from 'react-syntax-highlighter/dist/esm/languages/prism/diff.js';
import langToml from 'react-syntax-highlighter/dist/esm/languages/prism/toml.js';
import langGo from 'react-syntax-highlighter/dist/esm/languages/prism/go.js';
import langGraphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql.js';
// Common languages used in lessons (statically bundled for reliable highlighting;
// the dynamic loader covers the long tail on demand).
import langClojure from 'react-syntax-highlighter/dist/esm/languages/prism/clojure.js';
import langHaskell from 'react-syntax-highlighter/dist/esm/languages/prism/haskell.js';
import langLisp from 'react-syntax-highlighter/dist/esm/languages/prism/lisp.js';
import langScheme from 'react-syntax-highlighter/dist/esm/languages/prism/scheme.js';
import langScala from 'react-syntax-highlighter/dist/esm/languages/prism/scala.js';
import langElixir from 'react-syntax-highlighter/dist/esm/languages/prism/elixir.js';
import langErlang from 'react-syntax-highlighter/dist/esm/languages/prism/erlang.js';
import langElm from 'react-syntax-highlighter/dist/esm/languages/prism/elm.js';
import langFsharp from 'react-syntax-highlighter/dist/esm/languages/prism/fsharp.js';
import langOcaml from 'react-syntax-highlighter/dist/esm/languages/prism/ocaml.js';
import langJava from 'react-syntax-highlighter/dist/esm/languages/prism/java.js';
import langC from 'react-syntax-highlighter/dist/esm/languages/prism/c.js';
import langCpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp.js';
import langCsharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp.js';
import langObjectivec from 'react-syntax-highlighter/dist/esm/languages/prism/objectivec.js';
import langPhp from 'react-syntax-highlighter/dist/esm/languages/prism/php.js';
import langRuby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby.js';
import langSwift from 'react-syntax-highlighter/dist/esm/languages/prism/swift.js';
import langKotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin.js';
import langLua from 'react-syntax-highlighter/dist/esm/languages/prism/lua.js';
import langR from 'react-syntax-highlighter/dist/esm/languages/prism/r.js';
import langDart from 'react-syntax-highlighter/dist/esm/languages/prism/dart.js';
import langJulia from 'react-syntax-highlighter/dist/esm/languages/prism/julia.js';
import langFortran from 'react-syntax-highlighter/dist/esm/languages/prism/fortran.js';
import langPerl from 'react-syntax-highlighter/dist/esm/languages/prism/perl.js';
import langPowershell from 'react-syntax-highlighter/dist/esm/languages/prism/powershell.js';
import langMakefile from 'react-syntax-highlighter/dist/esm/languages/prism/makefile.js';
import langNginx from 'react-syntax-highlighter/dist/esm/languages/prism/nginx.js';
import langIni from 'react-syntax-highlighter/dist/esm/languages/prism/ini.js';

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
SyntaxHighlighter.registerLanguage('clojure', langClojure);
SyntaxHighlighter.registerLanguage('clj', langClojure);
SyntaxHighlighter.registerLanguage('edn', langClojure);
SyntaxHighlighter.registerLanguage('haskell', langHaskell);
SyntaxHighlighter.registerLanguage('hs', langHaskell);
SyntaxHighlighter.registerLanguage('lisp', langLisp);
SyntaxHighlighter.registerLanguage('scheme', langScheme);
SyntaxHighlighter.registerLanguage('scala', langScala);
SyntaxHighlighter.registerLanguage('elixir', langElixir);
SyntaxHighlighter.registerLanguage('ex', langElixir);
SyntaxHighlighter.registerLanguage('exs', langElixir);
SyntaxHighlighter.registerLanguage('erlang', langErlang);
SyntaxHighlighter.registerLanguage('erl', langErlang);
SyntaxHighlighter.registerLanguage('elm', langElm);
SyntaxHighlighter.registerLanguage('fsharp', langFsharp);
SyntaxHighlighter.registerLanguage('fs', langFsharp);
SyntaxHighlighter.registerLanguage('fsx', langFsharp);
SyntaxHighlighter.registerLanguage('ocaml', langOcaml);
SyntaxHighlighter.registerLanguage('ml', langOcaml);
SyntaxHighlighter.registerLanguage('java', langJava);
SyntaxHighlighter.registerLanguage('c', langC);
SyntaxHighlighter.registerLanguage('cpp', langCpp);
SyntaxHighlighter.registerLanguage('c++', langCpp);
SyntaxHighlighter.registerLanguage('cc', langCpp);
SyntaxHighlighter.registerLanguage('cxx', langCpp);
SyntaxHighlighter.registerLanguage('hpp', langCpp);
SyntaxHighlighter.registerLanguage('h', langCpp);
SyntaxHighlighter.registerLanguage('csharp', langCsharp);
SyntaxHighlighter.registerLanguage('cs', langCsharp);
SyntaxHighlighter.registerLanguage('objectivec', langObjectivec);
SyntaxHighlighter.registerLanguage('objc', langObjectivec);
SyntaxHighlighter.registerLanguage('php', langPhp);
SyntaxHighlighter.registerLanguage('ruby', langRuby);
SyntaxHighlighter.registerLanguage('rb', langRuby);
SyntaxHighlighter.registerLanguage('swift', langSwift);
SyntaxHighlighter.registerLanguage('kotlin', langKotlin);
SyntaxHighlighter.registerLanguage('kt', langKotlin);
SyntaxHighlighter.registerLanguage('lua', langLua);
SyntaxHighlighter.registerLanguage('r', langR);
SyntaxHighlighter.registerLanguage('dart', langDart);
SyntaxHighlighter.registerLanguage('julia', langJulia);
SyntaxHighlighter.registerLanguage('fortran', langFortran);
SyntaxHighlighter.registerLanguage('f90', langFortran);
SyntaxHighlighter.registerLanguage('f95', langFortran);
SyntaxHighlighter.registerLanguage('perl', langPerl);
SyntaxHighlighter.registerLanguage('pl', langPerl);
SyntaxHighlighter.registerLanguage('powershell', langPowershell);
SyntaxHighlighter.registerLanguage('ps1', langPowershell);
SyntaxHighlighter.registerLanguage('makefile', langMakefile);
SyntaxHighlighter.registerLanguage('make', langMakefile);
SyntaxHighlighter.registerLanguage('nginx', langNginx);
SyntaxHighlighter.registerLanguage('ini', langIni);

// Register .orb and .lolo languages from @almadar/syntax (refractor-compatible)
SyntaxHighlighter.registerLanguage('orb', orbLanguage);
SyntaxHighlighter.registerLanguage('lolo', loloLanguage);

// ── Dynamic Prism language loading ───────────────────────────────────────────
// Any language outside the static set above is fetched on demand. Because
// `@almadar/ui` is pre-bundled by the consumer's bundler, a template-literal
// dynamic import here would not be code-split — so the loader is injected from
// app source (where the bundler can split each grammar into its own lazy chunk)
// via `registerCodeLanguageLoader`. Apps call it once at bootstrap.
const dynamicallyLoaded = new Set<string>();

/** A PrismLight grammar module's default export: a function that registers
 *  token definitions on the Prism/refractor instance passed to it. */
export type PrismLanguageGrammar = (prism: object) => void;

/** A consumer-supplied async grammar fetcher. Returns the language module
 *  default (registered with PrismLight), or `null` if no grammar exists. */
export type CodeLanguageLoader = (lang: string) => Promise<PrismLanguageGrammar | null>;

let codeLanguageLoader: CodeLanguageLoader | null = null;

/** Wire up a dynamic language-grammar loader. Must be called from app source
 *  (not a pre-bundled dependency) so the bundler can split grammars into chunks. */
export function registerCodeLanguageLoader(loader: CodeLanguageLoader | null): void {
  codeLanguageLoader = loader;
}

function isLanguageRegistered(lang: string): boolean {
  return CODE_LANGUAGE_SET.has(lang) || dynamicallyLoaded.has(lang);
}

async function loadPrismLanguage(lang: string): Promise<void> {
  if (isLanguageRegistered(lang)) return;
  try {
    const grammar = codeLanguageLoader ? await codeLanguageLoader(lang) : null;
    if (grammar) SyntaxHighlighter.registerLanguage(lang, grammar);
    dynamicallyLoaded.add(lang);
  } catch {
    dynamicallyLoaded.add(lang);
  }
}

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
import { Icon } from '../../atoms/Icon';
import { useEventBus } from '../../../../hooks/useEventBus';
import { useTranslate } from '../../../../hooks/useTranslate';
import { createLogger } from '@almadar/logger';

const log = createLogger('almadar:ui:markdown-code');

/**
 * The set of languages with a registered PrismLight grammar (above) plus the
 * `.orb`/`.lolo` grammars from `@almadar/syntax`. Authoritative: an unregistered
 * value renders as plain text, so this union mirrors the `registerLanguage`
 * calls exactly.
 */
export const CODE_LANGUAGES = [
  'text',
  'json',
  'javascript',
  'js',
  'typescript',
  'ts',
  'jsx',
  'tsx',
  'css',
  'markdown',
  'md',
  'bash',
  'shell',
  'sh',
  'yaml',
  'yml',
  'rust',
  'python',
  'py',
  'sql',
  'diff',
  'toml',
  'go',
  'graphql',
  'html',
  'xml',
  'clojure',
  'clj',
  'edn',
  'haskell',
  'hs',
  'lisp',
  'scheme',
  'scala',
  'elixir',
  'ex',
  'exs',
  'erlang',
  'erl',
  'elm',
  'fsharp',
  'fs',
  'fsx',
  'ocaml',
  'ml',
  'java',
  'c',
  'cpp',
  'c++',
  'cc',
  'cxx',
  'hpp',
  'h',
  'csharp',
  'cs',
  'objectivec',
  'objc',
  'php',
  'ruby',
  'rb',
  'swift',
  'kotlin',
  'kt',
  'lua',
  'r',
  'dart',
  'julia',
  'fortran',
  'f90',
  'f95',
  'perl',
  'pl',
  'powershell',
  'ps1',
  'makefile',
  'make',
  'nginx',
  'ini',
  'orb',
  'lolo',
] as const;

export type CodeLanguage = (typeof CODE_LANGUAGES)[number];

const CODE_LANGUAGE_SET = new Set<string>(CODE_LANGUAGES);

/**
 * Normalize a fence info-string to a language id. Known languages pass through
 * as-is; unknown ids also pass through so they can be dynamically loaded by
 * `CodeBlock` (falling back to plain text if no Prism grammar exists).
 */
export function toCodeLanguage(value: string | undefined): string {
  if (!value) return 'text';
  return value.toLowerCase();
}

// ── Viewer types (absorbed from CodeViewer) ──────────────────────────────────

export type CodeViewerMode = 'code' | 'diff';

export interface DiffLine {
  type: 'add' | 'added' | 'remove' | 'removed' | 'context' | 'unchanged';
  content: string;
  lineNumber?: number;
}

export interface CodeViewerAction {
  label: string;
  event?: string;
  navigatesTo?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export interface CodeViewerFile {
  label: string;
  code: string;
  language?: CodeLanguage;
}

export interface CodeBlockProps {
  /** The code content to display */
  code?: string;
  /** Programming language for syntax highlighting (any Prism id; loaded on demand if not pre-registered) */
  language?: string;
  /** Show the copy button */
  showCopyButton?: boolean;
  /** Show the language badge */
  showLanguageBadge?: boolean;
  /** Maximum height before scrolling */
  maxHeight?: string | number;
  /** Enable brace-based code folding of multi-line `{}`/`[]` blocks (default: true). */
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
  // ── Viewer props (absorbed from CodeViewer / DocCodeBlock) ────────────────
  /** Title shown in the toolbar */
  title?: string;
  /** Diff or plain-code display mode */
  mode?: CodeViewerMode;
  /** Pre-computed diff lines */
  diff?: readonly DiffLine[];
  /** Old source text — generates diff when combined with newValue */
  oldValue?: string;
  /** New source text — generates diff when combined with oldValue */
  newValue?: string;
  /** Show line numbers in code / diff mode */
  showLineNumbers?: boolean;
  /** Enable word-wrap in code / diff mode */
  wordWrap?: boolean;
  /** Multiple files shown as tabs */
  files?: readonly CodeViewerFile[];
  /** Action badges in the toolbar */
  actions?: readonly CodeViewerAction[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: UiError | null;
  /** Show copy button (viewer alias for showCopyButton) */
  showCopy?: boolean;
}

// ── Diff helpers ─────────────────────────────────────────────────────────────

function generateDiff(oldVal: string, newVal: string): DiffLine[] {
  const oldLines = oldVal.split('\n');
  const newLines = newVal.split('\n');
  const diff: DiffLine[] = [];
  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    if (oldLine === newLine) {
      diff.push({ type: 'context', content: oldLine ?? '', lineNumber: i + 1 });
    } else {
      if (oldLine !== undefined) diff.push({ type: 'remove', content: oldLine, lineNumber: i + 1 });
      if (newLine !== undefined) diff.push({ type: 'add', content: newLine, lineNumber: i + 1 });
    }
  }
  return diff;
}

const DIFF_STYLES: Record<DiffLine['type'], { bg: string; prefix: string; text: string }> = {
  add:       { bg: 'bg-success/10', prefix: '+', text: 'text-success' },
  added:     { bg: 'bg-success/10', prefix: '+', text: 'text-success' },
  remove:    { bg: 'bg-error/10',   prefix: '-', text: 'text-error' },
  removed:   { bg: 'bg-error/10',   prefix: '-', text: 'text-error' },
  context:   { bg: '',              prefix: ' ', text: 'text-foreground' },
  unchanged: { bg: '',              prefix: ' ', text: 'text-foreground' },
};
const DIFF_STYLE_FALLBACK: { bg: string; prefix: string; text: string } = { bg: '', prefix: ' ', text: 'text-foreground' };

// Stable lineProps function (never changes, safe for memoized element)
const LINE_PROPS_FN = (n: number): React.HTMLProps<HTMLElement> => ({ 'data-line': String(n - 1) } as React.HTMLProps<HTMLElement>);
const HIDDEN_LINE_NUMBERS: React.CSSProperties = { display: 'none' };

/** Loads the Prism grammar for `language` on demand; returns readiness so the
 *  highlight re-renders once the lazy chunk arrives. */
function useLanguageReady(language: string): boolean {
  const [ready, setReady] = useState(() => isLanguageRegistered(language));
  useEffect(() => {
    if (isLanguageRegistered(language)) {
      if (!ready) setReady(true);
      return;
    }
    let active = true;
    loadPrismLanguage(language).then(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [language]);
  return ready;
}

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
    // viewer props
    title,
    mode = 'code',
    diff: propDiff,
    oldValue,
    newValue,
    showLineNumbers = false,
    wordWrap = false,
    files,
    actions,
    isLoading = false,
    error,
    showCopy,
  }) => {
    const code = typeof rawCode === 'string' ? rawCode : String(rawCode ?? '');
    const isOrb = language === 'orb';
    const isLolo = language === 'lolo';
    const activeStyle = isOrb ? orbStyle : isLolo ? loloStyle : dark;
    const languageReady = useLanguageReady(language);
    const eventBus = useEventBus();
    const { t } = useTranslate();
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const codeRef = useRef<HTMLDivElement | null>(null);
    const savedScrollLeftRef = useRef<number>(0);
    const [copied, setCopied] = useState(false);

    // ── Viewer-mode state ─────────────────────────────────────────────────────
    const [wrap, setWrap] = useState(wordWrap);
    const [activeFileIndex, setActiveFileIndex] = useState(0);

    const activeFile = files?.[activeFileIndex];
    const activeCode = activeFile?.code ?? code;
    const activeLanguage: string = activeFile?.language ?? language;

    const diffLines = useMemo(() => {
      if (propDiff) return propDiff;
      if (mode === 'diff' && oldValue !== undefined && newValue !== undefined) {
        return generateDiff(oldValue, newValue);
      }
      return null;
    }, [propDiff, mode, oldValue, newValue]);

    const isViewerMode = !!(title || files || showLineNumbers || diffLines || mode === 'diff' || actions);
    const effectiveCopy = showCopy ?? showCopyButton;

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
    // Folding is brace-based (language-agnostic): any language with multi-line
    // `{}`/`[]` blocks gets collapse/expand gutters by default. Languages with
    // no such blocks yield zero fold regions, so this is a no-op for them.
    const isFoldable = foldableProp ?? true;
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
    const hiddenLinesRef = useRef(hiddenLines);
    hiddenLinesRef.current = hiddenLines;

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
      [code, language, activeStyle, languageReady],
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
        await navigator.clipboard.writeText(activeCode);
        setCopied(true);
        eventBus.emit('UI:COPY_CODE', { language: activeLanguage, success: true });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        log.error('Failed to copy code', { error: err instanceof Error ? err : String(err) });
        eventBus.emit('UI:COPY_CODE', { language: activeLanguage, success: false });
      }
    };

    // Selection-copy: when the selection spans collapsed (folded) lines, the
    // DOM only holds the `… N lines` summary plus the visible lines, so a plain
    // copy loses the folded content. Reconstruct the selected line range from
    // the original `code` (fully expanded) instead. Untouched when the range
    // has no hidden lines, so partial in-line selections copy verbatim.
    const handleSelectionCopy = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
      if (hiddenLinesRef.current.size === 0) return;
      const sel = typeof window !== 'undefined' ? window.getSelection() : null;
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
      const lineOf = (node: Node | null): number | null => {
        const start = node instanceof HTMLElement ? node : node?.parentElement ?? null;
        const lineEl = start?.closest('[data-line]') as HTMLElement | null;
        if (!lineEl) return null;
        const n = parseInt(lineEl.getAttribute('data-line') ?? '', 10);
        return Number.isNaN(n) ? null : n;
      };
      const range = sel.getRangeAt(0);
      let a = lineOf(range.startContainer);
      let b = lineOf(range.endContainer);
      // Endpoints can land on a container (e.g. select-all) rather than inside a
      // line — fall back to the min/max line the selection actually intersects.
      if (a === null || b === null) {
        const container = codeRef.current;
        if (!container) return;
        let min = Infinity, max = -Infinity;
        container.querySelectorAll('[data-line]').forEach((el) => {
          if (!sel.containsNode(el, true)) return;
          const n = parseInt(el.getAttribute('data-line') ?? '', 10);
          if (!Number.isNaN(n)) { min = Math.min(min, n); max = Math.max(max, n); }
        });
        if (min === Infinity) return;
        a = a ?? min;
        b = b ?? max;
      }
      if (a > b) [a, b] = [b, a];
      // A folded region is represented by its (visible) start line plus the
      // `… N lines` summary; the body lines are hidden below it. The selection
      // "touches" folded content if it covers a hidden line OR a collapsed
      // start line. When it does, expand the range over every collapsed region
      // it reaches (fixpoint, so nested folds are covered) and emit the
      // original — fully-expanded — slice. Otherwise leave the copy verbatim.
      let touchesFold = false;
      for (let i = a; i <= b; i++) {
        if (hiddenLinesRef.current.has(i) || (foldStartMapRef.current.has(i) && collapsedRef.current.has(i))) {
          touchesFold = true;
          break;
        }
      }
      if (!touchesFold) return;
      // Expand the end over every collapsed region the selection reaches.
      // `b` is non-null here, but reassigning it inside the closure below would
      // widen it back to `number | null` for TS — use a dedicated number local.
      let endLine = b;
      let changed = true;
      while (changed) {
        changed = false;
        foldStartMapRef.current.forEach((region, start) => {
          if (start >= a && start <= endLine && collapsedRef.current.has(start) && region.end > endLine) {
            endLine = region.end;
            changed = true;
          }
        });
      }
      const full = activeCode.split('\n').slice(a, endLine + 1).join('\n');
      e.clipboardData.setData('text/plain', full);
      e.preventDefault();
    }, [code]);

    // ── Loading / error / empty guards ───────────────────────────────────────
    if (isLoading) {
      return <LoadingState message={t('common.loading')} className={className} />;
    }
    if (error) {
      return <ErrorState title={t('display.codeViewerError')} message={error.message} className={className} />;
    }
    if (isViewerMode && !activeCode && !diffLines) {
      return <EmptyState icon={CodeIcon} title={t('display.noCode')} description="No code to display." className={className} />;
    }

    // ── Viewer mode (title / multi-file / diff / showLineNumbers) ─────────────
    if (isViewerMode) {
      const tabItems: TabItem[] | undefined = files?.map((file, idx) => ({
        id: `file-${idx}`,
        label: file.label,
        content: null,
      }));
      const lines = activeCode.split('\n');

      return (
        <Card className={cn('overflow-hidden', className)}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tabItems && tabItems.length > 1 && (
              <Box className="border-b border-border">
                <Tabs
                  tabs={tabItems}
                  activeTab={`file-${activeFileIndex}`}
                  onTabChange={(id) => {
                    const idx = parseInt(id.replace('file-', ''), 10);
                    setActiveFileIndex(idx);
                  }}
                />
              </Box>
            )}
            <HStack
              gap="sm"
              align="center"
              justify="between"
              className="px-4 py-2 border-b border-border bg-muted/30"
            >
              <HStack gap="sm" align="center">
                <Icon icon={mode === 'diff' ? FileText : CodeIcon} size="sm" className="text-muted-foreground" />
                {title && (
                  <Typography variant="small" weight="medium" className="truncate">
                    {title}
                  </Typography>
                )}
                {activeLanguage && activeLanguage !== 'text' && (
                  <Badge variant="default">{activeLanguage}</Badge>
                )}
              </HStack>
              <HStack gap="xs" align="center">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={WrapText}
                  onClick={() => setWrap(!wrap)}
                  className={cn(wrap && 'text-primary')}
                />
                {effectiveCopy && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={copied ? Check : Copy}
                    onClick={handleCopy}
                    className={cn(copied && 'text-success')}
                  />
                )}
                {actions?.map((action, idx) => (
                  <Badge
                    key={idx}
                    variant="default"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      if (action.event) eventBus.emit(`UI:${action.event}`, {});
                    }}
                  >
                    {action.label}
                  </Badge>
                ))}
              </HStack>
            </HStack>
            <Box className="overflow-auto bg-muted/20" style={{ maxHeight }}>
              {diffLines ? (
                <div style={{ display: 'flex', flexDirection: 'column' }} className="font-mono text-xs">
                  {diffLines.map((line, idx) => {
                    const style = DIFF_STYLES[line.type] ?? DIFF_STYLE_FALLBACK;
                    return (
                      <HStack key={idx} gap="none" align="start" className={cn(style.bg, 'px-4 py-0.5')}>
                        {showLineNumbers && (
                          <Typography
                            variant="caption"
                            color="secondary"
                            className="w-8 text-right mr-3 select-none tabular-nums flex-shrink-0"
                          >
                            {line.lineNumber ?? ''}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          className={cn('font-mono flex-1 min-w-0', style.text, wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre')}
                        >
                          <Box as="span" className="select-none opacity-50 mr-2">{style.prefix}</Box>
                          {line.content}
                        </Typography>
                      </HStack>
                    );
                  })}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }} className="font-mono text-xs">
                  {lines.map((line, idx) => (
                    <HStack key={idx} gap="none" align="start" className="px-4 py-0.5 hover:bg-muted/50">
                      {showLineNumbers && (
                        <Typography
                          variant="caption"
                          color="secondary"
                          className="w-8 text-right mr-4 select-none tabular-nums flex-shrink-0"
                        >
                          {idx + 1}
                        </Typography>
                      )}
                      <Typography
                        variant="caption"
                        className={cn('font-mono flex-1 min-w-0', wrap ? 'whitespace-pre-wrap break-all' : 'whitespace-pre')}
                      >
                        {line || ' '}
                      </Typography>
                    </HStack>
                  ))}
                </div>
              )}
            </Box>
          </div>
        </Card>
      );
    }

    // ── Standard PrismLight code block (original behavior) ────────────────────
    const hasHeader = showLanguageBadge || effectiveCopy;

    return (
      <Box className={`relative group ${className || ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            {effectiveCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-muted-foreground hover:text-white"
                aria-label={t('common.copy')}
              >
                {copied ? (
                  <Icon name="check" className="w-4 h-4 text-green-400" />
                ) : (
                  <Icon name="copy" className="w-4 h-4" />
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
              flex: 1,
              minHeight: 0,
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
            onCopy={handleSelectionCopy}
            style={{
              flex: 1,
              minHeight: 0,
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
    prev.showCopy === next.showCopy &&
    prev.maxHeight === next.maxHeight &&
    prev.foldable === next.foldable &&
    prev.editable === next.editable &&
    prev.onChange === next.onChange &&
    prev.errorLines === next.errorLines &&
    prev.mode === next.mode &&
    prev.title === next.title &&
    prev.diff === next.diff &&
    prev.files === next.files &&
    prev.actions === next.actions &&
    prev.isLoading === next.isLoading &&
    prev.error === next.error,
);

CodeBlock.displayName = 'CodeBlock';
