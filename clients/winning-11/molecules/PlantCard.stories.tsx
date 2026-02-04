import type { Meta, StoryObj } from '@storybook/react';
import { PlantCard } from './PlantCard';

const meta: Meta<typeof PlantCard> = {
  title: 'Clients/Winning-11/Molecules/PlantCard',
  component: PlantCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    growthStage: {
      control: { type: 'range', min: 0, max: 100 },
    },
    trustLevel: {
      control: 'select',
      options: ['seedling', 'growing', 'mature', 'flourishing'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Green Valley Farm',
    type: 'Organic Producer',
    growthStage: 45,
    trustLevel: 'growing',
  },
};

export const NewRelationship: Story = {
  args: {
    name: 'Sunrise Orchards',
    type: 'Fruit Supplier',
    growthStage: 15,
    trustLevel: 'seedling',
    lastInteraction: '2 days ago',
  },
};

export const EstablishedPartner: Story = {
  args: {
    name: 'Heritage Grains Co.',
    type: 'Grain Supplier',
    growthStage: 85,
    trustLevel: 'flourishing',
    lastInteraction: 'Yesterday',
  },
};

export const NeedsAttention: Story = {
  args: {
    name: 'Mountain Dairy',
    type: 'Dairy Producer',
    growthStage: 60,
    trustLevel: 'mature',
    needsAttention: true,
    careNeeds: [
      { type: 'communication', urgency: 'high' },
      { type: 'payment', urgency: 'medium' },
    ],
    lastInteraction: '2 weeks ago',
  },
};

export const WithCareNeeds: Story = {
  args: {
    name: 'River Valley Produce',
    type: 'Vegetable Supplier',
    growthStage: 50,
    trustLevel: 'growing',
    careNeeds: [
      { type: 'feedback', urgency: 'low' },
      { type: 'delivery', urgency: 'medium' },
    ],
  },
};

export const Clickable: Story = {
  args: {
    name: 'Coastal Fisheries',
    type: 'Seafood Supplier',
    growthStage: 70,
    trustLevel: 'mature',
    onClick: () => alert('Card clicked!'),
  },
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid w-[600px] grid-cols-2 gap-4">
      <PlantCard
        name="Green Valley Farm"
        type="Organic Producer"
        growthStage={85}
        trustLevel="flourishing"
      />
      <PlantCard
        name="Sunrise Orchards"
        type="Fruit Supplier"
        growthStage={45}
        trustLevel="growing"
        needsAttention
        careNeeds={[{ type: 'communication', urgency: 'medium' }]}
      />
      <PlantCard
        name="Heritage Grains"
        type="Grain Supplier"
        growthStage={20}
        trustLevel="seedling"
        lastInteraction="Today"
      />
      <PlantCard
        name="Mountain Dairy"
        type="Dairy Producer"
        growthStage={65}
        trustLevel="mature"
        careNeeds={[
          { type: 'payment', urgency: 'high' },
          { type: 'feedback', urgency: 'low' },
        ]}
      />
    </div>
  ),
};
