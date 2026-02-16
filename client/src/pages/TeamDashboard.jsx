import React, { useMemo, useState } from "react";
import { Box, Grid, Typography, Button } from "@mui/material";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import StatusCard from "../components/StatusCard";
import TaskDrawer from "../components/TaskDrawer";
import { team, statusCards, tasks } from "../data/mock";

export default function TeamDashboard() {
  const [drawerStatus, setDrawerStatus] = useState(null);

  const byStatus = useMemo(() => {
    const map = {};
    for (const s of statusCards) map[s.key] = tasks.filter((t) => t.status === s.key);
    return map;
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
            {team.name}
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
            {team.members} members • {team.totalTasks} tasks tracked
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<SyncRoundedIcon />} sx={{ bgcolor: "#F79009", "&:hover": { bgcolor: "#DC6803" }, px: 2.2, py: 1.2, borderRadius: 2 }}>
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
              onClick={() => setDrawerStatus(s.key)}
            />
          </Grid>
        ))}
      </Grid>

      <TaskDrawer
        open={!!drawerStatus}
        onClose={() => setDrawerStatus(null)}
        statusKey={drawerStatus || "todo"}
        tasks={drawerStatus ? byStatus[drawerStatus] : []}
      />
    </Box>
  );
}
