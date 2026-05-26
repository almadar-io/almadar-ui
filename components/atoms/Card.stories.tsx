import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardBody, CardHeader, CardFooter, CardTitle } from './Card';
import { Button } from './Button';

const meta: Meta<typeof Card> = {
    title: 'Core/Atoms/Card',
    component: Card,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'wireframe' },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['default', 'outline', 'elevated'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        children: (
            <CardBody>
                <CardTitle>Card Title</CardTitle>
                <p className="text-sm text-neutral-600">This is a simple card with the wireframe theme applied.</p>
            </CardBody>
        ),
    },
};

export const WithHeader: Story = {
    render: () => (
        <Card className="w-80">
            <CardHeader>
                <CardTitle>Card Header</CardTitle>
                <p className="text-sm text-neutral-600">With header and body sections</p>
            </CardHeader>
            <CardBody>
                <p className="text-black">
                    This card demonstrates the header and body layout.
                </p>
            </CardBody>
        </Card>
    ),
};

export const WithFooter: Story = {
    render: () => (
        <Card className="w-80">
            <CardBody>
                <CardTitle>Complete Card</CardTitle>
                <p className="text-sm text-neutral-600">Header, body, and footer sections</p>
                <p className="mt-4 text-black">
                    Main content goes here in the body section.
                </p>
            </CardBody>
            <CardFooter>
                <Button variant="secondary" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save</Button>
            </CardFooter>
        </Card>
    ),
};

export const Variants: Story = {
    render: () => (
        <div className="flex gap-4">
            <Card variant="default" className="w-48 p-4">
                <CardTitle>Default</CardTitle>
                <p className="text-sm text-neutral-600">Default variant</p>
            </Card>
            <Card variant="bordered" className="w-48 p-4">
                <CardTitle>Bordered</CardTitle>
                <p className="text-sm text-neutral-600">Bordered variant</p>
            </Card>
            <Card variant="elevated" className="w-48 p-4">
                <CardTitle>Elevated</CardTitle>
                <p className="text-sm text-neutral-600">Elevated variant</p>
            </Card>
        </div>
    ),
};

export const Interactive: Story = {
    render: () => (
        <Card className="w-80 cursor-pointer hover:shadow-wireframe transition-shadow">
            <CardBody>
                <CardTitle>Interactive Card</CardTitle>
                <p className="text-sm text-neutral-600">Hover to see the shadow effect</p>
            </CardBody>
        </Card>
    ),
};

/** ── Layer 2 looks ── */

export const FlatBordered: Story = {
    args: {
        look: 'flat-bordered',
        children: (
            <CardBody>
                <CardTitle>Flat Bordered</CardTitle>
                <p className="text-sm text-neutral-600">A card with a hairline border and no shadow.</p>
            </CardBody>
        ),
    },
    parameters: {
        docs: { description: { story: 'Hairline border, no shadow. Linear/Notion-style flat cards.' } },
    },
};

export const BorderlessDivider: Story = {
    args: {
        look: 'borderless-divider',
        children: (
            <CardBody>
                <CardTitle>Borderless Divider</CardTitle>
                <p className="text-sm text-neutral-600">A card delineated by dividers instead of a border.</p>
            </CardBody>
        ),
    },
    parameters: {
        docs: { description: { story: 'No border or shadow; sections are separated by horizontal dividers only.' } },
    },
};

export const Ticket: Story = {
    args: {
        look: 'ticket',
        children: (
            <CardBody>
                <CardTitle>Ticket</CardTitle>
                <p className="text-sm text-neutral-600">A perforated ticket-style card for passes and receipts.</p>
            </CardBody>
        ),
    },
    parameters: {
        docs: { description: { story: 'Ticket/stub silhouette with notched edges, evoking event passes or boarding stubs.' } },
    },
};

export const Invoice: Story = {
    args: {
        look: 'invoice',
        children: (
            <CardBody>
                <CardTitle>Invoice</CardTitle>
                <p className="text-sm text-neutral-600">Paper-document treatment for invoices and statements.</p>
            </CardBody>
        ),
    },
    parameters: {
        docs: { description: { story: 'Document-paper treatment with crisp edges and conservative spacing — invoices, receipts, statements.' } },
    },
};

export const Chip: Story = {
    args: {
        look: 'chip',
        children: (
            <CardBody>
                <CardTitle>Chip</CardTitle>
                <p className="text-sm text-neutral-600">Compact pill-shaped card for tags or compact metadata.</p>
            </CardBody>
        ),
    },
    parameters: {
        docs: { description: { story: 'Compact pill-shaped surface for tag-like or token-sized content.' } },
    },
};

export const TileImageFirst: Story = {
    args: {
        look: 'tile-image-first',
        children: (
            <CardBody>
                <CardTitle>Tile (Image First)</CardTitle>
                <p className="text-sm text-neutral-600">Media-led tile where the image dominates above the text.</p>
            </CardBody>
        ),
    },
    parameters: {
        docs: { description: { story: 'Media-led tile: image area occupies the top, text content sits beneath.' } },
    },
};
