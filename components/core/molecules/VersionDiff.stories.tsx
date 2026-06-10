import type { Meta, StoryObj } from '@storybook/react-vite';
import { VersionDiff, type DiffRevision } from './VersionDiff';

const meta: Meta<typeof VersionDiff> = {
    title: 'Core/Molecules/VersionDiff',
    component: VersionDiff,
    parameters: {
        layout: 'centered',
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

const simpleRevisions: DiffRevision[] = [
    {
        id: 'v1',
        label: 'v1 (original)',
        author: 'alice',
        timestamp: 'Mar 10',
        content: `line one\nline two\nline three\nline four`,
    },
    {
        id: 'v2',
        label: 'v2 (current)',
        author: 'bob',
        timestamp: 'Mar 12',
        content: `line one\nline two changed\nline three\nline four\nline five added`,
    },
];

const multiRevisions: DiffRevision[] = [
    {
        id: 'r1',
        label: 'v1 (Mar 1)',
        author: 'alice',
        timestamp: 'Mar 1',
        content: `function greet(name) {\n  return "hi " + name;\n}`,
    },
    {
        id: 'r2',
        label: 'v2 (Mar 5)',
        author: 'bob',
        timestamp: 'Mar 5',
        content: `function greet(name) {\n  return \`hi \${name}\`;\n}`,
    },
    {
        id: 'r3',
        label: 'v3 (Mar 8)',
        author: 'carol',
        timestamp: 'Mar 8',
        content: `function greet(name) {\n  console.log("greeting");\n  return \`hi \${name}\`;\n}`,
    },
    {
        id: 'r4',
        label: 'v4 (Mar 12)',
        author: 'dave',
        timestamp: 'Mar 12',
        content: `export function greet(name) {\n  console.log("greeting", name);\n  return \`hi \${name}\`;\n}`,
    },
    {
        id: 'r5',
        label: 'v5 (current)',
        author: 'erin',
        timestamp: 'Mar 15',
        content: `export function greet(name: string): string {\n  console.log("greeting", name);\n  return \`hi \${name}\`;\n}`,
    },
];

const markdownRevisions: DiffRevision[] = [
    {
        id: 'md-old',
        label: 'Draft 1',
        author: 'alice',
        timestamp: 'Apr 1',
        content: `# Project README\n\nThis project does stuff.\n\n## Install\n\nRun npm install.\n\n## Usage\n\nRun npm start.`,
    },
    {
        id: 'md-new',
        label: 'Draft 2 (current)',
        author: 'bob',
        timestamp: 'Apr 5',
        content: `# Project README\n\nThis project does stuff for you.\n\n## Install\n\nRun \`pnpm install\`.\n\n## Usage\n\nRun \`pnpm dev\`.\n\n## License\n\nMIT`,
    },
];

const jsRevisions: DiffRevision[] = [
    {
        id: 'js-old',
        label: 'Before refactor',
        author: 'alice',
        timestamp: 'Apr 8',
        content: `const sum = (a, b) => {\n  return a + b;\n};\n\nconst mul = (a, b) => {\n  return a * b;\n};\n\nconsole.log(sum(2, 3));`,
    },
    {
        id: 'js-new',
        label: 'After refactor',
        author: 'bob',
        timestamp: 'Apr 9',
        content: `function sum(a, b) {\n  return a + b;\n}\n\nfunction mul(a, b) {\n  return a * b;\n}\n\nfunction sub(a, b) {\n  return a - b;\n}\n\nconsole.log(sum(2, 3));\nconsole.log(sub(5, 1));`,
    },
];

const sameContent = `line a\nline b\nline c`;
const emptyDiffRevisions: DiffRevision[] = [
    { id: 'same1', label: 'v1', content: sameContent },
    { id: 'same2', label: 'v2 (no changes)', content: sameContent },
];

export const SimpleDiff: Story = {
    args: {
        revisions: simpleRevisions,
    },
};

export const MultiRevision: Story = {
    args: {
        revisions: multiRevisions,
        beforeId: 'r2',
        afterId: 'r5',
    },
};

export const InlineView: Story = {
    args: {
        revisions: simpleRevisions,
        view: 'inline',
    },
};

export const SideBySide: Story = {
    args: {
        revisions: simpleRevisions,
        view: 'side-by-side',
    },
};

export const EmptyDiff: Story = {
    args: {
        revisions: emptyDiffRevisions,
    },
};

export const MarkdownDiff: Story = {
    args: {
        revisions: markdownRevisions,
        language: 'markdown',
    },
};

export const CodeDiff: Story = {
    args: {
        revisions: jsRevisions,
        language: 'javascript',
        view: 'side-by-side',
    },
};

export const WithRevert: Story = {
    args: {
        revisions: multiRevisions,
        beforeId: 'r1',
        afterId: 'r5',
        onRevert: (id: string) => {
            console.log('revert to', id);
        },
    },
};
