import { del, get, patch, post } from "../api/fetchClient";

export async function fetchRecords(params = {}) {
  const response = await get("/records", params);
  return response.data;
}

export async function createRecord(payload) {
  const response = await post("/records", payload);
  return response.data;
}

export async function updateRecord(recordId, payload) {
  const response = await patch(`/records/${recordId}`, payload);
  return response.data;
}

export async function deleteRecord(recordId) {
  await del(`/records/${recordId}`);
}
