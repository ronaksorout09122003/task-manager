const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { userSelect } = require("../utils/sanitizeUser");
const { isAdmin } = require("../utils/permissions");

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "Authentication token is required");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  const payload = jwt.verify(token, secret);
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(401, "User for this token no longer exists");
  }

  req.user = user;
  next();
});

const adminOnlyMiddleware = (req, _res, next) => {
  if (!isAdmin(req.user)) {
    return next(new ApiError(403, "Admin access is required"));
  }

  return next();
};

const projectAccessMiddleware = asyncHandler(async (req, _res, next) => {
  const projectId = req.params.id || req.params.projectId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (isAdmin(req.user)) {
    req.projectId = projectId;
    return next();
  }

  const membership = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId: req.user.id,
      },
    },
  });

  if (!membership) {
    throw new ApiError(403, "You do not have access to this project");
  }

  req.projectId = projectId;
  return next();
});

module.exports = {
  authMiddleware,
  adminOnlyMiddleware,
  projectAccessMiddleware,
};
