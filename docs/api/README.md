# KABAS API Reference

Base URL: `http://localhost:3001/api`

All protected endpoints require the `x-api-key` header. GitHub endpoints require `x-github-token` instead.

---

## Authentication

| Header | Description |
|--------|-------------|
| `x-api-key` | Admin API key (required for all protected endpoints) |
| `x-github-token` | GitHub personal access token (required for GitHub endpoints) |

**401 response:** `{ "success": false, "error": "Unauthorized" }`

---

## Teams

### `POST /api/teams`

Create a new team.

**Auth:** `x-api-key`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Team name (trimmed) |
| `classGroupId` | integer\|null | no | Associated class group ID |

**Response (201):**
```json
{ "success": true, "data": { "id": 1, "name": "Team Alpha", "classGroupId": null } }
```

---

### `GET /api/teams`

Get all teams. Optionally filter by query parameters.

**Auth:** `x-api-key`

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `classGroupId` | integer | Filter by class group |

**Response (200):**
```json
{ "success": true, "data": [{ "id": 1, "name": "Team Alpha", "classGroupId": null }] }
```

---

### `GET /api/teams/:teamId`

Get a single team by ID.

**Auth:** `x-api-key`

**Response (200):**
```json
{ "success": true, "data": { "id": 1, "name": "Team Alpha", "classGroupId": null } }
```

**Errors:** 404 if team not found.

---

### `PUT /api/teams/:teamId`

Update a team.

**Auth:** `x-api-key`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | no | Team name (non-empty if provided) |
| `classGroupId` | integer\|null | no | Associated class group ID |

**Response (200):**
```json
{ "success": true, "data": { "id": 1, "name": "Team Alpha Updated", "classGroupId": 1 } }
```

---

### `DELETE /api/teams/:teamId`

Delete a team and its associated credential and tasks.

**Auth:** `x-api-key`

**Response (200):**
```json
{ "success": true, "message": "Team deleted" }
```

---

## Team Credentials

Credentials are stored with AES-256-GCM encryption. The raw `apiToken` is never returned — responses include `hasApiToken: true/false` instead.

### `POST /api/teams/:teamId/credentials`

Create a credential for a team. One credential per team.

**Auth:** `x-api-key`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `provider` | string | yes | `"jira"` or `"github"` |
| `baseUrl` | string | Jira: yes, GitHub: no | Base URL (e.g., `https://site.atlassian.net/projects/KBAS`) |
| `email` | string | Jira: yes, GitHub: no | Account email |
| `apiToken` | string | yes | API token or personal access token |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1, "teamId": 1, "provider": "jira",
    "baseUrl": "https://site.atlassian.net/projects/KBAS",
    "email": "user@example.com", "hasApiToken": true
  }
}
```

**Errors:** 404 if team not found, 409 if credential already exists.

---

### `GET /api/teams/:teamId/credentials`

Get the credential for a team (sanitized — no raw token).

**Auth:** `x-api-key`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1, "teamId": 1, "provider": "jira",
    "baseUrl": "https://site.atlassian.net/projects/KBAS",
    "email": "user@example.com", "hasApiToken": true
  }
}
```

---

### `PUT /api/teams/:teamId/credentials`

Update a team's credential.

**Auth:** `x-api-key`

**Request Body:** Same fields as create, all optional.

**Response (200):**
```json
{ "success": true, "data": { "id": 1, "teamId": 1, "provider": "jira", "hasApiToken": true } }
```

---

### `DELETE /api/teams/:teamId/credentials`

Delete a team's credential.

**Auth:** `x-api-key`

**Response (200):**
```json
{ "success": true, "message": "Credential deleted" }
```

---

## Team Analytics

### `GET /api/teams/:teamId/analytics`

Returns aggregated task data and per-member analytics for a team's Kanban board. Fetches from the team's configured provider (Jira or GitHub), normalizes tasks, persists to DB, and computes analytics.

**Auth:** `x-api-key`

