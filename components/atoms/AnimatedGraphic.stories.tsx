import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatedGraphic } from './AnimatedGraphic';
import { AnimatedReveal } from './AnimatedReveal';
import { Box } from './Box';
import { VStack } from './Stack';
import { Typography } from './Typography';

const meta: Meta<typeof AnimatedGraphic> = {
  title: 'Atoms/AnimatedGraphic',
  component: AnimatedGraphic,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    animation: {
      control: 'select',
      options: ['draw', 'fill', 'pulse', 'morph'],
    },
    animate: { control: 'boolean' },
    duration: { control: { type: 'range', min: 200, max: 3000, step: 100 } },
    delay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    strokeColor: { control: 'color' },
    fillColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Simple geometric SVG for demos
const DEMO_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" stroke-width="2"/>
  <polygon points="100,30 170,140 30,140" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="100" y1="30" x2="100" y2="140" stroke="currentColor" stroke-width="1.5"/>
  <line x1="30" y1="140" x2="170" y2="140" stroke="currentColor" stroke-width="1.5"/>
</svg>`;

const STAR_SVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M100 10 L120 75 L190 75 L135 115 L155 180 L100 145 L45 180 L65 115 L10 75 L80 75 Z" fill="none" stroke="currentColor" stroke-width="2"/>
  <circle cx="100" cy="100" r="35" fill="none" stroke="currentColor" stroke-width="1.5"/>
</svg>`;

const WAVE_SVG = `<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
  <path d="M0 50 Q25 10 50 50 Q75 90 100 50 Q125 10 150 50 Q175 90 200 50 Q225 10 250 50 Q275 90 300 50" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M0 70 Q25 30 50 70 Q75 110 100 70 Q125 30 150 70 Q175 110 200 70 Q225 30 250 70 Q275 110 300 70" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
</svg>`;

export const DrawAnimation: Story = {
  args: {
    svgContent: DEMO_SVG,
    animation: 'draw',
    animate: true,
    duration: 1500,
    width: 200,
    height: 200,
    strokeColor: 'var(--color-primary)',
    alt: 'Geometric drawing animation',
  },
};

export const FillAnimation: Story = {
  args: {
    svgContent: STAR_SVG,
    animation: 'fill',
    animate: true,
    duration: 2000,
    width: 200,
    height: 200,
    strokeColor: 'var(--color-primary)',
    fillColor: 'var(--color-accent)',
    alt: 'Star fill animation',
  },
};

export const PulseAnimation: Story = {
  args: {
    svgContent: DEMO_SVG,
    animation: 'pulse',
    animate: true,
    duration: 2000,
    width: 200,
    height: 200,
    strokeColor: 'var(--color-primary)',
    alt: 'Pulsing graphic',
  },
};

export const MorphAnimation: Story = {
  args: {
    svgContent: STAR_SVG,
    animation: 'morph',
    animate: true,
    duration: 800,
    width: 200,
    height: 200,
    strokeColor: 'var(--color-primary)',
    alt: 'Morphing star',
  },
};

export const AllAnimationTypes: Story = {
  render: () => (
    <Box className="flex flex-wrap gap-8 items-start">
      {(['draw', 'fill', 'pulse', 'morph'] as const).map((anim) => (
        <VStack key={anim} className="gap-2 items-center">
          <Typography variant="small" className="text-muted-foreground font-medium">{anim}</Typography>
          <AnimatedGraphic
            svgContent={DEMO_SVG}
            animation={anim}
            animate={true}
            duration={anim === 'pulse' ? 2000 : 1500}
            width={150}
            height={150}
            strokeColor="var(--color-primary)"
            fillColor={anim === 'fill' ? 'var(--color-accent)' : undefined}
          />
        </VStack>
      ))}
    </Box>
  ),
};

export const WithAnimatedRevealScroll: Story = {
  render: () => (
    <VStack className="gap-24 py-[50vh] items-center">
      <Typography variant="body" className="text-muted-foreground">
        Scroll down to trigger SVG draw animations
      </Typography>
      <AnimatedReveal trigger="scroll" animation="fade-up">
        {(animated: boolean) => (
          <VStack className="gap-2 items-center">
            <AnimatedGraphic
              svgContent={DEMO_SVG}
              animation="draw"
              animate={animated}
              duration={1500}
              width={200}
              height={200}
              strokeColor="var(--color-primary)"
              alt="Circle and triangle drawing"
            />
            <Typography variant="small" className="text-muted-foreground">draw on scroll</Typography>
          </VStack>
        )}
      </AnimatedReveal>
      <AnimatedReveal trigger="scroll" animation="fade-up">
        {(animated: boolean) => (
          <VStack className="gap-2 items-center">
            <AnimatedGraphic
              svgContent={STAR_SVG}
              animation="fill"
              animate={animated}
              duration={2000}
              width={200}
              height={200}
              strokeColor="var(--color-primary)"
              fillColor="var(--color-accent)"
              alt="Star fill on scroll"
            />
            <Typography variant="small" className="text-muted-foreground">fill on scroll</Typography>
          </VStack>
        )}
      </AnimatedReveal>
      <AnimatedReveal trigger="scroll" animation="fade-in">
        {(animated: boolean) => (
          <VStack className="gap-2 items-center">
            <AnimatedGraphic
              svgContent={WAVE_SVG}
              animation="draw"
              animate={animated}
              duration={2000}
              width={300}
              height={100}
              strokeColor="var(--color-primary)"
              alt="Wave drawing on scroll"
            />
            <Typography variant="small" className="text-muted-foreground">wave draw on scroll</Typography>
          </VStack>
        )}
      </AnimatedReveal>
    </VStack>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const HoverTrigger: Story = {
  render: () => (
    <AnimatedReveal trigger="hover" animation="none" once={false}>
      {(animated: boolean) => (
        <Box className="p-4 border border-border rounded-md cursor-pointer">
          <AnimatedGraphic
            svgContent={STAR_SVG}
            animation="draw"
            animate={animated}
            duration={800}
            width={150}
            height={150}
            strokeColor="var(--color-primary)"
            alt="Star draws on hover"
          />
          <Typography variant="small" className="text-center text-muted-foreground">
            Hover to draw
          </Typography>
        </Box>
      )}
    </AnimatedReveal>
  ),
};
