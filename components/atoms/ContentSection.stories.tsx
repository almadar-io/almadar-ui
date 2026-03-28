import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContentSection } from './ContentSection';
import { Typography } from './Typography';
import { VStack } from './Stack';

const meta: Meta<typeof ContentSection> = {
  title: 'Marketing/Atoms/ContentSection',
  component: ContentSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    background: {
      control: 'select',
      options: ['default', 'alt', 'dark', 'gradient'],
    },
    padding: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <VStack gap="md" align="center">
        <Typography variant="h2" weight="bold">Default Section</Typography>
        <Typography variant="body" color="muted">
          This section uses the default background with large padding.
        </Typography>
      </VStack>
    ),
  },
};

export const AltBackground: Story = {
  args: {
    background: 'alt',
    children: (
      <VStack gap="md" align="center">
        <Typography variant="h2" weight="bold">Alt Background</Typography>
        <Typography variant="body" color="muted">
          A subtle muted background for visual separation.
        </Typography>
      </VStack>
    ),
  },
};

export const DarkBackground: Story = {
  args: {
    background: 'dark',
    children: (
      <VStack gap="md" align="center">
        <Typography variant="h2" weight="bold">Dark Background</Typography>
        <Typography variant="body">
          Inverted colors for high-contrast sections.
        </Typography>
      </VStack>
    ),
  },
};

export const GradientBackground: Story = {
  args: {
    background: 'gradient',
    children: (
      <VStack gap="md" align="center">
        <Typography variant="h2" weight="bold">Gradient Background</Typography>
        <Typography variant="body" color="muted">
          A subtle gradient using primary and secondary colors.
        </Typography>
      </VStack>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    background: 'alt',
    children: (
      <VStack gap="sm" align="center">
        <Typography variant="h3" weight="bold">Compact Section</Typography>
        <Typography variant="body" color="muted">
          Reduced vertical padding for tighter layouts.
        </Typography>
      </VStack>
    ),
  },
};

export const AllBackgrounds: Story = {
  render: () => (
    <VStack gap="none">
      <ContentSection background="default">
        <VStack gap="sm" align="center">
          <Typography variant="h3" weight="bold">Default</Typography>
          <Typography variant="body" color="muted">No background styling</Typography>
        </VStack>
      </ContentSection>
      <ContentSection background="alt">
        <VStack gap="sm" align="center">
          <Typography variant="h3" weight="bold">Alt</Typography>
          <Typography variant="body" color="muted">Subtle muted background</Typography>
        </VStack>
      </ContentSection>
      <ContentSection background="dark">
        <VStack gap="sm" align="center">
          <Typography variant="h3" weight="bold">Dark</Typography>
          <Typography variant="body">Inverted color scheme</Typography>
        </VStack>
      </ContentSection>
      <ContentSection background="gradient">
        <VStack gap="sm" align="center">
          <Typography variant="h3" weight="bold">Gradient</Typography>
          <Typography variant="body" color="muted">Subtle color gradient</Typography>
        </VStack>
      </ContentSection>
    </VStack>
  ),
};
