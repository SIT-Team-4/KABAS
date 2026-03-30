export const STATUS_BUCKETS = {
  todo: "todo",
  in_progress: "in_progress",
  completed: "completed",
  backlog: "backlog",
};

export const statusCards = [
  { key: STATUS_BUCKETS.todo, label: "To-Do", color: "#7C3AED", tint: "#F3E8FF" },
  { key: STATUS_BUCKETS.in_progress, label: "In Progress", color: "#2563EB", tint: "#E0EAFF" },
  { key: STATUS_BUCKETS.completed, label: "Completed", color: "#16A34A", tint: "#DCFCE7" },
  { key: STATUS_BUCKETS.backlog, label: "Backlog", color: "#F97316", tint: "#FFEDD5" },
];

export function getCountsByBucket(tasks = []) {
  return tasks.reduce(
    (acc, task) => {
      if (!task || typeof task !== "object" || task.bucket == null) {
        return acc;
      }

      if (Object.prototype.hasOwnProperty.call(acc, task.bucket)) {
        acc[task.bucket] += 1;
      }
      return acc;
    },
    {
      [STATUS_BUCKETS.todo]: 0,
      [STATUS_BUCKETS.in_progress]: 0,
      [STATUS_BUCKETS.completed]: 0,
      [STATUS_BUCKETS.backlog]: 0,
    }
  );
}
