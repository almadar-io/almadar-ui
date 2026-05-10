'use client';
/**
 * VendorOnboardingStepper Organism
 *
 * Multi-step KYC + bank-link wizard for marketplace vendor onboarding.
 * Composes WizardProgress + WizardNavigation molecules with a per-step
 * form panel that owns local validation.
 */
import React, { useCallback, useMemo, useState } from "react";
import {
  Building,
  FileText,
  Landmark,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { Card } from "../atoms/Card";
import { Typography } from "../atoms/Typography";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Icon } from "../atoms/Icon";
import { Box } from "../atoms/Box";
import { Label } from "../atoms/Label";
import { HStack, VStack } from "../atoms/Stack";
import { WizardProgress } from "../molecules/WizardProgress";
import { WizardNavigation } from "../molecules/WizardNavigation";
import { UploadDropZone } from "../molecules/UploadDropZone";
import { Tooltip } from "../molecules/Tooltip";
import { cn } from "../../lib/cn";

export type OnboardingStep =
  | "business-info"
  | "tax-id"
  | "bank-link"
  | "identity-verify"
  | "review"
  | "submitted";

export interface OnboardingState {
  businessName?: string;
  legalName?: string;
  ein?: string;
  bankRoutingMasked?: string;
  bankAcctMasked?: string;
  identityDocUploaded?: boolean;
  agreedToTerms?: boolean;
}

export interface VendorOnboardingStepperProps {
  initialStep?: OnboardingStep;
  initialState?: Partial<OnboardingState>;
  onSubmit?: (state: OnboardingState) => void;
  onStepChange?: (step: OnboardingStep) => void;
  onSaveDraft?: (state: OnboardingState) => void;
  className?: string;
}

const STEP_ORDER: OnboardingStep[] = [
  "business-info",
  "tax-id",
  "bank-link",
  "identity-verify",
  "review",
];

interface StepMeta {
  id: OnboardingStep;
  title: string;
  description: string;
  icon: typeof Building;
}

const STEP_META: Record<OnboardingStep, StepMeta> = {
  "business-info": {
    id: "business-info",
    title: "Business Info",
    description: "Tell us about your business",
    icon: Building,
  },
  "tax-id": {
    id: "tax-id",
    title: "Tax ID",
    description: "Provide your federal EIN",
    icon: FileText,
  },
  "bank-link": {
    id: "bank-link",
    title: "Bank Account",
    description: "Link a payout account",
    icon: Landmark,
  },
  "identity-verify": {
    id: "identity-verify",
    title: "Identity",
    description: "Upload an ID document",
    icon: ShieldCheck,
  },
  review: {
    id: "review",
    title: "Review",
    description: "Confirm and submit",
    icon: ClipboardCheck,
  },
  submitted: {
    id: "submitted",
    title: "Submitted",
    description: "Application received",
    icon: CheckCircle,
  },
};

const EIN_REGEX = /^\d{2}-\d{7}$/;

function maskLast4(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return digits.slice(-4);
}

function validateStep(
  step: OnboardingStep,
  state: OnboardingState,
): { valid: boolean; errors: Partial<Record<keyof OnboardingState, string>> } {
  const errors: Partial<Record<keyof OnboardingState, string>> = {};

  switch (step) {
    case "business-info": {
      if (!state.businessName?.trim()) {
        errors.businessName = "Business name is required";
      }
      if (!state.legalName?.trim()) {
        errors.legalName = "Legal name is required";
      }
      break;
    }
    case "tax-id": {
      if (!state.ein?.trim()) {
        errors.ein = "EIN is required";
      } else if (!EIN_REGEX.test(state.ein.trim())) {
        errors.ein = "EIN must match format xx-xxxxxxx";
      }
      break;
    }
    case "bank-link": {
      if (!state.bankRoutingMasked) {
        errors.bankRoutingMasked = "Routing number is required";
      }
      if (!state.bankAcctMasked) {
        errors.bankAcctMasked = "Account number is required";
      }
      break;
    }
    case "identity-verify": {
      if (!state.identityDocUploaded) {
        errors.identityDocUploaded = "Identity document is required";
      }
      break;
    }
    case "review": {
      if (!state.agreedToTerms) {
        errors.agreedToTerms = "You must agree to the terms";
      }
      break;
    }
    default:
      break;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, htmlFor, error, hint, children }) => (
  <Box className="space-y-1">
    <Label htmlFor={htmlFor} className="flex items-center gap-1">
      <Typography variant="small" weight="semibold">
        {label}
      </Typography>
      {hint}
    </Label>
    {children}
    {error && (
      <Typography variant="caption" color="error">
        {error}
      </Typography>
    )}
  </Box>
);

