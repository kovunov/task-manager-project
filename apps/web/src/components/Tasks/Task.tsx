import React from "react";
import { Task as TaskType } from "../../store/services/api";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskStatusSelect } from "./TaskStatusSelect";

interface TaskProps {
  task: TaskType;
  onAssignTask?: (taskId: number) => void;
  onUnassignTask?: (taskId: number) => void;
  onDeleteTask?: (taskId: number) => void;
  onStatusChange?: (taskId: number, newStatus: string) => void;
  isTaskProcessing: (taskId: number) => boolean;
  isAssigning?: boolean;
  isUnassigning?: boolean;
  isDeleting?: boolean;
  isUpdatingStatus?: boolean;
}

export const Task: React.FC<TaskProps> = ({
  task,
  onAssignTask,
  onUnassignTask,
  onDeleteTask,
  onStatusChange,
  isTaskProcessing,
  isAssigning = false,
  isUnassigning = false,
  isDeleting = false,
  isUpdatingStatus = false,
}) => {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        <TaskStatusBadge status={task.status} />
      </div>

      <div className="mt-2 text-sm text-gray-500">
        <span className="mr-2 font-medium">Priority:</span>
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === "high"
              ? "bg-red-100 text-red-800"
              : task.priority === "medium"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 mt-3 mb-4">
        {task.description || "No description provided"}
      </p>

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
            className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors
              ${
                isTaskProcessing(task.id)
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              }`}
          >
            {isTaskProcessing(task.id) ? "Assigning..." : "Assign to me"}
          </button>
        )}

        {onUnassignTask && (
          <button
            onClick={() => onUnassignTask(task.id)}
            disabled={isTaskProcessing(task.id) || isUnassigning}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors
              ${
                isTaskProcessing(task.id)
                  ? "bg-yellow-400 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              }`}
          >
            {isTaskProcessing(task.id) ? "Unassigning..." : "Unassign"}
          </button>
        )}

        {onDeleteTask && (
          <button
            onClick={() => onDeleteTask(task.id)}
            disabled={isTaskProcessing(task.id) || isDeleting}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white transition-colors
              ${
                isTaskProcessing(task.id)
                  ? "bg-red-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              }`}
          >
            {isTaskProcessing(task.id) ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {task.created_at && (
        <div className="mt-4 text-xs text-gray-400">
          Created: {new Date(task.created_at).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default Task;