**Caching:** Uses on-demand caching with a **5-minute TTL**. If stored tasks are fresh, returns cached data (`meta.cached: true`). Otherwise fetches fresh data from the provider.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "KBAS-42",
        "title": "Fix login validation",
        "owner": "Maya Patel",
        "ownerInitials": "MP",
        "priority": "high",
        "bucket": "in_progress",
        "rawStatus": "In Development",
        "createdAt": "2026-02-10T08:12:00.000Z",
        "startedAt": "2026-02-15T09:00:00.000Z",
        "completedAt": null,
        "updatedAt": "2026-02-20T14:30:00.000Z",
        "source": "jira",
        "fetchedAt": "2026-03-14T03:50:00.000Z"
      }
    ],
    "memberTaskCounts": {
      "Maya Patel": { "todo": 3, "inProgress": 2, "completed": 5, "backlog": 1 }
    },
    "statusLeaders": {
      "mostTodo": { "member": "Maya Patel", "count": 3 },
      "mostInProgress": { "member": "Alex Kim", "count": 4 },
      "mostBacklog": { "member": "Sam Lee", "count": 2 }
    },
    "completionStats": {
      "Maya Patel": { "avgDays": 4.2, "stdDevDays": 1.3, "completedCount": 5 }
    },
    "efficiency": {
      "Maya Patel": { "efficiencyPercent": 3.8, "totalTasks": 11, "completedTasks": 5 }
    },
    "meta": {
      "source": "jira",
      "fetchedAt": "2026-03-14T03:50:00.000Z",
      "projectDurationDays": 90,
      "cached": false
    }
  }
}
```

#### Task Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | External issue ID (e.g., "KBAS-42", "GH-123") |
| `title` | string | Issue title |
| `owner` | string | Assignee display name (or "Unassigned") |
| `ownerInitials` | string | Initials derived from owner name |
| `priority` | string\|null | "high", "medium", "low", or null. Derived from GitHub labels; null for Jira |
| `bucket` | string | `todo`, `in_progress`, `completed`, or `backlog` |
| `rawStatus` | string | Original status string from source |
| `createdAt` | string | ISO 8601 timestamp from source |
| `startedAt` | string\|null | When work started (GitHub timeline events; null for Jira) |
| `completedAt` | string\|null | When completed. Jira: `updatedAt` when bucket is completed. GitHub: `closedAt` |
| `updatedAt` | string | Last updated timestamp from source |
| `source` | string | "jira" or "github" |
| `fetchedAt` | string | When KABAS last synced this task |

#### `memberTaskCounts`

Per-member task counts by bucket. Keys use camelCase (`inProgress`).

#### `statusLeaders`

Members with the most tasks per status (todo, inProgress, backlog). Ties broken alphabetically. `null` if no tasks for that status.

#### `completionStats`

| Field | Type | Description |
|-------|------|-------------|
| `avgDays` | number | Average completion time in days (1 decimal) |
| `stdDevDays` | number | Population standard deviation in days (1 decimal) |
| `completedCount` | number | Completed tasks for this member |

#### `efficiency`

Formula: `((totalCompletionTime / totalTasks) / projectDuration) * 100`. Lower is better.

| Field | Type | Description |
|-------|------|-------------|
| `efficiencyPercent` | number\|null | Efficiency %. `0` if no completed tasks. `null` if project duration unavailable |
| `totalTasks` | number | Total tasks assigned to this member |
| `completedTasks` | number | Completed tasks for this member |

#### `meta`

| Field | Type | Description |
|-------|------|-------------|
| `source` | string | Provider: "jira" or "github" |
| `fetchedAt` | string | ISO 8601 timestamp of this response |
| `projectDurationDays` | number\|null | Days between class group start/end dates |
| `cached` | boolean | Whether cached data was returned |

#### Status Bucket Mapping

| Bucket | Matching Keywords (case-insensitive) |
|--------|--------------------------------------|
| `completed` | done, closed, merged, released, resolved, shipped |
| `in_progress` | in progress, in development, in review, in qa, building, debugging |
| `todo` | to do, todo, open, planned, queued, draft, selected for development |
| `backlog` | any unrecognized status (default) |

**Errors:** 404 team not found, 404 no credential configured.

---

## Class Groups

### `POST /api/class-groups`

Create a new class group.

**Auth:** `x-api-key`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Class group name |
| `startDate` | string (ISO date) | yes | Start date |
| `endDate` | string (ISO date) | yes | End date (must be after startDate) |

**Response (201):**
```json
{
  "success": true,
  "data": { "id": 1, "name": "ICT2505C AY24/25", "startDate": "2026-01-13", "endDate": "2026-04-14" }
}
```

---

### `GET /api/class-groups`

Get all class groups.

**Auth:** `x-api-key`

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `limit` | integer | Max results |
| `offset` | integer | Pagination offset |

**Response (200):**
```json
{ "success": true, "data": [{ "id": 1, "name": "ICT2505C AY24/25", "startDate": "2026-01-13", "endDate": "2026-04-14" }] }
```

---

### `GET /api/class-groups/:id`

Get a class group by ID, including its teams.

**Auth:** `x-api-key`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1, "name": "ICT2505C AY24/25", "startDate": "2026-01-13", "endDate": "2026-04-14",
    "Teams": [{ "id": 1, "name": "Team Alpha", "classGroupId": 1 }]
  }
}
```

