export const isSuperAdmin = (user) => user?.role === "SUPER_ADMIN";

export const isAdmin = (user) => user?.role === "ADMIN" || isSuperAdmin(user);
