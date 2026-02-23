/**
 * OfflineModeProvider
 *
 * Context provider that wraps useOfflineExecutor with force-offline toggle support.
 * Enables testing offline behavior without actually disconnecting.
 *
 * @packageDocumentation
 */
import React from 'react';
import { type UseOfflineExecutorOptions, type UseOfflineExecutorResult } from '../renderer/offline-executor';
export interface OfflineModeContextValue extends UseOfflineExecutorResult {
    /** Force offline mode for testing */
    forceOffline: boolean;
    /** Toggle force offline mode */
    setForceOffline: (value: boolean) => void;
    /** Whether effectively offline (real or forced) */
    effectivelyOffline: boolean;
}
export interface OfflineModeProviderProps extends UseOfflineExecutorOptions {
    children: React.ReactNode;
}
/**
 * OfflineModeProvider - Wraps offline executor with force-offline support.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <OfflineModeProvider
 *       serverUrl="/api/orbitals"
 *       authToken={token}
 *       autoSync={true}
 *       renderToSlot={slotManager.render}
 *       navigate={router.push}
 *       notify={toast.show}
 *       eventBus={{ emit: bus.emit }}
 *     >
 *       <PreviewPage />
 *     </OfflineModeProvider>
 *   );
 * }
 * ```
 */
export declare function OfflineModeProvider({ children, ...executorOptions }: OfflineModeProviderProps): React.ReactElement;
/**
 * Access offline mode context.
 *
 * @example
 * ```tsx
 * function OfflineToggle() {
 *   const {
 *     effectivelyOffline,
 *     forceOffline,
 *     setForceOffline,
 *     pendingCount,
 *     sync,
 *   } = useOfflineMode();
 *
 *   return (
 *     <div>
 *       <Toggle
 *         checked={forceOffline}
 *         onChange={setForceOffline}
 *       >
 *         Test Offline
 *       </Toggle>
 *       {pendingCount > 0 && <Badge>{pendingCount} pending</Badge>}
 *       <Button onClick={sync}>Sync Now</Button>
 *     </div>
 *   );
 * }
 * ```
 */
export declare function useOfflineMode(): OfflineModeContextValue;
/**
 * Check if offline mode provider is available (optional usage).
 */
export declare function useOptionalOfflineMode(): OfflineModeContextValue | null;
export default OfflineModeProvider;
