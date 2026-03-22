export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './templates';

// Utility re-exports (so clients can use `import { cn } from '@almadar/ui'`)
export { cn } from '../lib/cn';

// Hook re-exports (so clients can use `import { useEventBus } from '@almadar/ui'`)
export * from '../hooks';

// Provider re-exports (so EventBusProvider and useEventBus come from the SAME entry point)
// This prevents Vite dual-instance issues when providers and hooks are in separate subpaths.
export { EventBusProvider } from '../providers/EventBusProvider';
export { EventBusContext } from '../internals/event-bus-context';
export type { EventBusContextTypeExtended } from '../internals/event-bus-context';
