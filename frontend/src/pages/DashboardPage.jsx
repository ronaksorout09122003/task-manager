import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListChecks,
  Timer,
  UserCheck,
} from "lucide-react";
import { getErrorMessage } from "../api/client";
import { dashboardApi } from "../api/resources";
import Badge from "../components/Badge";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import ProgressBar from "../components/ProgressBar";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { formatDate, isOverdue } from "../utils/date";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        const response = await dashboardApi.stats();
        if (isMounted) setData(response.data);
      } catch (requestError) {
        if (isMounted) setError(getErrorMessage(requestError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) return <LoadingSpinner label="Loading dashboard" />;
  if (error) return <EmptyState title="Dashboard could not load" description={error} />;

  const stats = data.stats;
  const cards = [
    { title: "Total projects", value: stats.totalProjects, icon: FolderKanban, tone: "teal" },
    { title: "Active projects", value: stats.activeProjects, icon: Timer, tone: "indigo" },
    {
      title: "Completed projects",
      value: stats.completedProjects,
      icon: CheckCircle2,
      tone: "teal",
    },
    { title: "Total tasks", value: stats.totalTasks, icon: ListChecks, tone: "slate" },
    { title: "Todo tasks", value: stats.todoTasks, icon: Clock3, tone: "amber" },
    { title: "In-progress tasks", value: stats.inProgressTasks, icon: Timer, tone: "indigo" },
    { title: "Completed tasks", value: stats.completedTasks, icon: CheckCircle2, tone: "teal" },
    { title: "Overdue tasks", value: stats.overdueTasks, icon: AlertTriangle, tone: "rose" },
    { title: "My assigned tasks", value: stats.myAssignedTasks, icon: UserCheck, tone: "indigo" },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0] || "there"}`}
        description="A live overview of your projects, task status, overdue work, and recent updates from the database."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-slateLine bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Project progress</h2>
              <p className="mt-1 text-sm text-slate-600">
                Completion is calculated from real task status counts.
              </p>
            </div>
          </div>
          {data.projectProgress.length ? (
            <div className="space-y-4">
              {data.projectProgress.map((project) => (
                <div key={project.id} className="rounded-lg border border-slateLine p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{project.title}</p>
                      <p className="text-sm text-slate-600">
                        {project.completedTasks} of {project.totalTasks} tasks done
                      </p>
                    </div>
                    <Badge value={project.status} />
                  </div>
                  <ProgressBar value={project.progress} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No project progress yet"
              description="Create a project and tasks to see progress bars here."
            />
          )}
        </div>
        <div className="rounded-xl border border-slateLine bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Recent tasks</h2>
          <p className="mt-1 text-sm text-slate-600">Latest updates scoped to your role.</p>
          {data.recentTasks.length ? (
            <div className="mt-5 space-y-3">
              {data.recentTasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-slateLine bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{task.project?.title}</p>
                    </div>
                    <Badge value={task.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <Badge value={task.priority} />
                    {isOverdue(task) ? <Badge value="OVERDUE" /> : null}
                    <span>Due {formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState title="No recent tasks" description="Task updates will appear here." />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
