/**
 * StudioProjectTemplate - Project detail page with HQ and Build modes
 *
 * Main workspace with two modes:
 * - HQ Mode: Project info, proposal, design system browser
 * - Build Mode: Schema editor, visualization
 *
 * Event Contract:
 * - Emits: UI:MODE_CHANGE - When switching between HQ and Build modes
 * - Emits: UI:TAB_CHANGE - When switching tabs within a mode
 * - Emits: UI:SAVE - When saving the project
 * - Emits: UI:VALIDATE - When validating the schema
 * - Emits: UI:COMPILE - When compiling the schema
 * - Emits: UI:PREVIEW - When previewing the app
 * - Emits: UI:BACK - When navigating back to home
 * - Emits: UI:TOGGLE_AGENT - When toggling agent panel
 * - Emits: UI:TOGGLE_INSPECTOR - When toggling inspector panel
 * - Payload: { mode: StudioMode }, { tab: string }, void
 */

import React, { useState } from "react";
import {
  ArrowLeft,
  Building,
  Hammer,
  Bot,
  Info,
  FileText,
  Palette,
  Code,
  GitBranch,
  CheckCircle,
  Package,
  Play,
  Save,
  PanelRight,
  X,
} from "lucide-react";
import {
  Box,
  VStack,
  HStack,
  Typography,
  Button,
  Icon,
  Badge,
  Card,
  useEventBus,
} from '@almadar/ui';

export type StudioMode = "hq" | "build";
export type HQTab = "info" | "proposal" | "design-system";
export type BuildTab = "schema" | "visualization";

export interface ProjectInfo {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  orbitalsCount: number;
  traitsCount: number;
  pagesCount: number;
}

export interface StudioProjectTemplateProps {
  /** Project information */
  project: ProjectInfo;
  /** Current mode (HQ or Build) */
  mode?: StudioMode;
  /** Current tab within mode */
  activeTab?: HQTab | BuildTab;
  /** Schema validation status */
  validationStatus?: "valid" | "invalid" | "validating";
  /** Validation error count */
  errorCount?: number;

  /** Slot: Schema editor component */
  schemaEditor?: React.ReactNode;
  /** Slot: Orbital visualization component */
  orbitalVisualization?: React.ReactNode;
  /** Slot: History timeline component */
  historyTimeline?: React.ReactNode;
  /** Slot: Design system browser component */
  designSystemBrowser?: React.ReactNode;
  /** Slot: Proposal generator component */
  proposalGenerator?: React.ReactNode;
  /** Slot: AI Agent panel */
  agentPanel?: React.ReactNode;
  /** Slot: Inspector panel */
  inspectorPanel?: React.ReactNode;

  /** Show agent panel */
  showAgentPanel?: boolean;
  /** Show inspector panel */
  showInspectorPanel?: boolean;

  /** Additional CSS classes */
  className?: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: IconComponent,
}) => (
  <Card padding="md" className="flex-1">
    <HStack gap="md" align="center">
      <Box className="p-2 rounded-lg bg-[var(--color-primary)]/10">
        <IconComponent className="w-5 h-5 text-[var(--color-primary)]" />
      </Box>
      <VStack gap="none">
        <Typography
          variant="caption"
          className="text-[var(--color-muted-foreground)]"
        >
          {title}
        </Typography>
        <Typography variant="h3">{value}</Typography>
      </VStack>
    </HStack>
  </Card>
);

