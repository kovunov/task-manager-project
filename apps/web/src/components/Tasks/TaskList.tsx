import { memo, useId } from "react";
import { Task as TaskType } from "../../store/services/api";
import Task from "./Task";

interface TaskListProps {
  title: string;
  tasks: TaskType[];
  isError: boolean;
  emptyMessage: string;
  onAssignTask?: (taskId: number) => void;
  onUnassignTask?: (taskId: number) => void;
  onDeleteTask?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: string) => void;
  isTaskProcessing?: (taskId: number) => boolean;
  isAssigning?: boolean;
  isUnassigning?: boolean;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
}

export const TaskList = memo<TaskListProps>(
  ({
    title,
    tasks,
    isError,
    emptyMessage,
    onAssignTask,
    onUnassignTask,
    onDeleteTask,
    onStatusChange,
    isTaskProcessing = () => false,
    isAssigning = false,
    isUnassigning = false,
    isDeleting = false,
    isUpdatingStatus = false,
  }) => {
    const listId = useId();

    if (isError) {
      return <div className="text-red-500">Error loading tasks.</div>;
    }

    if (tasks.length === 0) {
      return (
        <div className="text-gray-500 text-center py-8">{emptyMessage}</div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={`${listId}-${task.id}`}>
              <Task
                task={task}
                onAssignTask={onAssignTask}
                onUnassignTask={onUnassignTask}
                onDeleteTask={onDeleteTask}
                onStatusChange={onStatusChange}
                isTaskProcessing={isTaskProcessing}
                isAssigning={isAssigning}
                isUnassigning={isUnassigning}
                isDeleting={isDeleting}
                isUpdatingStatus={isUpdatingStatus}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

TaskList.displayName = "TaskList";
