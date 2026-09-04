export * from './core/atoms/index';
export * from './core/molecules/index';
export * from './core/organisms/index';
export * from './core/templates/index';

// Utility re-exports (so clients can use `import { cn } from '@almadar/ui'`)
export { cn } from '../lib/cn';

// Hook re-exports (so clients can use `import { useEventBus } from '@almadar/ui'`)
export * from '../hooks/index';

// Slot-host manifest types (package root, alongside the types barrel at
// `../types/index`) — SlotHostRegion/SlotHostManifest/assertUniqueSlotsPerHost
export * from '../types/slot-host';
