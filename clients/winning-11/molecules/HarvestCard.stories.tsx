import type { Meta, StoryObj } from "@storybook/react-vite";
import { HarvestCard } from "./HarvestCard";

const meta: Meta<typeof HarvestCard> = {
  title: "Clients/Winning-11/Molecules/HarvestCard",
  component: HarvestCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Organic Tomatoes Delivery",
    amount: 2500,
    date: new Date("2024-01-15"),
    parties: {
      farmer: "Green Valley Farm",
      buyer: "Fresh Market Co.",
    },
  },
};

export const WithoutAmount: Story = {
  args: {
    title: "Partnership Agreement Signed",
    date: new Date("2024-01-10"),
    parties: {
      farmer: "Sunrise Orchards",
      buyer: "Local Grocery Chain",
    },
  },
};

export const WithActions: Story = {
  args: {
    title: "Spring Harvest Complete",
    amount: 15000,
    date: new Date("2024-03-20"),
    parties: {
      farmer: "Heritage Grains Co.",
      buyer: "Artisan Bakery",
    },
    itemActions: [
      { label: "View Details", event: "VIEW" },
      { label: "Download Receipt", event: "DOWNLOAD", variant: "ghost" },
    ],
  },
};

export const MinimalInfo: Story = {
  args: {
    title: "First Transaction",
    amount: 500,
  },
};

export const WithDataProp: Story = {
  args: {
    data: {
      id: "harvest-123",
      title: "Wheat Delivery Q4",
      amount: 8500,
      currency: "$",
      date: "2024-12-01",
      parties: {
        farmer: "Prairie Fields Farm",
        buyer: "Regional Mill",
      },
    },
  },
};

export const CardGrid: Story = {
  render: () => (
    <div className="grid w-[600px] grid-cols-2 gap-4">
      <HarvestCard
        title="Organic Produce"
        amount={3200}
        date={new Date("2024-01-15")}
        parties={{ farmer: "Green Valley", buyer: "Fresh Foods" }}
      />
      <HarvestCard
        title="Dairy Products"
        amount={1800}
        date={new Date("2024-01-12")}
        parties={{ farmer: "Mountain Dairy", buyer: "Local Market" }}
      />
      <HarvestCard
        title="Grain Shipment"
        amount={12000}
        date={new Date("2024-01-10")}
        parties={{ farmer: "Heritage Grains", buyer: "City Bakery" }}
      />
      <HarvestCard
        title="Fruit Harvest"
        amount={4500}
        date={new Date("2024-01-08")}
        parties={{ farmer: "Sunrise Orchards", buyer: "Juice Co." }}
      />
    </div>
  ),
};
