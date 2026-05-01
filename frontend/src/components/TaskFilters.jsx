import { Filter, RotateCcw } from "lucide-react";
import { TASK_PRIORITIES, TASK_STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "../utils/constants";
import Button from "./Button";
import { SelectInput } from "./FormControls";

export default function TaskFilters({ filters, onChange, users = [], isAdmin = false }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({ status: "", priority: "", assignedToId: "", overdue: "" });

  return (
    <div className="rounded-2xl border border-slateLine bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 border-b border-slateLine pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-ocean">
            <Filter className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Filters</p>
            <p className="text-xs font-medium text-slate-500">
              Narrow tasks by state, priority, and owner.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={reset} className="w-full sm:w-auto">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label>
          <span className="text-xs font-bold uppercase tracking-normal text-slate-500">Status</span>
          <SelectInput
            value={filters.status || ""}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </SelectInput>
        </label>
        <label>
          <span className="text-xs font-bold uppercase tracking-normal text-slate-500">
            Priority
          </span>
          <SelectInput
            value={filters.priority || ""}
            onChange={(event) => update("priority", event.target.value)}
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </SelectInput>
        </label>
        {isAdmin ? (
          <label>
            <span className="text-xs font-bold uppercase tracking-normal text-slate-500">
              Assigned user
            </span>
            <SelectInput
              value={filters.assignedToId || ""}
              onChange={(event) => update("assignedToId", event.target.value)}
            >
              <option value="">All assignees</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </SelectInput>
          </label>
        ) : null}
        <label>
          <span className="text-xs font-bold uppercase tracking-normal text-slate-500">
            Due date
          </span>
          <SelectInput
            value={filters.overdue || ""}
            onChange={(event) => update("overdue", event.target.value)}
          >
            <option value="">All due dates</option>
            <option value="true">Overdue only</option>
            <option value="false">Not overdue</option>
          </SelectInput>
        </label>
      </div>
    </div>
  );
}
