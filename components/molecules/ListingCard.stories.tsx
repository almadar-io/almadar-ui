import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ListingCard } from './ListingCard';
import { HStack, VStack } from '../atoms/Stack';

const HOUSE_IMG =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80';
const APARTMENT_IMG =
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80';
const LOFT_IMG =
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80';
const COTTAGE_IMG =
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80';
const STUDIO_IMG =
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';
const VILLA_IMG =
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';
const TOWNHOUSE_IMG =
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80';
const CABIN_IMG =
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80';
const PENTHOUSE_IMG =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80';

const meta: Meta<typeof ListingCard> = {
  title: 'Marketing/Molecules/ListingCard',
  component: ListingCard,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    layout: { control: 'select', options: ['vertical', 'horizontal'] },
    badge: {
      control: 'select',
      options: [undefined, 'new', 'featured', 'price-drop', 'sold', 'pending'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Modern Family Home with Garden',
    imageUrl: HOUSE_IMG,
    price: '$525,000',
    location: 'San Francisco, CA',
    rating: 4.8,
    reviewCount: 124,
    facts: [
      { icon: 'bed', label: '3 bed' },
      { icon: 'bath', label: '2 bath' },
      { icon: 'square', label: '1,850 sqft' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Featured: Story = {
  args: {
    title: 'Penthouse with Panoramic Views',
    imageUrl: PENTHOUSE_IMG,
    price: '$2,450,000',
    location: 'Manhattan, NY',
    rating: 4.9,
    reviewCount: 38,
    badge: 'featured',
    facts: [
      { icon: 'bed', label: '4 bed' },
      { icon: 'bath', label: '3 bath' },
      { icon: 'square', label: '3,200 sqft' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const Sold: Story = {
  args: {
    title: 'Charming Cottage by the Lake',
    imageUrl: COTTAGE_IMG,
    price: '$385,000',
    location: 'Lake Tahoe, CA',
    badge: 'sold',
    facts: [
      { icon: 'bed', label: '2 bed' },
      { icon: 'bath', label: '1 bath' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const PriceDrop: Story = {
  args: {
    title: 'Spacious Loft in Arts District',
    imageUrl: LOFT_IMG,
    price: '$675,000',
    location: 'Los Angeles, CA',
    rating: 4.6,
    reviewCount: 52,
    badge: 'price-drop',
    facts: [
      { icon: 'bed', label: '2 bed' },
      { icon: 'bath', label: '2 bath' },
      { icon: 'square', label: '1,400 sqft' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export const HorizontalLayout: Story = {
  args: {
    title: 'Sunlit Studio Apartment',
    imageUrl: STUDIO_IMG,
    price: '$1,950/mo',
    location: 'Brooklyn, NY',
    rating: 4.5,
    reviewCount: 89,
    layout: 'horizontal',
    facts: [
      { icon: 'bed', label: 'Studio' },
      { icon: 'bath', label: '1 bath' },
      { icon: 'square', label: '550 sqft' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
};

export const WithFavorite: Story = {
  render: (args) => {
    const [fav, setFav] = useState(true);
    return (
      <div className="w-80">
        <ListingCard
          {...args}
          favorite={fav}
          onFavoriteToggle={() => setFav((v) => !v)}
        />
      </div>
    );
  },
  args: {
    title: 'Cozy Mountain Cabin',
    imageUrl: CABIN_IMG,
    price: '$245/night',
    location: 'Aspen, CO',
    rating: 4.95,
    reviewCount: 211,
    badge: 'new',
    facts: [
      { icon: 'bed', label: '3 bed' },
      { icon: 'bath', label: '2 bath' },
      { icon: 'users', label: 'Sleeps 6' },
    ],
  },
};

export const MultipleFacts: Story = {
  args: {
    title: 'Luxury Villa with Private Pool',
    imageUrl: VILLA_IMG,
    price: '$1,250,000',
    location: 'Malibu, CA',
    rating: 5.0,
    reviewCount: 17,
    badge: 'featured',
    facts: [
      { icon: 'bed', label: '5 bed' },
      { icon: 'bath', label: '4 bath' },
      { icon: 'square', label: '4,800 sqft' },
      { icon: 'car', label: '3 garage' },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
};

export const GridDemo: Story = {
  render: () => {
    const listings: Array<{
      title: string;
      imageUrl: string;
      price: string;
      location: string;
      rating: number;
      reviewCount: number;
      badge?: 'new' | 'featured' | 'price-drop' | 'sold' | 'pending';
      facts: { icon: string; label: string }[];
    }> = [
      {
        title: 'Modern Family Home with Garden',
        imageUrl: HOUSE_IMG,
        price: '$525,000',
        location: 'San Francisco, CA',
        rating: 4.8,
        reviewCount: 124,
        badge: 'new',
        facts: [
          { icon: 'bed', label: '3 bed' },
          { icon: 'bath', label: '2 bath' },
          { icon: 'square', label: '1,850 sqft' },
        ],
      },
      {
        title: 'Downtown Apartment',
        imageUrl: APARTMENT_IMG,
        price: '$2,800/mo',
        location: 'Seattle, WA',
        rating: 4.6,
        reviewCount: 78,
        facts: [
          { icon: 'bed', label: '2 bed' },
          { icon: 'bath', label: '1 bath' },
          { icon: 'square', label: '950 sqft' },
        ],
      },
      {
        title: 'Penthouse with Panoramic Views',
        imageUrl: PENTHOUSE_IMG,
        price: '$2,450,000',
        location: 'Manhattan, NY',
        rating: 4.9,
        reviewCount: 38,
        badge: 'featured',
        facts: [
          { icon: 'bed', label: '4 bed' },
          { icon: 'bath', label: '3 bath' },
          { icon: 'square', label: '3,200 sqft' },
        ],
      },
      {
        title: 'Spacious Loft in Arts District',
        imageUrl: LOFT_IMG,
        price: '$675,000',
        location: 'Los Angeles, CA',
        rating: 4.6,
        reviewCount: 52,
        badge: 'price-drop',
        facts: [
          { icon: 'bed', label: '2 bed' },
          { icon: 'bath', label: '2 bath' },
          { icon: 'square', label: '1,400 sqft' },
        ],
      },
      {
        title: 'Charming Cottage by the Lake',
        imageUrl: COTTAGE_IMG,
        price: '$385,000',
        location: 'Lake Tahoe, CA',
        rating: 4.7,
        reviewCount: 96,
        badge: 'sold',
        facts: [
          { icon: 'bed', label: '2 bed' },
          { icon: 'bath', label: '1 bath' },
          { icon: 'square', label: '900 sqft' },
        ],
      },
      {
        title: 'Sunlit Studio Apartment',
        imageUrl: STUDIO_IMG,
        price: '$1,950/mo',
        location: 'Brooklyn, NY',
        rating: 4.5,
        reviewCount: 89,
        facts: [
          { icon: 'bed', label: 'Studio' },
          { icon: 'bath', label: '1 bath' },
          { icon: 'square', label: '550 sqft' },
        ],
      },
      {
        title: 'Luxury Villa with Private Pool',
        imageUrl: VILLA_IMG,
        price: '$1,250,000',
        location: 'Malibu, CA',
        rating: 5.0,
        reviewCount: 17,
        badge: 'featured',
        facts: [
          { icon: 'bed', label: '5 bed' },
          { icon: 'bath', label: '4 bath' },
          { icon: 'square', label: '4,800 sqft' },
        ],
      },
      {
        title: 'Brick Townhouse',
        imageUrl: TOWNHOUSE_IMG,
        price: '$725,000',
        location: 'Boston, MA',
        rating: 4.4,
        reviewCount: 63,
        badge: 'pending',
        facts: [
          { icon: 'bed', label: '3 bed' },
          { icon: 'bath', label: '2 bath' },
          { icon: 'square', label: '2,100 sqft' },
        ],
      },
      {
        title: 'Cozy Mountain Cabin',
        imageUrl: CABIN_IMG,
        price: '$245/night',
        location: 'Aspen, CO',
        rating: 4.95,
        reviewCount: 211,
        badge: 'new',
        facts: [
          { icon: 'bed', label: '3 bed' },
          { icon: 'bath', label: '2 bath' },
          { icon: 'users', label: 'Sleeps 6' },
        ],
      },
    ];

    const FavCard: React.FC<{ listing: (typeof listings)[number]; index: number }> = ({
      listing,
      index,
    }) => {
      const [fav, setFav] = useState(index % 3 === 0);
      return (
        <ListingCard
          {...listing}
          favorite={fav}
          onFavoriteToggle={() => setFav((v) => !v)}
        />
      );
    };

    return (
      <VStack gap="lg">
        <div className="grid grid-cols-3 gap-6 max-w-5xl">
          {listings.map((listing, idx) => (
            <FavCard key={listing.title} listing={listing} index={idx} />
          ))}
        </div>
      </VStack>
    );
  },
  parameters: { layout: 'padded' },
};

export const AllBadges: Story = {
  render: () => (
    <HStack gap="md" align="start" className="flex-wrap">
      {(['new', 'featured', 'price-drop', 'sold', 'pending'] as const).map(
        (b) => (
          <div key={b} className="w-64">
            <ListingCard
              title="Sample Listing"
              imageUrl={HOUSE_IMG}
              price="$525,000"
              location="San Francisco, CA"
              badge={b}
              size="sm"
              facts={[
                { icon: 'bed', label: '3 bed' },
                { icon: 'bath', label: '2 bath' },
              ]}
            />
          </div>
        ),
      )}
    </HStack>
  ),
  parameters: { layout: 'padded' },
};
