import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="max-w-md rounded-xl border border-slateLine bg-white p-8 text-center shadow-soft">
        <p className="text-sm font-semibold text-ocean">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The route you opened does not exist in this workspace.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-ocean bg-ocean px-4 text-sm font-semibold text-white transition hover:bg-oceanDark"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
