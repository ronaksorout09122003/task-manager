const isSuperAdmin = (user) => user?.role === "SUPERADMIN";
const isAdmin = (user) => user?.role === "ADMIN" || isSuperAdmin(user);

const canPatchTaskStatus = (user, task) => {
  if (!user || !task) return false;
  return isAdmin(user) || task.assignedToId === user.id;
};

const canViewTask = (user, task) => {
  if (!user || !task) return false;
  return isAdmin(user) || task.assignedToId === user.id;
};

module.exports = {
  isSuperAdmin,
  isAdmin,
  canPatchTaskStatus,
  canViewTask,
};
