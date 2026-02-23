import { getEntity, getByType, getAllEntities, getSingleton, spawnEntity, updateEntity, updateSingleton, removeEntity, clearEntities } from '../stores/entityStore';
import type { Entity } from '../stores/entityStore';
export type { Entity };
/**
 * Hook to access all entities
 */
export declare function useEntities(): {
    entities: Map<string, Entity>;
    getEntity: typeof getEntity;
    getByType: typeof getByType;
    getAllEntities: typeof getAllEntities;
    getSingleton: typeof getSingleton;
    spawnEntity: typeof spawnEntity;
    updateEntity: typeof updateEntity;
    updateSingleton: typeof updateSingleton;
    removeEntity: typeof removeEntity;
    clearEntities: typeof clearEntities;
};
/**
 * Hook to access a specific entity by ID
 */
export declare function useEntity(id: string): Entity | undefined;
/**
 * Hook to access entities of a specific type
 */
export declare function useEntitiesByType(type: string): Entity[];
/**
 * Hook to access a singleton entity by type
 */
export declare function useSingletonEntity<T extends Entity = Entity>(type: string): T | undefined;
/**
 * Hook for Player entity (convenience)
 */
export declare function usePlayer(): {
    player: Entity | undefined;
    updatePlayer: (updates: Partial<Entity>) => void;
};
/**
 * Hook for Physics entity (convenience)
 */
export declare function usePhysics(): {
    physics: Entity | undefined;
    updatePhysics: (updates: Partial<Entity>) => void;
};
/**
 * Hook for Input entity (convenience)
 */
export declare function useInput(): {
    input: Entity | undefined;
    updateInput: (updates: Partial<Entity>) => void;
};
export { spawnEntity, updateEntity, updateSingleton, removeEntity, clearEntities, getEntity, getByType, getAllEntities, getSingleton, };
