import React from "react";

interface TaskStatusBadgeProps {
  status: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  const getBadgeColor = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-gray-200 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDisplayText = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Done";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor()}`}
    >
      {getDisplayText()}
    </span>
  );
};
