require("dotenv/config");

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
};

async function upsertUser({ name, email, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 12);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role,
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
}

async function main() {
  const admin = await upsertUser({
    name: "Avery Admin",
    email: "admin@example.com",
    password: "Admin@123",
    role: "ADMIN",
  });

  const member = await upsertUser({
    name: "Mira Member",
    email: "member@example.com",
    password: "Member@123",
    role: "MEMBER",
  });

  const memberTwo = await upsertUser({
    name: "Noah Planner",
    email: "noah@example.com",
    password: "Member@123",
    role: "MEMBER",
  });

  const launchProject = await prisma.project.upsert({
    where: { id: "seed-launch-project" },
    update: {
      title: "Website Launch",
      description:
        "Coordinate final QA, launch copy, analytics, and release tasks for the public website.",
      status: "ACTIVE",
      startDate: daysFromNow(-14),
      dueDate: daysFromNow(12),
      createdById: admin.id,
    },
    create: {
      id: "seed-launch-project",
      title: "Website Launch",
      description:
        "Coordinate final QA, launch copy, analytics, and release tasks for the public website.",
      status: "ACTIVE",
      startDate: daysFromNow(-14),
      dueDate: daysFromNow(12),
      createdById: admin.id,
    },
  });

  const opsProject = await prisma.project.upsert({
    where: { id: "seed-ops-project" },
    update: {
      title: "Customer Ops Workflow",
      description: "Improve intake, triage, and task ownership for support operations.",
      status: "ACTIVE",
      startDate: daysFromNow(-7),
      dueDate: daysFromNow(21),
      createdById: admin.id,
    },
    create: {
      id: "seed-ops-project",
      title: "Customer Ops Workflow",
      description: "Improve intake, triage, and task ownership for support operations.",
      status: "ACTIVE",
      startDate: daysFromNow(-7),
      dueDate: daysFromNow(21),
      createdById: admin.id,
    },
  });

  await prisma.$transaction([
    prisma.task.deleteMany({
      where: {
        projectId: {
          in: [launchProject.id, opsProject.id],
        },
      },
    }),
    prisma.projectMember.deleteMany({
      where: {
        projectId: {
          in: [launchProject.id, opsProject.id],
        },
      },
    }),
  ]);

  await prisma.projectMember.createMany({
    data: [
      { projectId: launchProject.id, userId: admin.id },
      { projectId: launchProject.id, userId: member.id },
      { projectId: launchProject.id, userId: memberTwo.id },
      { projectId: opsProject.id, userId: admin.id },
      { projectId: opsProject.id, userId: member.id },
    ],
    skipDuplicates: true,
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Finalize launch checklist",
        description: "Confirm redirects, monitoring, release owner, and rollback contact.",
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: daysFromNow(2),
        projectId: launchProject.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
      {
        title: "QA responsive pages",
        description:
          "Review homepage and project flows at mobile, tablet, and desktop breakpoints.",
        priority: "HIGH",
        status: "TODO",
        dueDate: daysFromNow(-2),
        projectId: launchProject.id,
        assignedToId: memberTwo.id,
        createdById: admin.id,
      },
      {
        title: "Publish release notes",
        description: "Prepare the final release note and internal announcement.",
        priority: "MEDIUM",
        status: "DONE",
        dueDate: daysFromNow(-1),
        projectId: launchProject.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
      {
        title: "Map support intake states",
        description: "Document current intake categories and owner handoff points.",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        dueDate: daysFromNow(5),
        projectId: opsProject.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
      {
        title: "Clean stale escalations",
        description: "Close or reassign unresolved escalations that have no owner.",
        priority: "LOW",
        status: "TODO",
        dueDate: daysFromNow(-5),
        projectId: opsProject.id,
        assignedToId: member.id,
        createdById: admin.id,
      },
    ],
  });

  console.log("Seed data created.");
  console.log("Admin: admin@example.com / Admin@123");
  console.log("Member: member@example.com / Member@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
