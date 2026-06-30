/**
 * Learning family pattern barrel.
 *
 * Exports the canvas atom and field-scoped molecules so the pattern-sync
 * pipeline can discover them and generate matching LOLO factories.
 */

export { LearningCanvas, type LearningCanvasProps, type LearningShape, type LearningPoint } from './atoms/LearningCanvas';
export { MathCanvas, type MathCanvasProps, type MathCurve, type MathPoint, type MathVector } from './molecules/MathCanvas';
export { PhysicsCanvas, type PhysicsCanvasProps, type PhysicsBody, type PhysicsConstraint } from './molecules/PhysicsCanvas';
export { BiologyCanvas, type BiologyCanvasProps, type BiologyNode, type BiologyEdge } from './molecules/BiologyCanvas';
export { ChemistryCanvas, type ChemistryCanvasProps, type ChemistryAtom, type ChemistryBond, type ChemistryArrow } from './molecules/ChemistryCanvas';
