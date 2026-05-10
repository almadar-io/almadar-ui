'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { MapPin, GripVertical, ArrowRight, X, Clock, Route } from 'lucide-react';
import { MapView, type MapMarkerData } from '../molecules/MapView';
import { Box } from '../atoms/Box';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Badge, type BadgeVariant } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { cn } from '../../lib/cn';

export type RouteStopStatus =
  | 'pending'
  | 'en-route'
  | 'arrived'
  | 'completed'
  | 'skipped';

export interface RouteStop {
  id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  estimatedArrival?: string;
  durationMinutes?: number;
  status?: RouteStopStatus;
}

export interface RouteMapProps {
  stops: RouteStop[];
  origin?: { lat: number; lng: number; label: string };
  selectedStopId?: string | null;
  editable?: boolean;
  onSelectStop?: (id: string | null) => void;
  onReorderStops?: (newOrder: string[]) => void;
  onSkipStop?: (id: string) => void;
  totalDistanceKm?: number;
  totalDurationMinutes?: number;
  className?: string;
}

const statusVariant: Record<RouteStopStatus, BadgeVariant> = {
  pending: 'neutral',
  'en-route': 'info',
  arrived: 'warning',
  completed: 'success',
  skipped: 'danger',
};

const statusLabel: Record<RouteStopStatus, string> = {
  pending: 'Pending',
  'en-route': 'En Route',
  arrived: 'Arrived',
  completed: 'Completed',
  skipped: 'Skipped',
};

