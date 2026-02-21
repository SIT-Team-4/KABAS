import React, { useState } from "react";
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
import { team, statusCards, tasks, getCountsByBucket } from "../data/mock";

export default function TeamDashboard() {
  const [popupStatus, setPopupStatus] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Since tasks/statusCards are mock constants, compute directly (no useMemo = no hook lint issues)
  const totalTasks = tasks.length;
  const counts = getCountsByBucket(tasks);

  const byStatus = {};
  for (const s of statusCards) {
    byStatus[s.key] = tasks.filter((t) => t.bucket === s.key);
  }

  // Raw label to show on card (student's actual column name)
  const rawMetaByBucket = {};
  for (const s of statusCards) {
    const list = byStatus[s.key] || [];
    const firstRaw = list.find((t) => t.rawStatus)?.rawStatus;
    rawMetaByBucket[s.key] = {
      rawLabel: firstRaw || s.label, // fallback if rawStatus not available
    };
  }

  const meta = statusCards.find((s) => s.key === popupStatus);
  const list = popupStatus ? byStatus[popupStatus] : [];

  const displayStatusLabel =
    (popupStatus && rawMetaByBucket[popupStatus]?.rawLabel) || meta?.label || "";

  return (
    <Box
      sx={{
        maxWidth: 2000,
        mx: "auto",
        pt: 1,
        pb: 6,
      }}
    >
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
              // ✅ Only show raw label as main label
              label={rawMetaByBucket[s.key]?.rawLabel || s.label}
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

      {/* Placeholder panels */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                Task Distribution
              </Typography>
              <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
                Placeholder
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                Longest Open Issues
              </Typography>
              <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
                Placeholder
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, minHeight: 380 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                Member Highlights
              </Typography>
              <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 13 }}>
                Placeholder
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Team Performance (placeholder) */}
      <Card sx={{ borderRadius: 3, mt: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace", mb: 2 }}>
            Team Performance
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Member</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Tasks Assigned</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Completed</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>In Progress</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Avg. Completion (days)</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Std. Deviation</TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Efficiency</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow hover>
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
                      Initials
                    </Avatar>
                    <Typography sx={{ fontWeight: 700 }}>Placeholder</Typography>
                  </Box>
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>Placeholder</TableCell>

                <TableCell>
                  <Chip
                    label="Completed"
                    size="small"
                    sx={{
                      bgcolor: "rgba(18,183,106,0.12)",
                      color: "#12B76A",
                      fontWeight: 800,
                      borderRadius: 1.5,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label="In Progress"
                    size="small"
                    sx={{
                      bgcolor: "rgba(46,144,250,0.12)",
                      color: "#2E90FA",
                      fontWeight: 800,
                      borderRadius: 1.5,
                    }}
                  />
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}></TableCell>
                <TableCell sx={{ fontWeight: 700 }}></TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <TrendingDownRoundedIcon sx={{ fontSize: 18, color: "#F04438" }} />
                    <Typography sx={{ fontWeight: 800, color: "#F04438" }}>Placeholder</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal 1: task list */}
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

      {/* Modal 2: task details */}
      <TaskDetailsModal
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </Box>
  );
}