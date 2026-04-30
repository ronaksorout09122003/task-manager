export default function ProgressBar({ value = 0, label }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
        <span>{label || "Progress"}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-ocean transition-all"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}
