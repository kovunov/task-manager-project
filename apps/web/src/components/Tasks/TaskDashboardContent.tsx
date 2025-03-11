import { useState } from "react";
import {
  useAssignTaskToMeMutation,
  useDeleteTaskMutation,
  useGetMyTasksQuery,
  useGetUnassignedTasksQuery,
  useUpdateTaskStatusMutation,
} from "../../store/services/api";
import { TaskList } from "./TaskList";
import Spinner from "../common/Spinner";

export const TaskDashboardContent = () => {
  const [activeTab, setActiveTab] = useState<"my-tasks" | "unassigned">(
    "my-tasks"
  );
  const [processingTaskIds, setProcessingTaskIds] = useState<number[]>([]);

  // Load data for both tabs - with skip option to better control data fetching
  const {
    data: myTasks = [],
    isLoading: isMyTasksLoading,
    isError: isMyTasksError,
  } = useGetMyTasksQuery(undefined, {
    selectFromResult: (result) => ({
      ...result,
      data: result.data ?? [],
    }),
  });

  const {
    data: unassignedTasks = [],
    isLoading: isUnassignedLoading,
    isError: isUnassignedError,
  } = useGetUnassignedTasksQuery(undefined, {
    selectFromResult: (result) => ({
      ...result,
      data: result.data ?? [],
    }),
  });

  const [assignTask, { isLoading: isAssigning }] = useAssignTaskToMeMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [updateTaskStatus, { isLoading: isUpdatingStatus }] =
    useUpdateTaskStatusMutation();

  const isLoading =
    (activeTab === "my-tasks" && isMyTasksLoading) ||
    (activeTab === "unassigned" && isUnassignedLoading);

  const handleAssignTask = async (taskId: number) => {
    try {
      setProcessingTaskIds((prev) => [...prev, taskId]);
      await assignTask(taskId).unwrap();
    } catch (error) {
      console.error("Failed to assign task:", error);
    } finally {
      setProcessingTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        setProcessingTaskIds((prev) => [...prev, taskId]);
        await deleteTask(taskId).unwrap();
      } catch (error) {
        console.error("Failed to delete task:", error);
      } finally {
        setProcessingTaskIds((prev) => prev.filter((id) => id !== taskId));
      }
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      setProcessingTaskIds((prev) => [...prev, taskId]);

      await updateTaskStatus({
        taskId,
        status: newStatus,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update task status:", error);
    } finally {
      setProcessingTaskIds((prev) => prev.filter((id) => id !== taskId));
    }
  };

  // Check if a specific task is being processed
  const isTaskProcessing = (taskId: number) =>
    processingTaskIds.includes(taskId);

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my-tasks"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("my-tasks")}
          >
            My Tasks
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "unassigned"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("unassigned")}
          >
            Unassigned Tasks
          </button>
        </nav>
      </div>

      {activeTab === "my-tasks" ? (
        <TaskList
          title="My Assigned Tasks"
          tasks={myTasks}
          isError={isMyTasksError}
          emptyMessage="You don't have any tasks assigned to you."
          onStatusChange={handleStatusChange}
          isTaskProcessing={isTaskProcessing}
          isUpdatingStatus={isUpdatingStatus}
        />
      ) : (
        <TaskList
          title="Unassigned Tasks"
          tasks={unassignedTasks}
          isError={isUnassignedError}
          emptyMessage="There are no unassigned tasks."
          onAssignTask={handleAssignTask}
          onDeleteTask={handleDeleteTask}
          isTaskProcessing={isTaskProcessing}
          isAssigning={isAssigning}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};
