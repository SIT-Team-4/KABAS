import { apiClient } from "./client";

export async function login({ email, password }) {
  const response = await apiClient.request("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  return response.data;
}

export async function getMe() {
  const response = await apiClient.request("/auth/me");
  return response.data;
}
