import { memo, useId } from "react";
import { Task } from "../../store/services/api";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskStatusSelect } from "./TaskStatusSelect";

interface TaskListProps {
  title: string;
  tasks: Task[];
  isError: boolean;
  emptyMessage: string;
  onAssignTask?: (taskId: number) => void;
  onDeleteTask?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: string) => void;
  isTaskProcessing?: (taskId: number) => boolean;
  isAssigning?: boolean;
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
    onDeleteTask,
    onStatusChange,
    isTaskProcessing = () => false,
    isAssigning = false,
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
            <li
              key={`${listId}-${task.id}`}
              className="p-4 border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{task.title}</h3>
                <TaskStatusBadge status={task.status} />
              </div>

              <p className="text-gray-600 mt-1">{task.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {onStatusChange && (
                  <TaskStatusSelect
                    currentStatus={task.status}
                    onChange={(newStatus) => onStatusChange(task.id, newStatus)}
                    disabled={isTaskProcessing(task.id) || isUpdatingStatus}
                    loading={isTaskProcessing(task.id)}
                  />
                )}

                {onAssignTask && (
                  <button
                    onClick={() => onAssignTask(task.id)}
                    disabled={isTaskProcessing(task.id) || isAssigning}
                    className={`px-4 py-2 text-sm font-medium rounded-md text-white
                    ${
                      isTaskProcessing(task.id)
                        ? "bg-indigo-400"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {isTaskProcessing(task.id)
                      ? "Assigning..."
                      : "Assign to me"}
                  </button>
                )}

                {onDeleteTask && (
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    disabled={isTaskProcessing(task.id) || isDeleting}
                    className={`px-4 py-2 text-sm font-medium rounded-md text-white
                    ${
                      isTaskProcessing(task.id)
                        ? "bg-red-400"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {isTaskProcessing(task.id) ? "Deleting..." : "Delete"}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);

TaskList.displayName = "TaskList";
