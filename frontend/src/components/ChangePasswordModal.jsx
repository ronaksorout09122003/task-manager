import { useState } from "react";
import Button from "./Button";
import { Field, PasswordInput } from "./FormControls";
import Modal from "./Modal";

const initialForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function ChangePasswordModal({ isOpen, onClose, onSubmit, isLoading = false }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const close = () => {
    if (isLoading) return;
    setForm(initialForm);
    setErrors({});
    onClose();
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!form.currentPassword) nextErrors.currentPassword = "Current password is required";
    if (form.newPassword.length < 6) {
      nextErrors.newPassword = "New password must be at least 6 characters";
    }
    if (form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await onSubmit({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(initialForm);
      setErrors({});
    } catch (_error) {
      // The parent shows the toast; keep the form values so the user can retry.
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      title="Change password"
      description="Update your password without changing your account access."
    >
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Current password" error={errors.currentPassword}>
          <PasswordInput
            value={form.currentPassword}
            onChange={(event) => update("currentPassword", event.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <Field label="New password" error={errors.newPassword}>
          <PasswordInput
            value={form.newPassword}
            onChange={(event) => update("newPassword", event.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm new password" error={errors.confirmPassword}>
          <PasswordInput
            value={form.confirmPassword}
            onChange={(event) => update("confirmPassword", event.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Update password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
