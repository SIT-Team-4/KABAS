import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";

// IMPORTANT: adjust path if yours is different
import { statusCards } from "../data/mock";

// ---------- helpers ----------
const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const asDate = (d) => {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  // eslint-disable-next-line no-restricted-globals
  return isNaN(dt) ? null : dt;
};

const diffDays = (from, to = new Date()) => {
  const a = asDate(from);
  const b = asDate(to);
  if (!a || !b) return null;
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

const priorityMeta = (pRaw) => {
  const p = String(pRaw || "").toLowerCase();
  if (p.includes("high"))
    return { dot: "#F04438", bg: "rgba(240,68,56,0.12)", fg: "#B42318", label: "high" };
  if (p.includes("med"))
    return { dot: "#F79009", bg: "rgba(247,144,9,0.12)", fg: "#B54708", label: "medium" };
  if (p.includes("low"))
    return { dot: "#2E90FA", bg: "rgba(46,144,250,0.12)", fg: "#175CD3", label: "low" };
  return {
    dot: "rgba(16,24,40,0.25)",
    bg: "rgba(16,24,40,0.06)",
    fg: "rgba(16,24,40,0.6)",
    label: pRaw || "—",
  };
};

// Sorting weight for priority
const prioWeight = (pRaw) => {
  const p = String(pRaw || "").toLowerCase();
  if (p.includes("high")) return 3;
  if (p.includes("med")) return 2;
  if (p.includes("low")) return 1;
  return 0;
};

// Build a lookup for bucket -> {color, tint, label}
const bucketToColors = () => {
  const map = {};
  for (const c of statusCards || []) {
    map[c.key] = { fg: c.color, bg: c.tint, label: c.label };
  }
  return map;
};

export default function TasksModal({
  open,
  onClose,
  title,
  tasks = [],
  statusLabel,
  statusColor,
  statusTint,
  onSelectTask,
}) {
  const [sortBy, setSortBy] = useState("status"); // "status" | "priority" | "days"
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const bucketColors = useMemo(() => bucketToColors(), []);

  const sortedTasks = useMemo(() => {
    const copy = [...(tasks || [])];

    // When modal shows a single bucket (opened from status card), statusLabel is ok.
    // When modal shows mixed buckets ("All Tasks"), use task.rawStatus/status/bucket for sorting.
    const getStatus = (t) => statusLabel || t.rawStatus || t.status || t.bucket || "—";

    const getDaysOpen = (t) =>
      diffDays(t.statusChangedAt || t.lastMovedAt || t.updatedAt || t.createdAt) ?? 0;

    copy.sort((a, b) => {
      let va;
      let vb;

      if (sortBy === "status") {
        va = String(getStatus(a)).toLowerCase();
        vb = String(getStatus(b)).toLowerCase();
        if (va < vb) return -1;
        if (va > vb) return 1;
        return String(a.title || "").localeCompare(String(b.title || ""));
      }

      if (sortBy === "priority") {
        va = prioWeight(a.priority);
        vb = prioWeight(b.priority);
        if (va !== vb) return va - vb;
        return String(a.title || "").localeCompare(String(b.title || ""));
      }

      // days
      va = getDaysOpen(a);
      vb = getDaysOpen(b);
      if (va !== vb) return va - vb;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });

    if (sortDir === "desc") copy.reverse();
    return copy;
  }, [tasks, sortBy, sortDir, statusLabel]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: "#FBF7F2" }}>
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 18,
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <IconButton
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              sx={{ borderRadius: 2 }}
              title={`Sort ${sortDir === "asc" ? "ascending" : "descending"}`}
            >
              <SwapVertRoundedIcon />
            </IconButton>

            <FormControl size="small">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.7)",
                  borderRadius: 2,
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 800,
                  minWidth: 190,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(16,24,40,0.12)",
                  },
                }}
              >
                <MenuItem value="status">Sort by Status</MenuItem>
                <MenuItem value="priority">Sort by Priority</MenuItem>
                <MenuItem value="days">Sort by Days Open</MenuItem>
              </Select>
            </FormControl>

            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {/* Task List */}
        <Box
          sx={{
            p: 3,
            display: "grid",
            gap: 2,
            maxHeight: "70vh",
            overflowY: "auto",
            pr: 1.5,
          }}
        >
          {sortedTasks.map((task) => {
            const owner =
              task.owner || task.assignee || task.member || task.user || "Unassigned";

            const daysOpen = diffDays(
              task.statusChangedAt || task.lastMovedAt || task.updatedAt || task.createdAt
            );

            const pr = priorityMeta(task.priority);

            // Label shown on chip:
            // - If this modal is "single status" (opened from a status card), keep the header statusLabel.
            // - Else show the task rawStatus (In QA, Published, In Development, etc.)
            const sLabel =
              statusLabel || task.rawStatus || task.status || task.bucket || "—";

            // Chip colors:
            // - If this modal is single-bucket, you already pass the correct tint/color.
            // - If mixed (All Tasks), color based on task.bucket using statusCards palette.
            const palette =
              statusLabel
                ? { fg: statusColor || "#2E90FA", bg: statusTint || "rgba(46,144,250,0.12)" }
                : bucketColors[task.bucket] || { fg: "rgba(16,24,40,0.65)", bg: "rgba(16,24,40,0.06)" };

            return (
              <Box
                key={task.id || `${owner}-${task.title}`}
                onClick={() => onSelectTask?.(task)}
                sx={{
                  cursor: "pointer",
                  borderRadius: 3,
                  border: "1px solid rgba(16,24,40,0.08)",
                  p: 2.25,
                  bgcolor: "rgba(255,255,255,0.55)",
                  transition: "0.18s ease",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.85)" },
                }}
              >
                {/* Top row: title + chips */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: 18,
                      lineHeight: 1.2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "65%",
                    }}
                    title={task.title}
                  >
                    {task.title || "Untitled"}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {/* Status chip (NOW COLORED properly) */}
                    <Chip
                      size="small"
                      label={sLabel}
                      sx={{
                        bgcolor: palette.bg,
                        color: palette.fg,
                        fontWeight: 900,
                        borderRadius: 2,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    />

                    {/* Priority chip */}
                    <Chip
                      size="small"
                      label={pr.label}
                      sx={{
                        bgcolor: pr.bg,
                        color: pr.fg,
                        fontWeight: 900,
                        borderRadius: 2,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                      icon={
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            bgcolor: pr.dot,
                            ml: 1,
                          }}
                        />
                      }
                    />
                  </Box>
                </Box>

                {/* Bottom row: owner left, days right */}
                <Box
                  sx={{
                    mt: 1.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        bgcolor: "rgba(247,144,9,0.14)",
                        color: "#F79009",
                        fontWeight: 900,
                        display: "grid",
                        placeItems: "center",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 12,
                      }}
                    >
                      {initials(owner)}
                    </Box>

                    <Typography
                      sx={{
                        color: "rgba(16,24,40,0.65)",
                        fontWeight: 800,
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {owner}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 18, color: "rgba(16,24,40,0.55)" }} />
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "rgba(16,24,40,0.65)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {typeof daysOpen === "number" ? `${daysOpen}d` : "—"}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}

          {!sortedTasks.length && (
            <Typography sx={{ color: "text.secondary", fontFamily: "JetBrains Mono, monospace" }}>
              No tasks to display.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
