const sanitizeUser = (user) => {
  if (!user) return null;

  const { password, ...safeUser } = user;
  return safeUser;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

module.exports = {
  sanitizeUser,
  userSelect,
};
