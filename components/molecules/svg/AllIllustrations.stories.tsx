import type { Meta, StoryObj } from '@storybook/react-vite';
import { OrbitalUnit } from './OrbitalUnit';
import { ClosedCircuit } from './ClosedCircuit';
import { ComposableModels } from './ComposableModels';
import { SharedReality } from './SharedReality';
import { StandardLibrary } from './StandardLibrary';
import { CompileAnywhere } from './CompileAnywhere';
import { ProveCorrect } from './ProveCorrect';
import { AIGenerates } from './AIGenerates';
import { PlanVerifyRemember } from './PlanVerifyRemember';
import { CommunityOwnership } from './CommunityOwnership';
import { ServiceLayers } from './ServiceLayers';
import { DescribeProveDeploy } from './DescribeProveDeploy';
import { EventBus } from './EventBus';
import { StateMachine } from './StateMachine';
import { WorldModel } from './WorldModel';
import { DomainGrid } from './DomainGrid';

const ILLUSTRATIONS = [
  { name: 'OrbitalUnit', Component: OrbitalUnit },
  { name: 'ClosedCircuit', Component: ClosedCircuit },
  { name: 'ComposableModels', Component: ComposableModels },
  { name: 'SharedReality', Component: SharedReality },
  { name: 'StandardLibrary', Component: StandardLibrary },
  { name: 'CompileAnywhere', Component: CompileAnywhere },
  { name: 'ProveCorrect', Component: ProveCorrect },
  { name: 'AIGenerates', Component: AIGenerates },
  { name: 'PlanVerifyRemember', Component: PlanVerifyRemember },
  { name: 'CommunityOwnership', Component: CommunityOwnership },
  { name: 'ServiceLayers', Component: ServiceLayers },
  { name: 'DescribeProveDeploy', Component: DescribeProveDeploy },
  { name: 'EventBus', Component: EventBus },
  { name: 'StateMachine', Component: StateMachine },
  { name: 'WorldModel', Component: WorldModel },
  { name: 'DomainGrid', Component: DomainGrid },
] as const;

const Gallery = ({ animated }: { animated: boolean }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24, width: '100%', maxWidth: 1200 }}>
    {ILLUSTRATIONS.map(({ name, Component }) => (
      <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <Component className="w-full" animated={animated} />
        <span style={{ fontSize: 12, opacity: 0.6 }}>{name}</span>
      </div>
    ))}
  </div>
);

Gallery.displayName = 'Gallery';

const meta: Meta<typeof Gallery> = {
  title: 'Illustrations/Gallery',
  component: Gallery,
  parameters: { layout: 'padded', backgrounds: { default: 'dark' } },
  argTypes: {
    animated: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIllustrations: Story = {
  args: { animated: false },
};

export const AllAnimated: Story = {
  args: { animated: true },
};
