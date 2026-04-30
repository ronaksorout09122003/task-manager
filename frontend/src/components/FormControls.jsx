import { classNames } from "../utils/classNames";

const inputClass =
  "mt-1 w-full rounded-lg border border-slateLine bg-white px-3 py-2.5 text-sm text-ink shadow-sm transition placeholder:text-slate-400 focus:border-ocean";

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}

export function TextInput({ className = "", ...props }) {
  return <input className={classNames(inputClass, className)} {...props} />;
}

export function Textarea({ className = "", rows = 4, ...props }) {
  return (
    <textarea rows={rows} className={classNames(inputClass, "resize-y", className)} {...props} />
  );
}

export function SelectInput({ className = "", children, ...props }) {
  return (
    <select className={classNames(inputClass, className)} {...props}>
      {children}
    </select>
  );
}
