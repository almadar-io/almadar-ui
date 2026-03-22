/**
 * AVL Cosmic Zoom State Machine
 *
 * useReducer-based state machine managing which zoom level is displayed,
 * what is selected, and animation state.
 *
 * @packageDocumentation
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ZoomLevel = 'application' | 'orbital' | 'trait' | 'transition';

export interface ZoomState {
  level: ZoomLevel;
  selectedOrbital: string | null;
  selectedTrait: string | null;
  selectedTransition: number | null;
  animating: boolean;
  animationDirection: 'in' | 'out';
  animationTarget: { x: number; y: number; scale: number } | null;
}

export type ZoomAction =
  | { type: 'ZOOM_INTO_ORBITAL'; orbital: string; targetPosition: { x: number; y: number } }
  | { type: 'ZOOM_INTO_TRAIT'; trait: string; targetPosition: { x: number; y: number } }
  | { type: 'ZOOM_INTO_TRANSITION'; transitionIndex: number; targetPosition: { x: number; y: number } }
  | { type: 'ZOOM_OUT' }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'RESET' }
  | { type: 'SWITCH_TRAIT'; trait: string };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const initialZoomState: ZoomState = {
  level: 'application',
  selectedOrbital: null,
  selectedTrait: null,
  selectedTransition: null,
  animating: false,
  animationDirection: 'in',
  animationTarget: null,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function zoomReducer(state: ZoomState, action: ZoomAction): ZoomState {
  switch (action.type) {
    case 'ZOOM_INTO_ORBITAL': {
      if (state.level !== 'application' || state.animating) return state;
      return {
        ...state,
        animating: true,
        animationDirection: 'in',
        animationTarget: { x: action.targetPosition.x, y: action.targetPosition.y, scale: 3 },
        selectedOrbital: action.orbital,
      };
    }

    case 'ZOOM_INTO_TRAIT': {
      if (state.level !== 'orbital' || state.animating) return state;
      return {
        ...state,
        animating: true,
        animationDirection: 'in',
        animationTarget: { x: action.targetPosition.x, y: action.targetPosition.y, scale: 3 },
        selectedTrait: action.trait,
      };
    }

    case 'ZOOM_INTO_TRANSITION': {
      if (state.level !== 'trait' || state.animating) return state;
      return {
        ...state,
        animating: true,
        animationDirection: 'in',
        animationTarget: { x: action.targetPosition.x, y: action.targetPosition.y, scale: 3 },
        selectedTransition: action.transitionIndex,
      };
    }

    case 'ZOOM_OUT': {
      if (state.level === 'application' || state.animating) return state;
      return {
        ...state,
        animating: true,
        animationDirection: 'out',
        animationTarget: { x: 300, y: 200, scale: 0.3 },
      };
    }

    case 'ANIMATION_COMPLETE': {
      if (!state.animating) return state;

      if (state.animationDirection === 'in') {
        // Move to the next level
        const nextLevel: ZoomLevel =
          state.level === 'application' ? 'orbital' :
          state.level === 'orbital' ? 'trait' :
          'transition';
        return {
          ...state,
          level: nextLevel,
          animating: false,
          animationTarget: null,
        };
      }

      // Zoom out: go back one level and clear that level's selection
      if (state.level === 'transition') {
        return {
          ...state,
          level: 'trait',
          selectedTransition: null,
          animating: false,
          animationTarget: null,
        };
      }
      if (state.level === 'trait') {
        return {
          ...state,
          level: 'orbital',
          selectedTrait: null,
          animating: false,
          animationTarget: null,
        };
      }
      if (state.level === 'orbital') {
        return {
          ...state,
          level: 'application',
          selectedOrbital: null,
          animating: false,
          animationTarget: null,
        };
      }
      return state;
    }

    case 'SWITCH_TRAIT': {
      // Switch to a sibling trait without animation (stays at trait level)
      if (state.level !== 'trait' || state.animating) return state;
      return {
        ...state,
        selectedTrait: action.trait,
        selectedTransition: null,
      };
    }

    case 'RESET': {
      return initialZoomState;
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Breadcrumb helpers
// ---------------------------------------------------------------------------

export interface BreadcrumbSegment {
  label: string;
  level: ZoomLevel;
}

export function getBreadcrumbs(state: ZoomState): BreadcrumbSegment[] {
  const crumbs: BreadcrumbSegment[] = [{ label: 'Application', level: 'application' }];

  if (state.selectedOrbital) {
    crumbs.push({ label: state.selectedOrbital, level: 'orbital' });
  }
  if (state.selectedTrait) {
    crumbs.push({ label: state.selectedTrait, level: 'trait' });
  }
  if (state.selectedTransition !== null) {
    crumbs.push({ label: `Transition #${state.selectedTransition}`, level: 'transition' });
  }

  return crumbs;
}
