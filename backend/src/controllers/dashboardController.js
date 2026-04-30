const prisma = require("../config/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { userSelect } = require("../utils/sanitizeUser");
const { isAdmin } = require("../utils/permissions");

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

const accessibleTaskWhere = (user) => (isAdmin(user) ? {} : { assignedToId: user.id });

const getDashboardStats = asyncHandler(async (req, res) => {
  const projectWhere = accessibleProjectWhere(req.user);
  const taskWhere = accessibleTaskWhere(req.user);
  const now = new Date();

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    todoTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    myAssignedTasks,
    recentTasks,
    progressProjects,
  ] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.project.count({ where: { ...projectWhere, status: "ACTIVE" } }),
    prisma.project.count({ where: { ...projectWhere, status: "COMPLETED" } }),
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: "TODO" } }),
    prisma.task.count({ where: { ...taskWhere, status: "IN_PROGRESS" } }),
    prisma.task.count({ where: { ...taskWhere, status: "DONE" } }),
    prisma.task.count({
      where: {
        ...taskWhere,
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
    }),
    prisma.task.count({ where: { assignedToId: req.user.id } }),
    prisma.task.findMany({
      where: taskWhere,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        assignedTo: {
          select: userSelect,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
    }),
    prisma.project.findMany({
      where: projectWhere,
      include: {
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 6,
    }),
  ]);

  const projectProgress = progressProjects.map((project) => {
    const total = project.tasks.length;
    const done = project.tasks.filter((task) => task.status === "DONE").length;

    return {
      id: project.id,
      title: project.title,
      status: project.status,
      totalTasks: total,
      completedTasks: done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });

  res.json({
    stats: {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      myAssignedTasks,
    },
    recentTasks,
    projectProgress,
  });
});

module.exports = {
  getDashboardStats,
};
