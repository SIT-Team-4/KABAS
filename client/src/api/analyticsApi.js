import { apiClient } from "./client";

export async function getTeamAnalytics(teamId) {
  const type = typeof teamId;
  const isValidString = type === "string" && teamId.trim() !== "";
  const isValidNumber = type === "number" && Number.isFinite(teamId);

  if (!isValidString && !isValidNumber) {
    throw new Error("Invalid teamId supplied to getTeamAnalytics");
  }

  const safeTeamId = type === "string" ? teamId.trim() : teamId;
  const response = await apiClient.request(`/teams/${safeTeamId}/analytics`);
  return response.data;
}

export async function getAllTeamsAnalytics() {
  const response = await apiClient.request("/analytics/teams");
  return response.data;
}
