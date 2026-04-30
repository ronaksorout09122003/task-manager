export default function StatCard({ title, value, icon: Icon, tone = "teal" }) {
  const toneClasses = {
    teal: "bg-teal-50 text-ocean",
    indigo: "bg-indigo-50 text-iris",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-xl border border-slateLine bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
        </div>
        {Icon ? (
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-lg ${toneClasses[tone]}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
