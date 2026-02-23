/**
 * Entity Debug - Provides entity state snapshots for debugging
 *
 * @packageDocumentation
 */
export interface EntityState {
    id: string;
    type: string;
    fields: Record<string, unknown>;
    lastUpdated: number;
}
export interface RuntimeEntity {
    id: string;
    type: string;
    data: Record<string, unknown>;
}
export interface PersistentEntityInfo {
    loaded: boolean;
    count: number;
}
export interface EntitySnapshot {
    entities: EntityState[];
    timestamp: number;
    totalCount: number;
    /** Singleton entities by name */
    singletons: Record<string, unknown>;
    /** Runtime entities (in-memory) */
    runtime: RuntimeEntity[];
    /** Persistent entities info by type */
    persistent: Record<string, PersistentEntityInfo>;
}
type EntityProvider = () => EntityState[];
export declare function setEntityProvider(provider: EntityProvider): void;
export declare function clearEntityProvider(): void;
export declare function getEntitySnapshot(): EntitySnapshot | null;
export declare function getEntityById(id: string): EntityState | undefined;
export declare function getEntitiesByType(type: string): EntityState[];
export {};
