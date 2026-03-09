import React, { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
} from "@mui/material";

import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";

import StatusCard from "../components/StatusCard";
import TasksModal from "../components/TasksModal";
import TaskDetailsModal from "../components/TaskDetailsModal";
import {
  statusCards,
  getCountsByBucket,
  getTeamById,
  getMembersByTeamId,
  getTasksByTeamId,
  DEFAULT_TEAM_ID,
} from "../data/mock";

// ----------------------------
// Helpers (UI-safe + defensive)
// ----------------------------
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

const initials = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const fmtDays = (n) => (typeof n === "number" ? `${n}d` : "—");

const pct = (part, total) => {
  if (!total) return 0;
  return Math.round((part / total) * 100);
};

const stdDev = (arr) => {
  if (!arr?.length) return null;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
};

// Simple donut chart (with hover tooltips)
function DonutChart({ segments, totalCount = 0, size = 140, thickness = 18 }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const [hovered, setHovered] = React.useState(null);
  const [tooltip, setTooltip] = React.useState({ x: 0, y: 0, visible: false });

  const toPercent = (count) => {
    if (!totalCount) return 0;
    return Math.round((count / totalCount) * 100);
  };

  return (
    <Box sx={{ width: size, height: size, position: "relative" }}>
      {tooltip.visible && hovered && (
        <Box
          sx={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(12px, -110%)",
            bgcolor: "#101828",
            color: "white",
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
            pointerEvents: "none",
            minWidth: 140,
            zIndex: 10,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 900, lineHeight: 1.1 }}>
            {hovered.label}
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.9, mt: 0.5 }}>
            {hovered.count} tasks ({hovered.percent}%)
          </Typography>
        </Box>
      )}

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(16,24,40,0.08)"
          strokeWidth={thickness}
          fill="none"
        />

        {segments
          .filter((s) => s.value > 0)
          .map((s) => {
            const len = (s.value / 100) * c;
            const dash = `${len} ${c - len}`;

            const myOffset = offset;
            offset += len;

            return (
              <circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={s.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={dash}
                strokeDashoffset={-myOffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => {
                  const count =
                    s.count ?? Math.round((s.value / 100) * totalCount);
                  setHovered({
                    label: s.label,
                    count,
                    percent: toPercent(count),
                  });
                  setTooltip((t) => ({ ...t, visible: true }));
                }}
                onMouseMove={(e) => {
                  const rect =
                    e.currentTarget.ownerSVGElement.getBoundingClientRect();
                  setTooltip({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    visible: true,
                  });
                }}
                onMouseLeave={() => {
                  setTooltip((t) => ({ ...t, visible: false }));
                  setHovered(null);
                }}
              />
            );
          })}
      </svg>
    </Box>
  );
}

