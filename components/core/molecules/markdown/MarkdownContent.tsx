/**
 * MarkdownContent Molecule Component
 *
 * Renders markdown content with support for GFM (GitHub Flavored Markdown)
 * and math equations (KaTeX). Handles inline code only — fenced code blocks
 * should be parsed out and rendered with CodeBlock component.
 *
 * Event Contract:
 * - No events emitted (display-only component)
 * - entityAware: false
 *
 * NOTE: react-markdown's `components` override API requires native HTML
 * elements — this is the same library-boundary exception as `<iframe>` in
 * DocumentViewer and `<svg>` in JazariStateMachine/StateMachineView.
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Box } from '../../atoms/Box';
import { CodeBlock } from './CodeBlock';
import { useTranslate } from '../../../../hooks/useTranslate';
import { cn } from '../../../../lib/cn';

export interface MarkdownContentProps {
  /** The markdown content to render */
  content: string;
  /** Text direction */
  direction?: 'rtl' | 'ltr';
  /** Additional CSS classes */
  className?: string;
}

export const MarkdownContent = React.memo<MarkdownContentProps>(
  ({ content, direction, className }) => {
    const { t: _t } = useTranslate();
    const safeContent = typeof content === 'string' ? content : String(content ?? '');
    return (
      <Box
        className={cn('prose max-w-none', className)}
        style={{
          color: 'var(--color-foreground)',
          '--tw-prose-body': 'var(--color-foreground)',
          '--tw-prose-headings': 'var(--color-foreground)',
          '--tw-prose-lead': 'var(--color-muted-foreground)',
          '--tw-prose-links': 'var(--color-primary)',
          '--tw-prose-bold': 'var(--color-foreground)',
          '--tw-prose-counters': 'var(--color-muted-foreground)',
          '--tw-prose-bullets': 'var(--color-muted-foreground)',
          '--tw-prose-hr': 'var(--color-border)',
          '--tw-prose-quotes': 'var(--color-foreground)',
          '--tw-prose-quote-borders': 'var(--color-primary)',
          '--tw-prose-captions': 'var(--color-muted-foreground)',
          '--tw-prose-code': 'var(--color-foreground)',
          '--tw-prose-pre-code': 'var(--color-foreground)',
          '--tw-prose-pre-bg': 'var(--color-muted)',
          '--tw-prose-th-borders': 'var(--color-border)',
          '--tw-prose-td-borders': 'var(--color-border)',
          direction,
        } as React.CSSProperties}
      >
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[
            [rehypeKatex, { strict: false, throwOnError: false }],
          ]}
          components={{
            code({
              className: codeClassName,
              children,
              inline,
              ...props
            }: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean }) {
              if (!inline) {
                const match = /language-(\w+)/.exec(codeClassName ?? '');
                const code = String(children).replace(/\n$/, '');
                // Fenced block with a language — render with CodeBlock for syntax highlighting
                if (match) {
                  return (
                    <CodeBlock
                      code={code}
                      language={match[1]}
                      maxHeight="60vh"
                    />
                  );
                }
                // Indented block without language — plain styled pre, no header
                return (
                  <pre
                    style={{
                      backgroundColor: 'var(--color-muted)',
                      color: 'var(--color-foreground)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      overflow: 'auto',
                      margin: 0,
                    }}
                  >
                    <code
                      {...props}
                      className={codeClassName}
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: '0.875em',
                      }}
                    >
                      {children}
                    </code>
                  </pre>
                );
              }
              // Inline code
              return (
                <code
                  {...props}
                  className={codeClassName}
                  style={{
                    backgroundColor: 'var(--color-muted)',
                    color: 'var(--color-foreground)',
                    border: '1px solid var(--color-border)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.875em',
                    fontFamily: 'ui-monospace, monospace',
                  }}
                >
                  {children}
                </code>
              );
            },
            // Style links
            a({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) {
              return (
                <a
                  href={href}
                  {...props}
                  className="text-[var(--color-primary)] hover:underline"
                  target={href?.startsWith('http') ? '_blank' : undefined}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {children}
                </a>
              );
            },
            // Style tables
            table({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) {
              return (
                <div className="overflow-x-auto my-4">
                  <table
                    {...props}
                    className="min-w-full border-collapse border border-[var(--color-border)]"
                  >
                    {children}
                  </table>
                </div>
              );
            },
            th({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) {
              return (
                <th
                  {...props}
                  className="border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-2 text-left font-semibold"
                >
                  {children}
                </th>
              );
            },
            td({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) {
              return (
                <td
                  {...props}
                  className="border border-[var(--color-border)] px-4 py-2"
                >
                  {children}
                </td>
              );
            },
            // Style blockquotes
            blockquote({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) {
              return (
                <blockquote
                  {...props}
                  className="border-l-4 border-[var(--color-primary)] pl-4 italic text-[var(--color-foreground)] my-4"
                >
                  {children}
                </blockquote>
              );
            },
          }}
        >
          {safeContent}
        </ReactMarkdown>
      </Box>
    );
  },
  (prev, next) =>
    prev.content === next.content &&
    prev.className === next.className &&
    prev.direction === next.direction,
);

MarkdownContent.displayName = 'MarkdownContent';
