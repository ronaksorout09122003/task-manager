const express = require("express");
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} = require("../controllers/projectController");
const {
  authMiddleware,
  adminOnlyMiddleware,
  projectAccessMiddleware,
} = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  projectCreateSchema,
  projectUpdateSchema,
  projectMemberSchema,
} = require("../utils/validators");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProjects);
router.post("/", adminOnlyMiddleware, validate(projectCreateSchema), createProject);
router.get("/:id", projectAccessMiddleware, getProjectById);
router.put(
  "/:id",
  adminOnlyMiddleware,
  projectAccessMiddleware,
  validate(projectUpdateSchema),
  updateProject,
);
router.delete("/:id", adminOnlyMiddleware, projectAccessMiddleware, deleteProject);

router.get("/:id/members", projectAccessMiddleware, getProjectMembers);
router.post(
  "/:id/members",
  adminOnlyMiddleware,
  projectAccessMiddleware,
  validate(projectMemberSchema),
  addProjectMember,
);
router.delete(
  "/:id/members/:userId",
  adminOnlyMiddleware,
  projectAccessMiddleware,
  removeProjectMember,
);

module.exports = router;
