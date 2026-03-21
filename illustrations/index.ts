/**
 * @almadar/ui/illustrations
 *
 * Composable SVG visual language for Almadar.
 * Atoms are primitives (Node, Lobe, Ring, etc.).
 * Molecules compose atoms into concept illustrations (WorldModel, ClosedCircuit, etc.).
 */

// SVG Atoms
export { SvgNode } from '../components/atoms/svg';
export { SvgLobe } from '../components/atoms/svg';
export { SvgConnection } from '../components/atoms/svg';
export { SvgFlow } from '../components/atoms/svg';
export { SvgShield } from '../components/atoms/svg';
export { SvgRing } from '../components/atoms/svg';
export { SvgStack } from '../components/atoms/svg';
export { SvgGrid } from '../components/atoms/svg';
export { SvgPulse } from '../components/atoms/svg';
export { SvgBranch } from '../components/atoms/svg';
export { SvgMesh } from '../components/atoms/svg';
export { SvgMorph } from '../components/atoms/svg';

// SVG Molecules (concept illustrations)
export { WorldModel } from '../components/molecules/svg';
export { ClosedCircuit } from '../components/molecules/svg';
export { ComposableModels } from '../components/molecules/svg';
export { SharedReality } from '../components/molecules/svg';
export { StandardLibrary } from '../components/molecules/svg';
export { CompileAnywhere } from '../components/molecules/svg';
export { ProveCorrect } from '../components/molecules/svg';
export { AIGenerates } from '../components/molecules/svg';
export { PlanVerifyRemember } from '../components/molecules/svg';
export { CommunityOwnership } from '../components/molecules/svg';
export { ServiceLayers } from '../components/molecules/svg';
export { DescribeProveDeploy } from '../components/molecules/svg';
export { EventBus } from '../components/molecules/svg';
export { StateMachine } from '../components/molecules/svg';
export { OrbitalUnit } from '../components/molecules/svg';
export { DomainGrid } from '../components/molecules/svg';

// AVL Atoms (formal visual notation)
export { AvlState } from '../components/atoms/avl';
export { AvlTransition } from '../components/atoms/avl';
export { AvlEvent } from '../components/atoms/avl';
export { AvlGuard } from '../components/atoms/avl';
export { AvlEffect } from '../components/atoms/avl';
export { AvlEntity } from '../components/atoms/avl';
export { AvlTrait } from '../components/atoms/avl';
export { AvlPage } from '../components/atoms/avl';
export { AvlOrbital } from '../components/atoms/avl';
export { AvlApplication } from '../components/atoms/avl';
export { AvlField } from '../components/atoms/avl';
export { AvlFieldType } from '../components/atoms/avl';
export { AvlBinding } from '../components/atoms/avl';
export { AvlPersistence } from '../components/atoms/avl';
export { AvlOperator } from '../components/atoms/avl';
export { AvlSExpr } from '../components/atoms/avl';
export { AvlLiteral } from '../components/atoms/avl';
export { AvlBindingRef } from '../components/atoms/avl';

// AVL Molecules (composed diagrams)
export { AvlStateMachine } from '../components/molecules/avl';
export { AvlOrbitalUnit } from '../components/molecules/avl';
export { AvlClosedCircuit } from '../components/molecules/avl';
export { AvlEmitListen } from '../components/molecules/avl';
export { AvlSlotMap } from '../components/molecules/avl';
export { AvlExprTree } from '../components/molecules/avl';
