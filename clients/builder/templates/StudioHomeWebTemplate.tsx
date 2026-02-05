/**
 * StudioHomeWebTemplate - Web mode home page with AI agent and project list
 *
 * Entry point for web users with AI agent chat panel and project management.
 *
 * Event Contract:
 * - Emits: UI:CREATE_PROJECT - When creating a new project
 * - Emits: UI:SELECT_PROJECT - When selecting a project
 * - Emits: UI:DELETE_PROJECT - When deleting a project
 * - Emits: UI:OPEN_PROJECT - When opening a project
 * - Emits: UI:SEARCH - When searching projects
 * - Payload: { project: Project } or { query: string }
 */

import React from "react";
import { Plus, Trash2, FolderOpen, Search } from "lucide-react";
import {
  Box,
  VStack,
  HStack,
  Typography,
  Button,
  Icon,
  Input,
  Card,
  useEventBus,
} from '@almadar/ui';

export interface Project {
  id: string;
  name: string;
  description?: string;
  updatedAt: string;
  orbitalsCount?: number;
  traitsCount?: number;
  pagesCount?: number;
}

export interface StudioHomeWebTemplateProps {
  /** List of user's projects */
  projects: Project[];
  /** Currently selected project */
  selectedProject?: Project;
  /** AI Agent panel component (slot) */
  agentPanel?: React.ReactNode;
  /** Search query */
  searchQuery?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export const StudioHomeWebTemplate: React.FC<StudioHomeWebTemplateProps> = ({
  projects = [],
  selectedProject,
  agentPanel,
  searchQuery = "",
  isLoading = false,
  className = "",
}) => {
  const { emit } = useEventBus();
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  const handleCreateProject = () => {
    emit("UI:CREATE_PROJECT", {});
  };

  const handleSelectProject = (project: Project) => {
    emit("UI:SELECT_PROJECT", { project, entity: "Project" });
  };

  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    emit("UI:DELETE_PROJECT", { project, entity: "Project" });
  };

