import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import DragIndicatorRoundedIcon from "@mui/icons-material/DragIndicatorRounded";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { useNavigate } from "react-router-dom";
import { getAllTeamsAnalytics, getTeamAnalytics } from "../api/analyticsApi";
import { listClassGroups } from "../api/classGroupsApi";
import TaskDetailsModal from "../components/TaskDetailsModal";

const mono = "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace";
const ORANGE = "#F79009";
const DEFAULT_SECTION_ORDER = [
  "overallMetrics",
  "statusDistribution",
  "teamComparison",
  "comparisonWorkspace",
  "insights",
  "memberDistribution",
];

export default function AllTeams() {
  const navigate = useNavigate();
  const [classGroups, setClassGroups] = React.useState([]);
  const [selectedClassGroup, setSelectedClassGroup] = React.useState("all");
  const [data, setData] = React.useState({ teams: [], cohort: null });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selectedTeamId, setSelectedTeamId] = React.useState(null);
  const [teamDetails, setTeamDetails] = React.useState({});
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [sortConfig, setSortConfig] = React.useState({ key: "totalTasks", direction: "desc" });
  const [compareTeamIds, setCompareTeamIds] = React.useState([]);
  const [sectionOrder, setSectionOrder] = React.useState(DEFAULT_SECTION_ORDER);
  const [draggedSection, setDraggedSection] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadClassGroups = async () => {
      try {
        const response = await listClassGroups();
        if (!isMounted) return;
        setClassGroups(response);
      } catch {
        if (!isMounted) return;
        setClassGroups([]);
      }
    };

    loadClassGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getAllTeamsAnalytics(
          selectedClassGroup === "all"
            ? undefined
            : { classGroupId: selectedClassGroup }
        );

        if (!isMounted) return;

        setData({
          teams: Array.isArray(response?.teams) ? response.teams : [],
          cohort: response?.cohort || emptyCohort(),
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err?.message || "Unable to load all-team analytics");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [selectedClassGroup]);

  React.useEffect(() => {
    const visibleTeamIds = new Set(data.teams.map((team) => team.teamId));
    setCompareTeamIds((current) => current.filter((teamId) => visibleTeamIds.has(teamId)));
    setSelectedTeamId((current) => (current && visibleTeamIds.has(current) ? current : null));
  }, [data.teams]);

  const ensureTeamDetail = React.useCallback(async (teamId) => {
    if (!teamId) return null;
    if (teamDetails[teamId]) return teamDetails[teamId];

    setDetailLoading(true);
    setDetailError("");
    try {
      const analytics = await getTeamAnalytics(teamId);
      const detail = buildTeamDetail(teamId, analytics);
      setTeamDetails((current) => ({ ...current, [teamId]: detail }));
      return detail;
    } catch (err) {
      const message = err?.message || "Unable to load team detail";
      setDetailError(message);
      throw err;
    } finally {
      setDetailLoading(false);
    }
  }, [teamDetails]);

  const openTeamDetail = React.useCallback(async (teamId) => {
    setSelectedTeamId(teamId);
    try {
      await ensureTeamDetail(teamId);
    } catch {
      // handled by state
    }
  }, [ensureTeamDetail]);

  const toggleCompare = React.useCallback(async (teamId) => {
    const exists = compareTeamIds.includes(teamId);
    if (exists) {
      setCompareTeamIds((current) => current.filter((id) => id !== teamId));
      return;
    }

    if (compareTeamIds.length >= 3) {
      setError("You can compare up to 3 teams at once.");
      return;
    }

    try {
      await ensureTeamDetail(teamId);
      setCompareTeamIds((current) => [...current, teamId]);
    } catch {
      // handled by state
    }
  }, [compareTeamIds, ensureTeamDetail]);

  const requestSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedTeams = React.useMemo(() => {
    const sorted = [...data.teams];
    const { key, direction } = sortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    sorted.sort((a, b) => {
      const aValue = valueForSort(a, key);
      const bValue = valueForSort(b, key);

      if (typeof aValue === "string" || typeof bValue === "string") {
        return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * multiplier;
      }

      return ((aValue || 0) - (bValue || 0)) * multiplier;
    });

    return sorted;
  }, [data.teams, sortConfig]);

  const completionRate = pct(data.cohort?.totalCompleted, data.cohort?.totalTasks);
  const topPerformingTeams = React.useMemo(
    () => [...data.teams].sort((a, b) => teamCompletionRate(b) - teamCompletionRate(a)).slice(0, 3),
    [data.teams]
  );
  const backlogTeams = React.useMemo(
    () => [...data.teams].sort((a, b) => b.backlogCount - a.backlogCount).slice(0, 3),
    [data.teams]
  );

  const selectedTeam = selectedTeamId ? data.teams.find((team) => team.teamId === selectedTeamId) : null;
  const selectedTeamDetail = selectedTeamId ? teamDetails[selectedTeamId] : null;
  const comparisonTeams = compareTeamIds
    .map((teamId) => ({ summary: data.teams.find((team) => team.teamId === teamId), detail: teamDetails[teamId] }))
    .filter((entry) => entry.summary && entry.detail);

  const sections = {
    overallMetrics: (
      <Box>
        <SectionHeader icon={<DashboardCustomizeRoundedIcon sx={{ fontSize: 18 }} />} title="Overall Metrics" helper="Drag cards below to reorder the layout for each lecturer." />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} xl={3}>
            <OverviewMetricCard
              icon={<Groups2OutlinedIcon sx={{ fontSize: 16 }} />}
              label="Total Teams"
              value={String(data.cohort?.totalTeams ?? 0)}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <OverviewMetricCard
              icon={<AssignmentOutlinedIcon sx={{ fontSize: 16 }} />}
              label="Total Tasks"
              value={String(data.cohort?.totalTasks ?? 0)}
              helper={`${data.cohort?.totalCompleted ?? 0} of ${data.cohort?.totalTasks ?? 0} completed (${completionRate}%)`}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <OverviewMetricCard
              icon={<ScheduleOutlinedIcon sx={{ fontSize: 16 }} />}
              label="Avg Completion Time"
              value={fmtDays(data.cohort?.avgCompletionDays)}
              helper="Across all teams"
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <OverviewMetricCard
              icon={<AutorenewRoundedIcon sx={{ fontSize: 16 }} />}
              label="Tasks In Progress"
              value={String(data.cohort?.totalInProgress ?? 0)}
              helper={`${data.cohort?.totalTodo ?? 0} to do, ${data.cohort?.totalBacklog ?? 0} backlog`}
            />
          </Grid>
        </Grid>
      </Box>
    ),
    statusDistribution: (
      <Box>
        <SectionHeader title="Status Distribution Across All Teams" helper="Supports clear cohort-level to-do, in-progress, completed and backlog tracking." />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} xl={3}>
            <StatusSummaryCard
              title="To-Do"
              value={data.cohort?.totalTodo ?? 0}
              percent={pct(data.cohort?.totalTodo, data.cohort?.totalTasks)}
              borderColor="#C7B3FF"
              icon={<AssignmentOutlinedIcon sx={{ fontSize: 15 }} />}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <StatusSummaryCard
              title="In Progress"
              value={data.cohort?.totalInProgress ?? 0}
              percent={pct(data.cohort?.totalInProgress, data.cohort?.totalTasks)}
              borderColor="#B9D7FF"
              icon={<AutorenewRoundedIcon sx={{ fontSize: 15 }} />}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <StatusSummaryCard
              title="Completed"
              value={data.cohort?.totalCompleted ?? 0}
              percent={pct(data.cohort?.totalCompleted, data.cohort?.totalTasks)}
              borderColor="#B7E7CF"
              icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <StatusSummaryCard
              title="Backlog"
              value={data.cohort?.totalBacklog ?? 0}
              percent={pct(data.cohort?.totalBacklog, data.cohort?.totalTasks)}
              borderColor="#F5D98F"
              icon={<FolderOpenRoundedIcon sx={{ fontSize: 15 }} />}
            />
          </Grid>
        </Grid>
      </Box>
    ),
    teamComparison: (
      <Box>
        <SectionHeader title="Team Comparison" helper="Sortable columns, team drill-down, and selection for side-by-side benchmarking." />
        <Card sx={surfaceSx}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ overflowX: "auto" }}>
              <Table sx={{ minWidth: 1120 }}>
                <TableHead>
                  <TableRow>
                    <HeaderCell padding="checkbox">Compare</HeaderCell>
                    <SortableHeaderCell activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="teamName" onClick={requestSort}>Team</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="totalTasks" onClick={requestSort}>Total Tasks</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="todoCount" onClick={requestSort}>To-Do</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="inProgressCount" onClick={requestSort}>In Progress</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="completedCount" onClick={requestSort}>Completed</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="backlogCount" onClick={requestSort}>Backlog</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="completionRate" onClick={requestSort}>Completion Rate</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="avgEfficiency" onClick={requestSort}>Avg Efficiency</SortableHeaderCell>
                    <SortableHeaderCell align="center" activeKey={sortConfig.key} direction={sortConfig.direction} sortKey="memberCount" onClick={requestSort}>Members</SortableHeaderCell>
                    <HeaderCell align="center">Actions</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedTeams.map((team) => (
                    <TableRow key={team.teamId} hover sx={{ cursor: "pointer" }} onClick={() => openTeamDetail(team.teamId)}>
                      <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
                        <Checkbox checked={compareTeamIds.includes(team.teamId)} onChange={() => toggleCompare(team.teamId)} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontFamily: mono }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box sx={{ width: 20, height: 20, borderRadius: 1, bgcolor: "rgba(247,144,9,0.12)", color: ORANGE, display: "grid", placeItems: "center" }}>
                            <Groups2OutlinedIcon sx={{ fontSize: 13 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: mono }}>{team.teamName}</Typography>
                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{team.classGroupName || "Ungrouped"}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <BodyCell align="center">{team.totalTasks}</BodyCell>
                      <BodyCell align="center">{team.todoCount}</BodyCell>
                      <BodyCell align="center">{team.inProgressCount}</BodyCell>
                      <BodyCell align="center" sx={{ color: "#12B76A", fontWeight: 700 }}>{team.completedCount}</BodyCell>
                      <BodyCell align="center">{team.backlogCount}</BodyCell>
                      <BodyCell align="center">
                        <Typography sx={{ color: rateColor(teamCompletionRate(team)), fontWeight: 700, fontSize: 13 }}>
                          {teamCompletionRate(team)}%
                        </Typography>
                      </BodyCell>
                      <BodyCell align="center">{fmtPercent(team.avgEfficiency)}</BodyCell>
                      <BodyCell align="center">{team.memberCount}</BodyCell>
                      <BodyCell align="center" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Open team drill-down in this page">
                          <IconButton size="small" onClick={(event) => { event.stopPropagation(); openTeamDetail(team.teamId); }}>
                            <InsightsRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open dedicated team dashboard">
                          <IconButton size="small" onClick={(event) => { event.stopPropagation(); navigate(`/teams/${team.teamId}`); }}>
                            <LaunchRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </BodyCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Box>
    ),
    comparisonWorkspace: (
      <Box>
        <SectionHeader icon={<CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />} title="Side-by-Side Benchmarking" helper="Select up to 3 teams in the table above to compare per-team metrics, longest open issue, and member efficiency/deviation." />
        {comparisonTeams.length === 0 ? (
          <Card sx={surfaceSx}>
            <CardContent>
              <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                Choose one or more teams from the comparison table to benchmark them side by side.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {comparisonTeams.map(({ summary, detail }) => (
              <Grid key={summary.teamId} item xs={12} lg={comparisonTeams.length === 1 ? 12 : 6} xl={4}>
                <ComparisonTeamCard
                  summary={summary}
                  detail={detail}
                  onOpen={() => openTeamDetail(summary.teamId)}
                  onOpenDashboard={() => navigate(`/teams/${summary.teamId}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    ),
    insights: (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            <InsightListCard
              title="Top Performing Teams"
              icon={<EmojiEventsRoundedIcon sx={{ color: "#12B76A", fontSize: 18 }} />}
              items={topPerformingTeams.map((team, index) => ({
                key: team.teamId,
                rank: index + 1,
                title: team.teamName,
                subtitle: `${team.completedCount} completed · ${team.inProgressCount} in progress · ${team.memberCount} members`,
                value: `${teamCompletionRate(team)}%`,
                borderColor: "rgba(18,183,106,0.4)",
                background: "rgba(18,183,106,0.06)",
              }))}
              onItemClick={(teamId) => openTeamDetail(teamId)}
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <InsightListCard
              title="Teams with Most Backlog"
              icon={<WarningAmberRoundedIcon sx={{ color: "#F79009", fontSize: 18 }} />}
              items={backlogTeams.map((team, index) => ({
                key: team.teamId,
                rank: index + 1,
                title: team.teamName,
                subtitle: `${pct(team.backlogCount, team.totalTasks)}% in backlog · ${team.todoCount} to-do · ${team.memberCount} members`,
                value: `${team.backlogCount} tasks`,
                borderColor: "rgba(247,144,9,0.45)",
                background: "rgba(247,144,9,0.05)",
              }))}
              onItemClick={(teamId) => openTeamDetail(teamId)}
            />
          </Grid>
        </Grid>
      </Box>
    ),
    memberDistribution: (
      <Box>
        <SectionHeader title="Team Member Distribution" helper="Quick workload signal for each team. Click any card for the drill-down view." />
        <Grid container spacing={2}>
          {data.teams.map((team) => (
            <Grid key={team.teamId} item xs={12} md={6} lg={4}>
              <Card sx={{ ...surfaceSx, cursor: "pointer" }} onClick={() => openTeamDetail(team.teamId)}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontFamily: mono, fontSize: 13 }}>{team.teamName}</Typography>
                      <Typography sx={{ mt: 1, fontSize: 28, fontWeight: 800, fontFamily: mono }}>{team.memberCount}</Typography>
                      <Typography sx={{ color: "text.secondary", fontSize: 12 }}>{fmtTasksPerMember(team.totalTasks, team.memberCount)}</Typography>
                    </Box>
                    <Chip label={team.source || "mixed"} size="small" sx={{ textTransform: "uppercase", fontSize: 10, fontWeight: 700 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    ),
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 320 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
        <Box>
          <Typography sx={{ fontSize: 28, fontWeight: 800, fontFamily: mono }}>All Teams Overview</Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: 13 }}>
            Bird&apos;s-eye view of all {data.cohort?.totalTeams ?? 0} teams at a glance
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ width: { xs: "100%", md: "auto" } }}>
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <InputLabel id="cohort-filter-label">Class Group</InputLabel>
            <Select
              labelId="cohort-filter-label"
              label="Class Group"
              value={selectedClassGroup}
              onChange={(e) => setSelectedClassGroup(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: "#fff" }}
            >
              <MenuItem value="all">All class groups</MenuItem>
              {classGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DashboardCustomizeRoundedIcon />}
            onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER)}
            sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
          >
            Reset layout
          </Button>
        </Stack>
      </Stack>

      {error ? <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert> : null}
      {detailError ? <Alert severity="error" sx={{ mt: 2 }}>{detailError}</Alert> : null}
      {detailLoading ? <Alert severity="info" sx={{ mt: 2 }}>Loading team drill-down details…</Alert> : null}

      <Stack spacing={3} sx={{ mt: 3 }}>
        {sectionOrder.map((sectionKey) => (
          <Card
            key={sectionKey}
            draggable
            onDragStart={() => setDraggedSection(sectionKey)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleSectionDrop(sectionKey, draggedSection, setSectionOrder)}
            onDragEnd={() => setDraggedSection(null)}
            sx={{
              ...surfaceSx,
              p: 2.25,
              cursor: "grab",
              borderStyle: draggedSection === sectionKey ? "dashed" : "solid",
              borderColor: draggedSection === sectionKey ? "rgba(247,144,9,0.55)" : surfaceSx.borderColor,
              opacity: draggedSection === sectionKey ? 0.8 : 1,
              transition: "border-color 0.15s ease, opacity 0.15s ease",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Box sx={{ pt: 0.5, color: "text.secondary", cursor: "grab", display: "grid", placeItems: "center" }}><DragIndicatorRoundedIcon /></Box>
              <Box sx={{ flex: 1 }}>{sections[sectionKey]}</Box>
            </Stack>
          </Card>
        ))}
      </Stack>

      <TeamDetailDialog
        open={Boolean(selectedTeamId)}
        onClose={() => setSelectedTeamId(null)}
        team={selectedTeam}
        detail={selectedTeamDetail}
        onOpenTask={setSelectedTask}
        onOpenDashboard={() => selectedTeamId && navigate(`/teams/${selectedTeamId}`)}
      />

      <TaskDetailsModal open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)} task={selectedTask} />
    </Box>
  );
}

function TeamDetailDialog({ open, onClose, team, detail, onOpenTask, onOpenDashboard }) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: 800, fontFamily: mono }}>
        {team?.teamName || "Team drill-down"}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: "#FBF7F2" }}>
        {!detail ? (
          <Box sx={{ minHeight: 220, display: "grid", placeItems: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={2.25}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} xl={3}><StatusSummaryCard title="To-Do" value={detail.summary.todoCount} percent={pct(detail.summary.todoCount, detail.summary.totalTasks)} borderColor="#C7B3FF" icon={<AssignmentOutlinedIcon sx={{ fontSize: 15 }} />} /></Grid>
              <Grid item xs={12} md={6} xl={3}><StatusSummaryCard title="In Progress" value={detail.summary.inProgressCount} percent={pct(detail.summary.inProgressCount, detail.summary.totalTasks)} borderColor="#B9D7FF" icon={<AutorenewRoundedIcon sx={{ fontSize: 15 }} />} /></Grid>
              <Grid item xs={12} md={6} xl={3}><StatusSummaryCard title="Completed" value={detail.summary.completedCount} percent={pct(detail.summary.completedCount, detail.summary.totalTasks)} borderColor="#B7E7CF" icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 15 }} />} /></Grid>
              <Grid item xs={12} md={6} xl={3}><StatusSummaryCard title="Backlog" value={detail.summary.backlogCount} percent={pct(detail.summary.backlogCount, detail.summary.totalTasks)} borderColor="#F5D98F" icon={<FolderOpenRoundedIcon sx={{ fontSize: 15 }} />} /></Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} lg={5}>
                <Card sx={surfaceSx}>
                  <CardContent>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Highlights</Typography>
                    <Stack spacing={1.2}>
                      <InfoLine label="Longest open issue" value={detail.longestOpenTask?.title || "No open issue found"} helper={detail.longestOpenTask ? `${detail.longestOpenTask.daysOpen} days · ${detail.longestOpenTask.owner}` : ""} />
                      <InfoLine label="Most opened tasks" value={formatLeader(detail.statusLeaders.mostInProgress)} />
                      <InfoLine label="Most to-do tasks" value={formatLeader(detail.statusLeaders.mostTodo)} />
                      <InfoLine label="Most backlog tasks" value={formatLeader(detail.statusLeaders.mostBacklog)} />
                      <InfoLine label="Average completion time" value={fmtDays(detail.summary.avgCompletionDays)} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={7}>
                <Card sx={surfaceSx}>
                  <CardContent>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Per-student efficiency and deviation</Typography>
                    {detail.memberMetrics.length === 0 ? (
                      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>No member metrics available yet.</Typography>
                    ) : (
                      <Box sx={{ overflowX: "auto" }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <HeaderCell>Member</HeaderCell>
                              <HeaderCell align="center">Tasks</HeaderCell>
                              <HeaderCell align="center">Completed</HeaderCell>
                              <HeaderCell align="center">Avg Time</HeaderCell>
                              <HeaderCell align="center">Std Dev</HeaderCell>
                              <HeaderCell align="center">Efficiency</HeaderCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {detail.memberMetrics.map((member) => (
                              <TableRow key={member.member}>
                                <BodyCell>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <PersonOutlineRoundedIcon sx={{ fontSize: 16, color: ORANGE }} />
                                    <Typography sx={{ fontSize: 13 }}>{member.member}</Typography>
                                  </Stack>
                                </BodyCell>
                                <BodyCell align="center">{member.totalTasks}</BodyCell>
                                <BodyCell align="center">{member.completedTasks}</BodyCell>
                                <BodyCell align="center">{fmtDays(member.avgDays)}</BodyCell>
                                <BodyCell align="center">{fmtDays(member.stdDevDays)}</BodyCell>
                                <BodyCell align="center">{fmtPercent(member.efficiencyPercent)}</BodyCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Card sx={surfaceSx}>
              <CardContent>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1.5 }}>Detailed task drill-down</Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 920 }}>
                    <TableHead>
                      <TableRow>
                        <HeaderCell>Title</HeaderCell>
                        <HeaderCell>Owner</HeaderCell>
                        <HeaderCell>Priority</HeaderCell>
                        <HeaderCell>Status</HeaderCell>
                        <HeaderCell>Duration</HeaderCell>
                        <HeaderCell>Created</HeaderCell>
                        <HeaderCell>Updated</HeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detail.tasks.slice(0, 14).map((task) => (
                        <TableRow key={task.id || task.externalId} hover sx={{ cursor: "pointer" }} onClick={() => onOpenTask(task)}>
                          <BodyCell sx={{ fontWeight: 700 }}>{task.title}</BodyCell>
                          <BodyCell>{task.owner || "Unassigned"}</BodyCell>
                          <BodyCell><PriorityChip priority={task.priority} /></BodyCell>
                          <BodyCell><StatusChip task={task} /></BodyCell>
                          <BodyCell>{formatTaskDuration(task)}</BodyCell>
                          <BodyCell>{formatShortDate(task.createdAt)}</BodyCell>
                          <BodyCell>{formatShortDate(task.updatedAt || task.completedAt)}</BodyCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={onOpenDashboard} variant="contained" sx={{ bgcolor: ORANGE, "&:hover": { bgcolor: "#DC6803" } }}>Open dashboard</Button>
      </DialogActions>
    </Dialog>
  );
}

function ComparisonTeamCard({ summary, detail, onOpen, onOpenDashboard }) {
  return (
    <Card sx={surfaceSx}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, fontFamily: mono }}>{summary.teamName}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.4 }}>{summary.classGroupName || "Ungrouped"}</Typography>
          </Box>
          <Chip label={`${teamCompletionRate(summary)}% completion`} size="small" sx={{ fontWeight: 700, color: rateColor(teamCompletionRate(summary)) }} />
        </Stack>

        <Grid container spacing={1.25} sx={{ mt: 1.5 }}>
          {[
            ["To-Do", summary.todoCount],
            ["In Progress", summary.inProgressCount],
            ["Completed", summary.completedCount],
            ["Backlog", summary.backlogCount],
          ].map(([label, value]) => (
            <Grid key={label} item xs={6}>
              <Box sx={miniMetricSx}>
                <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{label}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 22, fontFamily: mono }}>{value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 1.5 }} />
        <Stack spacing={1}>
          <InfoLine label="Longest open issue" value={detail.longestOpenTask?.title || "No open issue found"} helper={detail.longestOpenTask ? `${detail.longestOpenTask.daysOpen} days · ${detail.longestOpenTask.owner}` : ""} />
          <InfoLine label="Top contributor signal" value={bestMemberLabel(detail.memberMetrics)} helper="Uses completion count, then efficiency as tie-breaker." />
        </Stack>

        <Divider sx={{ my: 1.5 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1 }}>Member efficiency</Typography>
        <Stack spacing={1}>
          {detail.memberMetrics.slice(0, 4).map((member) => (
            <Box key={member.member} sx={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 1, alignItems: "center" }}>
              <Typography sx={{ fontSize: 12 }}>{member.member}</Typography>
              <Chip size="small" label={`σ ${fmtDays(member.stdDevDays)}`} sx={{ fontWeight: 700 }} />
              <Chip size="small" label={fmtPercent(member.efficiencyPercent)} sx={{ fontWeight: 700, color: rateColor(100 - (member.efficiencyPercent || 0)) }} />
            </Box>
          ))}
          {detail.memberMetrics.length === 0 ? <Typography sx={{ color: "text.secondary", fontSize: 12 }}>No member analytics yet.</Typography> : null}
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" variant="outlined" onClick={onOpen}>View details</Button>
          <Button size="small" variant="contained" onClick={onOpenDashboard} sx={{ bgcolor: ORANGE, "&:hover": { bgcolor: "#DC6803" } }}>Open dashboard</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionHeader({ title, helper, icon }) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {icon || null}
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: "text.primary" }}>{title}</Typography>
      </Stack>
      {helper ? <Typography sx={{ color: "text.secondary", fontSize: 11.5 }}>{helper}</Typography> : null}
    </Stack>
  );
}

function SortableHeaderCell({ children, sortKey, activeKey, direction, onClick, ...props }) {
  return (
    <HeaderCell {...props}>
      <TableSortLabel active={activeKey === sortKey} direction={activeKey === sortKey ? direction : "asc"} onClick={() => onClick(sortKey)}>
        {children}
      </TableSortLabel>
    </HeaderCell>
  );
}

function OverviewMetricCard({ icon, label, value, helper }) {
  return (
    <Card sx={surfaceSx}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>{label}</Typography>
          <Box sx={iconBadgeSx}>{icon}</Box>
        </Stack>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 800, fontFamily: mono }}>{value}</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}>{helper}</Typography>
      </CardContent>
    </Card>
  );
}

function StatusSummaryCard({ title, value, percent, borderColor, icon }) {
  return (
    <Card sx={{ ...surfaceSx, borderColor }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{title}</Typography>
          <Box sx={iconBadgeSx}>{icon}</Box>
        </Stack>
        <Typography sx={{ mt: 1, fontSize: 30, fontWeight: 800, fontFamily: mono }}>{value}</Typography>
        <Typography sx={{ mt: 0.5, fontSize: 11, color: "text.secondary" }}>{percent}% of total</Typography>
      </CardContent>
    </Card>
  );
}

function InsightListCard({ title, icon, items, onItemClick }) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
        {icon}
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{title}</Typography>
      </Stack>

      <Stack spacing={1.4}>
        {items.map((item) => (
          <Card key={item.key} sx={{ ...surfaceSx, borderColor: item.borderColor, background: item.background, cursor: "pointer" }} onClick={() => onItemClick(item.key)}>
            <CardContent sx={{ py: 1.7, "&:last-child": { pb: 1.7 } }}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={1.2} alignItems="flex-start">
                  <Box sx={{ width: 22, height: 22, borderRadius: 99, bgcolor: ORANGE, color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800, mt: 0.2 }}>{item.rank}</Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontFamily: mono, fontSize: 13 }}>{item.title}</Typography>
                    <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>{item.subtitle}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 700, color: rateColorFromLabel(item.value), fontSize: 13 }}>{item.value}</Typography>
                  <ArrowOutwardRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

function HeaderCell({ children, ...props }) {
  return <TableCell {...props} sx={{ fontWeight: 700, fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>{children}</TableCell>;
}

function BodyCell({ children, sx, ...props }) {
  return <TableCell {...props} sx={{ fontSize: 13, whiteSpace: "nowrap", ...sx }}>{children}</TableCell>;
}

function PriorityChip({ priority }) {
  const value = String(priority || "—");
  const lower = value.toLowerCase();
  let sx = { bgcolor: "rgba(16,24,40,0.06)", color: "rgba(16,24,40,0.7)" };
  if (lower.includes("high")) sx = { bgcolor: "rgba(240,68,56,0.12)", color: "#B42318" };
  if (lower.includes("med")) sx = { bgcolor: "rgba(247,144,9,0.12)", color: "#B54708" };
  if (lower.includes("low")) sx = { bgcolor: "rgba(46,144,250,0.12)", color: "#175CD3" };
  return <Chip size="small" label={value} sx={{ fontWeight: 700, ...sx }} />;
}

function StatusChip({ task }) {
  return <Chip size="small" label={task.rawStatus || task.bucket || "—"} sx={{ fontWeight: 700 }} />;
}

function InfoLine({ label, value, helper }) {
  return (
    <Box>
      <Typography sx={{ color: "text.secondary", fontSize: 11 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, mt: 0.25 }}>{value}</Typography>
      {helper ? <Typography sx={{ color: "text.secondary", fontSize: 11, mt: 0.25 }}>{helper}</Typography> : null}
    </Box>
  );
}

function emptyCohort() {
  return { totalTeams: 0, totalTasks: 0, totalTodo: 0, totalInProgress: 0, totalCompleted: 0, totalBacklog: 0, avgCompletionDays: null, avgEfficiency: null };
}

function valueForSort(team, key) {
  if (key === "completionRate") return teamCompletionRate(team);
  return team[key] ?? 0;
}

function buildTeamDetail(teamId, analytics) {
  const tasks = Array.isArray(analytics?.tasks) ? analytics.tasks : [];
  const summary = {
    teamId,
    totalTasks: tasks.length,
    todoCount: tasks.filter((task) => task.bucket === "todo").length,
    inProgressCount: tasks.filter((task) => task.bucket === "in_progress").length,
    completedCount: tasks.filter((task) => task.bucket === "completed").length,
    backlogCount: tasks.filter((task) => task.bucket === "backlog").length,
    avgCompletionDays: average(Object.values(analytics?.completionStats || {}).map((item) => item.avgDays)),
  };

  const memberTaskCounts = analytics?.memberTaskCounts || {};
  const completionStats = analytics?.completionStats || {};
  const efficiency = analytics?.efficiency || {};
  const statusLeaders = analytics?.statusLeaders || { mostTodo: null, mostInProgress: null, mostBacklog: null };

  const memberNames = Array.from(new Set([...Object.keys(memberTaskCounts), ...Object.keys(completionStats), ...Object.keys(efficiency)])).sort();
  const memberMetrics = memberNames.map((member) => ({
    member,
    totalTasks: (memberTaskCounts[member]?.todo || 0) + (memberTaskCounts[member]?.inProgress || 0) + (memberTaskCounts[member]?.completed || 0) + (memberTaskCounts[member]?.backlog || 0),
    completedTasks: completionStats[member]?.completedCount || 0,
    avgDays: completionStats[member]?.avgDays ?? null,
    stdDevDays: completionStats[member]?.stdDevDays ?? null,
    efficiencyPercent: efficiency[member]?.efficiencyPercent ?? null,
  })).sort((a, b) => b.completedTasks - a.completedTasks || String(a.member).localeCompare(String(b.member)));

  const longestOpenTask = [...tasks]
    .filter((task) => task.bucket !== "completed")
    .map((task) => ({ ...task, daysOpen: diffInDays(task.startedAt || task.createdAt, new Date()) }))
    .sort((a, b) => (b.daysOpen || 0) - (a.daysOpen || 0))[0] || null;

  return {
    summary,
    tasks: [...tasks].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()),
    statusLeaders,
    memberMetrics,
    longestOpenTask,
  };
}

function handleSectionDrop(targetKey, draggedKey, setSectionOrder) {
  if (!draggedKey || draggedKey === targetKey) return;
  setSectionOrder((current) => {
    const next = [...current];
    const draggedIndex = next.indexOf(draggedKey);
    const targetIndex = next.indexOf(targetKey);
    if (draggedIndex === -1 || targetIndex === -1) return current;
    next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, draggedKey);
    return next;
  });
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function fmtDays(value) {
  return typeof value === "number" ? `${value.toFixed(1)} days` : "—";
}

function fmtPercent(value) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "—";
}

function teamCompletionRate(team) {
  return pct(team.completedCount, team.totalTasks);
}

function fmtTasksPerMember(tasks, members) {
  if (!members) return "0 tasks per member";
  return `${(tasks / members).toFixed(1)} tasks per member`;
}

function formatTaskDuration(task) {
  const end = task.completedAt || task.updatedAt || new Date().toISOString();
  const days = diffInDays(task.startedAt || task.createdAt, end);
  return typeof days === "number" ? `${days} day${days === 1 ? "" : "s"}` : "—";
}

function formatShortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatLeader(leader) {
  return leader ? `${leader.member} (${leader.count})` : "—";
}

function bestMemberLabel(memberMetrics) {
  if (!memberMetrics?.length) return "—";
  const sorted = [...memberMetrics].sort((a, b) => b.completedTasks - a.completedTasks || (a.efficiencyPercent ?? 999) - (b.efficiencyPercent ?? 999));
  const best = sorted[0];
  return `${best.member} · ${best.completedTasks} completed`;
}

function average(values) {
  const filtered = values.filter((value) => typeof value === "number");
  if (!filtered.length) return null;
  return filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
}

function diffInDays(from, to = new Date()) {
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function rateColor(value) {
  if (value >= 25) return "#12B76A";
  if (value >= 15) return "#F79009";
  return "#F04438";
}

function rateColorFromLabel(label) {
  const numeric = Number.parseFloat(String(label));
  if (Number.isNaN(numeric)) return "#F79009";
  return rateColor(numeric);
}

const surfaceSx = {
  borderRadius: 3,
  border: "1px solid rgba(15,23,42,0.08)",
  boxShadow: "none",
  backgroundColor: "#fff",
};

const iconBadgeSx = {
  width: 22,
  height: 22,
  borderRadius: 1.5,
  display: "grid",
  placeItems: "center",
  color: ORANGE,
  bgcolor: "rgba(247,144,9,0.12)",
};

const miniMetricSx = {
  borderRadius: 2,
  border: "1px solid rgba(15,23,42,0.08)",
  p: 1.2,
  bgcolor: "rgba(249,250,251,0.8)",
};
