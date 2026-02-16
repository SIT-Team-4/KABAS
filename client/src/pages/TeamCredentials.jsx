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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const ORANGE = "#F79009";

const INITIAL_TEAMS = [
  {
    id: "alpha",
    name: "Team Alpha",
    platform: "GitHub",
    repo: "alpha-team/project-x",
    token: "ghp_xxxxxxxxxxxx",
    status: "Connected"
  },
  {
    id: "beta",
    name: "Team Beta",
    platform: "Jira",
    repo: "beta-team.atlassian.net",
    token: "xxxxxxxxxxxx",
    status: "Connected"
  },
  {
    id: "gamma",
    name: "Team Gamma",
    platform: "GitHub",
    repo: "gamma-team/project-y",
    token: "ghp_xxxxxxxxxxxx",
    status: "Connected"
  }
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

function platformDotColor(platform) {
  return platform === "GitHub" ? "#12B76A" : "#2E90FA";
}

const mono = "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "rgba(15,23,42,0.10)" },
    "&:hover fieldset": { borderColor: "rgba(15,23,42,0.20)" },
    "&.Mui-focused fieldset": { borderColor: ORANGE }
  }
};

export default function TeamCredentials() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // ADD modal state
  const [openAdd, setOpenAdd] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [platform, setPlatform] = useState("GitHub");
  const [repo, setRepo] = useState("");
  const [token, setToken] = useState("");

  // EDIT modal state
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editPlatform, setEditPlatform] = useState("GitHub");
  const [editRepo, setEditRepo] = useState("");
  const [editToken, setEditToken] = useState("");

  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.platform.toLowerCase().includes(q) ||
        t.repo.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "All Status" ? true : t.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [teams, query, statusFilter]);

  function resetAddForm() {
    setTeamName("");
    setPlatform("GitHub");
    setRepo("");
    setToken("");
  }

  function handleOpenAdd() {
    resetAddForm();
    setOpenAdd(true);
  }

  function handleCloseAdd() {
    setOpenAdd(false);
  }

  function handleAddTeam() {
    const name = teamName.trim();
    const repoVal = repo.trim();
    if (!name || !repoVal) return;

    setTeams((prev) => [
      ...prev,
      {
        id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
        name,
        platform,
        repo: repoVal,
        token: token.trim(),
        status: "Connected"
      }
    ]);

    setOpenAdd(false);
    resetAddForm();
  }

  function handleDelete(id) {
    setTeams((prev) => prev.filter((t) => t.id !== id));
  }

  function handleOpenEdit(team) {
    setEditingId(team.id);
    setEditTeamName(team.name);
    setEditPlatform(team.platform);
    setEditRepo(team.repo);
    setEditToken(team.token || "");
    setOpenEdit(true);
  }

  function handleCloseEdit() {
    setOpenEdit(false);
    setEditingId(null);
  }

  function handleUpdateTeam() {
    if (!editingId) return;

    const name = editTeamName.trim();
    const repoVal = editRepo.trim();
    if (!name || !repoVal) return;

    setTeams((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? { ...t, name, platform: editPlatform, repo: repoVal, token: editToken.trim() }
          : t
      )
    );

    handleCloseEdit();
  }

  return (
    <Box sx={{ minHeight: 520 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 34, fontWeight: 900, fontFamily: mono }}>
            Team Credentials
          </Typography>
          <Typography sx={{ mt: 0.75, color: "text.secondary" }}>
            Manage GitHub and Jira access for student teams
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleOpenAdd}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            px: 2.2,
            py: 1.05,
            bgcolor: ORANGE,
            boxShadow: "none",
            "&:hover": { bgcolor: "#E07F07", boxShadow: "none" }
          }}
        >
          Add Team
        </Button>
      </Box>

      {/* thin divider under header like screenshot */}
      <Divider sx={{ mt: 2.4, mb: 2.6, borderColor: "rgba(15,23,42,0.06)" }} />

      {/* Search + Filter row (inside a box like screenshot) */}
      <Box
        sx={{
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: 3,
          bgcolor: "#fff",
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2
        }}
      >
        <TextField
          fullWidth
          placeholder="Search teams..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={inputSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon color="action" />
              </InputAdornment>
            )
          }}
        />

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{
            minWidth: 170,
            borderRadius: 2,
            bgcolor: "#fff",
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(15,23,42,0.10)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(15,23,42,0.20)" }
          }}
        >
          <MenuItem value="All Status">All Status</MenuItem>
          <MenuItem value="Connected">Connected</MenuItem>
          <MenuItem value="Invalid">Invalid</MenuItem>
          <MenuItem value="Expired">Expired</MenuItem>
        </Select>
      </Box>

      {/* Connected Teams summary card */}
      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          border: "1px solid rgba(15,23,42,0.06)",
          boxShadow: "none"
        }}
      >
        <CardContent sx={{ py: 2.4 }}>
          <Typography sx={{ fontWeight: 900, fontFamily: mono }}>
            Connected Teams
          </Typography>
          <Typography sx={{ mt: 0.9, color: "text.secondary" }}>
            Showing {filteredTeams.length} of {teams.length} teams
          </Typography>
        </CardContent>
      </Card>

      {/* Team list */}
      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.6 }}>
        {filteredTeams.map((t) => (
          <Card
            key={t.id}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(15,23,42,0.06)",
              boxShadow: "none"
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 2.2
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: "rgba(247,144,9,0.12)",
                    color: ORANGE,
                    fontWeight: 900,
                    fontFamily: mono
                  }}
                >
                  {initials(t.name)}
                </Avatar>

                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontFamily: mono }}>
                      {t.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: 99,
                          bgcolor: platformDotColor(t.platform)
                        }}
                      />
                      <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                        {t.platform}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.55 }}>
                    <LinkRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography sx={{ color: "text.secondary", fontFamily: mono, fontSize: 13 }}>
                      {t.repo}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" onClick={() => handleOpenEdit(t)}>
                  <EditOutlinedIcon />
                </IconButton>

                <IconButton size="small" onClick={() => handleDelete(t.id)}>
                  <DeleteOutlineOutlinedIcon sx={{ color: "#F04438" }} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Secure info box */}
      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          bgcolor: "rgba(18,183,106,0.10)",
          border: "1px solid rgba(18,183,106,0.20)",
          boxShadow: "none"
        }}
      >
        <CardContent sx={{ py: 2.2 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <CheckCircleRoundedIcon sx={{ color: "#12B76A" }} />
            <Typography sx={{ fontWeight: 900, fontFamily: mono }}>
              Credentials are stored securely
            </Typography>
          </Stack>
          <Typography sx={{ mt: 0.9, color: "rgba(15,23,42,0.70)", fontFamily: mono, fontSize: 13 }}>
            All API keys and tokens are encrypted and stored persistently. They will be available across sessions and can
            be updated or removed at any time.
          </Typography>
        </CardContent>
      </Card>

      {/* ADD modal */}
      <Dialog open={openAdd} onClose={handleCloseAdd} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 900, fontFamily: mono }}>
          Add New Team
          <IconButton onClick={handleCloseAdd} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2.2}>
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>Team Name</Typography>
              <TextField
                fullWidth
                placeholder="e.g., Team Alpha"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                sx={inputSx}
              />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>Platform</Typography>
              <RadioGroup row value={platform} onChange={(e) => setPlatform(e.target.value)} sx={{ gap: 2 }}>
                <FormControlLabel value="GitHub" control={<Radio />} label="GitHub" />
                <FormControlLabel value="Jira" control={<Radio />} label="Jira" />
              </RadioGroup>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>
                {platform === "GitHub" ? "GitHub Repository" : "Jira Site / Board"}
              </Typography>
              <TextField
                fullWidth
                placeholder={platform === "GitHub" ? "owner/repo" : "your-team.atlassian.net"}
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                sx={inputSx}
              />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>
                {platform === "GitHub" ? "GitHub Personal Access Token" : "Jira API Token"}
              </Typography>
              <TextField
                fullWidth
                placeholder={platform === "GitHub" ? "ghp_xxxxxxxxxxxx" : "xxxxxxxxxxxx"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                sx={inputSx}
                type="password"
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.2, pt: 1.6, gap: 1.2 }}>
          <Button
            onClick={handleCloseAdd}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              px: 2.2,
              py: 1.0,
              borderColor: "rgba(15,23,42,0.18)",
              color: "text.primary",
              "&:hover": { borderColor: "rgba(15,23,42,0.35)" }
            }}
            fullWidth
          >
            Cancel
          </Button>

          <Button
            onClick={handleAddTeam}
            variant="contained"
            disabled={!teamName.trim() || !repo.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              px: 2.2,
              py: 1.0,
              bgcolor: ORANGE,
              boxShadow: "none",
              "&:hover": { bgcolor: "#E07F07", boxShadow: "none" }
            }}
            fullWidth
          >
            Add Team
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT modal */}
      <Dialog open={openEdit} onClose={handleCloseEdit} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 900, fontFamily: mono }}>
          Edit Team
          <IconButton onClick={handleCloseEdit} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <Stack spacing={2.2}>
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>Team Name</Typography>
              <TextField fullWidth value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} sx={inputSx} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>Platform</Typography>
              <RadioGroup row value={editPlatform} onChange={(e) => setEditPlatform(e.target.value)} sx={{ gap: 2 }}>
                <FormControlLabel value="GitHub" control={<Radio />} label="GitHub" />
                <FormControlLabel value="Jira" control={<Radio />} label="Jira" />
              </RadioGroup>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>
                {editPlatform === "GitHub" ? "GitHub Repository" : "Jira Site / Board"}
              </Typography>
              <TextField fullWidth value={editRepo} onChange={(e) => setEditRepo(e.target.value)} sx={inputSx} />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>
                {editPlatform === "GitHub" ? "GitHub Personal Access Token" : "Jira API Token"}
              </Typography>
              <TextField fullWidth type="password" value={editToken} onChange={(e) => setEditToken(e.target.value)} sx={inputSx} />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.2, pt: 1.6, gap: 1.2 }}>
          <Button
            onClick={handleCloseEdit}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              px: 2.2,
              py: 1.0,
              borderColor: "rgba(15,23,42,0.18)",
              color: "text.primary",
              "&:hover": { borderColor: "rgba(15,23,42,0.35)" }
            }}
            fullWidth
          >
            Cancel
          </Button>

          <Button
            onClick={handleUpdateTeam}
            variant="contained"
            disabled={!editTeamName.trim() || !editRepo.trim()}
            sx={{
              textTransform: "none",
              fontWeight: 900,
              borderRadius: 2,
              px: 2.2,
              py: 1.0,
              bgcolor: ORANGE,
              boxShadow: "none",
              "&:hover": { bgcolor: "#E07F07", boxShadow: "none" }
            }}
            fullWidth
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}