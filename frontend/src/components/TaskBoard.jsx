import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  FolderKanban,
  Trash2,
  UserRound,
} from "lucide-react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { formatDate, isOverdue } from "../utils/date";
import { isAdmin as hasAdminAccess } from "../utils/roles";
import { classNames } from "../utils/classNames";

const statusOptions = [
  { value: "TODO", label: "To do", icon: Circle, color: "text-slate-500" },
  { value: "IN_PROGRESS", label: "In progress", icon: Clock3, color: "text-amber-500" },
  { value: "DONE", label: "Done", icon: CheckCircle2, color: "text-teal-500" },
];

function TaskRow({ task, currentUser, onEdit, onDelete, onStatusChange }) {
  const isAdmin = hasAdminAccess(currentUser);
  const canChangeStatus = isAdmin || task.assignedToId === currentUser?.id;
  const overdue = isOverdue(task);
  
  const currentStatus = statusOptions.find((s) => s.value === task.status);
  const CurrentIcon = currentStatus?.icon || Circle;

  const handleStatusChange = (newStatus) => {
    if (newStatus !== task.status) {
      onStatusChange?.(task, newStatus);
    }
  };

  return (
    <tr className="border-b border-slateLine hover:bg-slate-50/50 transition">
      {/* Task Title & Project */}
      <td className="px-4 py-3 text-sm">
        <div className="min-w-0">
          {task.project?.title ? (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <FolderKanban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{task.project.title}</span>
            </div>
          ) : null}
          <p className="font-bold text-ink">{task.title}</p>
          {task.description ? (
            <p className="mt-1 line-clamp-1 text-xs text-slate-600">{task.description}</p>
          ) : null}
        </div>
      </td>

      {/* Assigned To */}
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <UserRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span className="truncate text-xs font-medium">{task.assignedTo?.name || "Unassigned"}</span>
        </div>
      </td>

      {/* Priority & Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge value={task.priority} />
          {overdue ? <Badge value="OVERDUE" /> : null}
        </div>
      </td>

      {/* Due Date */}
      <td className="px-4 py-3">
        <div
          className={classNames(
            "flex items-center gap-2 text-xs font-medium",
            overdue ? "font-semibold text-rose-600" : "text-slate-600",
          )}
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </td>

      {/* Status Dropdown */}
      <td className="px-4 py-3">
        {canChangeStatus ? (
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex items-center gap-2 rounded-lg border border-slateLine bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-1"
            aria-label={`Change status for ${task.title}`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <CurrentIcon className={classNames("h-4 w-4", currentStatus?.color)} aria-hidden="true" />
            <span>{currentStatus?.label}</span>
          </div>
        )}
      </td>

      {/* Actions */}
      {isAdmin ? (
        <td className="px-4 py-3">
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slateLine bg-white px-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-ink"
              onClick={() => onEdit?.(task)}
              aria-label={`Edit ${task.title}`}
              title="Edit"
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-rose-100 bg-rose-50 px-2.5 text-xs font-bold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100"
              onClick={() => onDelete?.(task)}
              aria-label={`Delete ${task.title}`}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </td>
      ) : null}
    </tr>
  );
}

export default function TaskBoard({ tasks, currentUser, onEdit, onDelete, onStatusChange }) {
  const taskList = tasks || [];
  const isAdmin = hasAdminAccess(currentUser);

  if (!taskList.length) {
    return (
      <EmptyState
        title="No tasks found"
        description="Tasks that match the current view will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slateLine bg-white shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slateLine bg-slate-50">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              Task
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              Assigned To
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              Priority
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              Due Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              Status
            </th>
            {isAdmin && (
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {taskList.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              currentUser={currentUser}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
