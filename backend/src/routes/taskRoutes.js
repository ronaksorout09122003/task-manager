const express = require("express");
const {
  getTasks,
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");
const {
  authMiddleware,
  adminOnlyMiddleware,
  projectAccessMiddleware,
} = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema,
  taskFilterSchema,
} = require("../utils/validators");

const router = express.Router();

router.use(authMiddleware);

router.get("/tasks", validate(taskFilterSchema, "query"), getTasks);
router.get("/tasks/:id", getTaskById);
router.put("/tasks/:id", adminOnlyMiddleware, validate(taskUpdateSchema), updateTask);
router.patch("/tasks/:id/status", validate(taskStatusSchema), updateTaskStatus);
router.delete("/tasks/:id", adminOnlyMiddleware, deleteTask);

router.post(
  "/projects/:projectId/tasks",
  adminOnlyMiddleware,
  projectAccessMiddleware,
  validate(taskCreateSchema),
  createTask,
);
router.get(
  "/projects/:projectId/tasks",
  projectAccessMiddleware,
  validate(taskFilterSchema, "query"),
  getProjectTasks,
);

module.exports = router;
