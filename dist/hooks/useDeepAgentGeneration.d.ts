import type { OrbitalSchema } from '@almadar/core';
export interface DeepAgentActionRequest {
    id: string;
    type: string;
    tool: string;
    args: Record<string, unknown>;
    description?: string;
    allowedDecisions: ('approve' | 'edit' | 'reject')[];
    status: 'pending' | 'approved' | 'rejected' | 'edited';
}
export interface DeepAgentInterrupt {
    id: string;
    type: 'tool_calls' | 'confirmation' | 'error';
    message?: string;
    actionRequests: DeepAgentActionRequest[];
    timestamp: number;
    threadId?: string;
}
export interface GenerationRequest {
    id: string;
    prompt: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: OrbitalSchema;
    error?: string;
}
export interface GenerationProgress {
    stage: string;
    percent: number;
    message: string;
}
export interface UseDeepAgentGenerationResult {
    requests: GenerationRequest[];
    currentRequest: GenerationRequest | null;
    isGenerating: boolean;
    isLoading: boolean;
    isComplete: boolean;
    progress: GenerationProgress;
    error: string | null;
    interrupt: DeepAgentInterrupt | null;
    generate: (prompt: string) => Promise<OrbitalSchema | null>;
    startGeneration: (skill: string, prompt: string, options?: Record<string, unknown>) => Promise<void>;
    cancelGeneration: () => void;
    clearRequests: () => void;
    submitInterruptDecisions: (decisions: unknown[]) => void;
}
export declare function useDeepAgentGeneration(): UseDeepAgentGenerationResult;
