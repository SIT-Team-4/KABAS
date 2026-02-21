import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function TasksModal({
  open,
  onClose,
  title,
  tasks,
  statusLabel,
  statusColor,
  statusTint,
  onSelectTask,
}) {
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
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {title}
          </Typography>

          <IconButton onClick={onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* Task List */}
        <Box sx={{ p: 3, display: "grid", gap: 2 }}>
          {tasks.map((task) => (
            <Box
              key={task.id}
              onClick={() => onSelectTask(task)}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                border: "1px solid rgba(0,0,0,0.08)",
                p: 2,
                bgcolor: "rgba(255,255,255,0.6)",
                transition: "0.2s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontFamily: "JetBrains Mono, monospace",
                }}
              >
                {task.title}
              </Typography>

              <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                <Chip
                  size="small"
                  label={statusLabel}
                  sx={{
                    bgcolor: statusTint,
                    color: statusColor,
                    fontWeight: 700,
                  }}
                />

                <Chip
                  size="small"
                  label={task.priority}
                  sx={{
                    bgcolor: "#E0EAFF",
                    color: "#175CD3",
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}