import { useEffect, useState } from "react";
import { PROJECT_STATUSES, STATUS_LABELS } from "../utils/constants";
import { toInputDate } from "../utils/date";
import Button from "./Button";
import { Field, SelectInput, Textarea, TextInput } from "./FormControls";
import Modal from "./Modal";

const today = new Date().toISOString().slice(0, 10);

const initialForm = {
  title: "",
  description: "",
  status: "ACTIVE",
  startDate: today,
  dueDate: "",
};

export default function ProjectFormModal({
  isOpen,
  onClose,
  project,
  onSubmit,
  isLoading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        status: project.status || "ACTIVE",
        startDate: toInputDate(project.startDate) || today,
        dueDate: toInputDate(project.dueDate),
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [project, isOpen]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Project title is required";
    if (!form.startDate) nextErrors.startDate = "Start date is required";
    if (form.dueDate && new Date(form.dueDate) < new Date(form.startDate)) {
      nextErrors.dueDate = "Due date cannot be before the start date";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit({
      ...form,
      dueDate: form.dueDate || null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? "Edit project" : "Create project"}>
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Title" error={errors.title}>
          <TextInput value={form.title} onChange={(event) => update("title", event.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <SelectInput
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Start date" error={errors.startDate}>
            <TextInput
              type="date"
              value={form.startDate}
              onChange={(event) => update("startDate", event.target.value)}
            />
          </Field>
          <Field label="Due date" error={errors.dueDate}>
            <TextInput
              type="date"
              value={form.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
            />
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {project ? "Save changes" : "Create project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
