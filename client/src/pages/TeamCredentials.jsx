import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  FormControl,
  InputLabel
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

// Initial teams (mock). Later you’ll replace this with DB/API data.
const INITIAL_TEAMS = [
  { id: "alpha", name: "Team Alpha", platform: "GitHub", board: "alpha-team/project-x", status: "Connected" },
  { id: "beta", name: "Team Beta", platform: "Jira", board: "beta-team.atlassian.net", status: "Connected" },
  { id: "gamma", name: "Team Gamma", platform: "GitHub", board: "gamma-team/project-y", status: "Connected" }
];

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function platformChipSx(platform) {
  return {
    fontWeight: 800,
    borderRadius: 2,
    bgcolor: platform === "GitHub" ? "rgba(18,183,106,0.12)" : "rgba(46,144,250,0.12)",
    color: "text.primary"
  };
}

export default function TeamCredentials() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Add Team modal state
  const [openAdd, setOpenAdd] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newPlatform, setNewPlatform] = useState("GitHub");
  const [newBoard, setNewBoard] = useState("");

  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      const matchesQuery =
        q.length === 0 ||
        t.name.toLowerCase().includes(q) ||
        t.board.toLowerCase().includes(q) ||
        t.platform.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All Status" ? true : t.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [teams, query, statusFilter]);

  function handleDelete(teamId) {
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }

  function handleAddTeam() {
    const name = newTeamName.trim();
    const board = newBoard.trim();
    if (!name || !board) return;

    const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    setTeams((prev) => [
      ...prev,
      {
        id,
        name,
        platform: newPlatform,
        board,
        status: "Connected"
      }
    ]);

    // reset + close
    setNewTeamName("");
    setNewBoard("");
    setNewPlatform("GitHub");
    setOpenAdd(false);
  }

  return (
    <Box sx={{ minHeight: 500 }}>
      {/* Title Row */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 34, fontWeight: 900, fontFamily: "JetBrains Mono, monospace" }}>
            Team Credentials
          </Typography>
          <Typography sx={{ mt: 0.75, color: "text.secondary" }}>
            Manage GitHub and Jira access for student teams
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 800,
            px: 2,
            py: 1.1,
            bgcolor: "#F79009",
            "&:hover": { bgcolor: "#E07F07" }
          }}
          onClick={() => setOpenAdd(true)}
        >
          Add Team
        </Button>
      </Box>

      {/* Search + Filter */}
      <Box sx={{ mt: 3, display: "flex", gap: 1.5, alignItems: "center" }}>
        <TextField
          fullWidth
          placeholder="Search teams..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterAltOutlinedIcon color="action" />
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="All Status">All Status</MenuItem>
            <MenuItem value="Connected">Connected</MenuItem>
            <MenuItem value="Invalid">Invalid</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Connected Teams header card (with counts) */}
      <Card sx={{ mt: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography sx={{ fontWeight: 900, fontFamily: "JetBrains Mono, monospace" }}>
            Connected Teams
          </Typography>
          <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
            Showing {filteredTeams.length} of {teams.length} teams
          </Typography>
        </CardContent>
      </Card>

      {/* Team cards list */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filteredTeams.map((t) => (
          <Card key={t.id} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: "rgba(247,144,9,0.15)",
                    color: "#F79009",
                    fontWeight: 900
                  }}
                >
                  {initials(t.name)}
                </Avatar>

                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontFamily: "JetBrains Mono, monospace" }}>
                      {t.name}
                    </Typography>

                    <Chip size="small" label={t.platform} sx={platformChipSx(t.platform)} />
                  </Box>

                  <Typography sx={{ mt: 0.25, color: "text.secondary" }}>{t.board}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton onClick={() => alert("Edit modal can be added next")}>
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(t.id)}>
                  <DeleteOutlineOutlinedIcon color="error" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}

        {filteredTeams.length === 0 && (
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography sx={{ fontWeight: 800 }}>No teams found</Typography>
              <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
                Try clearing the search or changing the status filter.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Footer note */}
      <Card sx={{ mt: 3, borderRadius: 3, bgcolor: "rgba(18,183,106,0.10)" }}>
        <CardContent>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <VerifiedUserOutlinedIcon color="success" />
            <Typography sx={{ fontWeight: 900 }}>Credentials are stored securely</Typography>
          </Stack>
          <Divider sx={{ my: 1.2 }} />
          <Typography sx={{ color: "text.secondary" }}>
            All API keys and tokens are encrypted and stored persistently. They will be available across sessions and can
            be updated or removed at any time.
          </Typography>
        </CardContent>
      </Card>

      {/* Add Team Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 900 }}>Add Team</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.0} sx={{ mt: 1 }}>
            <TextField
              label="Team Name"
              placeholder="e.g., Team Delta"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Platform</InputLabel>
              <Select
                label="Platform"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
              >
                <MenuItem value="GitHub">GitHub</MenuItem>
                <MenuItem value="Jira">Jira</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={newPlatform === "GitHub" ? "GitHub Project (org/repo or project)" : "Jira Site / Board"}
              placeholder={newPlatform === "GitHub" ? "alpha-team/project-x" : "beta-team.atlassian.net"}
              value={newBoard}
              onChange={(e) => setNewBoard(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAdd(false)} sx={{ textTransform: "none", fontWeight: 800 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddTeam}
            disabled={!newTeamName.trim() || !newBoard.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              bgcolor: "#F79009",
              "&:hover": { bgcolor: "#E07F07" }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}