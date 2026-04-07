import { apiClient } from "./client";

export async function listClassGroups(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== "") {
      search.set(key, value);
    }
  });

  const qs = search.toString();
  const response = await apiClient.request(`/class-groups${qs ? `?${qs}` : ""}`);
  return Array.isArray(response.data) ? response.data : [];
}