export const StudioProjectTemplate: React.FC<StudioProjectTemplateProps> = ({
  project,
  mode: initialMode = "hq",
  activeTab: initialTab = "info",
  validationStatus = "valid",
  errorCount = 0,
  schemaEditor,
  orbitalVisualization,
  historyTimeline,
  designSystemBrowser,
  proposalGenerator,
  agentPanel,
  inspectorPanel,
  showAgentPanel: initialShowAgent = false,
  showInspectorPanel: initialShowInspector = false,
  className = "",
}) => {
  const { emit } = useEventBus();
  const [mode, setMode] = useState<StudioMode>(initialMode);
  const [activeTab, setActiveTab] = useState<HQTab | BuildTab>(initialTab);
  const [showAgentPanel, setShowAgentPanel] = useState(initialShowAgent);
  const [showInspectorPanel, setShowInspectorPanel] =
    useState(initialShowInspector);

  const handleModeChange = (newMode: StudioMode) => {
    setMode(newMode);
    setActiveTab(newMode === "hq" ? "info" : "schema");
    emit("UI:MODE_CHANGE", { mode: newMode });
  };

  const handleTabChange = (tab: HQTab | BuildTab) => {
    setActiveTab(tab);
    emit("UI:TAB_CHANGE", { tab });
  };

  const handleBack = () => {
    emit("UI:BACK", {});
  };

  const handleSave = () => {
    emit("UI:SAVE", { projectId: project.id });
  };

  const handleValidate = () => {
    emit("UI:VALIDATE", { projectId: project.id });
  };

  const handleCompile = () => {
    emit("UI:COMPILE", { projectId: project.id });
  };

  const handlePreview = () => {
    emit("UI:PREVIEW", { projectId: project.id });
  };

  const handleToggleAgent = () => {
    setShowAgentPanel(!showAgentPanel);
    emit("UI:TOGGLE_AGENT", { visible: !showAgentPanel });
  };

  const handleToggleInspector = () => {
    setShowInspectorPanel(!showInspectorPanel);
    emit("UI:TOGGLE_INSPECTOR", { visible: !showInspectorPanel });
  };

  const hqTabs = [
    { id: "info" as const, label: "Project Info", icon: Info },
    { id: "proposal" as const, label: "Proposal", icon: FileText },
    { id: "design-system" as const, label: "Design System", icon: Palette },
  ];

  const buildTabs = [
    { id: "schema" as const, label: "Schema", icon: Code },
    { id: "visualization" as const, label: "Visualization", icon: GitBranch },
  ];

  const currentTabs = mode === "hq" ? hqTabs : buildTabs;

  return (
    <HStack gap="none" className={`h-screen ${className}`}>
      {/* Left Sidebar - Mode Switcher */}
      <Box
        border
        fullHeight
        bg="muted"
        className="w-16 border-t-0 border-b-0 border-l-0"
      >
        <VStack gap="none" className="h-full">
          {/* Back Button */}
          <Box padding="sm" border className="border-t-0 border-l-0 border-r-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="w-full"
            >
              <Icon icon={ArrowLeft} size="sm" />
            </Button>
          </Box>

          {/* Mode Buttons */}
          <VStack gap="sm" flex className="p-2">
            <Button
              variant={mode === "hq" ? "default" : "ghost"}
              size="sm"
              className="w-full flex-col h-16 gap-1"
              onClick={() => handleModeChange("hq")}
              title="HQ Mode"
            >
              <Icon icon={Building} size="md" />
              <Typography variant="caption">HQ</Typography>
            </Button>
            <Button
              variant={mode === "build" ? "default" : "ghost"}
              size="sm"
              className="w-full flex-col h-16 gap-1"
              onClick={() => handleModeChange("build")}
              title="Build Mode"
            >
              <Icon icon={Hammer} size="md" />
              <Typography variant="caption">Build</Typography>
            </Button>
          </VStack>

          {/* Bottom Actions */}
          <VStack
            gap="sm"
            className="p-2 border-t border-[var(--color-border)]"
          >
            <Button
              variant={showAgentPanel ? "default" : "ghost"}
              size="sm"
              className="w-full"
              onClick={handleToggleAgent}
              title="AI Assistant"
            >
              <Icon icon={Bot} size="md" />
            </Button>
          </VStack>
        </VStack>
      </Box>

      {/* Main Content Area */}
      <VStack flex gap="none" className="h-full">
        {/* Top Bar */}
        <Box
          padding="md"
          border
          bg="surface"
          className="border-t-0 border-l-0 border-r-0"
        >
          <HStack justify="between" align="center">
            <HStack gap="md" align="center">
              <VStack gap="none">
                <Typography variant="h3">{project.name}</Typography>
                <Typography
                  variant="caption"
                  className="text-[var(--color-muted-foreground)]"
                >
                  v{project.version}
                </Typography>
              </VStack>
              <Badge
                variant={
                  validationStatus === "valid"
                    ? "success"
                    : validationStatus === "invalid"
                      ? "error"
                      : "secondary"
                }
              >
                {validationStatus === "valid" && "Valid"}
                {validationStatus === "invalid" && `${errorCount} errors`}
                {validationStatus === "validating" && "Validating..."}
              </Badge>
            </HStack>

            <HStack gap="sm">
              {mode === "build" && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleValidate}
                  >
                    <HStack gap="xs" align="center">
                      <Icon icon={CheckCircle} size="sm" />
                      <span>Validate</span>
                    </HStack>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleCompile}>
                    <HStack gap="xs" align="center">
                      <Icon icon={Package} size="sm" />
                      <span>Compile</span>
                    </HStack>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handlePreview}>
                    <HStack gap="xs" align="center">
                      <Icon icon={Play} size="sm" />
                      <span>Preview</span>
                    </HStack>
                  </Button>
                </>
              )}
              <Button onClick={handleSave}>
                <HStack gap="xs" align="center">
                  <Icon icon={Save} size="sm" />
                  <span>Save</span>
                </HStack>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleToggleInspector}>
                <Icon icon={PanelRight} size="sm" />
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Tab Navigation */}
        <Box
          paddingX="md"
          border
          bg="surface"
          className="border-t-0 border-l-0 border-r-0"
        >
          <HStack gap="md">
            {currentTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`rounded-none border-b-2 ${
                  activeTab === tab.id
                    ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                    : "border-transparent"
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <HStack gap="xs" align="center">
                  <Icon icon={tab.icon} size="sm" />
                  <span>{tab.label}</span>
                </HStack>
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Content Area */}
        <HStack gap="none" flex className="overflow-hidden">
          {/* Main Panel */}
          <VStack flex className="h-full overflow-auto p-6">
            {/* HQ Mode Content */}
            {mode === "hq" && activeTab === "info" && (
              <VStack gap="lg">
                <Typography variant="h2">Project Information</Typography>

                {/* Stats */}
                <HStack gap="md">
                  <StatCard
                    title="Orbitals"
                    value={project.orbitalsCount}
                    icon={GitBranch}
                  />
                  <StatCard
                    title="Traits"
                    value={project.traitsCount}
                    icon={Code}
                  />
                  <StatCard
                    title="Pages"
                    value={project.pagesCount}
                    icon={FileText}
                  />
                </HStack>

                {/* Project Details */}
                <Card padding="lg">
                  <VStack gap="md">
                    <HStack justify="between">
                      <Typography
                        variant="body2"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Name
                      </Typography>
                      <Typography variant="body1">{project.name}</Typography>
                    </HStack>
                    <HStack justify="between">
                      <Typography
                        variant="body2"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Version
                      </Typography>
                      <Typography variant="body1">{project.version}</Typography>
                    </HStack>
                    <HStack justify="between">
                      <Typography
                        variant="body2"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Created
                      </Typography>
                      <Typography variant="body1">
                        {project.createdAt}
                      </Typography>
                    </HStack>
                    <HStack justify="between">
                      <Typography
                        variant="body2"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Updated
                      </Typography>
                      <Typography variant="body1">
                        {project.updatedAt}
                      </Typography>
                    </HStack>
                    {project.description && (
                      <VStack gap="sm">
                        <Typography
                          variant="body2"
                          className="text-[var(--color-muted-foreground)]"
                        >
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {project.description}
                        </Typography>
                      </VStack>
                    )}
                  </VStack>
                </Card>

                {/* History Timeline Slot */}
                {historyTimeline && (
                  <VStack gap="md">
                    <Typography variant="h3">Version History</Typography>
                    {historyTimeline}
                  </VStack>
                )}
              </VStack>
            )}

            {mode === "hq" && activeTab === "proposal" && (
              <VStack gap="lg">
                <Typography variant="h2">Project Proposal</Typography>
                {proposalGenerator || (
                  <Card padding="lg" className="text-center">
                    <VStack gap="md" align="center" className="py-8">
                      <Icon
                        icon={FileText}
                        size="lg"
                        className="text-[var(--color-muted-foreground)] opacity-50"
                      />
                      <Typography
                        variant="body1"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Generate a lean proposal with architecture and pricing
                      </Typography>
                      <Button>Generate Proposal</Button>
                    </VStack>
                  </Card>
                )}
              </VStack>
            )}

            {mode === "hq" && activeTab === "design-system" && (
              <VStack gap="lg">
                <Typography variant="h2">Design System</Typography>
                {designSystemBrowser || (
                  <Card padding="lg" className="text-center">
                    <VStack gap="md" align="center" className="py-8">
                      <Icon
                        icon={Palette}
                        size="lg"
                        className="text-[var(--color-muted-foreground)] opacity-50"
                      />
                      <Typography
                        variant="body1"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Browse available patterns and components
                      </Typography>
                      <Button>Open Storybook</Button>
                    </VStack>
                  </Card>
                )}
              </VStack>
            )}

            {/* Build Mode Content */}
            {mode === "build" && activeTab === "schema" && (
              <Box fullHeight>
                {schemaEditor || (
                  <Card padding="lg" className="h-full">
                    <VStack
                      gap="md"
                      align="center"
                      justify="center"
                      className="h-full"
                    >
                      <Icon
                        icon={Code}
                        size="lg"
                        className="text-[var(--color-muted-foreground)] opacity-50"
                      />
                      <Typography
                        variant="body1"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Schema editor will appear here
                      </Typography>
                    </VStack>
                  </Card>
                )}
              </Box>
            )}

            {mode === "build" && activeTab === "visualization" && (
              <Box fullHeight>
                {orbitalVisualization || (
                  <Card padding="lg" className="h-full">
                    <VStack
                      gap="md"
                      align="center"
                      justify="center"
                      className="h-full"
                    >
                      <Icon
                        icon={GitBranch}
                        size="lg"
                        className="text-[var(--color-muted-foreground)] opacity-50"
                      />
                      <Typography
                        variant="body1"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        State machine visualization will appear here
                      </Typography>
                    </VStack>
                  </Card>
                )}
              </Box>
            )}
          </VStack>

          {/* Inspector Panel */}
          {showInspectorPanel && (
            <Box
              border
              fullHeight
              overflow="auto"
              className="w-80 border-t-0 border-b-0 border-r-0"
            >
              <VStack gap="none" className="h-full">
                <Box
                  padding="md"
                  border
                  className="border-t-0 border-l-0 border-r-0"
                >
                  <HStack justify="between" align="center">
                    <Typography variant="h4">Inspector</Typography>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleInspector}
                    >
                      <Icon icon={X} size="sm" />
                    </Button>
                  </HStack>
                </Box>
                <VStack flex className="overflow-auto p-4">
                  {inspectorPanel || (
                    <Typography
                      variant="body2"
                      className="text-[var(--color-muted-foreground)]"
                    >
                      Select an element to inspect
                    </Typography>
                  )}
                </VStack>
              </VStack>
            </Box>
          )}
        </HStack>
      </VStack>

      {/* AI Agent Panel */}
      {showAgentPanel && (
        <Box
          border
          fullHeight
          className="w-96 border-t-0 border-b-0 border-r-0"
        >
          <VStack gap="none" className="h-full">
            <Box
              padding="md"
              border
              className="border-t-0 border-l-0 border-r-0"
            >
              <HStack justify="between" align="center">
                <Typography variant="h4">AI Assistant</Typography>
                <Button variant="ghost" size="sm" onClick={handleToggleAgent}>
                  <Icon icon={X} size="sm" />
                </Button>
              </HStack>
            </Box>
            <VStack flex className="overflow-auto">
              {agentPanel || (
                <Box padding="lg">
                  <Typography
                    variant="body2"
                    className="text-[var(--color-muted-foreground)]"
                  >
                    AI Assistant will appear here
                  </Typography>
                </Box>
              )}
            </VStack>
          </VStack>
        </Box>
      )}
    </HStack>
  );
};

StudioProjectTemplate.displayName = "StudioProjectTemplate";

export default StudioProjectTemplate;
