export const team = {
  id: "team-alpha",
  name: "Team Alpha",
  members: 4,
  totalTasks: 45,
};

export const members = [
  { id: "u1", name: "Alice Chen", initials: "AC" },
  { id: "u2", name: "Bob Smith", initials: "BS" },
  { id: "u3", name: "Carol Wang", initials: "CW" },
  { id: "u4", name: "David Lee", initials: "DL" },
];

// We standardize buckets for the dashboard cards.
// Backend can later normalize Jira/GitHub statuses into these buckets.
export const STATUS_BUCKETS = {
  todo: "todo",
  in_progress: "in_progress",
  completed: "completed",
  backlog: "backlog",
};

// Card definitions (colors match your UI styling)
export const statusCards = [
  {
    key: STATUS_BUCKETS.todo,
    label: "To-Do",
    color: "#7C3AED",   // text/icon color
    tint: "#F3E8FF",    // background tint
  },
  {
    key: STATUS_BUCKETS.in_progress,
    label: "In Progress",
    color: "#2563EB",
    tint: "#E0EAFF",
  },
  {
    key: STATUS_BUCKETS.completed,
    label: "Completed",
    color: "#16A34A",
    tint: "#DCFCE7",
  },
  {
    key: STATUS_BUCKETS.backlog,
    label: "Backlog",
    color: "#F97316",
    tint: "#FFEDD5",
  },
];

// ✅ Tasks array supports both modals.
// Important fields:
// - bucket: used for counts/filtering (stable)
// - rawStatus: what team actually calls it (optional display)
// - createdAt / startedAt: for details modal
// - durationInStatusDays: lets you show "7 days" etc.
export const tasks = [
  {
    id: "TASK-12",
    title: "Add data validation",
    ownerId: "u3",
    owner: "Carol Wang",
    ownerInitials: "CW",
    priority: "medium", // low | medium | high
    bucket: STATUS_BUCKETS.in_progress,
    rawStatus: "In Review",
    durationInStatusDays: 7,
    createdAt: "2026-02-10T03:05:00Z",
    startedAt: "2026-02-13T09:16:00Z",
  },
  {
    id: "TASK-15",
    title: "Implement search feature",
    ownerId: "u1",
    owner: "Alice Chen",
    ownerInitials: "AC",
    priority: "high",
    bucket: STATUS_BUCKETS.todo,
    rawStatus: "To Do",
    durationInStatusDays: 27,
    createdAt: "2026-01-15T02:20:00Z",
    startedAt: null,
  },
  {
    id: "TASK-22",
    title: "Create API endpoints",
    ownerId: "u1",
    owner: "Alice Chen",
    ownerInitials: "AC",
    priority: "low",
    bucket: STATUS_BUCKETS.todo,
    rawStatus: "Backlog Grooming",
    durationInStatusDays: 57,
    createdAt: "2025-12-10T04:00:00Z",
    startedAt: null,
  },
  {
    id: "TASK-33",
    title: "Design user profile page",
    ownerId: "u4",
    owner: "David Lee",
    ownerInitials: "DL",
    priority: "low",
    bucket: STATUS_BUCKETS.todo,
    rawStatus: "Ready",
    durationInStatusDays: 18,
    createdAt: "2026-01-22T08:00:00Z",
    startedAt: null,
  },
  {
    id: "TASK-44",
    title: "Write unit tests",
    ownerId: "u2",
    owner: "Bob Smith",
    ownerInitials: "BS",
    priority: "high",
    bucket: STATUS_BUCKETS.completed,
    rawStatus: "Done",
    durationInStatusDays: 15,
    createdAt: "2026-01-08T06:00:00Z",
    startedAt: "2026-01-12T10:00:00Z",
  },
  {
    id: "TASK-48",
    title: "Optimize database queries",
    ownerId: "u2",
    owner: "Bob Smith",
    ownerInitials: "BS",
    priority: "medium",
    bucket: STATUS_BUCKETS.backlog,
    rawStatus: "Icebox",
    durationInStatusDays: 43,
    createdAt: "2025-12-01T02:00:00Z",
    startedAt: null,
  },
];

// --- Helpers you can use in TeamDashboard.jsx ---

export function formatDays(days) {
  if (days === null || days === undefined) return "-";
  return `${days} days`;
}

// Count tasks by bucket
export function getCountsByBucket(tasksArr) {
  return tasksArr.reduce(
    (acc, t) => {
      acc[t.bucket] = (acc[t.bucket] || 0) + 1;
      return acc;
    },
    { todo: 0, in_progress: 0, completed: 0, backlog: 0 }
  );
}

// Count tasks per member
export function getMemberTaskCounts(tasksArr) {
  const map = {};
  for (const t of tasksArr) {
    const key = t.ownerId || t.owner;
    map[key] = (map[key] || 0) + 1;
  }
  return map;
}