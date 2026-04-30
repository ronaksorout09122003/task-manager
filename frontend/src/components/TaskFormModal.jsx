import { useEffect, useState } from "react";
import { PRIORITY_LABELS, STATUS_LABELS, TASK_PRIORITIES, TASK_STATUSES } from "../utils/constants";
import { toInputDate } from "../utils/date";
import Button from "./Button";
import { Field, SelectInput, Textarea, TextInput } from "./FormControls";
import Modal from "./Modal";

const initialForm = {
  title: "",
  description: "",
  priority: "MEDIUM",
  status: "TODO",
  dueDate: "",
  assignedToId: "",
};

export default function TaskFormModal({
  isOpen,
  onClose,
  task,
  members = [],
  onSubmit,
  isLoading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        priority: task.priority || "MEDIUM",
        status: task.status || "TODO",
        dueDate: toInputDate(task.dueDate),
        assignedToId: task.assignedToId || "",
      });
    } else {
      setForm({ ...initialForm, assignedToId: members[0]?.user?.id || members[0]?.id || "" });
    }
    setErrors({});
  }, [task, members, isOpen]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Task title is required";
    if (!form.dueDate) nextErrors.dueDate = "Due date is required";
    if (!form.assignedToId) nextErrors.assignedToId = "Choose an assignee";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit(form);
  };

  const memberOptions = members.map((member) => member.user || member);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? "Edit task" : "Create task"} size="lg">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Priority">
            <SelectInput
              value={form.priority}
              onChange={(event) => update("priority", event.target.value)}
            >
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Status">
            <SelectInput
              value={form.status}
              onChange={(event) => update("status", event.target.value)}
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Due date" error={errors.dueDate}>
            <TextInput
              type="date"
              value={form.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
            />
          </Field>
          <Field label="Assigned user" error={errors.assignedToId}>
            <SelectInput
              value={form.assignedToId}
              onChange={(event) => update("assignedToId", event.target.value)}
            >
              <option value="">Choose user</option>
              {memberOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {task ? "Save task" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
