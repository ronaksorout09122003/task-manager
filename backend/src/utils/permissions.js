const isAdmin = (user) => user?.role === "ADMIN";

const canPatchTaskStatus = (user, task) => {
  if (!user || !task) return false;
  return isAdmin(user) || task.assignedToId === user.id;
};

const canViewTask = (user, task) => {
  if (!user || !task) return false;
  return isAdmin(user) || task.assignedToId === user.id;
};

module.exports = {
  isAdmin,
  canPatchTaskStatus,
  canViewTask,
};
