import { useEffect, useState } from "react";
import Button from "./Button";
import Badge from "./Badge";
import { Field, PasswordInput, TextInput } from "./FormControls";
import Modal from "./Modal";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "MEMBER",
};

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  roleOptions = [],
  isLoading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({ ...initialForm, role: roleOptions[0]?.value || "MEMBER" });
    setErrors({});
  }, [isOpen, roleOptions]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (form.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    if (!form.role) nextErrors.role = "Role is required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add user"
      description="Create a user account and share the password directly with the user."
    >
      <form className="space-y-4" onSubmit={submit} autoComplete="off">
        <Field label="Name" error={errors.name}>
          <TextInput
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="Temporary password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Role" error={errors.role}>
          {roleOptions.length > 1 ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    form.role === role.value
                      ? "border-ocean bg-ocean text-white"
                      : "border-slateLine bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => update("role", role.value)}
                >
                  {role.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2 rounded-lg border border-slateLine bg-slate-50 px-3 py-2">
              <Badge value={form.role} />
            </div>
          )}
        </Field>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create user
          </Button>
        </div>
      </form>
    </Modal>
  );
}
