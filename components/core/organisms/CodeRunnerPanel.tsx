'use client';
/**
 * CodeRunnerPanel Organism Component
 *
 * Editable code block with Run/Reset buttons and simulated terminal output.
 * Real execution is a future concern; callers supply a simulation function via
 * `onRun`. Emits `UI:RUN_CODE { language, exitCode }` on every run attempt.
 *
 * Event Contract:
 * - Emits: UI:RUN_CODE { language, exitCode, error? }
 * - entityAware: false
 */

import React, { useState, useCallback } from 'react';
import { Play, RotateCcw, Terminal, CheckCircle, XCircle } from 'lucide-react';
import { Box } from '../atoms/Box';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Typography } from '../atoms/Typography';
import { VStack, HStack } from '../atoms/Stack';
import { CodeBlock } from '../molecules/markdown/CodeBlock';
import { useEventBus } from '../../../hooks/useEventBus';
import { useTranslate } from '../../../hooks/useTranslate';
import { cn } from '../../../lib/cn';

export interface CodeSimulationOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  testResults: Array<{
    input: string;
    expectedOutput: string;
    actualOutput: string;
    passed: boolean;
  }>;
}

export interface CodeRunnerPanelProps {
  /** Initial code content */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Whether the panel allows running (false = read-only code block) */
  runnable?: boolean;
  /**
   * Simulate executing the code. Omit to render a read-only block.
   * Real execution is a separate future track — this callback supplies
   * deterministic simulated output for UI feedback.
   */
  onRun?: (code: string) => Promise<CodeSimulationOutput>;
  /** Event name to emit on run (emitted as `UI:<runEvent>`). Defaults to 'RUN_CODE'. */
  runEvent?: string;
  /** Additional CSS classes */
  className?: string;
}

export const CodeRunnerPanel: React.FC<CodeRunnerPanelProps> = ({
  code: initialCode,
  language,
  runnable = true,
  onRun,
  runEvent = 'RUN_CODE',
  className,
}) => {
  const eventBus = useEventBus();
  const { t } = useTranslate();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<CodeSimulationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = useCallback(async () => {
    if (!onRun) return;

    setIsRunning(true);
    setError(null);
    setOutput(null);

    try {
      const result = await onRun(code);
      setOutput(result);
      eventBus.emit(`UI:${runEvent}`, { language, exitCode: result.exitCode });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error');
      setError(message);
      eventBus.emit(`UI:${runEvent}`, { language, exitCode: 1, error: message });
    } finally {
      setIsRunning(false);
    }
  }, [code, language, onRun, runEvent, eventBus, t]);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    setOutput(null);
    setError(null);
  }, [initialCode]);

  if (!runnable || !onRun) {
    return (
      <Box className={className}>
        <CodeBlock language={language as Parameters<typeof CodeBlock>[0]['language']} code={code} />
      </Box>
    );
  }

  const hasOutput = output !== null || error !== null;

  return (
    <Box className={cn('space-y-3', className)}>
      <CodeBlock
        language={language as Parameters<typeof CodeBlock>[0]['language']}
        code={code}
        editable
        onChange={setCode}
        showLanguageBadge
        showCopyButton
      />

      <HStack gap="sm" justify="between">
        <HStack gap="sm">
          <Button
            variant="primary"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="min-w-[5rem]"
          >
            {isRunning ? (
              <span className="inline-flex items-center gap-2">
                <RotateCcw size={16} className="animate-spin" />
                {t('common.loading')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <Play size={16} />
                Run
              </span>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={isRunning}
          >
            <span className="inline-flex items-center gap-2">
              <RotateCcw size={16} />
              Reset
            </span>
          </Button>
        </HStack>
        {output && (
          <Badge
            variant={output.exitCode === 0 ? 'success' : 'danger'}
            size="sm"
          >
            Exit {output.exitCode}
          </Badge>
        )}
      </HStack>

      {hasOutput && (
        <Box className="rounded-lg border border-border bg-foreground overflow-hidden">
          <HStack
            gap="sm"
            align="center"
            className="px-3 py-2 bg-card border-b border-border"
          >
            <Terminal size={16} className="text-muted-foreground" />
            <Typography variant="small" className="text-foreground font-medium">
              Output
            </Typography>
          </HStack>

          <VStack gap="none" className="p-3 font-mono text-sm">
            {error ? (
              <Typography variant="small" className="text-error whitespace-pre-wrap">
                {error}
              </Typography>
            ) : (
              <>
                {output?.stdout ? (
                  <Typography variant="small" className="text-background whitespace-pre-wrap">
                    {output.stdout}
                  </Typography>
                ) : null}
                {output?.stderr ? (
                  <Typography variant="small" className="text-error whitespace-pre-wrap">
                    {output.stderr}
                  </Typography>
                ) : null}
                {!output?.stdout && !output?.stderr ? (
                  <Typography variant="small" className="text-background italic">
                    No output
                  </Typography>
                ) : null}

                {output && output.testResults.length > 0 && (
                  <Box className="mt-3 pt-3 border-t border-border space-y-2">
                    {output.testResults.map((test, index) => (
                      <HStack key={index} gap="sm" align="start" className="text-xs">
                        {test.passed ? (
                          <CheckCircle size={14} className="text-success mt-0.5" />
                        ) : (
                          <XCircle size={14} className="text-error mt-0.5" />
                        )}
                        <VStack gap="xs" className="flex-1">
                          <Typography
                            variant="small"
                            className={test.passed ? 'text-success' : 'text-error'}
                          >
                            Test {index + 1}: {test.passed ? 'passed' : 'failed'}
                          </Typography>
                          <Typography variant="small" className="text-background">
                            Input: {test.input}
                          </Typography>
                          <Typography variant="small" className="text-background">
                            Expected: {test.expectedOutput}
                          </Typography>
                          <Typography variant="small" className="text-background">
                            Actual: {test.actualOutput}
                          </Typography>
                        </VStack>
                      </HStack>
                    ))}
                  </Box>
                )}
              </>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

CodeRunnerPanel.displayName = 'CodeRunnerPanel';