---

### `PUT /api/class-groups/:id`

Update a class group. If updating dates, both `startDate` and `endDate` must be provided together.

**Auth:** `x-api-key`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | no | Class group name |
| `startDate` | string (ISO date) | both or neither | Start date |
| `endDate` | string (ISO date) | both or neither | End date (must be after startDate) |

**Response (200):**
```json
{ "success": true, "data": { "id": 1, "name": "Updated Name", "startDate": "2026-01-13", "endDate": "2026-04-14" } }
```

---

### `DELETE /api/class-groups/:id`

Delete a class group. Associated teams will have their `classGroupId` set to null.

**Auth:** `x-api-key`

**Response (200):**
```json
{ "success": true, "message": "Class group deleted" }
```

---

## Jira Configuration

Global Jira configuration (not per-team). Used for direct Jira issue queries.

### `GET /api/jira/config`

Get current Jira configuration (without sensitive data).

**Auth:** none

**Response (200):**
```json
{ "success": true, "data": { "baseUrl": "https://site.atlassian.net" } }
```

---

### `POST /api/jira/config`

Set Jira configuration.

**Auth:** `x-api-key`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `baseUrl` | string | yes | Jira site URL (must start with `https://`) |
| `email` | string | yes | Jira account email |
| `apiToken` | string | yes | Jira API token |

**Response (200):**
```json
{ "success": true, "message": "Jira configuration updated" }
```

---

### `POST /api/jira/config/validate`

Validate Jira configuration by testing the connection.

**Auth:** `x-api-key`

**Response (200):**
```json
{ "success": true, "message": "Jira configuration is valid" }
```

---

### `DELETE /api/jira/config`

Clear Jira configuration.

**Auth:** `x-api-key`

**Response (200):**
```json
{ "success": true, "message": "Jira configuration cleared" }
```

---

## Jira Issues

### `GET /api/jira/projects/:projectKey/issues`

Get all issues for a Jira project.

**Auth:** none (uses stored Jira config)

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `projectKey` | string | Jira project key (e.g., "KBAS") |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "KBAS-42",
      "title": "Fix login bug",
      "status": "In Progress",
      "assignee": "Maya Patel",
      "created": "2026-02-10T08:12:00.000Z",
      "updated": "2026-02-20T14:30:00.000Z",
      "url": "https://site.atlassian.net/browse/KBAS-42"
    }
  ]
}
```

---

### `GET /api/jira/issues/:issueKey`

Get detailed information for a single Jira issue.

**Auth:** none (uses stored Jira config)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "KBAS-42",
    "title": "Fix login bug",
    "description": "...",
    "status": "In Progress",
    "assignee": "Maya Patel",
    "created": "2026-02-10T08:12:00.000Z",
    "updated": "2026-02-20T14:30:00.000Z",
    "url": "https://site.atlassian.net/browse/KBAS-42"
  }
}
```

---

## GitHub

### `GET /api/github/repos/:owner/:repo/kanban`

Fetch Kanban board data for a GitHub repository. Retrieves issues, board column statuses (via GraphQL), and timeline events.

**Auth:** `x-github-token` header (not `x-api-key`)

**Path Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `owner` | string | Repository owner |
| `repo` | string | Repository name |

**Response (200):**
```json
{
  "repository": { "owner": "SIT-Team-4", "repo": "KABAS" },
  "fetchedAt": "2026-03-14T03:50:00.000Z",
  "issues": [
    {
      "number": 42,
      "title": "Fix login bug",
      "state": "open",
      "columnName": "In Progress",
      "labels": ["bug", "priority:high"],
      "assignees": ["mayapatel"],
      "createdAt": "2026-02-10T08:12:00Z",
      "updatedAt": "2026-02-20T14:30:00Z",
      "closedAt": null,
      "timelineEvents": [
        { "event": "moved_columns_in_project", "createdAt": "2026-02-15T09:00:00Z", "from": "To Do", "to": "In Progress" }
      ]
    }
  ]
}
```

**Errors:** 401 missing token, 404 repo not found, 429 rate limit exceeded.

---

## Common Error Responses

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "success": false, "error": "validation messages" }` | Request body validation failure |
| 401 | `{ "success": false, "error": "Unauthorized" }` | Missing or invalid API key |
| 404 | `{ "error": "Resource not found" }` | Requested resource does not exist |
| 409 | `{ "error": "Credential already exists for this team" }` | Duplicate credential |
| 429 | `{ "error": "GitHub API rate limit exceeded" }` | GitHub rate limit |
| 500 | `{ "error": "Internal server error" }` | Unhandled server error |
