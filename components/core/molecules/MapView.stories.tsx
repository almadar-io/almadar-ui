import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapView } from './MapView';

const meta: Meta<typeof MapView> = {
  title: 'Core/Molecules/MapView',
  component: MapView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    zoom: { control: { type: 'range', min: 1, max: 18, step: 1 } },
    height: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMarkers = [
  { id: '1', lat: 51.505, lng: -0.09, label: 'London Bridge', category: 'Landmark' },
  { id: '2', lat: 51.515, lng: -0.1, label: 'Kings Cross', category: 'Station' },
  { id: '3', lat: 51.498, lng: -0.075, label: 'Tower of London', category: 'Landmark' },
  { id: '4', lat: 51.51, lng: -0.118, label: 'Covent Garden', category: 'Shopping' },
  { id: '5', lat: 51.501, lng: -0.142, label: 'Buckingham Palace', category: 'Landmark' },
];

export const Default: Story = {
  args: {
    markers: sampleMarkers,
    centerLat: 51.505,
    centerLng: -0.09,
    zoom: 13,
    height: '400px',
  },
};

export const NoMarkers: Story = {
  args: {
    centerLat: 48.8566,
    centerLng: 2.3522,
    zoom: 12,
    height: '400px',
  },
};

export const HighZoom: Story = {
  args: {
    markers: [sampleMarkers[0]],
    centerLat: 51.505,
    centerLng: -0.09,
    zoom: 17,
    height: '500px',
  },
};

export const Interactive: Story = {
  args: {
    markers: sampleMarkers,
    centerLat: 51.505,
    centerLng: -0.09,
    zoom: 13,
    height: '500px',
    onMarkerClick: (marker) => alert(`Clicked: ${marker.label}`),
    onMapClick: (lat, lng) => alert(`Map clicked at ${lat.toFixed(4)}, ${lng.toFixed(4)}`),
  },
};
