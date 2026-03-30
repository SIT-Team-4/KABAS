import { apiClient } from "./client";

export async function getTeamCredential(teamId) {
  const response = await apiClient.request(`/teams/${teamId}/credentials`);
  return response.data;
}

export async function createTeamCredential(teamId, payload) {
  const response = await apiClient.request(`/teams/${teamId}/credentials`, {
    method: "POST",
    body: payload,
  });
  return response.data;
}

export async function updateTeamCredential(teamId, payload) {
  const response = await apiClient.request(`/teams/${teamId}/credentials`, {
    method: "PUT",
    body: payload,
  });
  return response.data;
}

export async function deleteTeamCredential(teamId) {
  return apiClient.request(`/teams/${teamId}/credentials`, {
    method: "DELETE",
  });
}
