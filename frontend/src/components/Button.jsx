import { Loader2 } from "lucide-react";
import { classNames } from "../utils/classNames";

const variants = {
  primary: "bg-ocean text-white hover:bg-oceanDark border-ocean",
  secondary: "bg-white text-ink hover:bg-slate-50 border-slateLine",
  danger: "bg-roseSoft text-white hover:bg-rose-700 border-roseSoft",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border-transparent",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
