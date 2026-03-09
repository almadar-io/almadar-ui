'use client';
/**
 * MapView Molecule Component
 *
 * Interactive map using react-leaflet with OpenStreetMap tiles.
 * Supports both programmatic callbacks (onMapClick) and schema-driven
 * event dispatch (mapClickEvent) via the event bus.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box } from '../atoms/Box';
import { Typography } from '../atoms/Typography';
import { cn } from '../../lib/cn';
import { useEventBus } from '../../hooks/useEventBus';

// Fix default marker icon (Leaflet CSS/webpack issue)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export interface MapMarkerData {
  /** Unique marker identifier */
  id: string | number;
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Label shown in popup */
  label?: string;
  /** Optional category for styling */
  category?: string;
}

export interface MapViewProps {
  /** Array of markers to display */
  markers?: MapMarkerData[];
  /** Map center latitude */
  centerLat?: number;
  /** Map center longitude */
  centerLng?: number;
  /** Zoom level (1-18, default 13) */
  zoom?: number;
  /** Height of the map container (default "400px") */
  height?: string;
  /** Callback when a marker is clicked (programmatic use) */
  onMarkerClick?: (marker: MapMarkerData) => void;
  /** Callback when the map is clicked (programmatic use) */
  onMapClick?: (lat: number, lng: number) => void;
  /** Event name dispatched via event bus when the map is clicked. Payload: { latitude, longitude } */
  mapClickEvent?: string;
  /** Event name dispatched via event bus when a marker is clicked. Payload: marker data */
  markerClickEvent?: string;
  /** Whether to show a pin at the clicked location */
  showClickedPin?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Show attribution (default true) */
  showAttribution?: boolean;
}

/** Syncs map view when center/zoom props change */
function MapUpdater({ centerLat, centerLng, zoom }: { centerLat: number; centerLng: number; zoom: number }) {
  const map = useMap();
  const prevRef = useRef({ centerLat, centerLng, zoom });

  useEffect(() => {
    const prev = prevRef.current;
    if (prev.centerLat !== centerLat || prev.centerLng !== centerLng || prev.zoom !== zoom) {
      map.setView([centerLat, centerLng], zoom);
      prevRef.current = { centerLat, centerLng, zoom };
    }
  }, [map, centerLat, centerLng, zoom]);

  return null;
}

/** Handles map click events */
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [map, onMapClick]);

  return null;
}

export function MapView({
  markers = [],
  centerLat = 51.505,
  centerLng = -0.09,
  zoom = 13,
  height = '400px',
  onMarkerClick,
  onMapClick,
  mapClickEvent,
  markerClickEvent,
  showClickedPin = false,
  className,
  showAttribution = true,
}: MapViewProps) {
  const eventBus = useEventBus();
  const [clickedPosition, setClickedPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (showClickedPin) {
      setClickedPosition({ lat, lng });
    }
    onMapClick?.(lat, lng);
    if (mapClickEvent) {
      eventBus.emit(`UI:${mapClickEvent}`, { latitude: lat, longitude: lng });
    }
  }, [onMapClick, mapClickEvent, eventBus, showClickedPin]);

  const handleMarkerClick = useCallback((marker: MapMarkerData) => {
    onMarkerClick?.(marker);
    if (markerClickEvent) {
      eventBus.emit(`UI:${markerClickEvent}`, { ...marker });
    }
  }, [onMarkerClick, markerClickEvent, eventBus]);

  return (
    <Box
      className={cn('relative w-full overflow-hidden rounded-lg', className)}
      style={{ height }}
      data-testid="map-view"
    >
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        attributionControl={showAttribution}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={showAttribution ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' : undefined}
        />
        <MapUpdater centerLat={centerLat} centerLng={centerLng} zoom={zoom} />
        <MapClickHandler onMapClick={handleMapClick} />
        {showClickedPin && clickedPosition && (
          <Marker position={[clickedPosition.lat, clickedPosition.lng]}>
            <Popup>
              <Typography variant="body2">
                {clickedPosition.lat.toFixed(5)}, {clickedPosition.lng.toFixed(5)}
              </Typography>
            </Popup>
          </Marker>
        )}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            eventHandlers={(onMarkerClick || markerClickEvent) ? { click: () => handleMarkerClick(marker) } : undefined}
          >
            {marker.label ? (
              <Popup>
                <Typography variant="body2">{marker.label}</Typography>
                {marker.category ? (
                  <Typography variant="caption" className="text-muted-foreground">{marker.category}</Typography>
                ) : null}
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
