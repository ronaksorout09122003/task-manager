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
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Edit3,
  FolderKanban,
  GripVertical,
  Trash2,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "./Badge";
import EmptyState from "./EmptyState";
import { formatDate, isOverdue } from "../utils/date";
import { isAdmin as hasAdminAccess } from "../utils/roles";
import { classNames } from "../utils/classNames";

const columns = [
  {
    status: "TODO",
    title: "To do",
    description: "Ready to start",
    Icon: Circle,
    accent: "bg-slate-400",
    header: "bg-slate-50",
    count: "bg-slate-100 text-slate-700",
    empty: "border-slate-200 bg-slate-50 text-slate-500",
  },
  {
    status: "IN_PROGRESS",
    title: "In progress",
    description: "Currently active",
    Icon: Clock3,
    accent: "bg-amberSoft",
    header: "bg-amber-50/70",
    count: "bg-amber-100 text-amber-700",
    empty: "border-amber-200 bg-amber-50/60 text-amber-700",
  },
  {
    status: "DONE",
    title: "Done",
    description: "Completed work",
    Icon: CheckCircle2,
    accent: "bg-ocean",
    header: "bg-teal-50/80",
    count: "bg-teal-100 text-teal-700",
    empty: "border-teal-200 bg-teal-50/60 text-teal-700",
  },
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
      className={classNames(
        "group rounded-xl border border-slateLine/90 bg-white p-3.5 shadow-sm transition duration-200",
        "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-soft",
        isDragging && "opacity-40",
        isOverlay && "w-[22rem] max-w-[calc(100vw-2rem)] shadow-soft",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {task.project?.title ? (
            <div className="mb-2 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500">
              <FolderKanban className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{task.project.title}</span>
            </div>
          ) : null}
          <p className="text-sm font-bold leading-5 text-ink">{task.title}</p>
          {task.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{task.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          className={classNames(
            "mt-0.5 rounded-lg border border-transparent p-1.5 text-slate-400 transition",
            "hover:border-slateLine hover:bg-slate-50 hover:text-slate-700",
            "disabled:cursor-not-allowed disabled:opacity-40",
            canMove && !isOverlay ? "cursor-grab active:cursor-grabbing" : "",
          )}
          disabled={!canMove || isOverlay}
          aria-label={canMove ? `Move ${task.title}` : "Task cannot be moved"}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slateLine pt-3">
        <Badge value={task.priority} />
        {overdue ? <Badge value="OVERDUE" /> : null}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid min-w-0 gap-2 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="truncate">{task.assignedTo?.name || "Unassigned"}</span>
          </div>
          <div
            className={classNames(
              "flex items-center gap-2",
              overdue ? "font-semibold text-rose-600" : "text-slate-500",
            )}
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        </div>

        {isAdmin ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slateLine bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-ink"
              onClick={() => onEdit?.(task)}
              aria-label={`Edit ${task.title}`}
            >
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100"
              onClick={() => onDelete?.(task)}
              aria-label={`Delete ${task.title}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </div>
        ) : null}
      </div>
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
      className={classNames(
        "relative flex min-h-[18rem] flex-col overflow-hidden rounded-2xl border border-slateLine bg-white shadow-sm transition duration-200 lg:min-h-[24rem]",
        isOver && "border-ocean ring-4 ring-teal-100",
      )}
    >
      <div className={classNames("h-1.5 w-full", column.accent)} />
      <div className={classNames("border-b border-slateLine px-4 py-3", column.header)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
              <column.Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-ink">{column.title}</h2>
              <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                {column.description}
              </p>
            </div>
          </div>
          <span
            className={classNames(
              "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold",
              column.count,
            )}
          >
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="grid flex-1 content-start gap-3 p-3">
        {tasks.length ? (
          children
        ) : (
          <div
            className={classNames(
              "flex min-h-28 items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center text-sm font-semibold lg:min-h-32",
              column.empty,
            )}
          >
            No tasks here
          </div>
        )}
      </div>
    </section>
  );
}

export default function TaskBoard({ tasks, currentUser, onEdit, onDelete, onStatusChange }) {
  const [activeTask, setActiveTask] = useState(null);
  const taskList = tasks || [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const groupedTasks = useMemo(
    () =>
      columns.reduce((groups, column) => {
        groups[column.status] = taskList.filter((task) => task.status === column.status);
        return groups;
      }, {}),
    [taskList],
  );

  if (!taskList.length) {
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
      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = groupedTasks[column.status];

          return (
            <TaskColumn key={column.status} column={column} tasks={columnTasks}>
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUser={currentUser}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TaskColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} currentUser={currentUser} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
