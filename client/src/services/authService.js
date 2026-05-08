import { get, post } from "../api/fetchClient";

export async function registerUser(payload) {
  const response = await post("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload) {
  const response = await post("/auth/login", payload);
  return response.data;
}

export async function fetchCurrentUser() {
  const response = await get("/auth/me");
  return response.data;
}
