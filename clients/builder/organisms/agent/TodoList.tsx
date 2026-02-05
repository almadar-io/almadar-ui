/**
 * TodoList - List of agent todos with progress tracking
 *
 * Event Contract:
 * - Emits: UI:TODO_COMPLETE - When a todo is marked complete
 * - Emits: UI:TODO_SELECT - When a todo is selected
 * - Payload: { todo: TodoItem }
 */

import React from "react";
import {
  Box,
  HStack,
  VStack,
  Typography,
  ProgressBar,
} from '@almadar/ui';
import { TodoItem, type Todo } from "../../molecules/agent";

export interface TodoListProps {
  /** List of todos */
  todos: Todo[];
  /** Show section header */
  showHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function TodoList({
  todos,
  showHeader = true,
  className = "",
}: TodoListProps) {
  if (todos.length === 0) {
    return null;
  }

  const completedCount = todos.filter((t) => t.status === "completed").length;
  const progress = Math.round((completedCount / todos.length) * 100);

  return (
    <VStack gap="md" className={className}>
      {showHeader && (
        <HStack justify="between" align="center">
          <Typography variant="overline">
            Tasks ({completedCount}/{todos.length})
          </Typography>
          <HStack gap="sm" align="center">
            <Box className="w-24">
              <ProgressBar value={progress} max={100} size="sm" />
            </Box>
            <Typography variant="caption" color="muted">
              {progress}%
            </Typography>
          </HStack>
        </HStack>
      )}

      <VStack gap="sm">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </VStack>
    </VStack>
  );
}

export default TodoList;
