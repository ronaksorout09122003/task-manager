const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { userSelect } = require("../utils/sanitizeUser");
const { isAdmin } = require("../utils/permissions");

const projectInclude = {
  createdBy: {
    select: userSelect,
  },
  members: {
    include: {
      user: {
        select: userSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  tasks: {
    include: {
      assignedTo: {
        select: userSelect,
      },
      createdBy: {
        select: userSelect,
      },
    },
    orderBy: {
      dueDate: "asc",
    },
  },
};

const withProgress = (project, user) => {
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((task) => task.status === "DONE").length || 0;
  const visibleTasks = isAdmin(user)
    ? project.tasks
    : project.tasks?.filter((task) => task.assignedToId === user.id) || [];

  return {
    ...project,
    tasks: visibleTasks,
    progress: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    taskSummary: {
      total: totalTasks,
      completed: completedTasks,
    },
  };
};

const accessibleProjectWhere = (user) =>
  isAdmin(user)
    ? {}
    : {
        members: {
          some: {
            userId: user.id,
          },
        },
      };

const getProjects = asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    where: accessibleProjectWhere(req.user),
    include: projectInclude,
    orderBy: {
      updatedAt: "desc",
    },
  });

  res.json({ projects: projects.map((project) => withProgress(project, req.user)) });
});

const createProject = asyncHandler(async (req, res) => {
  const project = await prisma.project.create({
    data: {
      ...req.body,
      createdById: req.user.id,
      members: {
        create: {
          userId: req.user.id,
        },
      },
    },
    include: projectInclude,
  });

  res.status(201).json({ project: withProgress(project, req.user) });
});

const getProjectById = asyncHandler(async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: projectInclude,
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({ project: withProgress(project, req.user) });
});

const updateProject = asyncHandler(async (req, res) => {
  const existingProject = await prisma.project.findUnique({
    where: { id: req.params.id },
    select: {
      startDate: true,
      dueDate: true,
    },
  });

  if (!existingProject) {
    throw new ApiError(404, "Project not found");
  }

  const nextStartDate = req.body.startDate || existingProject.startDate;
  const nextDueDate = Object.prototype.hasOwnProperty.call(req.body, "dueDate")
    ? req.body.dueDate
    : existingProject.dueDate;

  if (nextDueDate && nextDueDate < nextStartDate) {
    throw new ApiError(400, "Due date cannot be before the start date");
  }

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data: req.body,
    include: projectInclude,
  });

  res.json({ project: withProgress(project, req.user) });
});

const deleteProject = asyncHandler(async (req, res) => {
  await prisma.project.delete({
    where: { id: req.params.id },
  });

  res.status(204).send();
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const members = await prisma.projectMember.findMany({
    where: { projectId: req.params.id },
    include: {
      user: {
        select: userSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  res.json({ members });
});

const addProjectMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId: req.params.id,
      userId,
    },
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  res.status(201).json({ member });
});

const removeProjectMember = asyncHandler(async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    select: { createdById: true },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (project.createdById === req.params.userId) {
    throw new ApiError(400, "The project creator cannot be removed from the project");
  }

  const assignedOpenTasks = await prisma.task.count({
    where: {
      projectId: req.params.id,
      assignedToId: req.params.userId,
      status: {
        not: "DONE",
      },
    },
  });

  if (assignedOpenTasks > 0) {
    throw new ApiError(400, "Reassign or complete this member's open tasks before removing them");
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId: req.params.id,
        userId: req.params.userId,
      },
    },
  });

  res.status(204).send();
});

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};
