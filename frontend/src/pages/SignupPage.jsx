import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/Button";
import { Field, TextInput } from "../components/FormControls";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await signup(form);
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slateLine bg-white p-8 shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-semibold text-ocean">Team Task Manager</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">New signups receive the Member role.</p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <Field label="Name" error={errors.name}>
            <TextInput value={form.name} onChange={(event) => update("name", event.target.value)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <TextInput
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <TextInput
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
            />
          </Field>
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Sign up
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-ocean hover:text-oceanDark" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
