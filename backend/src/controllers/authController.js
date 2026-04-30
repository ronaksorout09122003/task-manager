const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { sanitizeUser, userSelect } = require("../utils/sanitizeUser");

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ApiError(500, "JWT secret is not configured");
  }

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

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
      role: "MEMBER",
    },
  });

  const safeUser = sanitizeUser(user);
  res.status(201).json({
    user: safeUser,
    token: generateToken(safeUser),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const safeUser = sanitizeUser(user);
  res.json({
    user: safeUser,
    token: generateToken(safeUser),
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: userSelect,
  });

  res.json({ user });
});

module.exports = {
  signup,
  login,
  me,
};
