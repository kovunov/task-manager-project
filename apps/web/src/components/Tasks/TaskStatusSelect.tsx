import React, { useEffect, useState } from "react";

interface TaskStatusSelectProps {
  currentStatus: string;
  onChange: (newStatus: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const TaskStatusSelect: React.FC<TaskStatusSelectProps> = ({
  currentStatus,
  onChange,
  disabled = false,
  loading = false,
}) => {
  // Track the displayed status locally to provide immediate feedback
  const [displayedStatus, setDisplayedStatus] = useState(currentStatus);

  // Update displayed status when the prop changes (e.g. after API response)
  useEffect(() => {
    setDisplayedStatus(currentStatus);
  }, [currentStatus]);

  const statuses = [
    { value: "pending", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Done" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setDisplayedStatus(newStatus); // Update local state for immediate feedback
    onChange(newStatus); // Trigger the parent's onChange handler
  };

  return (
    <div className="flex items-center">
      <label
        htmlFor="status"
        className="text-sm font-medium text-gray-700 mr-2"
      >
        Status:
      </label>
      <div className="relative">
        <select
          id="status"
          value={displayedStatus}
          onChange={handleChange}
          disabled={disabled}
          className={`block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md ${
            loading ? "opacity-50" : ""
          }`}
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="animate-spin h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