function formatDuration(minutes: number | undefined): string | null {
  if (minutes == null) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function RouteMap({
  stops,
  origin,
  selectedStopId,
  editable = false,
  onSelectStop,
  onReorderStops,
  onSkipStop,
  totalDistanceKm,
  totalDurationMinutes,
  className,
}: RouteMapProps): React.ReactElement {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const markers: MapMarkerData[] = useMemo(() => {
    const result: MapMarkerData[] = [];
    if (origin) {
      result.push({
        id: `origin:${origin.label}`,
        lat: origin.lat,
        lng: origin.lng,
        label: `Start: ${origin.label}`,
        category: 'origin',
      });
    }
    stops.forEach((stop, index) => {
      if (stop.lat != null && stop.lng != null) {
        result.push({
          id: stop.id,
          lat: stop.lat,
          lng: stop.lng,
          label: `${index + 1}. ${stop.label}`,
          category: stop.status ?? 'pending',
        });
      }
    });
    return result;
  }, [stops, origin]);

  const center = useMemo(() => {
    const points = markers.length > 0
      ? markers.map((m) => ({ lat: m.lat, lng: m.lng }))
      : [];
    if (points.length === 0) {
      return { lat: 51.505, lng: -0.09 };
    }
    const sumLat = points.reduce((a, p) => a + p.lat, 0);
    const sumLng = points.reduce((a, p) => a + p.lng, 0);
    return { lat: sumLat / points.length, lng: sumLng / points.length };
  }, [markers]);

  const handleDragStart = useCallback((id: string) => {
    if (!editable) return;
    setDragId(id);
  }, [editable]);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    if (!editable || dragId == null) return;
    e.preventDefault();
    setDragOverId(id);
  }, [editable, dragId]);

  const handleDrop = useCallback((targetId: string) => {
    if (!editable || dragId == null || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const order = stops.map((s) => s.id);
    const fromIdx = order.indexOf(dragId);
    const toIdx = order.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const next = [...order];
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, dragId);
    onReorderStops?.(next);
    setDragId(null);
    setDragOverId(null);
  }, [editable, dragId, stops, onReorderStops]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDragOverId(null);
  }, []);

  return (
    <Card
      variant="bordered"
      padding="none"
      className={cn('flex flex-col overflow-hidden', className)}
      data-testid="route-map"
    >
      <Box className="flex flex-col md:flex-row min-h-[400px]">
        <Box className="w-full md:w-[30%] border-b md:border-b-0 md:border-r border-border flex flex-col">
          <Box className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Route className="w-4 h-4 text-muted-foreground" />
            <Typography variant="subheading">Route</Typography>
            <Badge variant="neutral" size="sm" label={`${stops.length} stops`} />
          </Box>
          <Box className="flex-1 overflow-y-auto" data-testid="route-map-stop-list">
            {origin ? (
              <Box className="px-4 py-3 border-b border-border bg-muted/30">
                <Box className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success flex-shrink-0" />
                  <Box className="min-w-0 flex-1">
                    <Typography variant="caption" className="uppercase tracking-wide">Origin</Typography>
                    <Typography variant="body2" truncate>{origin.label}</Typography>
                  </Box>
                </Box>
              </Box>
            ) : null}
            {stops.length === 0 ? (
              <Box className="px-4 py-8 text-center">
                <Typography variant="body2" color="muted">No stops on this route.</Typography>
              </Box>
            ) : (
              <Box as="ul" className="divide-y divide-border">
                {stops.map((stop, index) => {
                  const isSelected = stop.id === selectedStopId;
                  const isDragOver = stop.id === dragOverId && dragId != null && dragId !== stop.id;
                  const status = stop.status ?? 'pending';
                  return (
                    <Box
                      as="li"
                      key={stop.id}
                      data-testid={`route-map-stop-${stop.id}`}
                      data-stop-id={stop.id}
                      draggable={editable}
                      onDragStart={() => handleDragStart(stop.id)}
                      onDragOver={(e: React.DragEvent) => handleDragOver(e, stop.id)}
                      onDrop={() => handleDrop(stop.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onSelectStop?.(stop.id === selectedStopId ? null : stop.id)}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                        'hover:bg-muted/40',
                        isSelected && 'bg-primary/10',
                        isDragOver && 'border-t-2 border-primary',
                      )}
                    >
                      {editable ? (
                        <Box
                          as="span"
                          className="flex-shrink-0 mt-1 cursor-grab text-muted-foreground hover:text-foreground"
                          aria-label="Drag to reorder"
                          data-testid={`route-map-drag-${stop.id}`}
                        >
                          <GripVertical className="w-4 h-4" />
                        </Box>
                      ) : null}
                      <Box
                        as="span"
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center',
                          'bg-primary text-primary-foreground',
                        )}
                        aria-label={`Stop ${index + 1}`}
                      >
                        {index + 1}
                      </Box>
                      <Box className="min-w-0 flex-1">
                        <Typography variant="body2" weight="semibold" truncate>{stop.label}</Typography>
                        <Typography variant="caption" truncate>{stop.address}</Typography>
                        <Box className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant={statusVariant[status]} size="sm" label={statusLabel[status]} />
                          {stop.estimatedArrival ? (
                            <Box as="span" className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {stop.estimatedArrival}
                            </Box>
                          ) : null}
                          {stop.durationMinutes != null ? (
                            <Typography variant="caption">{formatDuration(stop.durationMinutes)}</Typography>
                          ) : null}
                        </Box>
                      </Box>
                      {editable && onSkipStop && status !== 'skipped' && status !== 'completed' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Skip ${stop.label}`}
                          data-testid={`route-map-skip-${stop.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSkipStop(stop.id);
                          }}
                          leftIcon={<X className="w-3.5 h-3.5" />}
                        />
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
        <Box className="w-full md:w-[70%] relative" data-testid="route-map-map-container">
          {markers.length > 0 ? (
            <MapView
              markers={markers}
              centerLat={center.lat}
              centerLng={center.lng}
              zoom={12}
              height="100%"
              className="h-full min-h-[400px]"
            />
          ) : (
            <Box className="h-full min-h-[400px] flex items-center justify-center bg-muted/20">
              <Box className="text-center px-6">
                <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <Typography variant="body2" color="muted">
                  Add stops with coordinates to see them on the map.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
      <Box className="border-t border-border px-4 py-3 flex items-center gap-4 flex-wrap bg-muted/20">
        <Box className="flex items-center gap-2">
          <Route className="w-4 h-4 text-muted-foreground" />
          <Typography variant="caption" className="uppercase tracking-wide">Total</Typography>
        </Box>
        <Typography variant="body2">
          {stops.length} {stops.length === 1 ? 'stop' : 'stops'}
        </Typography>
        {totalDistanceKm != null ? (
          <Box as="span" className="inline-flex items-center gap-1">
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            <Typography variant="body2">{totalDistanceKm.toFixed(1)} km</Typography>
          </Box>
        ) : null}
        {totalDurationMinutes != null ? (
          <Box as="span" className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <Typography variant="body2">{formatDuration(totalDurationMinutes)}</Typography>
          </Box>
        ) : null}
      </Box>
    </Card>
  );
}

RouteMap.displayName = 'RouteMap';

export default RouteMap;
