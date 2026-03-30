import { apiClient } from "./client";

export async function getTeamAnalytics(teamId) {
  const response = await apiClient.request(`/teams/${teamId}/analytics`);
  return response.data;
}

export async function getAllTeamsAnalytics() {
  const response = await apiClient.request("/analytics/teams");
  return response.data;
}
