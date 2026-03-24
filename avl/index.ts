/**
 * @almadar/ui/avl
 *
 * Almadar Visual Language (AVL) - Formal visual notation for .orb constructs.
 * Atoms render <g> elements for composition. Molecules render full <svg>.
 */

// AVL Atoms - Tier 1: Structural Primitives
export { AvlOrbital, type AvlOrbitalProps } from '../components/atoms/avl';
export { AvlEntity, type AvlEntityProps } from '../components/atoms/avl';
export { AvlTrait, type AvlTraitProps } from '../components/atoms/avl';
export { AvlPage, type AvlPageProps } from '../components/atoms/avl';
export { AvlApplication, type AvlApplicationProps } from '../components/atoms/avl';

// AVL Atoms - Tier 2: Behavioral Primitives
export { AvlState, type AvlStateProps } from '../components/atoms/avl';
export { AvlTransition, type AvlTransitionProps } from '../components/atoms/avl';
export { AvlEvent, type AvlEventProps } from '../components/atoms/avl';
export { AvlGuard, type AvlGuardProps } from '../components/atoms/avl';
export { AvlEffect, type AvlEffectProps } from '../components/atoms/avl';

// AVL Atoms - Tier 3: Data Primitives
export { AvlField, type AvlFieldProps } from '../components/atoms/avl';
export { AvlFieldType, type AvlFieldTypeProps } from '../components/atoms/avl';
export { AvlBinding, type AvlBindingProps } from '../components/atoms/avl';
export { AvlPersistence, type AvlPersistenceProps } from '../components/atoms/avl';

// AVL Atoms - Tier 4: Expression Primitives
export { AvlOperator, type AvlOperatorProps } from '../components/atoms/avl';
export { AvlSExpr, type AvlSExprProps } from '../components/atoms/avl';
export { AvlLiteral, type AvlLiteralProps } from '../components/atoms/avl';
export { AvlBindingRef, type AvlBindingRefProps } from '../components/atoms/avl';

// AVL Types + Constants
export type {
  AvlBaseProps,
  AvlEffectType,
  AvlFieldTypeKind,
  AvlPersistenceKind,
  AvlOperatorNamespace,
} from '../components/atoms/avl';
export { AVL_OPERATOR_COLORS, AVL_FIELD_TYPE_SHAPES } from '../components/atoms/avl';
// V2 color system
export type { StateRole, EffectCategory } from '../components/atoms/avl';
export { STATE_COLORS, EFFECT_CATEGORY_COLORS, EFFECT_TYPE_TO_CATEGORY, CONNECTION_COLORS, getStateRole } from '../components/atoms/avl';

// AVL Molecules
export { AvlStateMachine, type AvlStateMachineProps, type AvlStateMachineState, type AvlStateMachineTransition } from '../components/molecules/avl';
export { AvlOrbitalUnit, type AvlOrbitalUnitProps, type AvlOrbitalUnitTrait, type AvlOrbitalUnitPage } from '../components/molecules/avl';
export { AvlClosedCircuit, type AvlClosedCircuitProps, type AvlClosedCircuitState, type AvlClosedCircuitTransition } from '../components/molecules/avl';
export { AvlEmitListen, type AvlEmitListenProps } from '../components/molecules/avl';
export { AvlSlotMap, type AvlSlotMapProps, type AvlSlotMapSlot } from '../components/molecules/avl';
export { AvlExprTree, type AvlExprTreeProps, type AvlExprTreeNode } from '../components/molecules/avl';

// Layout utilities
export { ringPositions, arcPath, radialPositions, gridPositions, curveControlPoint } from '../components/molecules/avl';

// AVL Organisms - Interactive Cosmic Zoom
export {
  AvlCosmicZoom,
  type AvlCosmicZoomProps,
  AvlApplicationScene,
  type AvlApplicationSceneProps,
  AvlOrbitalScene,
  type AvlOrbitalSceneProps,
  AvlTraitScene,
  type AvlTraitSceneProps,
  AvlTransitionScene,
  type AvlTransitionSceneProps,
  AvlClickTarget,
  type AvlClickTargetProps,
  parseApplicationLevel,
  parseOrbitalLevel,
  parseTraitLevel,
  parseTransitionLevel,
  type ApplicationLevelData,
  type OrbitalLevelData,
  type TraitLevelData,
  type TransitionLevelData,
  type CrossLink,
  type ZoomLevel,
} from '../components/organisms/avl';
