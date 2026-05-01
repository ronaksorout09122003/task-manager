import api from "./client";

const withQuery = (path, params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  changePassword: (payload) => api.patch("/auth/password", payload),
};

export const usersApi = {
  list: (search = "") => api.get(withQuery("/users", { search })),
  listTeam: (search = "") => api.get(withQuery("/users", { search, scope: "team" })),
  create: (payload) => api.post("/users", payload),
  getAdminMembers: (id) => api.get(`/users/admins/${id}/members`),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
};

export const projectsApi = {
  list: () => api.get("/projects"),
  create: (payload) => api.post("/projects", payload),
  getById: (id) => api.get(`/projects/${id}`),
  update: (id, payload) => api.put(`/projects/${id}`, payload),
  remove: (id) => api.delete(`/projects/${id}`),
  members: (id) => api.get(`/projects/${id}/members`),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

export const tasksApi = {
  list: (filters = {}) => api.get(withQuery("/tasks", filters)),
  listByProject: (projectId, filters = {}) =>
    api.get(withQuery(`/projects/${projectId}/tasks`, filters)),
  create: (projectId, payload) => api.post(`/projects/${projectId}/tasks`, payload),
  getById: (id) => api.get(`/tasks/${id}`),
  update: (id, payload) => api.put(`/tasks/${id}`, payload),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
};
