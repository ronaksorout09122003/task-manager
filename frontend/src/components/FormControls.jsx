import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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

export function PasswordInput({ className = "", ...props }) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="mt-1 flex items-center rounded-lg border border-slateLine bg-white shadow-sm transition focus-within:border-ocean focus-within:ring-2 focus-within:ring-ocean/20">
      <input
        className={classNames(
          "min-w-0 flex-1 rounded-l-lg border-0 bg-transparent px-3 py-2.5 text-sm text-ink outline-none placeholder:text-slate-400",
          className,
        )}
        type={isVisible ? "text" : "password"}
        {...props}
      />
      <button
        type="button"
        className="flex h-10 w-11 shrink-0 items-center justify-center rounded-r-lg text-slate-500 transition hover:bg-slate-50 hover:text-ink focus:outline-none"
        onClick={() => setIsVisible((current) => !current)}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
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
