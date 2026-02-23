import type { CameraState } from '../types/isometric';
interface CameraResult {
    /** Mutable camera state ref (x, y, zoom) */
    cameraRef: React.MutableRefObject<CameraState>;
    /** Target camera position for smooth lerp centering. Set to null when reached. */
    targetCameraRef: React.MutableRefObject<{
        x: number;
        y: number;
    } | null>;
    /** Whether the user is currently dragging */
    isDragging: () => boolean;
    /** Total drag distance — used to distinguish click from pan (threshold: 5px) */
    dragDistance: () => number;
    /** Mouse down handler — starts panning */
    handleMouseDown: (e: React.MouseEvent) => void;
    /** Mouse up handler — stops panning */
    handleMouseUp: () => void;
    /** Mouse move handler — pans camera if dragging, returns true if panning */
    handleMouseMove: (e: React.MouseEvent, drawFn?: () => void) => boolean;
    /** Mouse leave handler — cancels drag */
    handleMouseLeave: () => void;
    /** Wheel handler — zoom in/out */
    handleWheel: (e: React.WheelEvent, drawFn?: () => void) => void;
    /** Convert screen coordinates to world coordinates (inverse camera transform) */
    screenToWorld: (clientX: number, clientY: number, canvas: HTMLCanvasElement, viewportSize: {
        width: number;
        height: number;
    }) => {
        x: number;
        y: number;
    };
    /** Lerp camera toward target. Call in animation loop. Returns true if still animating. */
    lerpToTarget: (t?: number) => boolean;
}
/**
 * Camera hook for pan/zoom canvas rendering.
 *
 * @returns Camera state, event handlers, and coordinate conversion
 */
export declare function useCamera(): CameraResult;
export {};
