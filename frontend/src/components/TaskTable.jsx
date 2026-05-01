import { Edit3, Trash2 } from "lucide-react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import TaskStatusSelect from "./TaskStatusSelect";
import { formatDate, isOverdue } from "../utils/date";
import { isAdmin as hasAdminAccess } from "../utils/roles";

export default function TaskTable({
  tasks,
  currentUser,
  onEdit,
  onDelete,
  onStatusChange,
  showProject = true,
}) {
  if (!tasks?.length) {
    return (
      <EmptyState
        title="No tasks found"
        description="Tasks that match the current view will appear here."
      />
    );
  }

  const isAdmin = hasAdminAccess(currentUser);

  return (
    <div className="overflow-hidden rounded-xl border border-slateLine bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slateLine">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                Task
              </th>
              {showProject ? (
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  Project
                </th>
              ) : null}
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                Assignee
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                Due
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-normal text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateLine bg-white">
            {tasks.map((task) => {
              const overdue = isOverdue(task);
              const canUpdateStatus = isAdmin || task.assignedToId === currentUser?.id;

              return (
                <tr key={task.id} className={overdue ? "bg-rose-50/50" : ""}>
                  <td className="max-w-sm px-4 py-4">
                    <p className="font-semibold text-ink">{task.title}</p>
                    {task.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{task.description}</p>
                    ) : null}
                    {overdue ? <Badge value="OVERDUE" className="mt-2" /> : null}
                  </td>
                  {showProject ? (
                    <td className="px-4 py-4 text-sm text-slate-600">{task.project?.title}</td>
                  ) : null}
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {task.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge value={task.priority} />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-700">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-4">
                    <TaskStatusSelect
                      value={task.status}
                      disabled={!canUpdateStatus}
                      onChange={(status) => onStatusChange?.(task, status)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {isAdmin ? (
                        <>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slateLine bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-ink"
                            onClick={() => onEdit?.(task)}
                            aria-label={`Edit ${task.title}`}
                          >
                            <Edit3 className="h-4 w-4" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100"
                            onClick={() => onDelete?.(task)}
                            aria-label={`Delete ${task.title}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400">Restricted</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
