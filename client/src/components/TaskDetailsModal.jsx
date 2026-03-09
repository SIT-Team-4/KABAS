import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";

// ✅ adjust path if your folder differs
import { statusCards } from "../data/mock";

// ---------- helpers ----------
function calculateDurationInDays(createdAt) {
  if (!createdAt) return "-";
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "-";
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const priorityMeta = (pRaw) => {
  const p = String(pRaw || "").toLowerCase();

  if (p.includes("high")) {
    return {
      label: "high Priority",
      fg: "#B42318",
      bg: "rgba(240,68,56,0.12)",
      dot: "#F04438",
    };
  }
  if (p.includes("med")) {
    return {
      label: "medium Priority",
      fg: "#B54708",
      bg: "rgba(247,144,9,0.12)",
      dot: "#F79009",
    };
  }
  if (p.includes("low")) {
    return {
      label: "low Priority",
      fg: "#175CD3",
      bg: "rgba(46,144,250,0.12)",
      dot: "#2E90FA",
    };
  }

  return {
    label: pRaw ? `${pRaw} Priority` : "Priority —",
    fg: "rgba(16,24,40,0.6)",
    bg: "rgba(16,24,40,0.06)",
    dot: "rgba(16,24,40,0.25)",
  };
};

const bucketToColors = () => {
  const map = {};
  for (const c of statusCards || []) {
    map[c.key] = { fg: c.color, bg: c.tint };
  }
  return map;
};

export default function TaskDetailsModal({ open, onClose, task }) {
  const bucketColors = useMemo(() => bucketToColors(), []);

  if (!task) return null;

  const pr = priorityMeta(task.priority);

  // show rawStatus if you have it (In QA, Published, etc.) — matches your screenshot
  const statusText = String(task.rawStatus || task.status || task.bucket || "—").toUpperCase();

  // color status by bucket (todo/in_progress/completed/backlog)
  const statusPalette =
    (task.bucket && bucketColors[task.bucket]) || {
      fg: "rgba(16,24,40,0.65)",
      bg: "rgba(16,24,40,0.06)",
    };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          overflow: "hidden",
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 14, opacity: 0.7 }}>
            Task Details
          </Typography>

          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* Title */}
        <Box sx={{ px: 3 }}>
          <Typography
            sx={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            {task.title}
          </Typography>

          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {/* ✅ Priority chip (NOW changes color by priority) */}
            <Chip
              size="small"
              label={pr.label}
              sx={{
                bgcolor: pr.bg,
                color: pr.fg,
                fontWeight: 800,
                borderRadius: 2,
                fontFamily: "JetBrains Mono, monospace",
              }}
              icon={
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "999px",
                    bgcolor: pr.dot,
                    ml: 1,
                  }}
                />
              }
            />

            {/* ✅ Status chip (colored by bucket) */}
            <Chip
              size="small"
              label={statusText}
              sx={{
                bgcolor: statusPalette.bg,
                color: statusPalette.fg,
                fontWeight: 800,
                borderRadius: 2,
                fontFamily: "JetBrains Mono, monospace",
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Details */}
        <Box sx={{ px: 3, pb: 3, display: "grid", gap: 2 }}>
          <InfoRow
            icon={<PersonOutlineRoundedIcon fontSize="small" />}
            label="Task Owner"
            value={task.owner || "-"}
            avatar={task.ownerInitials || task.initials}
          />

          <InfoRow
            icon={<AccessTimeRoundedIcon fontSize="small" />}
            label="Duration in Current Status"
            value={calculateDurationInDays(task.createdAt)}
          />

          <InfoRow
            icon={<CalendarMonthRoundedIcon fontSize="small" />}
            label="Created At"
            value={formatDateTime(task.createdAt)}
          />

          {task.startedAt ? (
            <InfoRow
              icon={<CalendarMonthRoundedIcon fontSize="small" />}
              label="Started At"
              value={formatDateTime(task.startedAt)}
            />
          ) : null}

          {task.completedAt ? (
            <InfoRow
              icon={<CalendarMonthRoundedIcon fontSize="small" />}
              label="Completed At"
              value={formatDateTime(task.completedAt)}
            />
          ) : null}

          <InfoRow
            icon={<TagRoundedIcon fontSize="small" />}
            label="Task ID"
            value={task.id || "-"}
          />
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, pb: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              bgcolor: "#F79009",
              "&:hover": { bgcolor: "#DC6803" },
              borderRadius: 2,
              fontWeight: 800,
              fontFamily: "JetBrains Mono, monospace",
              px: 3,
            }}
          >
            Close
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value, avatar }) {
  return (
    <Box
      sx={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 2,
        px: 2,
        py: 1.6,
        bgcolor: "rgba(255,255,255,0.7)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      {/* Icon block */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: "rgba(0,0,0,0.04)",
          display: "grid",
          placeItems: "center",
          opacity: 0.75,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12, opacity: 0.6 }}>{label}</Typography>
        <Typography
          sx={{
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 800,
            mt: 0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value}
        </Typography>
      </Box>

      {avatar ? (
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "999px",
            bgcolor: "#FFEAD5",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            fontFamily: "JetBrains Mono, monospace",
            color: "#B54708",
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {avatar}
        </Box>
      ) : null}
    </Box>
  );
}