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
      createdUsers: true,
      projectMemberships: true,
      assignedTasks: true,
    },
  },
};

const buildSearchWhere = (search) =>
  search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

const getDefaultPassword = (name) => {
  const firstName = name.trim().split(/\s+/)[0].toLowerCase();
  return `${firstName}@123`;
};

const getUsers = asyncHandler(async (req, res) => {
  const search = req.query.search?.trim();
  const scope = req.query.scope?.trim();
  const scopedWhere =
    scope === "team"
      ? isSuperAdmin(req.user)
        ? { role: "ADMIN" }
        : { role: "MEMBER", createdById: req.user.id }
      : { role: { not: "SUPERADMIN" } };

  const users = await prisma.user.findMany({
    where: {
      ...scopedWhere,
      ...buildSearchWhere(search),
    },
    select: userListSelect,
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  res.json({ users });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const role = req.body.role || "MEMBER";

  if (role === "SUPERADMIN") {
    throw new ApiError(400, "Only one super admin is allowed");
  }

  if (isSuperAdmin(req.user) && role !== "ADMIN") {
    throw new ApiError(403, "Super admin can only create admin accounts");
  }

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

  const hashedPassword = await bcrypt.hash(getDefaultPassword(name), 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      createdById: req.user.id,
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

  if (existingUser.role === "SUPERADMIN") {
    throw new ApiError(400, "Super admin role cannot be changed");
  }

  if (role === "SUPERADMIN") {
    throw new ApiError(400, "Only one super admin is allowed");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: userListSelect,
  });

  res.json({ user });
});

const getAdminMembers = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isSuperAdmin(req.user) && req.user.id !== id) {
    throw new ApiError(403, "You do not have permission to view these members");
  }

  const admin = await prisma.user.findFirst({
    where: { id, role: "ADMIN" },
    select: userListSelect,
  });

  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  const members = await prisma.user.findMany({
    where: {
      role: "MEMBER",
      createdById: id,
    },
    select: userListSelect,
    orderBy: { name: "asc" },
  });

  res.json({ admin, members });
});

module.exports = {
  getUsers,
  createUser,
  getUserById,
  getAdminMembers,
  updateUserRole,
};
