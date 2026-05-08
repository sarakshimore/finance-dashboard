import { del, get, patch, post } from "../api/fetchClient";

export async function fetchUsers() {
  const response = await get("/users");
  return response.data;
}

export async function createViewerUser(payload) {
  const response = await post("/users", { ...payload, role: "viewer", status: "active" });
  return response.data;
}

export async function updateUser(userId, payload) {
  const response = await patch(`/users/${userId}`, payload);
  return response.data;
}

export async function deactivateUser(userId) {
  const response = await del(`/users/${userId}`);
  return response.data;
}

export async function deleteUserPermanently(userId) {
  const response = await del(`/users/${userId}/permanent`);
  return response.data;
}
