import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BranchingLogicBuilder,
  type BranchingQuestion,
  type BranchingRule,
} from './BranchingLogicBuilder';

const meta: Meta<typeof BranchingLogicBuilder> = {
  title: 'Core/Molecules/BranchingLogicBuilder',
  component: BranchingLogicBuilder,
  parameters: {
    layout: 'padded',
    backgrounds: { default: 'wireframe' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const surveyQuestions: BranchingQuestion[] = [
  { id: 'q1', label: 'Q1: Are you employed?', optionValues: ['yes', 'no'] },
  { id: 'q2', label: 'Q2: What is your industry?', optionValues: ['tech', 'finance', 'health', 'other'] },
  { id: 'q3', label: 'Q3: How long at current job?', optionValues: ['<1yr', '1-3yr', '3-5yr', '5+yr'] },
  { id: 'q4', label: 'Q4: Are you looking for a new role?', optionValues: ['yes', 'no'] },
  { id: 'q5', label: 'Q5: Preferred work mode', optionValues: ['remote', 'hybrid', 'onsite'] },
  { id: 'q6', label: 'Q6: Salary expectation' },
];

const simpleRules: BranchingRule[] = [
  {
    id: 'r1',
    sourceQuestionId: 'q1',
    operator: 'equals',
    value: 'no',
    targetQuestionId: 'end-of-survey',
  },
  {
    id: 'r2',
    sourceQuestionId: 'q2',
    operator: 'equals',
    value: 'tech',
    targetQuestionId: 'q5',
  },
  {
    id: 'r3',
    sourceQuestionId: 'q3',
    operator: 'equals',
    value: '<1yr',
    targetQuestionId: 'q4',
  },
];

const branchingTreeRules: BranchingRule[] = [
  {
    id: 'r1',
    sourceQuestionId: 'q1',
    operator: 'equals',
    value: 'no',
    targetQuestionId: 'end-of-survey',
  },
  {
    id: 'r2',
    sourceQuestionId: 'q1',
    operator: 'equals',
    value: 'yes',
    targetQuestionId: 'q2',
  },
  {
    id: 'r3',
    sourceQuestionId: 'q2',
    operator: 'in',
    value: ['tech', 'finance'],
    targetQuestionId: 'q5',
  },
  {
    id: 'r4',
    sourceQuestionId: 'q2',
    operator: 'not-equals',
    value: 'tech',
    targetQuestionId: 'q3',
  },
  {
    id: 'r5',
    sourceQuestionId: 'q4',
    operator: 'equals',
    value: 'yes',
    targetQuestionId: 'q6',
  },
];

const brokenRules: BranchingRule[] = [
  {
    id: 'r1',
    sourceQuestionId: 'q1',
    operator: 'equals',
    value: 'yes',
    targetQuestionId: 'q2',
  },
  {
    id: 'r2',
    sourceQuestionId: 'q-missing',
    operator: 'equals',
    value: 'foo',
    targetQuestionId: 'q3',
  },
  {
    id: 'r3',
    sourceQuestionId: 'q2',
    operator: 'equals',
    value: 'tech',
    targetQuestionId: 'q-also-missing',
  },
];

export const Empty: Story = {
  args: {
    questions: surveyQuestions,
    rules: [],
  },
};

export const SimpleRules: Story = {
  args: {
    questions: surveyQuestions,
    rules: simpleRules,
  },
};

export const BranchingTree: Story = {
  args: {
    questions: surveyQuestions,
    rules: branchingTreeRules,
  },
};

export const WithBrokenReferences: Story = {
  args: {
    questions: surveyQuestions,
    rules: brokenRules,
  },
};

export const ReadOnly: Story = {
  args: {
    questions: surveyQuestions,
    rules: branchingTreeRules,
    readOnly: true,
  },
};

const InteractiveDemo: React.FC = () => {
  const [rules, setRules] = useState<BranchingRule[]>(simpleRules);
  return (
    <div className="flex flex-col gap-4">
      <BranchingLogicBuilder
        questions={surveyQuestions}
        rules={rules}
        onRulesChange={setRules}
      />
      <pre className="rounded-md border border-border bg-muted p-3 text-xs">
        {JSON.stringify(rules, null, 2)}
      </pre>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
