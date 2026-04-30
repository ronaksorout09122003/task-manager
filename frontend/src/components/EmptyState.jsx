import { Inbox } from "lucide-react";

export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slateLine bg-white p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-ocean">
        <Inbox className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
