import { useAppSelector } from "../../store";
import { Task } from "../../store/services/api";

interface TaskCardProps {
  task: Task;
  onAssign?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const TaskCard = ({
  task,
  onAssign,
  onDelete,
  showActions = true,
}: TaskCardProps) => {
  const userId = useAppSelector((state) => state.auth.user?.id);

  // Check if task is assigned to current user
  const isAssignedToMe = task.tasks_users?.some((tu) => tu.users.id === userId);

  const priorityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  }[task.priority || "medium"];

  const statusColor = {
    TODO: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    DONE: "bg-green-100 text-green-800",
  }[task.status || "TODO"];

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
        <div className="flex space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${priorityColor}`}
          >
            {task.priority}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${statusColor}`}
          >
            {task.status}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-gray-500">{task.description}</p>
      )}

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {task.tasks_users && task.tasks_users.length > 0 ? (
            <span>
              Assigned to: {task.tasks_users[0].users.username}
              {task.tasks_users[0].users.first_name &&
                ` (${task.tasks_users[0].users.first_name} ${
                  task.tasks_users[0].users.last_name || ""
                })`}
            </span>
          ) : (
            <span>Unassigned</span>
          )}
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {!isAssignedToMe && onAssign && (
              <button
                onClick={onAssign}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Assign to me
              </button>
            )}
            {onDelete && (!isAssignedToMe || task.tasks_users.length === 0) && (
              <button
                onClick={onDelete}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
