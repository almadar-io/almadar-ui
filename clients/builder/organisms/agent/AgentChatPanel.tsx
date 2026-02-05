/**
 * AgentChatPanel - Full agent chat panel with header, activity feed, todos, and input
 *
 * This is the main component to display anywhere you need agent interaction.
 *
 * Event Contract:
 * - Emits: UI:SEND_MESSAGE - When a message is sent
 * - Emits: UI:CANCEL_GENERATION - When generation is cancelled
 * - Emits: UI:RETRY - When retry is requested
 * - Payload: { message: string }
 */

import React, { useState } from "react";
import { MessageSquare, ListTodo, GitCompare } from "lucide-react";
import {
  Box,
  HStack,
  VStack,
  Typography,
  Button,
  Icon,
} from '@almadar/ui';
import { AgentStatusHeader } from "./AgentStatusHeader";
import { AgentChatInput } from "./AgentChatInput";
import { AgentActivityFeed, type ActivityItem } from "./AgentActivityFeed";
import { TodoList } from "./TodoList";
import { SchemaDiffViewer, type SchemaDiff } from "./SchemaDiffViewer";
import type { Todo } from "../../molecules/agent";
import type { AgentStatus } from "../../atoms/agent";

export interface AgentChatPanelProps {
  /** Current agent status */
  status: AgentStatus;
  /** Current skill being used */
  skill?: string;
  /** Thread ID */
  threadId?: string;
  /** Activity items */
  activities: ActivityItem[];
  /** Todo list */
  todos?: Todo[];
  /** Schema diffs */
  schemaDiffs?: SchemaDiff[];
  /** Send message callback */
  onSendMessage: (message: string) => void;
  /** Cancel callback */
  onCancel?: () => void;
  /** Retry error callback */
  onRetryError?: () => void;
  /** Panel variant */
  variant?: "panel" | "full";
  /** Show the input field */
  showInput?: boolean;
  /** Show todos section */
  showTodos?: boolean;
  /** Show schema diffs section */
  showDiffs?: boolean;
  /** Custom placeholder for input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

export function AgentChatPanel({
  status,
  skill,
  threadId,
  activities,
  todos = [],
  schemaDiffs = [],
  onSendMessage,
  onCancel,
  onRetryError,
  variant = "panel",
  showInput = true,
  showTodos = true,
  showDiffs = true,
  placeholder,
  className = "",
}: AgentChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "todos" | "changes">(
    "activity",
  );

  const isProcessing = status === "running";
  const isFullWidth = variant === "full";

  const hasTodos = todos.length > 0;
  const hasDiffs = schemaDiffs.length > 0;

  const todoCount = todos.length;
  const diffCount = schemaDiffs.length;
  const completedTodos = todos.filter((t) => t.status === "completed").length;

  return (
    <Box
      border
      rounded="xl"
      overflow="hidden"
      shadow="lg"
      bg="surface"
      display="flex"
      className={`flex-col ${isFullWidth ? "h-full" : "h-[600px]"} ${className}`}
    >
      {/* Header */}
      <AgentStatusHeader
        status={status}
        skill={skill}
        threadId={threadId}
        onCancel={onCancel}
      />

      {/* Tab Bar */}
      {((showTodos && hasTodos) || (showDiffs && hasDiffs)) && (
        <Box border bg="muted" className="border-l-0 border-r-0 border-t-0">
          <HStack gap="none">
            <Button
              variant={activeTab === "activity" ? "primary" : "ghost"}
              size="sm"
              className="flex-1 rounded-none"
              onClick={() => setActiveTab("activity")}
            >
              <HStack gap="xs" align="center">
                <Icon icon={MessageSquare} size="sm" />
                <Typography variant="caption">Activity</Typography>
              </HStack>
            </Button>
            {showTodos && hasTodos && (
              <Button
                variant={activeTab === "todos" ? "primary" : "ghost"}
                size="sm"
                className="flex-1 rounded-none"
                onClick={() => setActiveTab("todos")}
              >
                <HStack gap="xs" align="center">
                  <Icon icon={ListTodo} size="sm" />
                  <Typography variant="caption">
                    Tasks ({completedTodos}/{todoCount})
                  </Typography>
                </HStack>
              </Button>
            )}
            {showDiffs && hasDiffs && (
              <Button
                variant={activeTab === "changes" ? "primary" : "ghost"}
                size="sm"
                className="flex-1 rounded-none"
                onClick={() => setActiveTab("changes")}
              >
                <HStack gap="xs" align="center">
                  <Icon icon={GitCompare} size="sm" />
                  <Typography variant="caption">
                    Changes ({diffCount})
                  </Typography>
                </HStack>
              </Button>
            )}
          </HStack>
        </Box>
      )}

      {/* Content Area */}
      <VStack flex className="overflow-hidden">
        {/* Activity Tab */}
        {activeTab === "activity" && (
          <AgentActivityFeed
            activities={activities}
            onRetryError={onRetryError}
            className="h-full p-4"
          />
        )}

        {/* Todos Tab */}
        {activeTab === "todos" && showTodos && (
          <Box fullHeight overflow="auto" padding="md">
            <TodoList todos={todos} showHeader={false} />
          </Box>
        )}

        {/* Changes Tab */}
        {activeTab === "changes" && showDiffs && (
          <Box fullHeight overflow="auto" padding="md">
            <SchemaDiffViewer diffs={schemaDiffs} title="Schema Changes" />
          </Box>
        )}
      </VStack>

      {/* Chat Input */}
      {showInput && (
        <AgentChatInput
          onSend={onSendMessage}
          isProcessing={isProcessing}
          disabled={status === "error"}
          placeholder={placeholder}
        />
      )}

      {/* Empty State */}
      {status === "idle" && activities.length === 0 && (
        <Box
          position="absolute"
          className="inset-0 flex items-center justify-center pointer-events-none"
        >
          <VStack gap="md" align="center">
            <Icon icon={MessageSquare} size="lg" className="opacity-30" />
            <Typography variant="body2" color="muted">
              Start a conversation with the agent
            </Typography>
          </VStack>
        </Box>
      )}
    </Box>
  );
}

export default AgentChatPanel;
