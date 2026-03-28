import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatedReveal } from './AnimatedReveal';
import { Box } from './Box';
import { Typography } from './Typography';
import { Card, CardContent } from './Card';
import { VStack } from './Stack';

const meta: Meta<typeof AnimatedReveal> = {
  title: 'Marketing/Atoms/AnimatedReveal',
  component: AnimatedReveal,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    trigger: {
      control: 'select',
      options: ['scroll', 'hover', 'manual'],
    },
    animation: {
      control: 'select',
      options: ['fade-up', 'fade-down', 'fade-in', 'fade-left', 'fade-right', 'scale', 'scale-up', 'none'],
    },
    duration: { control: { type: 'range', min: 100, max: 2000, step: 100 } },
    delay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    threshold: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    once: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DemoCard = ({ label }: { label: string }) => (
  <Card className="w-72">
    <CardContent>
      <Typography variant="h4">{label}</Typography>
      <Typography variant="body" className="text-muted-foreground">
        This card animates into view when it enters the viewport.
      </Typography>
    </CardContent>
  </Card>
);

export const Default: Story = {
  args: {
    trigger: 'scroll',
    animation: 'fade-up',
    duration: 600,
    once: true,
    children: <DemoCard label="Scroll to reveal" />,
  },
};

export const HoverTrigger: Story = {
  args: {
    trigger: 'hover',
    animation: 'scale',
    duration: 300,
    children: <DemoCard label="Hover me" />,
  },
};

export const AllAnimations: Story = {
  render: () => (
    <VStack className="gap-24 py-[50vh]">
      <Typography variant="body" className="text-center text-muted-foreground">
        Scroll down to see each animation
      </Typography>
      {(['fade-up', 'fade-down', 'fade-in', 'fade-left', 'fade-right', 'scale', 'scale-up'] as const).map((anim) => (
        <AnimatedReveal key={anim} animation={anim} duration={700}>
          <DemoCard label={anim} />
        </AnimatedReveal>
      ))}
    </VStack>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const StaggeredGroup: Story = {
  render: () => (
    <VStack className="gap-4 py-[60vh]">
      <Typography variant="body" className="text-center text-muted-foreground">
        Scroll down for staggered reveal
      </Typography>
      {[0, 100, 200, 300, 400].map((d, i) => (
        <AnimatedReveal key={d} animation="fade-up" delay={d}>
          <DemoCard label={`Card ${i + 1} (delay ${d}ms)`} />
        </AnimatedReveal>
      ))}
    </VStack>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const RenderFunction: Story = {
  args: {
    trigger: 'scroll',
    animation: 'fade-up',
  },
  render: (args) => (
    <Box className="py-[60vh]">
      <AnimatedReveal {...args}>
        {(animated: boolean) => (
          <Card className="w-72">
            <CardContent>
              <Typography variant="h4">
                {animated ? 'Visible!' : 'Hidden'}
              </Typography>
              <Typography variant="body" className="text-muted-foreground">
                Render function receives animated state: {String(animated)}
              </Typography>
            </CardContent>
          </Card>
        )}
      </AnimatedReveal>
    </Box>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const RepeatingAnimation: Story = {
  args: {
    trigger: 'scroll',
    animation: 'fade-up',
    once: false,
    children: <DemoCard label="Scroll in and out" />,
  },
  render: (args) => (
    <Box className="py-[60vh]">
      <AnimatedReveal {...args} />
      <Box className="h-[80vh]" />
    </Box>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
