'use client';
/**
 * ConfettiEffect Atom Component
 *
 * Renders a brief particle burst animation when triggered.
 * Uses CSS keyframe animations for each particle with random
 * position, rotation, and velocity.
 */
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { Box } from "./Box";

export interface ConfettiEffectProps {
  /** When this changes from false to true, a burst of particles is spawned */
  trigger: boolean;
  /** How long the animation lasts in milliseconds */
  duration?: number;
  /** Number of particles to spawn */
  particleCount?: number;
  /** Additional class names */
  className?: string;
}

interface Particle {
  id: number;
  color: string;
  left: number;
  delay: number;
  angle: number;
  distance: number;
  rotation: number;
  size: number;
}

const CONFETTI_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
  "gold",
  "dodgerblue",
];

let particleIdCounter = 0;

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    particleIdCounter += 1;
    return {
      id: particleIdCounter,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      left: 30 + Math.random() * 40,
      delay: Math.random() * 300,
      angle: Math.random() * 360,
      distance: 40 + Math.random() * 80,
      rotation: Math.random() * 720 - 360,
      size: 4 + Math.random() * 6,
    };
  });
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  trigger,
  duration = 2000,
  particleCount = 30,
  className,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const previousTriggerRef = useRef(false);

  useEffect(() => {
    const wasFalse = !previousTriggerRef.current;
    previousTriggerRef.current = trigger;

    if (trigger && wasFalse) {
      const newParticles = createParticles(particleCount);
      setParticles(newParticles);

      const timer = window.setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => {
        window.clearTimeout(timer);
      };
    }
    return undefined;
  }, [trigger, particleCount, duration]);

  if (particles.length === 0) {
    return null;
  }

  return (
    <Box
      position="absolute"
      className={cn(
        "inset-0 pointer-events-none overflow-hidden z-50",
        className,
      )}
      aria-hidden="true"
    >
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.distance;
        const ty = Math.sin(rad) * p.distance - 20;

        return (
          <Box
            key={p.id}
            className="absolute rounded-sm"
            style={{
              left: `${p.left}%`,
              top: "50%",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animation: `confetti-burst ${duration - p.delay}ms ease-out ${p.delay}ms forwards`,
              opacity: 0,
              // Use CSS custom properties for the animation endpoint
              // @ts-expect-error -- CSS custom properties are not typed in CSSProperties
              '--confetti-tx': `${tx}px`,
              '--confetti-ty': `${ty}px`,
              '--confetti-rotate': `${p.rotation}deg`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-burst {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(var(--confetti-tx), var(--confetti-ty)) rotate(var(--confetti-rotate)) scale(0.5);
          }
        }
      `}</style>
    </Box>
  );
};

ConfettiEffect.displayName = "ConfettiEffect";
