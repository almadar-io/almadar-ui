'use client';
/**
 * NotifyListener Component
 *
 * Listens for UI:NOTIFY events on the event bus and renders toast notifications.
 * Mount once at the app root level (inside EventBusProvider).
 *
 * The compiler transpiles `notify("message", severity)` effects into
 * `eventBus.emit('UI:NOTIFY', { message, severity })` calls.
 * This component picks those up and renders them as Toast overlays.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useEventBus } from '../../hooks/useEventBus';
import { Toast, type ToastVariant } from '../molecules/Toast';
import { Box } from '../atoms/Box';

interface NotifyItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const MAX_VISIBLE = 4;
let nextId = 0;

export function NotifyListener(): React.ReactElement | null {
  const eventBus = useEventBus();
  const [items, setItems] = useState<NotifyItem[]>([]);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let root = document.getElementById('ui-notify-portal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'ui-notify-portal-root';
      document.body.appendChild(root);
    }
    setPortalRoot(root);
  }, []);

  const handleDismiss = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  useEffect(() => {
    const unsubscribe = eventBus.on('UI:NOTIFY', (event) => {
      const payload = (event.payload ?? event) as Record<string, unknown>;
      const message = typeof payload.message === 'string' ? payload.message : 'Notification';
      const severityMap: Record<string, ToastVariant> = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info',
      };
      const variant = severityMap[String(payload.severity)] || 'info';
      const id = ++nextId;
      setItems(prev => {
        // Deduplicate: skip if last toast has same message and variant
        const last = prev[prev.length - 1];
        if (last && last.message === message && last.variant === variant) return prev;
        return [...prev, { id, message, variant }].slice(-MAX_VISIBLE);
      });
    });
    return unsubscribe;
  }, [eventBus]);

  if (!portalRoot || items.length === 0) return null;

  return createPortal(
    <Box className="fixed bottom-4 right-4 z-50 pointer-events-auto flex flex-col gap-2">
      {items.map(item => (
        <Toast
          key={item.id}
          variant={item.variant}
          message={item.message}
          duration={5000}
          onDismiss={() => handleDismiss(item.id)}
        />
      ))}
    </Box>,
    portalRoot,
  );
}

NotifyListener.displayName = 'NotifyListener';
