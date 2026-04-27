import API from "./api";

// Users
export const getAllUsers = () => API.get("/users");
export const updateUserStatus = (id, is_active) =>
  API.patch(`/users/${id}/status`, { is_active });
export const updateProfile = (id, data) => API.put(`/users/${id}`, data);
export const permanentDeleteUser = (id) => API.delete(`/users/${id}/permanent`);
// Helpers
export const getAllHelpers = () => API.get("/helpers");
export const addHelper = (data) => API.post("/helpers", data);

export const unblockUser = (id) => API.patch(`/auth/unblock/${id}`);

export const softDeleteUser = (id) => API.delete(`/users/${id}`);
export const restoreUser = (id) => API.patch(`/users/${id}/restore`);
export const getDeletedItems = () => API.get("/deleted/tickets").then(t =>
  API.get("/deleted/users").then(u => ({
    tickets: t.data,
    users: u.data
  }))
);
