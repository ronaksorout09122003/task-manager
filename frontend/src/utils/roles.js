export const isSuperAdmin = (user) => user?.role === "SUPERADMIN";

export const isAdmin = (user) => user?.role === "ADMIN" || isSuperAdmin(user);
