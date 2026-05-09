import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouteMap, type RouteStop } from './RouteMap';

const meta: Meta<typeof RouteMap> = {
  title: 'Core/Organisms/RouteMap',
  component: RouteMap,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const depot = { lat: 37.7749, lng: -122.4194, label: 'SF Service Depot' };

const threeStops: RouteStop[] = [
  {
    id: 's1',
    label: 'Customer A — HVAC inspection',
    address: '1 Market St, San Francisco, CA',
    lat: 37.7937,
    lng: -122.3965,
    estimatedArrival: '09:15',
    durationMinutes: 45,
    status: 'completed',
  },
  {
    id: 's2',
    label: 'Customer B — Boiler repair',
    address: '500 Howard St, San Francisco, CA',
    lat: 37.7891,
    lng: -122.3973,
    estimatedArrival: '10:30',
    durationMinutes: 90,
    status: 'en-route',
  },
  {
    id: 's3',
    label: 'Customer C — Annual maintenance',
    address: '101 California St, San Francisco, CA',
    lat: 37.7929,
    lng: -122.3989,
    estimatedArrival: '12:45',
    durationMinutes: 60,
    status: 'pending',
  },
];

const tenStops: RouteStop[] = Array.from({ length: 10 }, (_, i) => {
  const lat = 37.77 + (i % 5) * 0.012;
  const lng = -122.43 + Math.floor(i / 5) * 0.025 + i * 0.004;
  const hour = 8 + Math.floor(i * 0.75);
  const min = (i * 30) % 60;
  return {
    id: `s${i + 1}`,
    label: `Job #${1200 + i} — Service call`,
    address: `${100 + i * 23} Main St, San Francisco, CA`,
    lat,
    lng,
    estimatedArrival: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
    durationMinutes: 30 + (i % 3) * 15,
    status: i < 2 ? 'completed' : i === 2 ? 'en-route' : 'pending',
  } satisfies RouteStop;
});

const mixedStatusStops: RouteStop[] = [
  { ...threeStops[0], status: 'completed' },
  { ...threeStops[1], status: 'arrived' },
  {
    id: 's3',
    label: 'Customer C — Faulty meter',
    address: '101 California St, San Francisco, CA',
    lat: 37.7929,
    lng: -122.3989,
    estimatedArrival: '12:45',
    durationMinutes: 60,
    status: 'skipped',
  },
  {
    id: 's4',
    label: 'Customer D — New install',
    address: '888 Brannan St, San Francisco, CA',
    lat: 37.7708,
    lng: -122.4048,
    estimatedArrival: '14:00',
    durationMinutes: 120,
    status: 'pending',
  },
];

export const EmptyRoute: Story = {
  args: {
    stops: [],
    totalDistanceKm: 0,
    totalDurationMinutes: 0,
  },
};

export const ThreeStops: Story = {
  args: {
    stops: threeStops,
    origin: depot,
    totalDistanceKm: 4.7,
    totalDurationMinutes: 195,
  },
};

export const TenStops: Story = {
  args: {
    stops: tenStops,
    origin: depot,
    totalDistanceKm: 38.2,
    totalDurationMinutes: 540,
  },
};

export const Editable: Story = {
  args: {
    stops: threeStops,
    origin: depot,
    editable: true,
    totalDistanceKm: 4.7,
    totalDurationMinutes: 195,
  },
};

export const WithStatus: Story = {
  args: {
    stops: mixedStatusStops,
    origin: depot,
    selectedStopId: 's2',
    totalDistanceKm: 6.1,
    totalDurationMinutes: 240,
  },
};

export const CustomOrigin: Story = {
  args: {
    stops: threeStops,
    origin: { lat: 37.8044, lng: -122.2712, label: 'Oakland Field Office' },
    totalDistanceKm: 22.4,
    totalDurationMinutes: 215,
  },
};
