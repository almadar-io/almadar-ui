'use client';

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Lightbox, type LightboxImage } from "./Lightbox";

const sampleImages: LightboxImage[] = [
  {
    src: "https://picsum.photos/id/10/800/600",
    alt: "Forest landscape",
    caption: "A misty forest in the morning",
  },
  {
    src: "https://picsum.photos/id/20/800/600",
    alt: "Mountain view",
    caption: "Mountain peaks above the clouds",
  },
  {
    src: "https://picsum.photos/id/30/800/600",
    alt: "Ocean sunset",
    caption: "Sunset over the Pacific Ocean",
  },
  {
    src: "https://picsum.photos/id/40/800/600",
    alt: "City skyline",
    caption: "Downtown skyline at dusk",
  },
];

const meta: Meta<typeof Lightbox> = {
  title: "Molecules/Lightbox",
  component: Lightbox,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    currentIndex: { control: { type: "number", min: 0, max: 3 } },
    showCounter: { control: "boolean" },
    isOpen: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    images: sampleImages,
    isOpen: true,
    currentIndex: 0,
    showCounter: true,
  },
};

export const SingleImage: Story = {
  args: {
    images: [sampleImages[0]],
    isOpen: true,
    showCounter: false,
  },
};

export const WithoutCounter: Story = {
  args: {
    images: sampleImages,
    isOpen: true,
    showCounter: false,
  },
};

function GalleryWithLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="p-8">
      <div className="text-sm font-medium text-[var(--color-foreground)] mb-4">
        Click an image to open lightbox
      </div>
      <div className="grid grid-cols-4 gap-2 w-[600px]">
        {sampleImages.map((img, i) => (
          <button
            key={i}
            type="button"
            className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setSelectedIndex(i);
              setIsOpen(true);
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      <Lightbox
        images={sampleImages}
        isOpen={isOpen}
        currentIndex={selectedIndex}
        onClose={() => setIsOpen(false)}
        onIndexChange={setSelectedIndex}
      />
    </div>
  );
}

export const GalleryIntegration: Story = {
  render: () => <GalleryWithLightbox />,
};
