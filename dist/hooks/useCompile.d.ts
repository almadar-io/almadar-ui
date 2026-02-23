export interface SchemaLike {
    name: string;
    version?: string;
    [key: string]: unknown;
}
export type CompileStage = 'idle' | 'compiling' | 'done' | 'error';
export interface CompileResult {
    success: boolean;
    files?: Array<{
        path: string;
        content: string;
    }>;
    errors?: string[];
}
export interface UseCompileResult {
    isCompiling: boolean;
    stage: CompileStage;
    lastResult: CompileResult | null;
    error: string | null;
    compileSchema: (schema: SchemaLike) => Promise<CompileResult | null>;
}
export declare function useCompile(): UseCompileResult;
