/**
 * Hooks barrel export
 */

// Orbital History hook for version control
export {
  useOrbitalHistory,
  type HistoryTimelineItem,
  type RevertResult,
  type ChangeSummary,
  type UseOrbitalHistoryOptions,
  type UseOrbitalHistoryResult,
} from './useOrbitalHistory';

// File System hook for WebContainer operations
export {
  useFileSystem,
  type FileSystemStatus,
  type FileSystemFile,
  type SelectedFile,
  type UseFileSystemResult,
} from './useFileSystem';

// Extensions hook for editor language support
export {
  useExtensions,
  type Extension,
  type ExtensionManifest,
  type UseExtensionsOptions,
  type UseExtensionsResult,
} from './useExtensions';

// File Editor hook for managing open files
export {
  useFileEditor,
  type OpenFile,
  type UseFileEditorOptions,
  type UseFileEditorResult,
} from './useFileEditor';

// Compile hook for schema compilation
export {
  useCompile,
  type CompileStage,
  type CompileResult,
  type UseCompileResult,
} from './useCompile';

// Preview hook for runtime preview
export { usePreview } from './usePreview';

// Agent Chat hook for AI agent interactions
export { useAgentChat } from './useAgentChat';

// Validation hook for schema validation
export { useValidation } from './useValidation';

// DeepAgent generation hook
export { useDeepAgentGeneration } from './useDeepAgentGeneration';

// EventBus hooks for trait communication
export { useEventBus, useEventListener, useEmitEvent } from './useEventBus';
export type {
  BusEvent,
  BusEventSource,
  EventListener,
  Unsubscribe,
  EventBusContextType,
} from './event-bus-types';

// UI Slot hooks for trait-driven UI rendering
export {
  useUISlotManager,
  DEFAULT_SLOTS,
  type UISlot,
  type SlotAnimation,
  type SlotContent,
  type RenderUIConfig,
  type SlotChangeCallback,
  type UISlotManager,
} from './useUISlots';

// UI Events hook for bridging UI events to state machines
export { useUIEvents, useTraitListens, type TraitListenSpec } from './useUIEvents';

// G13 (2026-04-24): the `useEntityData` family — useEntityList, useEntity,
// useEntityDetail, useEntityListSuspense, useEntitySuspense, entityDataKeys,
// EntityDataProvider, useEntityDataAdapter, EntityDataAdapter — has been
// deleted. Components receive pre-resolved entity data as props (bound via
// `@payload.data` on the emitting state-machine transition). The pluggable
// context adapter is gone; there is no auto-fetch fallback anymore.
//
// Entity mutations (`useEntityMutations`, `useOrbitalMutations`) have been
// deleted as well — they depended on `entityDataKeys` for React-Query cache
// invalidation, which is no longer meaningful without the context. Consumers
// that need mutation helpers (e.g., `apps/builder/client`) ship their own
// copies keyed by their own cache layer.

// Query singleton hook for filter/search state management
export {
  useQuerySingleton,
  parseQueryBinding,
  type QueryState,
  type QuerySingletonEntity,
  type QuerySingletonResult,
  type QuerySingletonState,
} from './useQuerySingleton';

// Entity store hooks (for game/runtime entities)
export {
  useEntities,
  useEntity as useEntityById,
  useEntitiesByType,
  useSingletonEntity,
  usePlayer,
  usePhysics,
  useInput,
  spawnEntity,
  updateEntity,
  updateSingleton,
  removeEntity,
  clearEntities,
  getEntity,
  getByType,
  getAllEntities,
  getSingleton,
  type Entity,
} from './useEntities';

// i18n — translation hook + provider
export {
  useTranslate,
  I18nProvider,
  createTranslate,
  type TranslateFunction,
  type I18nContextValue,
} from './useTranslate';

// `useResolvedEntity` removed in G13 (2026-04-24) along with the auto-fetch
// fallback path it depended on (`useEntityList`). Components now receive a
// pre-resolved `entity` prop directly; no normalization layer needed.

// Auth context stub (applications should provide their own AuthProvider)
export {
  useAuthContext,
  type AuthUser,
  type AuthContextValue,
} from './useAuthContext';

// Gesture hooks (Phase 5 — rich interactions)
export {
  useSwipeGesture,
  type SwipeGestureOptions,
  type SwipeGestureResult,
  type SwipeHandlers,
} from './useSwipeGesture';
export {
  useLongPress,
  type LongPressOptions,
  type LongPressHandlers,
} from './useLongPress';
export {
  useDragReorder,
  type DragReorderResult,
} from './useDragReorder';
export {
  useInfiniteScroll,
  type InfiniteScrollOptions,
  type InfiniteScrollResult,
} from './useInfiniteScroll';
export {
  usePullToRefresh,
  type PullToRefreshOptions,
  type PullToRefreshResult,
} from './usePullToRefresh';
export {
  usePinchZoom,
  type PinchZoomOptions,
  type PinchZoomResult,
} from './usePinchZoom';

// Drag & Drop hooks (HTML5 DnD with structured payloads)
export {
  useDraggable,
  ALMADAR_DND_MIME,
  type DraggablePayload,
  type UseDraggableOptions,
  type UseDraggableResult,
} from './useDraggable';
export {
  useDropZone,
  type UseDropZoneOptions,
  type UseDropZoneResult,
} from './useDropZone';

// GitHub integration hooks
export {
  useGitHubStatus,
  useConnectGitHub,
  useDisconnectGitHub,
  useGitHubRepos,
  useGitHubRepo,
  useGitHubBranches,
  type GitHubStatus,
  type GitHubRepo,
} from './useGitHub';
