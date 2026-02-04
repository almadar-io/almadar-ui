/**
 * Type declarations for @orbital/shared
 * This allows TypeScript to resolve the module from the parent dist folder
 */
declare module '@orbital/shared' {
  // Re-export types from the evaluator
  export type SExprAtom = string | number | boolean | null;
  export type SExpr = SExprAtom | SExpr[];

  export interface EvaluationContext {
    entity: Record<string, unknown>;
    payload: Record<string, unknown>;
    state: string;
    now: number;
    user?: {
      id: string;
      email?: string;
      name?: string;
      role?: string;
      permissions?: string[];
      [key: string]: unknown;
    };
    singletons: Map<string, Record<string, unknown>>;
    locals?: Map<string, unknown>;
    mutateEntity?: (changes: Record<string, unknown>) => void;
    emit?: (event: string, payload?: unknown) => void;
    navigate?: (route: string, params?: Record<string, unknown>) => void;
    persist?: (action: 'create' | 'update' | 'delete', data?: Record<string, unknown>) => Promise<void>;
    notify?: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
    spawn?: (entityType: string, props?: Record<string, unknown>) => void;
    despawn?: (entityId?: string) => void;
    callService?: (service: string, method: string, params?: Record<string, unknown>) => Promise<unknown>;
    renderUI?: (slot: string, pattern: unknown, props?: Record<string, unknown>, priority?: number) => void;
  }

  export function createMinimalContext(
    entity?: Record<string, unknown>,
    payload?: Record<string, unknown>,
    state?: string
  ): EvaluationContext;

  export function evaluate(expr: SExpr, ctx: EvaluationContext): unknown;
  export function evaluateGuard(expr: SExpr, ctx: EvaluationContext): boolean;
  export function resolveBinding(binding: string, ctx: EvaluationContext): unknown;
}

// Image asset declarations
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}
