import dynamic from "next/dynamic";
import { AppLayout } from "../src/components/Layout/AppLayout";

// No change to the dynamic import, just ensuring it's properly configured
const TaskDashboardContent = dynamic(
  () =>
    import("../src/components/Tasks/TaskDashboardContent").then(
      (mod) => mod.TaskDashboardContent
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-indigo-500 border-r-transparent"></div>
      </div>
    ),
  }
);

export default function Dashboard() {
  // Keep the dashboard component simple - just render the layout and client-only content
  return (
    <AppLayout>
      <TaskDashboardContent />
    </AppLayout>
  );
}
