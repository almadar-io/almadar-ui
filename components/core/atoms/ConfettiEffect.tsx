'use client';
/**
 * ConfettiEffect Atom Component
 *
 * Renders a brief particle burst animation when triggered.
 * Uses CSS keyframe animations for each particle with random
 * position, rotation, and velocity.
 */
import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/cn";
import { Box } from "./Box";
import { CONFETTI_BURST_KEYFRAMES, createConfettiParticles, type ConfettiParticle } from "./fx";

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

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  trigger,
  duration = 2000,
  particleCount = 30,
  className,
}) => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);
  const previousTriggerRef = useRef(false);
  const burstRef = useRef(0);

  useEffect(() => {
    const wasFalse = !previousTriggerRef.current;
    previousTriggerRef.current = trigger;

    if (trigger && wasFalse) {
      burstRef.current += 1;
      const newParticles = createConfettiParticles(particleCount, `confetti-${burstRef.current}`);
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
              '--confetti-tx': `${tx}px`,
              '--confetti-ty': `${ty}px`,
              '--confetti-rotate': `${p.rotation}deg`,
            } as React.CSSProperties & Record<`--${string}`, string>}
          />
        );
      })}
      <style>{CONFETTI_BURST_KEYFRAMES}</style>
    </Box>
  );
};

ConfettiEffect.displayName = "ConfettiEffect";
