import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { getAllTeamsAnalytics } from "../api/analyticsApi";

export default function AllTeams() {
  const [data, setData] = React.useState({ teams: [], cohort: null });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await getAllTeamsAnalytics();
        if (!isMounted) return;
        setData({
          teams: Array.isArray(response?.teams) ? response.teams : [],
          cohort: response?.cohort || null,
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Unable to load all-team analytics");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ minHeight: 240 }}>
      <Typography sx={{ fontSize: 28, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>
        All Teams
      </Typography>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={3}>
          <SummaryCard label="Total Teams" value={data.cohort?.totalTeams ?? 0} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard label="Total Tasks" value={data.cohort?.totalTasks ?? 0} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard label="Avg Completion" value={fmtDays(data.cohort?.avgCompletionDays)} />
        </Grid>
        <Grid item xs={12} md={3}>
          <SummaryCard label="Avg Efficiency" value={fmtPercent(data.cohort?.avgEfficiency)} />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, mt: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 900, fontFamily: "JetBrains Mono, monospace", mb: 2 }}>
            Team Overview
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>Class Group</TableCell>
                <TableCell align="center">Tasks</TableCell>
                <TableCell align="center">Members</TableCell>
                <TableCell align="center">Completed</TableCell>
                <TableCell align="center">Avg Completion</TableCell>
                <TableCell align="center">Avg Efficiency</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.teams.map((team) => (
                <TableRow key={team.teamId} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{team.teamName}</TableCell>
                  <TableCell>{team.classGroupName || "—"}</TableCell>
                  <TableCell align="center">{team.totalTasks}</TableCell>
                  <TableCell align="center">{team.memberCount}</TableCell>
                  <TableCell align="center">{team.completedCount}</TableCell>
                  <TableCell align="center">{fmtDays(team.avgCompletionDays)}</TableCell>
                  <TableCell align="center">{fmtPercent(team.avgEfficiency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}

function SummaryCard({ label, value }) {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography sx={{ fontSize: 12, color: "text.secondary", textTransform: "uppercase" }}>
          {label}
        </Typography>
        <Typography sx={{ mt: 0.8, fontSize: 28, fontWeight: 900, fontFamily: "JetBrains Mono, monospace" }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function fmtDays(value) {
  return typeof value === "number" ? `${value.toFixed(1)}d` : "—";
}

function fmtPercent(value) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "—";
}