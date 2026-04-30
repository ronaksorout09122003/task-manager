const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { userSelect } = require("../utils/sanitizeUser");
const { isAdmin } = require("../utils/permissions");

const getUsers = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    select: {
      ...userSelect,
      _count: {
        select: {
          projectMemberships: true,
          assignedTasks: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  res.json({ users });
});

const getUserById = asyncHandler(async (req, res) => {
  if (!isAdmin(req.user) && req.user.id !== req.params.id) {
    throw new ApiError(403, "You can only view your own user record");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({ user });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (existingUser.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    if (adminCount <= 1) {
      throw new ApiError(400, "At least one admin must remain");
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      ...userSelect,
      _count: {
        select: {
          projectMemberships: true,
          assignedTasks: true,
        },
      },
    },
  });

  res.json({ user });
});

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
};