  const handleOpenProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    emit("UI:OPEN_PROJECT", { project, entity: "Project" });
  };

  const handleSearch = (query: string) => {
    setLocalSearch(query);
    emit("UI:SEARCH", { query });
  };

  // Ensure projects is always an array
  const projectsList = Array.isArray(projects) ? projects : [];

  const filteredProjects = localSearch
    ? projectsList.filter(
        (p) =>
          p.name.toLowerCase().includes(localSearch.toLowerCase()) ||
          p.description?.toLowerCase().includes(localSearch.toLowerCase()),
      )
    : projectsList;

  return (
    <HStack gap="none" className={`h-screen ${className}`}>
      {/* Left Panel - AI Agent */}
      <Box
        border
        fullHeight
        className="w-[400px] border-t-0 border-b-0 border-l-0"
      >
        <VStack gap="none" className="h-full">
          {/* Agent Header */}
          <Box padding="md" border className="border-t-0 border-l-0 border-r-0">
            <HStack justify="between" align="center">
              <Typography variant="h3">AI Assistant</Typography>
            </HStack>
          </Box>

          {/* Agent Panel Slot */}
          <VStack flex className="overflow-auto">
            {agentPanel || (
              <Box padding="lg">
                <VStack gap="md" align="center" className="py-12">
                  <Typography
                    variant="body2"
                    className="text-[var(--color-muted-foreground)] text-center"
                  >
                    AI Assistant will appear here
                  </Typography>
                </VStack>
              </Box>
            )}
          </VStack>
        </VStack>
      </Box>

      {/* Right Panel - Projects */}
      <VStack flex gap="none" className="h-full bg-[var(--color-muted)]">
        {/* Header */}
        <Box padding="lg" bg="surface">
          <HStack justify="between" align="center">
            <VStack gap="xs">
              <Typography variant="h2">My Projects</Typography>
              <Typography
                variant="body2"
                className="text-[var(--color-muted-foreground)]"
              >
                {projectsList.length} project{projectsList.length !== 1 ? "s" : ""}
              </Typography>
            </VStack>
            <Button onClick={handleCreateProject}>
              <HStack gap="xs" align="center">
                <Icon icon={Plus} size="sm" />
                <span>New Project</span>
              </HStack>
            </Button>
          </HStack>
        </Box>

        {/* Search */}
        <Box paddingX="lg" paddingY="sm" bg="surface">
          <HStack gap="sm" align="center">
            <Icon
              icon={Search}
              size="sm"
              className="text-[var(--color-muted-foreground)]"
            />
            <Input
              value={localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search projects..."
              className="flex-1"
            />
          </HStack>
        </Box>

        {/* Project Grid */}
        <VStack flex className="p-6 overflow-auto">
          {isLoading ? (
            <VStack gap="md" align="center" className="py-12">
              <Typography variant="body2">Loading projects...</Typography>
            </VStack>
          ) : filteredProjects.length === 0 ? (
            <VStack gap="md" align="center" className="py-12">
              <Icon
                icon={FolderOpen}
                size="lg"
                className="text-[var(--color-muted-foreground)] opacity-50"
              />
              <Typography
                variant="body2"
                className="text-[var(--color-muted-foreground)]"
              >
                {localSearch
                  ? "No projects match your search"
                  : "No projects yet"}
              </Typography>
              {!localSearch && (
                <Button variant="secondary" onClick={handleCreateProject}>
                  Create your first project
                </Button>
              )}
            </VStack>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  padding="md"
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    selectedProject?.id === project.id
                      ? "ring-2 ring-[var(--color-primary)]"
                      : ""
                  }`}
                  onClick={() => handleSelectProject(project)}
                >
                  <VStack gap="sm">
                    <HStack justify="between" align="start">
                      <Typography variant="h4" className="truncate flex-1">
                        {project.name}
                      </Typography>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteProject(project, e)}
                        className="text-[var(--color-muted-foreground)] hover:text-[var(--color-error)]"
                      >
                        <Icon icon={Trash2} size="sm" />
                      </Button>
                    </HStack>
                    {project.description && (
                      <Typography
                        variant="body2"
                        className="text-[var(--color-muted-foreground)] line-clamp-2"
                      >
                        {project.description}
                      </Typography>
                    )}
                    <HStack justify="between" align="center">
                      <Typography
                        variant="caption"
                        className="text-[var(--color-muted-foreground)]"
                      >
                        Updated {project.updatedAt}
                      </Typography>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleOpenProject(project, e)}
                      >
                        Open
                      </Button>
                    </HStack>
                    {(project.orbitalsCount !== undefined ||
                      project.traitsCount !== undefined) && (
                      <HStack
                        gap="md"
                        className="pt-2 border-t border-[var(--color-border)]"
                      >
                        {project.orbitalsCount !== undefined && (
                          <Typography
                            variant="caption"
                            className="text-[var(--color-muted-foreground)]"
                          >
                            {project.orbitalsCount} orbital
                            {project.orbitalsCount !== 1 ? "s" : ""}
                          </Typography>
                        )}
                        {project.traitsCount !== undefined && (
                          <Typography
                            variant="caption"
                            className="text-[var(--color-muted-foreground)]"
                          >
                            {project.traitsCount} trait
                            {project.traitsCount !== 1 ? "s" : ""}
                          </Typography>
                        )}
                        {project.pagesCount !== undefined && (
                          <Typography
                            variant="caption"
                            className="text-[var(--color-muted-foreground)]"
                          >
                            {project.pagesCount} page
                            {project.pagesCount !== 1 ? "s" : ""}
                          </Typography>
                        )}
                      </HStack>
                    )}
                  </VStack>
                </Card>
              ))}
            </div>
          )}
        </VStack>
      </VStack>
    </HStack>
  );
};

StudioHomeWebTemplate.displayName = "StudioHomeWebTemplate";

export default StudioHomeWebTemplate;
