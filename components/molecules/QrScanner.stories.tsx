'use client';

import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QrScanner, type QrScanResult } from './QrScanner';

const meta: Meta<typeof QrScanner> = {
  title: 'Core/Molecules/QrScanner',
  component: QrScanner,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    facingMode: {
      control: 'select',
      options: ['environment', 'user'],
    },
    paused: { control: 'boolean' },
    showOverlay: { control: 'boolean' },
    showCameraControls: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    facingMode: 'environment',
    paused: false,
    showOverlay: true,
    showCameraControls: true,
  },
};

export const Paused: Story = {
  args: {
    facingMode: 'environment',
    paused: true,
    showOverlay: true,
    showCameraControls: true,
  },
};

export const NoCameraFallback: Story = {
  render: (args) => {
    const originalGetUserMedia =
      typeof navigator !== 'undefined' && navigator.mediaDevices
        ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
        : null;

    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(
          Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' }),
        );
    }

    React.useEffect(() => {
      return () => {
        if (originalGetUserMedia && navigator.mediaDevices) {
          navigator.mediaDevices.getUserMedia = originalGetUserMedia;
        }
      };
    }, []);

    return (
      <QrScanner
        {...args}
        fallback={
          <div className="flex aspect-square w-full max-w-md items-center justify-center rounded-sm bg-muted p-6 text-center text-sm">
            Camera not available. Please grant permission or use a different device.
          </div>
        }
      />
    );
  },
  args: {
    facingMode: 'environment',
    showOverlay: true,
    showCameraControls: false,
  },
};

export const MockScanButton: Story = {
  render: (args) => {
    const [lastScan, setLastScan] = useState<QrScanResult | null>(null);
    return (
      <div className="flex flex-col gap-3">
        <QrScanner
          {...args}
          onScan={(r) => setLastScan(r)}
          onError={(e) => console.error('Scanner error', e)}
        />
        <div className="rounded-sm border border-border bg-surface p-3 text-sm">
          {lastScan ? (
            <div>
              <div className="font-medium">Last scan</div>
              <div className="font-mono text-xs">{lastScan.text}</div>
              <div className="text-xs opacity-70">
                {lastScan.format} . {new Date(lastScan.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ) : (
            <div className="opacity-70">Click Mock Scan to synthesize a result.</div>
          )}
        </div>
      </div>
    );
  },
  args: {
    facingMode: 'environment',
    showOverlay: true,
    showCameraControls: true,
  },
};
