export interface LLMErrorContext {
    rawValuePreview?: string;
    expectedType?: string;
    actualType?: string;
    source?: {
        agent: 'requirements' | 'builder' | 'view-planner';
        operation: string;
        promptHash?: string;
    };
    tokenUsage?: {
        prompt: number;
        completion: number;
    };
}
export interface ValidationError {
    code: string;
    message: string;
    path?: string;
    severity: 'error' | 'warning';
    suggestion?: string;
    validValues?: string[];
    expectedShape?: string;
    fixGuidance?: string;
    llmContext?: LLMErrorContext;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}
export type ValidationStage = 'idle' | 'validating' | 'fixing' | 'complete';
export interface UseValidationResult {
    result: ValidationResult | null;
    isValidating: boolean;
    error: string | null;
    stage: ValidationStage;
    isFixing: boolean;
    progressMessage: string | null;
    errors: ValidationError[];
    warnings: ValidationError[];
    isValid: boolean;
    validate: (appId: string) => Promise<ValidationResult>;
    clearResult: () => void;
    reset: () => void;
}
export declare function useValidation(): UseValidationResult;
