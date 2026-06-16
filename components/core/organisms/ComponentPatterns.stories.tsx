import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  ButtonPattern,
  IconButtonPattern,
  TextPattern,
  AlertPattern,
} from './ComponentPatterns';
import { Card } from '../atoms/Card';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Checkbox } from '../atoms/Checkbox';
import { VStack, HStack } from '../atoms/Stack';
import { Typography } from '../atoms/Typography';
import { Badge } from '../atoms/Badge';
import { Avatar } from '../atoms/Avatar';
import { Icon } from '../atoms/Icon';
import { ProgressBar } from '../atoms/ProgressBar';
import { Spinner } from '../atoms/Spinner';
import { Accordion } from '../molecules/Accordion';
import { Container } from '../molecules/Container';

const HeadingPattern = ({ content, level = 2 }: { content: string; level?: 1|2|3|4|5|6 }) => (
  <Typography variant={`h${level}` as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'}>{content}</Typography>
);
const BadgePattern = ({ label, variant }: { label: string; variant?: string }) => (
  <Badge variant={variant as 'default'|'success'|'warning'|'danger'}>{label}</Badge>
);
const AvatarPattern = ({ name, size }: { name?: string; size?: 'xs'|'sm'|'md'|'lg'|'xl' }) => (
  <Avatar name={name} size={size} />
);
const IconPattern = ({ name, size, color }: { name: string; size?: 'xs'|'sm'|'md'|'lg'|'xl'; color?: string }) => (
  <Icon name={name} size={size} style={{ color }} />
);
const ProgressBarPattern = ({ value, variant, showLabel }: { value: number; variant?: string; showLabel?: boolean }) => (
  <ProgressBar value={value} variant={variant as 'primary'} showLabel={showLabel} />
);
const SpinnerPattern = ({ size }: { size?: 'xs'|'sm'|'md'|'lg' }) => <Spinner size={size} />;
const AccordionPattern = ({ items, defaultOpen }: { items: Array<{ title: string; content: React.ReactNode }>; defaultOpen?: number[] }) => (
  <Accordion items={items.map(i => ({ ...i, header: i.title }))} defaultOpen={defaultOpen} />
);
const ContainerPattern = ({ maxWidth, padding, children }: { maxWidth?: string; padding?: string; children?: React.ReactNode }) => (
  <Container maxWidth={maxWidth as 'md'} padding={padding as 'lg'}>{children}</Container>
);

const meta: Meta<typeof ButtonPattern> = {
  title: 'Core/Organisms/ComponentPatterns',
  component: ButtonPattern,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof ButtonPattern>;

export const Default: Story = {
  args: {
    label: 'Click Me',
    variant: 'primary',
    onClick: 'BUTTON_CLICK',
  },
};

export const ButtonVariants: Story = {
  render: () => (
    <HStack gap="md" wrap>
      <ButtonPattern label="Primary" variant="primary" onClick="PRIMARY" />
      <ButtonPattern label="Secondary" variant="secondary" onClick="SECONDARY" />
      <ButtonPattern label="Ghost" variant="ghost" onClick="GHOST" />
      <ButtonPattern label="Danger" variant="danger" onClick="DANGER" />
      <ButtonPattern label="Disabled" variant="primary" disabled onClick="DISABLED" />
      <ButtonPattern label="With Icon" variant="primary" icon="plus" iconPosition="left" onClick="ICON" />
    </HStack>
  ),
};

export const IconButtons: Story = {
  render: () => (
    <HStack gap="md">
      <IconButtonPattern icon="settings" onClick="SETTINGS" ariaLabel="Settings" />
      <IconButtonPattern icon="edit" onClick="EDIT" ariaLabel="Edit" variant="secondary" />
      <IconButtonPattern icon="trash" onClick="DELETE" ariaLabel="Delete" variant="danger" />
    </HStack>
  ),
};

export const DisplayComponents: Story = {
  render: () => (
    <VStack gap="lg">
      <HeadingPattern content="Section Heading" level={2} />
      <TextPattern content="Body text rendered through the pattern system." variant="body" size="md" />
      <HStack gap="sm">
        <BadgePattern label="Active" variant="success" />
        <BadgePattern label="Pending" variant="warning" />
        <BadgePattern label="Error" variant="danger" />
      </HStack>
      <HStack gap="md" align="center">
        <AvatarPattern name="John Doe" size="md" />
        <AvatarPattern name="Jane Smith" size="lg" />
        <IconPattern name="star" size="lg" color="var(--color-warning)" />
      </HStack>
      <ProgressBarPattern value={65} variant="primary" showLabel />
      <SpinnerPattern size="md" />
    </VStack>
  ),
};

export const FormInputs: Story = {
  render: () => (
    <VStack gap="md" className="max-w-sm">
      <Input placeholder="Enter your name" onChange="NAME_CHANGE" />
      <Input inputType="email" placeholder="Email address" onChange="EMAIL_CHANGE" />
      <Select
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' },
        ]}
        placeholder="Select role"
        onChange="ROLE_CHANGE"
      />
      <Checkbox label="Accept terms" onChange="TERMS_CHANGE" />
    </VStack>
  ),
};

export const FeedbackComponents: Story = {
  render: () => (
    <VStack gap="md">
      <AlertPattern variant="info" title="Info" message="This is an informational alert." />
      <AlertPattern variant="success" message="Operation completed successfully." />
      <AlertPattern variant="warning" message="Please review before continuing." dismissible onDismiss="DISMISS_WARNING" />
      <AlertPattern variant="error" title="Error" message="Something went wrong." />
    </VStack>
  ),
};

export const NavigationComponents: Story = {
  render: () => (
    <VStack gap="md">
      <AccordionPattern
        items={[
          { title: 'Section 1', content: <TextPattern content="Content for section one." /> },
          { title: 'Section 2', content: <TextPattern content="Content for section two." /> },
          { title: 'Section 3', content: <TextPattern content="Content for section three." /> },
        ]}
        defaultOpen={[0]}
      />
    </VStack>
  ),
};

export const LayoutComponents: Story = {
  render: () => (
    <ContainerPattern maxWidth="md" padding="lg">
      <Card title="Card Title" subtitle="Card subtitle" padding="lg" action="CARD_ACTION">
        <VStack gap="sm">
          <TextPattern content="This card is rendered via the pattern system." />
          <ButtonPattern label="Action" variant="primary" onClick="CARD_ACTION" />
        </VStack>
      </Card>
    </ContainerPattern>
  ),
};
