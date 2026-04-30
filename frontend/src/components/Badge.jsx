import { STATUS_LABELS, PRIORITY_LABELS, ROLE_LABELS } from "../utils/constants";
import { classNames } from "../utils/classNames";

const toneClasses = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  COMPLETED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
  TODO: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  DONE: "bg-teal-50 text-teal-700 border-teal-200",
  LOW: "bg-sky-50 text-sky-700 border-sky-200",
  MEDIUM: "bg-violet-50 text-violet-700 border-violet-200",
  HIGH: "bg-rose-50 text-rose-700 border-rose-200",
  SUPER_ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  ADMIN: "bg-iris/10 text-iris border-indigo-200",
  MEMBER: "bg-slate-100 text-slate-700 border-slate-200",
  OVERDUE: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function Badge({ value, className = "" }) {
  const label = STATUS_LABELS[value] || PRIORITY_LABELS[value] || ROLE_LABELS[value] || value;

  return (
    <span
      className={classNames(
        "inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[value] || "bg-slate-100 text-slate-700 border-slate-200",
        className,
      )}
    >
      {label}
    </span>
  );
}
