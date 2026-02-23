import type { DeepAgentInterrupt } from './useDeepAgentGeneration';
export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}
export type AvatarRole = 'user' | 'assistant' | 'system';
export type FileOperation = 'ls' | 'read_file' | 'write_file' | 'edit_file';
export type Activity = {
    type: 'message';
    role: AvatarRole;
    content: string;
    timestamp: number;
    isStreaming?: boolean;
} | {
    type: 'tool_call';
    tool: string;
    args: Record<string, unknown>;
    timestamp: number;
    isExecuting?: boolean;
} | {
    type: 'tool_result';
    tool: string;
    result: unknown;
    success: boolean;
    timestamp: number;
} | {
    type: 'file_operation';
    operation: FileOperation;
    path: string;
    success?: boolean;
    timestamp: number;
} | {
    type: 'schema_diff';
    filePath: string;
    hunks: DiffHunk[];
    timestamp: number;
} | {
    type: 'error';
    message: string;
    code?: string;
    timestamp: number;
};
export interface TodoActivity {
    type: 'thinking' | 'tool_call' | 'tool_result' | 'code_change';
    content: string;
    timestamp: number;
    tool?: string;
    success?: boolean;
    filePath?: string;
    diff?: string;
}
export interface Todo {
    id: string;
    task: string;
    status: 'pending' | 'in_progress' | 'completed';
    latestActivity?: TodoActivity;
    activityHistory?: TodoActivity[];
}
export interface DiffHunk {
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    lines: Array<{
        type: 'add' | 'remove' | 'context';
        content: string;
    }>;
}
export interface SchemaDiff {
    id: string;
    filePath: string;
    hunks: DiffHunk[];
    timestamp: number;
    addedLines: number;
    removedLines: number;
}
export type AgentStatus = 'idle' | 'running' | 'complete' | 'error' | 'interrupted';
export interface UseAgentChatOptions {
    appId?: string;
    onComplete?: (schema?: unknown) => void;
    onSchemaChange?: (diff?: unknown) => void;
    onError?: (error: Error | string) => void;
}
export interface UseAgentChatResult {
    messages: ChatMessage[];
    status: AgentStatus;
    activities: Activity[];
    todos: Todo[];
    schemaDiffs: SchemaDiff[];
    isLoading: boolean;
    error: string | null;
    threadId: string | null;
    interrupt: DeepAgentInterrupt | null;
    sendMessage: (content: string) => Promise<void>;
    startGeneration: (skill: string | string[], prompt: string, options?: Record<string, unknown>) => Promise<void>;
    continueConversation: (message: string | string[]) => Promise<void>;
    resumeWithDecision: (decisions: unknown[]) => Promise<void>;
    cancel: () => void;
    clearMessages: () => void;
    clearHistory: () => void;
}
export declare function useAgentChat(options?: UseAgentChatOptions): UseAgentChatResult;
