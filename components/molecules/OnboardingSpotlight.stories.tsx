import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { OnboardingSpotlight } from './OnboardingSpotlight';
import { Button } from '../atoms/Button';
import { HStack } from '../atoms/Stack';

const meta: Meta<typeof OnboardingSpotlight> = {
  title: 'Core/Molecules/OnboardingSpotlight',
  component: OnboardingSpotlight,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WelcomeTour: Story = {
  render: function Welcome() {
    const [step, setStep] = useState(0);
    const [done, setDone] = useState(false);
    const steps = [
      { anchor: '#sb-chat', title: 'Describe what you want', body: 'The agent edits your app; the studio reacts.' },
      { anchor: '#sb-canvas', title: 'Your app takes shape', body: 'Watch entities and screens appear on the canvas.' },
      { anchor: '#sb-persona', title: "You're in Builder mode", body: 'Switch to Designer or Architect to unlock more.' },
    ];
    return (
      <div className="p-8 h-screen flex flex-col gap-8">
        <HStack gap="md" className="justify-between">
          <Button id="sb-chat" variant="ghost">Chat</Button>
          <Button id="sb-persona" variant="ghost">Builder ▾</Button>
        </HStack>
        <Button id="sb-canvas">Canvas</Button>

        {!done && (
          <OnboardingSpotlight
            steps={steps}
            stepIndex={step}
            onNext={() => setStep((s) => s + 1)}
            onSkip={() => setDone(true)}
            onFinish={() => setDone(true)}
          />
        )}
        {done && <Button onClick={() => { setStep(0); setDone(false); }}>Replay</Button>}
      </div>
    );
  },
};
