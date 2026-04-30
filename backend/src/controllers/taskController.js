const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { userSelect } = require("../utils/sanitizeUser");
const { isAdmin, canPatchTaskStatus, canViewTask } = require("../utils/permissions");

const taskInclude = {
  project: {
    select: {
      id: true,
      title: true,
      status: true,
    },
  },
  assignedTo: {
    select: userSelect,
  },
  createdBy: {
    select: userSelect,
  },
};

const assertAssigneeIsProjectMember = async ({ projectId, assignedToId }) => {
  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: assignedToId,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new ApiError(400, "Tasks can only be assigned to members of the project");
  }
};

const buildTaskWhere = (user, filters = {}) => {
  const where = isAdmin(user) ? {} : { assignedToId: user.id };

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.overdue === "true") {
    where.dueDate = { lt: new Date() };
    where.status = filters.status || { not: "DONE" };
  }
  if (isAdmin(user) && filters.assignedToId) where.assignedToId = filters.assignedToId;

  return where;
};

const getTasks = asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: buildTaskWhere(req.user, req.query),
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });

  res.json({ tasks });
});

const getProjectTasks = asyncHandler(async (req, res) => {
  const where = {
    projectId: req.params.projectId,
    ...(isAdmin(req.user) ? {} : { assignedToId: req.user.id }),
    ...buildTaskWhere(req.user, req.query),
  };

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
  });

  res.json({ tasks });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: taskInclude,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!canViewTask(req.user, task)) {
    throw new ApiError(403, "You can only view tasks assigned to you");
  }

  res.json({ task });
});

const createTask = asyncHandler(async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.projectId },
    select: { id: true },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await assertAssigneeIsProjectMember({
    projectId: req.params.projectId,
    assignedToId: req.body.assignedToId,
  });

  const task = await prisma.task.create({
    data: {
      ...req.body,
      projectId: req.params.projectId,
      createdById: req.user.id,
    },
    include: taskInclude,
  });

  res.status(201).json({ task });
});

const updateTask = asyncHandler(async (req, res) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: req.params.id },
    select: { id: true, projectId: true, assignedToId: true },
  });

  if (!existingTask) {
    throw new ApiError(404, "Task not found");
  }

  const projectId = req.body.projectId || existingTask.projectId;
  const assignedToId = req.body.assignedToId || existingTask.assignedToId;
  if (req.body.assignedToId || req.body.projectId) {
    await assertAssigneeIsProjectMember({
      projectId,
      assignedToId,
    });
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: req.body,
    include: taskInclude,
  });

  res.json({ task });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const existingTask = await prisma.task.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!existingTask) {
    throw new ApiError(404, "Task not found");
  }

  if (!canPatchTaskStatus(req.user, existingTask)) {
    throw new ApiError(403, "You can only update the status of your assigned tasks");
  }

  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
    include: taskInclude,
  });

  res.json({ task });
});

const deleteTask = asyncHandler(async (req, res) => {
  await prisma.task.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
});

module.exports = {
  getTasks,
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
