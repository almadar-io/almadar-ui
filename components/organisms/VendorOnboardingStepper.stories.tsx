import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  VendorOnboardingStepper,
  type OnboardingStep,
  type OnboardingState,
} from "./VendorOnboardingStepper";

const meta: Meta<typeof VendorOnboardingStepper> = {
  title: "Core/Organisms/VendorOnboardingStepper",
  component: VendorOnboardingStepper,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "wireframe" },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const wrap = (Story: React.ComponentType) => (
  <div style={{ padding: "2rem", minHeight: "100vh" }}>
    <Story />
  </div>
);

export const InitialBusinessInfo: Story = {
  args: {
    initialStep: "business-info",
    onSubmit: (state) => console.log("submit", state),
    onStepChange: (step) => console.log("step", step),
    onSaveDraft: (state) => console.log("draft", state),
  },
  decorators: [wrap],
};

export const MidwayBankLink: Story = {
  args: {
    initialStep: "bank-link",
    initialState: {
      businessName: "Acme Coffee Roasters",
      legalName: "Acme Coffee Roasters, LLC",
      ein: "12-3456789",
    },
    onSubmit: (state) => console.log("submit", state),
  },
  decorators: [wrap],
};

export const ReviewStep: Story = {
  args: {
    initialStep: "review",
    initialState: {
      businessName: "Acme Coffee Roasters",
      legalName: "Acme Coffee Roasters, LLC",
      ein: "12-3456789",
      bankRoutingMasked: "4321",
      bankAcctMasked: "9876",
      identityDocUploaded: true,
    },
    onSubmit: (state) => console.log("submit", state),
  },
  decorators: [wrap],
};

export const SubmittedSuccess: Story = {
  args: {
    initialStep: "submitted",
    initialState: {
      businessName: "Acme Coffee Roasters",
      legalName: "Acme Coffee Roasters, LLC",
      ein: "12-3456789",
      bankRoutingMasked: "4321",
      bankAcctMasked: "9876",
      identityDocUploaded: true,
      agreedToTerms: true,
    },
  },
  decorators: [wrap],
};

export const ValidationErrors: Story = {
  args: {
    initialStep: "tax-id",
    initialState: {
      businessName: "Acme",
      legalName: "Acme LLC",
      ein: "not-a-valid-ein",
    },
    onSubmit: (state) => console.log("submit", state),
  },
  decorators: [wrap],
  parameters: {
    docs: {
      description: {
        story:
          "Click Next with an invalid EIN to see the inline error and disabled-state guard.",
      },
    },
  },
};

const InteractiveDemo = () => {
  const [step, setStep] = useState<OnboardingStep>("business-info");
  const [submitted, setSubmitted] = useState<OnboardingState | null>(null);

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <strong>Current step:</strong> {step}
        {submitted && (
          <pre style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
            {JSON.stringify(submitted, null, 2)}
          </pre>
        )}
      </div>
      <VendorOnboardingStepper
        onStepChange={setStep}
        onSubmit={setSubmitted}
        onSaveDraft={(state) => console.log("draft", state)}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
  decorators: [wrap],
};
