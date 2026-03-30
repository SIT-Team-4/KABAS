import { apiClient } from "./client";

export async function listTeams(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== "") {
      search.set(key, value);
    }
  });
  const qs = search.toString();
  const response = await apiClient.request(`/teams${qs ? `?${qs}` : ""}`);
  return response.data;
}

export async function getTeamById(teamId) {
  const response = await apiClient.request(`/teams/${teamId}`);
  return response.data;
}

export async function createTeam(payload) {
  const response = await apiClient.request("/teams", {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateTeam(teamId, payload) {
  const response = await apiClient.request(`/teams/${teamId}`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function deleteTeam(teamId) {
  const response = await apiClient.request(`/teams/${teamId}`, {
    method: "DELETE",
  });
  return response.data;
}
