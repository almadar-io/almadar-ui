'use client';

/**
 * Avl3DTooltip - Styled tooltip card for 3D AVL hover info.
 *
 * Uses drei's Html to render a DOM card in 3D space that always
 * faces the camera. Shows contextual info based on the hovered node.
 *
 * @packageDocumentation
 */

import React from 'react';
import { Html } from '@react-three/drei';
import { Box } from '../Box';
import { Typography } from '../Typography';
import { VStack } from '../Stack';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface Avl3DTooltipProps {
  /** 3D position [x, y, z] */
  position: [number, number, number];
  /** Tooltip title (bold, top line) */
  title: string;
  /** Key-value rows to display */
  rows: Array<{ label: string; value: string }>;
  /** Optional accent color for the left border */
  accentColor?: string;
  /** CSS class */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Avl3DTooltip: React.FC<Avl3DTooltipProps> = ({
  position,
  title,
  rows,
  accentColor = '#5b9bd5',
}) => {
  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      style={{ pointerEvents: 'none' }}
      zIndexRange={[100, 0]}
    >
      <Box
        style={{
          background: 'rgba(12, 18, 34, 0.92)',
          backdropFilter: 'blur(8px)',
          borderLeft: `3px solid ${accentColor}`,
          borderRadius: '6px',
          padding: '8px 12px',
          minWidth: '140px',
          maxWidth: '220px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
      >
        <VStack gap="xs">
          <Typography
            variant="small"
            style={{
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

          {rows.map((row) => (
            <Box
              key={row.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <Typography
                variant="small"
                style={{
                  color: '#8899bb',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.label}
              </Typography>
              <Typography
                variant="small"
                style={{
                  color: '#ccddf0',
                  fontSize: '10px',
                  fontWeight: 500,
                  textAlign: 'right',
                }}
              >
                {row.value}
              </Typography>
            </Box>
          ))}
        </VStack>
      </Box>
    </Html>
  );
};

Avl3DTooltip.displayName = 'Avl3DTooltip';
