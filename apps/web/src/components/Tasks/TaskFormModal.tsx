import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import React, { useState } from "react";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    priority: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, description, priority });
    setTitle("");
    setDescription("");
    setPriority("medium");
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-gray-100 shadow-xl transition-all w-full max-w-md border border-gray-300">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-bold leading-6 text-gray-900 mb-4 border-b border-gray-300 pb-2"
                  >
                    Create New Task
                  </DialogTitle>

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-800 mb-1"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          className="block w-full px-3 py-2.5 text-base border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white rounded-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-800 mb-1"
                        >
                          Description
                        </label>
                        <textarea
                          id="description"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="block w-full px-3 py-2.5 text-base border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white rounded-sm"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="priority"
                          className="block text-sm font-medium text-gray-800 mb-1"
                        >
                          Priority
                        </label>
                        <select
                          id="priority"
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="block w-full px-3 py-2.5 text-base border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white rounded-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        className="mr-3 rounded-md border-2 border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={onClose}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border-2 border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Create Task"}
                      </button>
                    </div>
                  </form>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
