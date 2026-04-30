import { TASK_PRIORITIES, TASK_STATUSES, PRIORITY_LABELS, STATUS_LABELS } from "../utils/constants";
import Button from "./Button";
import { SelectInput } from "./FormControls";

export default function TaskFilters({ filters, onChange, users = [], isAdmin = false }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({ status: "", priority: "", assignedToId: "", overdue: "" });

  return (
    <div className="rounded-xl border border-slateLine bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-4">
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
        {isAdmin ? (
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
        ) : (
          <div className="hidden md:block" />
        )}
        <div className="flex gap-2">
          <SelectInput
            value={filters.overdue || ""}
            onChange={(event) => update("overdue", event.target.value)}
          >
            <option value="">Due state</option>
            <option value="true">Overdue only</option>
            <option value="false">All due dates</option>
          </SelectInput>
          <Button variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
