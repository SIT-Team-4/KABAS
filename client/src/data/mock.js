export const team = { name: "Team Alpha", members: 4, totalTasks: 45 };

export const statusCards = [
  { key: "todo", label: "To-Do", count: 13, color: "#7F56D9", tint: "rgba(127,86,217,0.12)" },
  { key: "in_progress", label: "In Progress", count: 9, color: "#2E90FA", tint: "rgba(46,144,250,0.12)" },
  { key: "completed", label: "Completed", count: 13, color: "#12B76A", tint: "rgba(18,183,106,0.12)" },
  { key: "backlog", label: "Backlog", count: 10, color: "#F79009", tint: "rgba(247,144,9,0.14)" }
];

export const tasks = [
  { id: "K-101", title: "Implement search feature", owner: "Alice Chen", status: "todo", priority: "high", ageDays: 27 },
  { id: "K-102", title: "Design user profile page", owner: "Carol Wang", status: "todo", priority: "low", ageDays: 1 },
  { id: "K-103", title: "Create dashboard UI", owner: "Carol Wang", status: "todo", priority: "low", ageDays: 18 },
  { id: "K-104", title: "Add data validation", owner: "Bob Smith", status: "todo", priority: "high", ageDays: 26 },
  { id: "K-105", title: "Create API endpoints", owner: "Alice Chen", status: "todo", priority: "low", ageDays: 57 },

  { id: "K-201", title: "Optimize database queries", owner: "Bob Smith", status: "in_progress", priority: "high", ageDays: 52 },
  { id: "K-202", title: "Deploy to production", owner: "Bob Smith", status: "in_progress", priority: "high", ageDays: 50 },
  { id: "K-203", title: "Design user profile page", owner: "Alice Chen", status: "in_progress", priority: "low", ageDays: 48 },

  { id: "K-301", title: "Write unit tests", owner: "David Lee", status: "completed", priority: "low", ageDays: 12 },
  { id: "K-302", title: "Update documentation", owner: "Alice Chen", status: "completed", priority: "low", ageDays: 9 },

  { id: "K-401", title: "Refactor code structure", owner: "Carol Wang", status: "backlog", priority: "low", ageDays: 43 }
];
