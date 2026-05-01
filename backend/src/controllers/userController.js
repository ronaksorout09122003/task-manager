const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { userSelect } = require("../utils/sanitizeUser");
const { isAdmin, isSuperAdmin } = require("../utils/permissions");

const userListSelect = {
  ...userSelect,
  _count: {
    select: {
      projectMemberships: true,
      assignedTasks: true,
    },
  },
};

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
    select: userListSelect,
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  res.json({ users });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const role = req.body.role || "MEMBER";

  if (!isSuperAdmin(req.user) && role !== "MEMBER") {
    throw new ApiError(403, "Only a super admin can create admin accounts");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
    select: userListSelect,
  });

  res.status(201).json({ user });
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

  if (!isSuperAdmin(req.user)) {
    throw new ApiError(403, "Only a super admin can change roles");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  if (existingUser.role === "SUPERADMIN" && role !== "SUPERADMIN") {
    const superAdminCount = await prisma.user.count({
      where: { role: "SUPERADMIN" },
    });

    if (superAdminCount <= 1) {
      throw new ApiError(400, "At least one super admin must remain");
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: userListSelect,
  });

  res.json({ user });
});

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUserRole,
};
