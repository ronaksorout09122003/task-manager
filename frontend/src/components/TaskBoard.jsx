import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Edit3, GripVertical, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "./Badge";
import Button from "./Button";
import EmptyState from "./EmptyState";
import { formatDate, isOverdue } from "../utils/date";
import { isAdmin as hasAdminAccess } from "../utils/roles";

const columns = [
  { status: "TODO", title: "Todo", tone: "border-slateLine bg-slate-50" },
  { status: "IN_PROGRESS", title: "In Progress", tone: "border-amber-200 bg-amber-50/70" },
  { status: "DONE", title: "Done", tone: "border-emerald-200 bg-emerald-50/70" },
];

function TaskCard({ task, currentUser, isOverlay = false, onEdit, onDelete }) {
  const isAdmin = hasAdminAccess(currentUser);
  const canMove = isAdmin || task.assignedToId === currentUser?.id;
  const overdue = isOverdue(task);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !canMove || isOverlay,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "rounded-lg border border-slateLine bg-white p-4 shadow-sm transition",
        isDragging ? "opacity-50" : "",
        isOverlay ? "w-80 shadow-soft" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink">{task.title}</p>
          {task.project?.title ? (
            <p className="mt-1 truncate text-xs font-medium text-slate-500">{task.project.title}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="mt-0.5 rounded-md p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!canMove || isOverlay}
          aria-label={canMove ? `Move ${task.title}` : "Task cannot be moved"}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {task.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-slate-600">{task.description}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge value={task.priority} />
        {overdue ? <Badge value="OVERDUE" /> : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{task.assignedTo?.name || "Unassigned"}</span>
        <span className="font-medium">{formatDate(task.dueDate)}</span>
      </div>

      {isAdmin ? (
        <div className="mt-4 flex justify-end gap-2 border-t border-slateLine pt-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0"
            onClick={() => onEdit?.(task)}
            aria-label="Edit task"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 px-0 text-rose-600 hover:bg-rose-50"
            onClick={() => onDelete?.(task)}
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function TaskColumn({ column, tasks, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.status,
    data: { status: column.status },
  });

  return (
    <section
      ref={setNodeRef}
      className={[
        "flex min-h-96 flex-col rounded-xl border p-3 transition",
        column.tone,
        isOver ? "border-ocean bg-teal-50" : "",
      ].join(" ")}
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="text-sm font-bold text-ink">{column.title}</h2>
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-slate-600">
          {tasks.length}
        </span>
      </div>
      <div className="grid flex-1 content-start gap-3">{children}</div>
    </section>
  );
}

export default function TaskBoard({ tasks, currentUser, onEdit, onDelete, onStatusChange }) {
  const [activeTask, setActiveTask] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const groupedTasks = useMemo(
    () =>
      columns.reduce((groups, column) => {
        groups[column.status] = tasks.filter((task) => task.status === column.status);
        return groups;
      }, {}),
    [tasks],
  );

  if (!tasks?.length) {
    return (
      <EmptyState
        title="No tasks found"
        description="Tasks that match the current view will appear here."
      />
    );
  }

  const handleDragStart = (event) => {
    setActiveTask(event.active.data.current?.task || null);
  };

  const handleDragEnd = (event) => {
    const nextStatus = event.over?.data.current?.status || event.over?.id;
    const task = event.active.data.current?.task;
    setActiveTask(null);

    if (!task || !nextStatus || task.status === nextStatus) return;
    if (!columns.some((column) => column.status === nextStatus)) return;

    onStatusChange?.(task, nextStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => (
          <TaskColumn key={column.status} column={column} tasks={groupedTasks[column.status]}>
            {groupedTasks[column.status].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUser={currentUser}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TaskColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} currentUser={currentUser} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
