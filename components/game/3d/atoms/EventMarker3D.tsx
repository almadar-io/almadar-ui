'use client';
/**
 * EventMarker3D
 *
 * Floating combat/feedback marker for one `GameEvent` — billboarded text above
 * the cell. Lifetime is LOLO-owned: boards append events on actions and expire
 * them in their tick (same contract as the 2D effects array).
 *
 * @packageDocumentation
 */

import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import { EVENT_COLORS_3D } from '../../shared/game3dTheme';
import type { GameEvent } from '../molecules/GameCanvas3D';

export interface EventMarker3DProps {
    event: GameEvent;
    position: [number, number, number];
}

export function EventMarker3D({ event, position }: EventMarker3DProps): React.JSX.Element {
    return (
        <Billboard position={position}>
            <Text
                fontSize={0.32}
                color={EVENT_COLORS_3D[event.type] ?? EVENT_COLORS_3D.default}
                outlineWidth={0.02}
                outlineColor="#000000"
                anchorX="center"
                anchorY="middle"
            >
                {event.message ?? event.type}
            </Text>
        </Billboard>
    );
}

export default EventMarker3D;
