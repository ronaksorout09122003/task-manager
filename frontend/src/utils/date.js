export const formatDate = (dateValue) => {
  if (!dateValue) return "No date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
};

export const toInputDate = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

export const isOverdue = (task) => {
  if (!task?.dueDate || task.status === "DONE") return false;
  return new Date(task.dueDate) < new Date();
};