export default function TeamDashboard() {
  const { teamId } = useParams();

  const activeTeamId = teamId || DEFAULT_TEAM_ID;
  const team = getTeamById(activeTeamId);
  const memberObjects = getMembersByTeamId(activeTeamId);
  const tasks = getTasksByTeamId(activeTeamId);

  const [popupStatus, setPopupStatus] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [memberPopup, setMemberPopup] = useState(null);
  const [memberAllPopup, setMemberAllPopup] = useState(null);

  function taskOwner(t) {
    return t.owner || t.assignee || t.member || t.user || "Unassigned";
  }

  const totalTasks = tasks.length;
  const counts = getCountsByBucket(tasks);

  const byStatus = {};
  for (const s of statusCards) {
    byStatus[s.key] = tasks.filter((t) => t.bucket === s.key);
  }

  const rawMetaByBucket = {};
  for (const s of statusCards) {
    const list = byStatus[s.key] || [];
    const firstRaw = list.find((t) => t.rawStatus)?.rawStatus;
    rawMetaByBucket[s.key] = {
      rawLabel: firstRaw || s.label,
    };
  }

  const meta = statusCards.find((s) => s.key === popupStatus);
  const list = popupStatus ? byStatus[popupStatus] : [];
  const displayStatusLabel =
    (popupStatus && rawMetaByBucket[popupStatus]?.rawLabel) || meta?.label || "";

  const cardByKey = {};
  for (const s of statusCards) cardByKey[s.key] = s;

  const keyCompleted = statusCards.find((s) => /completed/i.test(s.label))?.key;
  const keyInProgress = statusCards.find((s) => /progress/i.test(s.label))?.key;
  const keyTodo = statusCards.find((s) => /to-?do/i.test(s.label))?.key;
  const keyBacklog = statusCards.find((s) => /backlog/i.test(s.label))?.key;

  const members = useMemo(() => {
    if (Array.isArray(memberObjects) && memberObjects.length) {
      return memberObjects.map((m) => m.name);
    }

    const owners = tasks.map((t) => taskOwner(t)).filter(Boolean);
    return Array.from(new Set(owners));
  }, [memberObjects, tasks]);

  const memberPopupTasks = useMemo(() => {
    if (!memberPopup) return [];
    const { memberName, bucketKey } = memberPopup;

    return tasks.filter(
      (t) => taskOwner(t) === memberName && t.bucket === bucketKey
    );
  }, [memberPopup, tasks]);

  const memberPopupTitle = useMemo(() => {
    if (!memberPopup) return "";
    const { memberName, bucketKey } = memberPopup;

    const statusLabel =
      rawMetaByBucket[bucketKey]?.rawLabel ||
      cardByKey[bucketKey]?.label ||
      "Tasks";

    return `${memberName} - ${statusLabel} Tasks (${memberPopupTasks.length})`;
  }, [memberPopup, memberPopupTasks]);

  const statusAgeDays = (t) =>
    diffDays(t.statusChangedAt || t.lastMovedAt || t.updatedAt || t.createdAt);

  const taskCreatedAt = (t) =>
    asDate(t.createdAt || t.openedAt || t.created || t.timestamp);

  const taskCompletedAt = (t) =>
    asDate(t.completedAt || t.doneAt || t.closedAt || t.resolvedAt || t.completed);

  const projectDurationDays = useMemo(() => {
    const dates = tasks
      .map((t) => taskCreatedAt(t))
      .filter(Boolean)
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length < 2) return 1;
    return Math.max(1, diffDays(dates[0], dates[dates.length - 1]) || 1);
  }, [tasks]);

  const distributionSegments = useMemo(() => {
    return statusCards.map((s) => {
      const count = counts[s.key] ?? 0;
      const v = pct(count, totalTasks);
      return {
        key: s.key,
        label: rawMetaByBucket[s.key]?.rawLabel || s.label,
        value: v,
        count,
        color: s.color,
      };
    });
  }, [counts, totalTasks]);

  const longestOpen = useMemo(() => {
    const open = tasks.filter((t) =>
      keyCompleted ? t.bucket !== keyCompleted : true
    );

    return open
      .map((t) => ({
        task: t,
        age: statusAgeDays(t),
      }))
      .sort((a, b) => (b.age ?? -1) - (a.age ?? -1))
      .slice(0, 5);
  }, [tasks, keyCompleted]);

  const memberHighlights = useMemo(() => {
    const byMember = {};

    for (const m of members) {
      byMember[m] = { total: 0, byBucket: {} };
      for (const s of statusCards) byMember[m].byBucket[s.key] = 0;
    }

    for (const t of tasks) {
      const m = taskOwner(t);
      if (!byMember[m]) {
        byMember[m] = { total: 0, byBucket: {} };
        for (const s of statusCards) byMember[m].byBucket[s.key] = 0;
      }
      byMember[m].total += 1;
      if (t.bucket && byMember[m].byBucket[t.bucket] != null) {
        byMember[m].byBucket[t.bucket] += 1;
      }
    }

    const pickMax = (bucketKey) => {
      if (!bucketKey) return { name: "—", count: 0 };
      let best = { name: "—", count: 0 };
      for (const [name, v] of Object.entries(byMember)) {
        const c = v.byBucket?.[bucketKey] ?? 0;
        if (c > best.count) best = { name, count: c };
      }
      return best;
    };

    return {
      mostInProgress: pickMax(keyInProgress),
      mostTodo: pickMax(keyTodo),
      mostBacklog: pickMax(keyBacklog),
    };
  }, [members, tasks, keyInProgress, keyTodo, keyBacklog]);

  const performanceRows = useMemo(() => {
    const rows = [];
    const completedKey = keyCompleted || "completed";

    for (const m of members) {
      const mine = tasks.filter((t) => taskOwner(t) === m);
      const assigned = mine.length;

      const completedTasks = mine.filter((t) => t.bucket === completedKey);
      const inProgTasks = keyInProgress
        ? mine.filter((t) => t.bucket === keyInProgress)
        : [];

      const completionDays = completedTasks
        .map((t) => {
          const created = asDate(t.createdAt || t.openedAt || t.created || t.timestamp);
          const done = asDate(t.completedAt || t.doneAt || t.closedAt || t.resolvedAt || t.completed);

          if (!created || !done) return null;

          const ms = done.getTime() - created.getTime();
          if (ms < 0) return null;

          return ms / (1000 * 60 * 60 * 24);
        })
        .filter((n) => typeof n === "number" && Number.isFinite(n));

      const avg =
        completionDays.length > 0
          ? completionDays.reduce((a, b) => a + b, 0) / completionDays.length
          : null;

      const sd = completionDays.length >= 2 ? stdDev(completionDays) : null;
      const totalTimeTakenDays = completionDays.reduce((a, b) => a + b, 0);
      const totalTasksUsed = completedTasks.length;

      const avgTimePerTaskDays =
        totalTasksUsed > 0 ? totalTimeTakenDays / totalTasksUsed : null;

      const eff =
        typeof avgTimePerTaskDays === "number"
          ? (avgTimePerTaskDays / projectDurationDays) * 100
          : null;

      rows.push({
        member: m,
        assigned,
        completedCount: completedTasks.length,
        inProgress: inProgTasks.length,
        avgCompletionDays: avg,
        stdDevCompletionDays: sd,
        eff,
      });
    }

    return rows;
  }, [members, tasks, keyCompleted, keyInProgress, projectDurationDays]);

  const latestActivity = useMemo(() => {
    const byMember = [];

    for (const m of members) {
      const mine = tasks.filter((t) => taskOwner(t) === m);

      const opened = mine
        .map((t) => ({ t, d: taskCreatedAt(t) }))
        .filter((x) => x.d)
        .sort((a, b) => b.d.getTime() - a.d.getTime());

      const latestOpened = opened[0]?.t;
      if (latestOpened) {
        byMember.push({ member: m, task: latestOpened, kind: "opened" });
        continue;
      }

      const done = mine
        .map((t) => ({ t, d: taskCompletedAt(t) }))
        .filter((x) => x.d)
        .sort((a, b) => b.d.getTime() - a.d.getTime());

      byMember.push({ member: m, task: done[0]?.t || null, kind: "completed" });
    }

    return byMember;
  }, [members, tasks]);

  const memberAllTasks = useMemo(() => {
    if (!memberAllPopup) return [];
    return tasks.filter((t) => taskOwner(t) === memberAllPopup);
  }, [memberAllPopup, tasks]);

  const memberAllTitle = useMemo(() => {
    if (!memberAllPopup) return "";
    return `${memberAllPopup} - All Tasks (${memberAllTasks.length})`;
  }, [memberAllPopup, memberAllTasks]);

  if (!team) {
    return <Navigate to={`/teams/${DEFAULT_TEAM_ID}`} replace />;
  }

  return (
    <Box sx={{ maxWidth: 2000, mx: "auto", pt: 1, pb: 6 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 28,
              fontWeight: 800,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {team.name}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
            {team.members} members • {totalTasks} tasks tracked
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<SyncRoundedIcon />}
          sx={{
            bgcolor: "#F79009",
            "&:hover": { bgcolor: "#DC6803" },
            px: 2.5,
            py: 1.2,
            borderRadius: 2,
            boxShadow: "0 10px 18px rgba(0,0,0,0.12)",
          }}
        >
          Live Sync
        </Button>
      </Box>

      {/* Status Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statusCards.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.key}>
            <StatusCard
              label={s.label}
              count={counts[s.key] ?? 0}
              total={totalTasks}
              color={s.color}
              tint={s.tint}
              iconKey={s.key}
              onClick={() => setPopupStatus(s.key)}
              variant="wide"
            />
          </Grid>
        ))}
      </Grid>

      {/* Panels */}
      <Grid container spacing={2.5}>
        {/* Task Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                Task Distribution
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
                <DonutChart
                  segments={distributionSegments}
                  totalCount={totalTasks}
                  size={150}
                  thickness={30}
                />
              </Box>

              <Box sx={{ mt: 1 }}>
                {statusCards.map((s) => (
                  <Box
                    key={s.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1,
                      pt: 0.5,
                      pb: 0,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: s.color }} />
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "text.secondary",
                          fontWeight: 700,
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {rawMetaByBucket[s.key]?.rawLabel || s.label}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 900, fontSize: 16, fontFamily: "JetBrains Mono, monospace" }}>
                      {counts[s.key] ?? 0}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Longest Open Issues */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                    Longest Open Issues
                  </Typography>
                  <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
                    {longestOpen.length} tasks need attention
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1.25 }}>
                {longestOpen.map(({ task: t, age }, idx) => (
                  <Box
                    key={t.id || t.key || `${idx}-${t.title}`}
                    onClick={() => setSelectedTask(t)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setSelectedTask(t);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1.25,
                      px: 1.25,
                      borderRadius: 2,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "rgba(16,24,40,0.04)" },
                      "&:active": { bgcolor: "rgba(16,24,40,0.06)" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 999,
                          bgcolor: "rgba(16,24,40,0.06)",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 900,
                          fontSize: 12,
                          color: "rgba(16,24,40,0.6)",
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 260,
                        }}
                        title={t.title}
                      >
                        {t.title || "Untitled"}
                      </Typography>
                    </Box>

                    <Typography sx={{ fontWeight: 900, color: "#F79009" }}>
                      {fmtDays(age)}
                    </Typography>
                  </Box>
                ))}

                {!longestOpen.length && (
                  <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
                    No open tasks found.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Member Highlights */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                Member Highlights
              </Typography>
              <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
                Top contributors by category
              </Typography>

              <Box sx={{ mt: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    border: "1px solid rgba(16,24,40,0.08)",
                    borderRadius: 2.25,
                    px: 2,
                    py: 1.5,
                    mb: 1.6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(16,24,40,0.02)" },
                  }}
                  onClick={() => {
                    if (memberHighlights.mostInProgress.count === 0) return;
                    setMemberPopup({
                      memberName: memberHighlights.mostInProgress.name,
                      bucketKey: keyInProgress,
                    });
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 2,
                        bgcolor: cardByKey[keyInProgress]?.tint || "rgba(46,144,250,0.12)",
                        display: "grid",
                        placeItems: "center",
                        color: cardByKey[keyInProgress]?.color || "#2E90FA",
                        fontWeight: 900,
                      }}
                    >
                      ↗
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700 }}>
                        Most In Progress
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{memberHighlights.mostInProgress.name}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 900, color: cardByKey[keyInProgress]?.color || "#2E90FA" }}>
                    {memberHighlights.mostInProgress.count}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    border: "1px solid rgba(16,24,40,0.08)",
                    borderRadius: 2.25,
                    px: 2,
                    py: 1.5,
                    mb: 1.6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(16,24,40,0.02)" },
                  }}
                  onClick={() => {
                    if (memberHighlights.mostTodo.count === 0) return;
                    setMemberPopup({
                      memberName: memberHighlights.mostTodo.name,
                      bucketKey: keyTodo,
                    });
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 2,
                        bgcolor: cardByKey[keyTodo]?.tint || "rgba(155,81,224,0.12)",
                        display: "grid",
                        placeItems: "center",
                        color: cardByKey[keyTodo]?.color || "#9B51E0",
                        fontWeight: 900,
                      }}
                    >
                      ≡
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700 }}>
                        Most To-Do
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{memberHighlights.mostTodo.name}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 900, color: cardByKey[keyTodo]?.color || "#9B51E0" }}>
                    {memberHighlights.mostTodo.count}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    border: "1px solid rgba(16,24,40,0.08)",
                    borderRadius: 2.25,
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(16,24,40,0.02)" },
                  }}
                  onClick={() => {
                    if (memberHighlights.mostBacklog.count === 0) return;
                    setMemberPopup({
                      memberName: memberHighlights.mostBacklog.name,
                      bucketKey: keyBacklog,
                    });
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 2,
                        bgcolor: cardByKey[keyBacklog]?.tint || "rgba(247,144,9,0.12)",
                        display: "grid",
                        placeItems: "center",
                        color: cardByKey[keyBacklog]?.color || "#F79009",
                        fontWeight: 900,
                      }}
                    >
                      ▣
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700 }}>
                        Most Backlog
                      </Typography>
                      <Typography sx={{ fontWeight: 800 }}>{memberHighlights.mostBacklog.name}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 900, color: cardByKey[keyBacklog]?.color || "#F79009" }}>
                    {memberHighlights.mostBacklog.count}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team Performance */}
      <Card sx={{ borderRadius: 3, mt: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace", mb: 2 }}>
            Team Performance
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Member</TableCell>
                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: 700 }}>Tasks Assigned</TableCell>
                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: 700 }}>Completed</TableCell>
                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: 700 }}>In Progress</TableCell>
                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: 700 }}>Avg. Completion (days)</TableCell>
                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: 700 }}>Std. Deviation</TableCell>
                <TableCell align="center" sx={{ color: "text.secondary", fontWeight: 700 }}>Efficiency</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {performanceRows.map((r) => (
                <TableRow
                  key={r.member}
                  hover
                  onClick={() => setMemberAllPopup(r.member)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "rgba(247,144,9,0.14)",
                          color: "#F79009",
                          fontWeight: 800,
                          fontSize: 13,
                        }}
                      >
                        {initials(r.member)}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700 }}>{r.member}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 800 }}>{r.assigned}</TableCell>

                  <TableCell align="center">
                    <Chip
                      label={r.completedCount}
                      size="small"
                      sx={{
                        bgcolor: "rgba(18,183,106,0.12)",
                        color: "#12B76A",
                        fontWeight: 900,
                        borderRadius: 1.5,
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={r.inProgress}
                      size="small"
                      sx={{
                        bgcolor: "rgba(46,144,250,0.12)",
                        color: "#2E90FA",
                        fontWeight: 900,
                        borderRadius: 1.5,
                      }}
                    />
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 800 }}>
                    {typeof r.avgCompletionDays === "number" ? r.avgCompletionDays.toFixed(1) : "—"}
                  </TableCell>

                  <TableCell align="center" sx={{ fontWeight: 800 }}>
                    {typeof r.stdDevCompletionDays === "number" ? r.stdDevCompletionDays.toFixed(1) : "—"}
                  </TableCell>

                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75, width: "100%" }}>
                      <TrendingDownRoundedIcon sx={{ fontSize: 18, color: "#F04438" }} />
                      <Typography sx={{ fontWeight: 900, color: "#F04438" }}>
                        {typeof r.eff === "number" ? `${r.eff.toFixed(1)}%` : "—"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Latest Activity */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
            Latest Activity
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
            Most recent task for each member
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {latestActivity.map(({ member, task }, idx) => {
              const bucketKey = task?.bucket;
              const bucketCard = bucketKey ? cardByKey[bucketKey] : null;
              const bucketLabel = task?.rawStatus || bucketCard?.label || "Unknown";

              return (
                <Grid item xs={12} sm={6} md={3} key={`${member}-${idx}`}>
                  <Box
                    role="button"
                    tabIndex={task ? 0 : -1}
                    onClick={() => {
                      if (!task) return;
                      setSelectedTask(task);
                    }}
                    onKeyDown={(e) => {
                      if (!task) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedTask(task);
                      }
                    }}
                    sx={{
                      border: "1px solid rgba(16,24,40,0.08)",
                      borderRadius: 2.75,
                      p: 2,
                      height: "100%",
                      cursor: task ? "pointer" : "default",
                      transition: "0.18s ease",
                      "&:hover": task ? { bgcolor: "rgba(16,24,40,0.02)" } : undefined,
                      "&:active": task ? { bgcolor: "rgba(16,24,40,0.04)" } : undefined,
                      outline: "none",
                      "&:focus-visible": {
                        boxShadow: "0 0 0 3px rgba(46,144,250,0.22)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.25 }}>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: "rgba(247,144,9,0.14)",
                          color: "#F79009",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {initials(member)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>{member}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 12, fontWeight: 700 }}>
                          {tasks.filter((t) => taskOwner(t) === member).length} total tasks
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          bgcolor: bucketCard?.color || "rgba(16,24,40,0.3)",
                        }}
                      />
                      <Typography sx={{ fontSize: 12, fontWeight: 800, color: bucketCard?.color || "text.secondary" }}>
                        {bucketLabel}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontWeight: 900,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={task?.title || "No task"}
                    >
                      {task?.title || "No recent tasks"}
                    </Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Modal 1: status task list */}
      <TasksModal
        open={!!popupStatus}
        onClose={() => setPopupStatus(null)}
        title={`${displayStatusLabel} Tasks (${list.length})`}
        tasks={list}
        statusLabel={displayStatusLabel}
        statusColor={meta?.color}
        statusTint={meta?.tint}
        onSelectTask={(task) => setSelectedTask(task)}
      />

      {/* Modal 2: member highlight task list */}
      <TasksModal
        open={!!memberPopup}
        onClose={() => setMemberPopup(null)}
        title={memberPopupTitle}
        tasks={memberPopupTasks}
        statusLabel={
          memberPopup
            ? rawMetaByBucket[memberPopup.bucketKey]?.rawLabel ||
              cardByKey[memberPopup.bucketKey]?.label
            : ""
        }
        statusColor={memberPopup ? cardByKey[memberPopup.bucketKey]?.color : undefined}
        statusTint={memberPopup ? cardByKey[memberPopup.bucketKey]?.tint : undefined}
        onSelectTask={(task) => setSelectedTask(task)}
      />

      {/* Modal 3: member all task list */}
      <TasksModal
        open={!!memberAllPopup}
        onClose={() => setMemberAllPopup(null)}
        title={memberAllTitle}
        tasks={memberAllTasks}
        onSelectTask={(task) => setSelectedTask(task)}
      />

      {/* Modal 4: task details */}
      <TaskDetailsModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </Box>
  );
}