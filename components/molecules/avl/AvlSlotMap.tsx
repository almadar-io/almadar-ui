'use client';

import React from 'react';

export interface AvlSlotMapSlot {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AvlSlotMapProps {
  slots: AvlSlotMapSlot[];
  pageWidth?: number;
  pageHeight?: number;
  className?: string;
  color?: string;
  animated?: boolean;
}

export const AvlSlotMap: React.FC<AvlSlotMapProps> = ({
  slots,
  pageWidth = 360,
  pageHeight = 280,
  className,
  color = 'var(--color-primary)',
  animated = false,
}) => {
  // Center the page frame in the viewBox
  const ox = (600 - pageWidth) / 2;
  const oy = (400 - pageHeight) / 2;

  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" className={className}>
      {animated && (
        <style>{`
          @keyframes avl-slot-pulse { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.25; } }
        `}</style>
      )}

      {/* Page frame */}
      <rect
        x={ox}
        y={oy}
        width={pageWidth}
        height={pageHeight}
        rx={4}
        ry={4}
        fill="none"
        stroke={color}
        strokeWidth={2}
      />

      {/* Title bar */}
      <rect
        x={ox}
        y={oy}
        width={pageWidth}
        height={24}
        rx={4}
        ry={4}
        fill={color}
        opacity={0.1}
      />
      <text
        x={ox + pageWidth / 2}
        y={oy + 16}
        textAnchor="middle"
        fill={color}
        fontSize={10}
        fontFamily="inherit"
        fontWeight="bold"
      >
        Page Layout
      </text>

      {/* Named slot regions */}
      {slots.map((slot) => (
        <g key={slot.name}>
          <rect
            x={ox + slot.x}
            y={oy + 24 + slot.y}
            width={slot.width}
            height={slot.height}
            rx={3}
            ry={3}
            fill={color}
            opacity={0.08}
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 2"
            style={animated ? { animation: 'avl-slot-pulse 2s ease-in-out infinite' } : undefined}
          />
          <text
            x={ox + slot.x + slot.width / 2}
            y={oy + 24 + slot.y + slot.height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fill={color}
            fontSize={9}
            fontFamily="inherit"
            opacity={0.6}
          >
            {slot.name}
          </text>
        </g>
      ))}
    </svg>
  );
};

AvlSlotMap.displayName = 'AvlSlotMap';
