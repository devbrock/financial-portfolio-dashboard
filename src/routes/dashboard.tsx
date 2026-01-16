import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@features/dashboard/Dashboard";

export const Route = createFileRoute("/dashboard")({
  component: DashboardComponent,
});

function DashboardComponent() {
  return <Dashboard />;
}
