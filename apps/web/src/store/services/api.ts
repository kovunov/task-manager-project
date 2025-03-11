import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  created_at: string;
  users?: {
    id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
  tasks_users: Array<{
    users: {
      id: number;
      username: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
    };
  }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
}

export const api = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5002/api", // Updated to point to NestJS server with /api prefix
    prepareHeaders: (headers, { getState }: any) => {
      // Get token from state
      const token = getState()?.auth?.token;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Tasks", "Auth"],
  endpoints: (builder) => ({
    hello: builder.query<{ message: string }, void>({
      query: () => ({
        url: "/",
      }),
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    getAllTasks: builder.query<Task[], void>({
      query: () => "/tasks",
      providesTags: ["Tasks"],
    }),
    getMyTasks: builder.query<Task[], void>({
      query: () => "/tasks/my-tasks",
      providesTags: ["Tasks"],
    }),
    getUnassignedTasks: builder.query<Task[], void>({
      query: () => "/tasks/unassigned",
      providesTags: ["Tasks"],
    }),
    assignTaskToMe: builder.mutation<Task, number>({
      query: (taskId: number) => ({
        url: `/tasks/${taskId}/assign`,
        method: "POST",
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteTask: builder.mutation<void, number>({
      query: (taskId: number) => ({
        url: `/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: builder.mutation<
      Task,
      { taskId: number; status: string }
    >({
      query: ({ taskId, status }) => ({
        url: `/tasks/${taskId}`,
        method: "PUT",
        body: { status },
      }),
      // Improve cache invalidation - invalidate all Tasks-related queries
      invalidatesTags: () => [{ type: "Tasks", id: "LIST" }],

      // Add optimistic updates
      async onQueryStarted({ taskId, status }, { dispatch, queryFulfilled }) {
        // Get current cache keys for both my tasks and unassigned tasks queries
        const myTasksPatchResult = dispatch(
          api.util.updateQueryData("getMyTasks", undefined, (draft) => {
            const taskToUpdate = draft.find((task) => task.id === taskId);
            if (taskToUpdate) {
              taskToUpdate.status = status;
            }
          })
        );

        const unassignedTasksPatchResult = dispatch(
          api.util.updateQueryData("getUnassignedTasks", undefined, (draft) => {
            const taskToUpdate = draft.find((task) => task.id === taskId);
            if (taskToUpdate) {
              taskToUpdate.status = status;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // If the update fails, revert the optimistic update
          myTasksPatchResult.undo();
          unassignedTasksPatchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useHelloQuery,
  useLoginMutation,
  useGetAllTasksQuery,
  useGetMyTasksQuery,
  useGetUnassignedTasksQuery,
  useAssignTaskToMeMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
} = api;
