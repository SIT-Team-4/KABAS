import React, { useMemo, useState } from "react";
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
import { team, statusCards, tasks } from "../data/mock";

export default function TeamDashboard() {
  const [popupStatus, setPopupStatus] = useState(null);

  const byStatus = useMemo(() => {
    const map = {};
    for (const s of statusCards) {
      map[s.key] = tasks.filter((t) => t.status === s.key);
    }
    return map;
  }, []);

  const meta = statusCards.find((s) => s.key === popupStatus);
  const list = popupStatus ? byStatus[popupStatus] : [];

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
            {team.members} members • {team.totalTasks} tasks tracked
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

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statusCards.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.key}>
            <StatusCard
              label={s.label}
              count={s.count}
              total={team.totalTasks}
              color={s.color}
              tint={s.tint}
              iconKey={s.key}
              onClick={() => setPopupStatus(s.key)}
              variant="wide"
            />
          </Grid>
        ))}
      </Grid>

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
      
      
      <Card sx={{ borderRadius: 3, mt:3, mb: 3 }}>
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
                      label="in Progress"
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
                      <Typography sx={{ fontWeight: 800, color: "#F04438" }}>
                        Placeholder
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ===== PLACEHOLDER: Latest Activity ===== */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
            Latest Activity
          </Typography>
          <Typography sx={{ mt: 0.75, color: "text.secondary", fontSize: 13 }}>
            Most recent task for each member
          </Typography>

          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ borderRadius: 3, height: "100%" }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 46,
                          height: 46,
                          bgcolor: "rgba(247,144,9,0.14)",
                          color: "#F79009",
                          fontWeight: 800,
                        }}
                      >
                      </Avatar>

                      <Box>
                        <Typography sx={{ fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                          Placeholder
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75}}>
                        <Typography sx={{ fontWeight: 800}}>
                        </Typography>
                      </Box>
                    </Box>

                    <Typography sx={{ mt: 1.5, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
          </Grid>
        </CardContent>
      </Card>
      

      {/* Prototype-style center popup */}
      <TasksModal
        open={!!popupStatus}
        onClose={() => setPopupStatus(null)}
        title={`${meta?.label ?? ""} Tasks (${list.length})`}
        tasks={list}
        statusLabel={meta?.label ?? ""}
        statusColor={meta?.color}
        statusTint={meta?.tint}
      />
    </Box>
  );
}
