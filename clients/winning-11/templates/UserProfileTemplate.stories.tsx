import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserProfileTemplate, type UserProfileData } from "./UserProfileTemplate";

const mockUser: UserProfileData = {
  id: "user-1",
  name: "Alex Thompson",
  email: "alex.thompson@example.com",
  status: "active",
  primaryCategory: "Technology",
  connectionSlots: 150,
  usedSlots: 45,
  isBetaUser: true,
  inviteCode: "ALEX2024",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  assessmentId: "assess-123",
  trustScoreId: "ts-456",
};

const meta: Meta<typeof UserProfileTemplate> = {
  title: "Clients/Winning-11/Templates/UserProfileTemplate",
  component: UserProfileTemplate,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: mockUser,
  },
};

export const ActiveUser: Story = {
  args: {
    user: {
      ...mockUser,
      status: "active",
    },
  },
};

export const PendingUser: Story = {
  args: {
    user: {
      ...mockUser,
      status: "pending",
      assessmentId: undefined,
      trustScoreId: undefined,
    },
  },
};

export const SuspendedUser: Story = {
  args: {
    user: {
      ...mockUser,
      status: "suspended",
    },
  },
};

export const BetaUser: Story = {
  args: {
    user: {
      ...mockUser,
      isBetaUser: true,
    },
  },
};

export const HighConnectionUsage: Story = {
  args: {
    user: {
      ...mockUser,
      connectionSlots: 150,
      usedSlots: 145,
    },
  },
};

export const NoAssessmentOrTrustScore: Story = {
  args: {
    user: {
      ...mockUser,
      assessmentId: undefined,
      trustScoreId: undefined,
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    error: new Error("Failed to load user profile"),
  },
};

export const NotFound: Story = {
  args: {
    user: undefined,
  },
};

export const NoBackButton: Story = {
  args: {
    user: mockUser,
    showBack: false,
  },
};

export const UsingDataProp: Story = {
  args: {
    data: mockUser,
  },
};
