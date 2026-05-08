import { getToken } from "../utils/tokenStorage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(body?.message || "Request failed.");
    error.status = response.status;
    error.details = body?.details;
    throw error;
  }

  return body;
}

function toQueryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function get(path, params) {
  return request(`${path}${toQueryString(params)}`);
}

export async function post(path, payload) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function patch(path, payload) {
  return request(path, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function del(path) {
  return request(path, {
    method: "DELETE",
  });
}
