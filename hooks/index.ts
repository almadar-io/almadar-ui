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
export type { KFlowEvent, EventListener, Unsubscribe, EventBusContextType } from './event-bus-types';

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
export { useUIEvents, useSelectedEntity } from './useUIEvents';

// Entity data hooks for schema-driven components
export {
  useEntityList,
  useEntityDetail,
  useEntity,
  useEntityListSuspense,
  useEntitySuspense,
  entityDataKeys,
  EntityDataProvider,
  useEntityDataAdapter,
  type EntityDataAdapter,
  type EntityDataRecord,
  type UseEntityListOptions,
  type UseEntityListResult,
  type UseEntityDetailResult,
} from './useEntityData';

// Query singleton hook for filter/search state management
export {
  useQuerySingleton,
  parseQueryBinding,
  type QueryState,
  type QuerySingletonEntity,
  type QuerySingletonResult,
  type QuerySingletonState,
} from './useQuerySingleton';

// Entity mutations (legacy direct CRUD)
export {
  useEntityMutations,
  useCreateEntity,
  useUpdateEntity,
  useDeleteEntity,
  type EntityMutationResult,
  type UseEntityMutationsOptions,
} from './useEntityMutations';

// Orbital mutations (event-based, recommended)
export {
  useOrbitalMutations,
  useSendOrbitalEvent,
  ENTITY_EVENTS,
  type OrbitalEventPayload,
  type OrbitalEventResponse,
} from './useOrbitalMutations';

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

// Resolved entity hook for normalizing data sources
export {
  useResolvedEntity,
  type ResolvedEntity,
} from './useResolvedEntity';

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
