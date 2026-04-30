import { TASK_STATUSES, STATUS_LABELS } from "../utils/constants";

export default function TaskStatusSelect({ value, onChange, disabled = false }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 min-w-32 rounded-lg border border-slateLine bg-white px-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      aria-label="Task status"
    >
      {TASK_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
