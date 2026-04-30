import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import Button from "../components/Button";
import { Field, PasswordInput, TextInput } from "../components/FormControls";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(form);
      toast.success("Welcome back");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-mist lg:grid-cols-[1fr_0.9fr]">
      <section className="hidden bg-ink px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ocean text-lg font-black">
            TT
          </div>
          <div>
            <p className="text-xl font-bold">Team Task Manager</p>
            <p className="text-sm text-slate-300">Project delivery with clear ownership.</p>
          </div>
        </div>
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold leading-tight tracking-normal">
            Run projects, tasks, and team access from one calm workspace.
          </h1>
          <div className="mt-8 grid gap-4 text-sm text-slate-200">
            {[
              "JWT authentication",
              "Super admin, admin, and member roles",
              "Real project progress and overdue tracking",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-300" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-400">Secure access for your project workspace.</p>
      </section>
      <section className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-xl border border-slateLine bg-white p-8 shadow-soft">
          <div className="mb-8">
            <p className="text-sm font-semibold text-ocean">Team Task Manager</p>
            <h2 className="mt-2 text-3xl font-bold text-ink">Sign in</h2>
            <p className="mt-2 text-sm text-slate-600">Enter your credentials to continue.</p>
          </div>
          <form className="space-y-4" onSubmit={submit} autoComplete="off">
            <Field label="Email" error={errors.email}>
              <TextInput
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </Field>
            <Field label="Password" error={errors.password}>
              <PasswordInput
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
              Login
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Contact your administrator if you need access.
          </p>
        </div>
      </section>
    </main>
  );
}
