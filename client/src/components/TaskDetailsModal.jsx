import React from "react";
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

function calculateDurationInDays(createdAt) {
  if (!createdAt) return "-";
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now - created;
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

export default function TaskDetailsModal({ open, onClose, task }) {
  if (!task) return null;

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
            <Chip
              size="small"
              label={`${task.priority ?? "medium"} Priority`}
              sx={{
                bgcolor: "#FEF0C7",
                color: "#B54708",
                fontWeight: 700,
                borderRadius: 2,
              }}
            />

            <Chip
              size="small"
              label={(task.status ?? task.rawStatus ?? "IN PROGRESS").toUpperCase()}
              sx={{
                bgcolor: "#E0EAFF",
                color: "#175CD3",
                fontWeight: 700,
                borderRadius: 2,
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
      {/* Icon block (like your prototype) */}
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
        <Typography sx={{ fontSize: 12, opacity: 0.6 }}>
          {label}
        </Typography>
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

      {/* Optional initials bubble for owner row */}
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