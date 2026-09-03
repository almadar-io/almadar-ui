/**
 * MermaidDiagram Molecule Component
 *
 * Renders a mermaid diagram from the body of a ```mermaid fenced block.
 * The mermaid library is loaded lazily on first use (a literal dynamic
 * import the consumer's bundler code-splits), so apps that never show a
 * diagram never pay for it. Invalid diagram source degrades to a
 * syntax-highlighted code block with the parse error above it.
 *
 * Event Contract:
 * - No events emitted (display-only component)
 * - entityAware: false
 *
 * NOTE: mermaid's render API returns an SVG string, so the container is
 * filled via innerHTML — the same library-boundary exception as `<iframe>`
 * in DocumentViewer and react-markdown's native-element overrides in
 * MarkdownContent. securityLevel 'strict' keeps the output sanitized.
 */

import React, { useEffect, useId, useRef, useState } from 'react';
import { Box } from '../../atoms/Box';
import { Typography } from '../../atoms/Typography';
import { CodeBlock } from './CodeBlock';
import { useTheme } from '../../../../providers/ThemeContext';
import { cn } from '../../../../lib/cn';

export interface MermaidDiagramProps {
  /** Mermaid diagram source (the fenced ```mermaid block body) */
  code: string;
  /** Additional CSS classes */
  className?: string;
}

type MermaidApi = typeof import('mermaid').default;

let mermaidModule: Promise<MermaidApi> | null = null;
function loadMermaid(): Promise<MermaidApi> {
  mermaidModule ??= import('mermaid').then((m) => m.default);
  return mermaidModule;
}

export const MermaidDiagram = React.memo<MermaidDiagramProps>(
  ({ code, className }) => {
    const { resolvedMode } = useTheme();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const reactId = useId();

    useEffect(() => {
      let active = true;
      void (async () => {
        try {
          const mermaid = await loadMermaid();
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: resolvedMode === 'dark' ? 'dark' : 'default',
          });
          // render() requires a document-unique element id; useId emits `:`
          // which is invalid inside the CSS selectors mermaid builds from it.
          const domId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
          const { svg } = await mermaid.render(domId, code);
          if (!active || !containerRef.current) return;
          containerRef.current.innerHTML = svg;
          setError(null);
        } catch (err: unknown) {
          if (active) setError(err instanceof Error ? err.message : String(err));
        }
      })();
      return () => {
        active = false;
      };
    }, [code, resolvedMode, reactId]);

    // The container stays mounted through the error state so a corrected
    // `code` prop can re-render into it (the effect writes via its ref).
    return (
      <Box className={cn('not-prose my-4', className)}>
        {error !== null && (
          <Box className="space-y-2 mb-2">
            <Typography variant="caption" className="text-error whitespace-pre-wrap">
              {error}
            </Typography>
            <CodeBlock code={code} language="mermaid" />
          </Box>
        )}
        <Box
          ref={containerRef}
          data-testid="mermaid-diagram"
          className="overflow-x-auto"
          style={error !== null ? { display: 'none' } : undefined}
        />
      </Box>
    );
  },
  (prev, next) => prev.code === next.code && prev.className === next.className,
);

MermaidDiagram.displayName = 'MermaidDiagram';
