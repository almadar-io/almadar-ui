import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CodeRunnerPanel, type CodeSimulationOutput } from '../CodeRunnerPanel';
import { EventBusProvider } from '../../../../providers/EventBusProvider';

const result: CodeSimulationOutput = { stdout: 'ok', stderr: '', exitCode: 0, testResults: [] };

describe('CodeRunnerPanel while running', () => {
  it('the focused Run keeps focus while busy and after it settles', async () => {
    let finish: (r: CodeSimulationOutput) => void = () => {};
    const onRun = () => new Promise<CodeSimulationOutput>((res) => { finish = res; });
    render(
      <EventBusProvider debug={false}>
        <CodeRunnerPanel code="print(1)" language="python" onRun={onRun} />
      </EventBusProvider>,
    );
    const run = screen.getByRole('button', { name: 'Run' });
    run.focus();
    fireEvent.click(run);
    const busyRun = screen.getAllByRole('button').find((b) => b.getAttribute('aria-busy') === 'true');
    expect(busyRun).toBeDefined();
    expect(busyRun).not.toBeDisabled();
    expect(document.activeElement).toBe(busyRun);

    await act(async () => { finish(result); });
    expect(screen.getByRole('button', { name: 'Run' })).not.toHaveAttribute('aria-busy');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Run' }));
  });
});
