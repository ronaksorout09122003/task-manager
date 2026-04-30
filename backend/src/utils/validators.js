const { z } = require("zod");

const Role = z.enum(["ADMIN", "MEMBER"]);
const ProjectStatus = z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]);
const TaskStatus = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
const TaskPriority = z.enum(["LOW", "MEDIUM", "HIGH"]);

const requiredDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date({
    required_error: "Date is required",
    invalid_type_error: "Date must be valid",
  }),
);

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date().optional(),
);

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().email("Email must be valid").max(180, "Email is too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Email must be valid"),
  password: z.string().min(1, "Password is required"),
});

const projectCreateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Project title is required")
      .max(160, "Project title is too long"),
    description: z.string().trim().max(2000, "Description is too long").optional().default(""),
    status: ProjectStatus.optional().default("ACTIVE"),
    startDate: requiredDate,
    dueDate: optionalDate,
  })
  .refine((data) => !data.dueDate || data.dueDate >= data.startDate, {
    path: ["dueDate"],
    message: "Due date cannot be before the start date",
  });

const projectUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Project title is required")
      .max(160, "Project title is too long")
      .optional(),
    description: z.string().trim().max(2000, "Description is too long").optional(),
    status: ProjectStatus.optional(),
    startDate: requiredDate.optional(),
    dueDate: optionalDate.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required")
  .refine((data) => !data.startDate || !data.dueDate || data.dueDate >= data.startDate, {
    path: ["dueDate"],
    message: "Due date cannot be before the start date",
  });

const projectMemberSchema = z.object({
  userId: z.string().trim().min(1, "User is required"),
});

const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(180, "Task title is too long"),
  description: z.string().trim().max(2500, "Description is too long").optional().default(""),
  priority: TaskPriority.optional().default("MEDIUM"),
  status: TaskStatus.optional().default("TODO"),
  dueDate: requiredDate,
  assignedToId: z.string().trim().min(1, "Assigned user is required"),
});

const taskUpdateSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Task title is required")
      .max(180, "Task title is too long")
      .optional(),
    description: z.string().trim().max(2500, "Description is too long").optional(),
    priority: TaskPriority.optional(),
    status: TaskStatus.optional(),
    dueDate: requiredDate.optional(),
    assignedToId: z.string().trim().min(1, "Assigned user is required").optional(),
    projectId: z.string().trim().min(1, "Project is required").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field is required");

const taskStatusSchema = z.object({
  status: TaskStatus,
});

const taskFilterSchema = z.object({
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  assignedToId: z.string().trim().optional(),
  overdue: z.enum(["true", "false"]).optional(),
});

module.exports = {
  Role,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  signupSchema,
  loginSchema,
  projectCreateSchema,
  projectUpdateSchema,
  projectMemberSchema,
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema,
  taskFilterSchema,
};