export const VendorOnboardingStepper: React.FC<VendorOnboardingStepperProps> = ({
  initialStep = "business-info",
  initialState,
  onSubmit,
  onStepChange,
  onSaveDraft,
  className,
}) => {
  const [step, setStep] = useState<OnboardingStep>(initialStep);
  const [state, setState] = useState<OnboardingState>({ ...initialState });
  const [showErrors, setShowErrors] = useState(false);

  const currentIndex = STEP_ORDER.indexOf(step);
  const isSubmitted = step === "submitted";
  const stepIndex = isSubmitted ? STEP_ORDER.length : currentIndex;

  const { valid, errors } = useMemo(
    () => validateStep(step, state),
    [step, state],
  );

  const goToStep = useCallback(
    (next: OnboardingStep) => {
      setStep(next);
      setShowErrors(false);
      onStepChange?.(next);
    },
    [onStepChange],
  );

  const handleNext = useCallback(() => {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      goToStep(STEP_ORDER[nextIndex]);
    }
  }, [valid, currentIndex, goToStep]);

  const handleBack = useCallback(() => {
    if (currentIndex > 0) {
      goToStep(STEP_ORDER[currentIndex - 1]);
    }
  }, [currentIndex, goToStep]);

  const handleSubmit = useCallback(() => {
    if (!valid) {
      setShowErrors(true);
      return;
    }
    onSubmit?.(state);
    setStep("submitted");
    onStepChange?.("submitted");
  }, [valid, state, onSubmit, onStepChange]);

  const handleSaveDraft = useCallback(() => {
    onSaveDraft?.(state);
  }, [state, onSaveDraft]);

  const update = <K extends keyof OnboardingState>(
    key: K,
    value: OnboardingState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const progressSteps = STEP_ORDER.map((id) => ({
    id,
    title: STEP_META[id].title,
    description: STEP_META[id].description,
  }));

  const renderPanel = () => {
    if (isSubmitted) {
      return (
        <VStack align="center" gap="md" className="py-12">
          <Icon icon={CheckCircle} size="xl" className="text-success" />
          <Typography variant="h3" align="center">
            Application submitted
          </Typography>
          <Typography variant="body1" color="muted" align="center">
            Your application is under review. We'll email you within 2 business days.
          </Typography>
        </VStack>
      );
    }

    const meta = STEP_META[step];
    const err = showErrors ? errors : {};

    return (
      <VStack gap="md">
        <HStack gap="sm" align="center">
          <Icon icon={meta.icon} size="md" className="text-primary" />
          <Box>
            <Typography variant="h4" as="h2">
              {meta.title}
            </Typography>
            <Typography variant="body2" color="muted">
              {meta.description}
            </Typography>
          </Box>
        </HStack>

        {step === "business-info" && (
          <VStack gap="sm">
            <Field
              label="Business name"
              htmlFor="vos-business-name"
              error={err.businessName}
            >
              <Input
                id="vos-business-name"
                value={state.businessName ?? ""}
                placeholder="Acme Coffee Roasters"
                onChange={(e) => update("businessName", e.target.value)}
                error={err.businessName}
              />
            </Field>
            <Field
              label="Legal entity name"
              htmlFor="vos-legal-name"
              error={err.legalName}
            >
              <Input
                id="vos-legal-name"
                value={state.legalName ?? ""}
                placeholder="Acme Coffee Roasters, LLC"
                onChange={(e) => update("legalName", e.target.value)}
                error={err.legalName}
              />
            </Field>
          </VStack>
        )}

        {step === "tax-id" && (
          <Field
            label="Federal EIN"
            htmlFor="vos-ein"
            error={err.ein}
            hint={
              <Tooltip content="Your 9-digit Employer Identification Number, formatted xx-xxxxxxx. Found on IRS Form SS-4.">
                <Box as="span" className="inline-flex">
                  <Icon icon={HelpCircle} size="sm" className="text-muted-foreground" />
                </Box>
              </Tooltip>
            }
          >
            <Input
              id="vos-ein"
              value={state.ein ?? ""}
              placeholder="12-3456789"
              onChange={(e) => update("ein", e.target.value)}
              error={err.ein}
            />
          </Field>
        )}

        {step === "bank-link" && (
          <VStack gap="sm">
            <Button variant="secondary" disabled>
              <Icon icon={Landmark} size="sm" />
              Connect with Plaid
            </Button>
            <Typography variant="caption" color="muted">
              Or enter account details manually:
            </Typography>
            <Field
              label="Routing number"
              htmlFor="vos-routing"
              error={err.bankRoutingMasked}
            >
              <Input
                id="vos-routing"
                value={
                  state.bankRoutingMasked
                    ? `****${state.bankRoutingMasked}`
                    : ""
                }
                placeholder="9 digits"
                onChange={(e) =>
                  update("bankRoutingMasked", maskLast4(e.target.value))
                }
                error={err.bankRoutingMasked}
              />
            </Field>
            <Field
              label="Account number"
              htmlFor="vos-account"
              error={err.bankAcctMasked}
            >
              <Input
                id="vos-account"
                value={
                  state.bankAcctMasked ? `****${state.bankAcctMasked}` : ""
                }
                placeholder="Account number"
                onChange={(e) =>
                  update("bankAcctMasked", maskLast4(e.target.value))
                }
                error={err.bankAcctMasked}
              />
            </Field>
          </VStack>
        )}

        {step === "identity-verify" && (
          <VStack gap="sm">
            <UploadDropZone
              accept="image/*,application/pdf"
              maxSize={10 * 1024 * 1024}
              maxFiles={1}
              label="Upload government-issued ID"
              description="Driver's license, passport, or state ID. PNG, JPG, or PDF up to 10MB."
              onFiles={() => update("identityDocUploaded", true)}
            />
            {state.identityDocUploaded && (
              <Typography variant="caption" color="success">
                Document received
              </Typography>
            )}
            {err.identityDocUploaded && (
              <Typography variant="caption" color="error">
                {err.identityDocUploaded}
              </Typography>
            )}
          </VStack>
        )}

        {step === "review" && (
          <VStack gap="sm">
            <Card variant="bordered" padding="md">
              <VStack gap="sm">
                <ReviewRow label="Business name" value={state.businessName} />
                <ReviewRow label="Legal entity" value={state.legalName} />
                <ReviewRow label="EIN" value={state.ein} />
                <ReviewRow
                  label="Routing"
                  value={
                    state.bankRoutingMasked
                      ? `****${state.bankRoutingMasked}`
                      : undefined
                  }
                />
                <ReviewRow
                  label="Account"
                  value={
                    state.bankAcctMasked ? `****${state.bankAcctMasked}` : undefined
                  }
                />
                <ReviewRow
                  label="Identity document"
                  value={state.identityDocUploaded ? "Uploaded" : undefined}
                />
              </VStack>
            </Card>
            <Checkbox
              checked={state.agreedToTerms ?? false}
              onChange={(e) =>
                update("agreedToTerms", e.currentTarget.checked)
              }
              label="I agree to the marketplace vendor terms and W-9 attestation"
            />
            {err.agreedToTerms && (
              <Typography variant="caption" color="error">
                {err.agreedToTerms}
              </Typography>
            )}
          </VStack>
        )}
      </VStack>
    );
  };

  return (
    <Card
      variant="bordered"
      padding="none"
      className={cn("flex flex-col w-full max-w-3xl mx-auto", className)}
    >
      {!isSubmitted && (
        <WizardProgress
          steps={progressSteps}
          currentStep={stepIndex}
          allowNavigation={false}
        />
      )}

      <Box className="p-6 flex-1">{renderPanel()}</Box>

      {!isSubmitted && (
        <>
          <Box className="px-6 pb-2 flex justify-end">
            <Button variant="ghost" onClick={handleSaveDraft}>
              Save Draft
            </Button>
          </Box>
          <WizardNavigation
            currentStep={currentIndex}
            totalSteps={STEP_ORDER.length}
            isValid={valid || !showErrors}
            onBackClick={handleBack}
            onNextClick={handleNext}
            onCompleteClick={handleSubmit}
            completeLabel="Submit application"
          />
        </>
      )}
    </Card>
  );
};

VendorOnboardingStepper.displayName = "VendorOnboardingStepper";

interface ReviewRowProps {
  label: string;
  value?: string;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ label, value }) => (
  <HStack gap="sm" align="center" className="justify-between">
    <Typography variant="small" color="muted">
      {label}
    </Typography>
    <Typography variant="small" weight="semibold">
      {value ?? "-"}
    </Typography>
  </HStack>
);

export default VendorOnboardingStepper;
