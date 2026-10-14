import { beforeAll, vi } from 'vitest';
import { warmKernel } from './kernel-engine';

vi.mock('../../providers/KernelEngineContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../providers/KernelEngineContext')>();
  const { KERNEL_ENGINE } = await import('./kernel-engine');
  return { ...actual, useKernelEngine: () => KERNEL_ENGINE };
});

beforeAll(warmKernel);
