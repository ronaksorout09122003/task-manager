const express = require("express");
const {
  getUsers,
  createUser,
  getUserById,
  getAdminMembers,
  updateUserRole,
} = require("../controllers/userController");
const { authMiddleware, adminOnlyMiddleware } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { userCreateSchema, userRoleUpdateSchema } = require("../utils/validators");

const router = express.Router();

router.use(authMiddleware);
router.get("/", adminOnlyMiddleware, getUsers);
router.post("/", adminOnlyMiddleware, validate(userCreateSchema), createUser);
router.get("/admins/:id/members", adminOnlyMiddleware, getAdminMembers);
router.patch("/:id/role", adminOnlyMiddleware, validate(userRoleUpdateSchema), updateUserRole);
router.get("/:id", getUserById);

module.exports = router;
