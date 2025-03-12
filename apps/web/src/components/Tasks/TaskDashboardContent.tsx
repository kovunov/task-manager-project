import { useState } from "react";
import { useAppSelector } from "../../store";
import {
  useAssignTaskToMeMutation,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetMyTasksQuery,
  useGetUnassignedTasksQuery,
  useUnassignTaskFromMeMutation,
  useUpdateTaskStatusMutation,
} from "../../store/services/api";
import Spinner from "../common/Spinner";
import { TaskFormModal } from "./TaskFormModal";
import { TaskList } from "./TaskList";

export const TaskDashboardContent = () => {
  const [activeTab, setActiveTab] = useState<"my-tasks" | "unassigned">(
    "my-tasks"
  );
  const [processingTaskIds, setProcessingTaskIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = currentUser?.username === "admin";

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
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [unassignTask, { isLoading: isUnassigning }] =
    useUnassignTaskFromMeMutation();

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

  const handleUnassignTask = async (taskId: number) => {
    try {
      setProcessingTaskIds((prev) => [...prev, taskId]);
      await unassignTask(taskId).unwrap();
    } catch (error) {
      console.error("Failed to unassign task:", error);
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

  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    priority: string;
  }) => {
    try {
      await createTask({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: "pending",
      }).unwrap();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  // Helper function to check if a task is currently being processed
  const isTaskProcessing = (taskId: number) => {
    return processingTaskIds.includes(taskId);
  };

  return (
    <>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Task
        </button>
      </div>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        isSubmitting={isCreating}
      />

      {isLoading && (
        <div className="flex justify-center my-8">
          <Spinner />
        </div>
      )}

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("my-tasks")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my-tasks"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "unassigned"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
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
          onUnassignTask={handleUnassignTask}
          isTaskProcessing={isTaskProcessing}
          isUpdatingStatus={isUpdatingStatus}
          isUnassigning={isUnassigning}
        />
      ) : (
        <TaskList
          title="Unassigned Tasks"
          tasks={unassignedTasks}
          isError={isUnassignedError}
          emptyMessage="There are no unassigned tasks."
          onAssignTask={handleAssignTask}
          onDeleteTask={isAdmin ? handleDeleteTask : undefined}
          isTaskProcessing={isTaskProcessing}
          isAssigning={isAssigning}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};
