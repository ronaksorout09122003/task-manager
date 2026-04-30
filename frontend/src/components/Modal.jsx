import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({ isOpen, onClose, title, description, children, size = "md" }) {
  if (!isOpen) return null;

  const widthClass = size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <button className="absolute inset-0 bg-ink/40" aria-label="Close modal" onClick={onClose} />
      <div
        className={`relative max-h-[92vh] w-full ${widthClass} overflow-auto rounded-xl bg-white shadow-soft`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slateLine px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 px-0"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
