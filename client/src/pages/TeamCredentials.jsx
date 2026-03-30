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
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { createTeam, deleteTeam, listTeams, updateTeam } from "../api/teamsApi";
import {
  createTeamCredential,
  deleteTeamCredential,
  getTeamCredentials,
  updateTeamCredential,
} from "../api/teamCredentialsApi";

const ORANGE = "#F79009";
const mono = "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "rgba(15,23,42,0.10)" },
    "&:hover fieldset": { borderColor: "rgba(15,23,42,0.20)" },
    "&.Mui-focused fieldset": { borderColor: ORANGE },
  },
};

const emptyForm = {
  teamName: "",
  platform: "GitHub",
  repo: "",
  token: "",
  email: "",
};

const toProvider = (platform) => (platform === "Jira" ? "jira" : "github");
const toPlatform = (provider) => (provider === "jira" ? "Jira" : "GitHub");

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

export default function TeamCredentials() {
  const [teams, setTeams] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  React.useEffect(() => {
    refreshTeams();
  }, []);

  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    return teams.filter((team) => {
      const matchesQuery =
        !q
        || team.name.toLowerCase().includes(q)
        || team.platform.toLowerCase().includes(q)
        || team.repo.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "All Status" ? true : team.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [teams, query, statusFilter]);

  async function refreshTeams() {
    setIsLoading(true);
    setError("");
    try {
      const rawTeams = await listTeams();
      const teamIds = rawTeams.map((team) => team.id);
      const credentials = await getTeamCredentials(teamIds);
      const credentialByTeamId = new Map(
        credentials.map((credential) => [credential.teamId, credential])
      );

      const mapped = rawTeams.map((team) => {
        const credential = credentialByTeamId.get(team.id);
        if (!credential) {
          return {
            id: team.id,
            name: team.name,
            platform: "GitHub",
            repo: "",
            email: "",
            hasToken: false,
            status: "Not Configured",
          };
        }

        return {
          id: team.id,
          name: team.name,
          platform: toPlatform(credential.provider),
          repo: credential.baseUrl || "",
          email: credential.email || "",
          hasToken: !!credential.hasApiToken,
          status: "Connected",
        };
      });

      setTeams(mapped);
    } catch (err) {
      setError(err?.message || "Unable to load teams and credentials");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddTeam() {
    if (!addForm.teamName.trim() || !addForm.repo.trim() || !addForm.token.trim()) return;

    let createdTeam = null;
    try {
      createdTeam = await createTeam({ name: addForm.teamName.trim() });
      await createTeamCredential(createdTeam.id, {
        provider: toProvider(addForm.platform),
        baseUrl: addForm.repo.trim(),
        email: addForm.platform === "Jira" ? addForm.email.trim() : null,
        apiToken: addForm.token.trim(),
      });

      setOpenAdd(false);
      setAddForm(emptyForm);
      refreshTeams();
    } catch (err) {
      if (createdTeam) {
        await deleteTeam(createdTeam.id).catch(() => undefined);
      }
      setError(err?.message || "Unable to create team credential");
    }
  }

  async function handleDeleteTeam(id) {
    try {
      await deleteTeamCredential(id).catch(() => undefined);
      await deleteTeam(id);
      refreshTeams();
    } catch (err) {
      setError(err?.message || "Unable to delete team");
    }
  }

  function handleOpenEdit(team) {
    setEditTeam(team);
    setEditForm({
      teamName: team.name,
      platform: team.platform,
      repo: team.repo,
      token: "",
      email: team.email || "",
    });
    setOpenEdit(true);
  }

  async function handleUpdateTeam() {
    if (!editTeam) return;
    if (!editForm.teamName.trim() || !editForm.repo.trim()) return;
    if (editTeam.status !== "Connected" && !editForm.token.trim()) {
      setError("A token is required to configure credentials for this team");
      return;
    }

    try {
      const payload = {
        provider: toProvider(editForm.platform),
        baseUrl: editForm.repo.trim(),
        email: editForm.platform === "Jira" ? editForm.email.trim() : null,
      };
      if (editForm.token.trim()) {
        payload.apiToken = editForm.token.trim();
      }

      await updateTeam(editTeam.id, { name: editForm.teamName.trim() });

      if (editTeam.status === "Connected") {
        await updateTeamCredential(editTeam.id, payload);
      } else {
        await createTeamCredential(editTeam.id, { ...payload, apiToken: payload.apiToken });
      }

      setOpenEdit(false);
      setEditTeam(null);
      setEditForm(emptyForm);
      refreshTeams();
    } catch (err) {
      setError(err?.message || "Unable to update team");
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 520 }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

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
          onClick={() => setOpenAdd(true)}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            px: 2.2,
            py: 1.05,
            bgcolor: ORANGE,
            boxShadow: "none",
            "&:hover": { bgcolor: "#E07F07", boxShadow: "none" },
          }}
        >
          Add Team
        </Button>
      </Box>

      <Divider sx={{ mt: 2.4, mb: 2.6, borderColor: "rgba(15,23,42,0.06)" }} />

      <Box
        sx={{
          border: "1px solid rgba(15,23,42,0.06)",
          borderRadius: 3,
          bgcolor: "#fff",
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
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
            ),
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
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(15,23,42,0.20)" },
          }}
        >
          <MenuItem value="All Status">All Status</MenuItem>
          <MenuItem value="Connected">Connected</MenuItem>
          <MenuItem value="Not Configured">Not Configured</MenuItem>
        </Select>
      </Box>

      <Card sx={{ mt: 3, borderRadius: 3, border: "1px solid rgba(15,23,42,0.06)", boxShadow: "none" }}>
        <CardContent sx={{ py: 2.4 }}>
          <Typography sx={{ fontWeight: 900, fontFamily: mono }}>Connected Teams</Typography>
          <Typography sx={{ mt: 0.9, color: "text.secondary" }}>
            Showing {filteredTeams.length} of {teams.length} teams
          </Typography>
        </CardContent>
      </Card>

      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.6 }}>
        {filteredTeams.map((team) => (
          <Card key={team.id} sx={{ borderRadius: 3, border: "1px solid rgba(15,23,42,0.06)", boxShadow: "none" }}>
            <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2.2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 3,
                    bgcolor: "rgba(247,144,9,0.12)",
                    color: ORANGE,
                    fontWeight: 900,
                    fontFamily: mono,
                  }}
                >
                  {initials(team.name)}
                </Avatar>

                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 900, fontFamily: mono }}>{team.name}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: 99, bgcolor: platformDotColor(team.platform) }} />
                      <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{team.platform}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.55 }}>
                    <LinkRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography sx={{ color: "text.secondary", fontFamily: mono, fontSize: 13 }}>
                      {team.repo || "Credential not configured"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <IconButton size="small" onClick={() => handleOpenEdit(team)}>
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteTeam(team.id)}>
                  <DeleteOutlineOutlinedIcon sx={{ color: "#F04438" }} />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          bgcolor: "rgba(18,183,106,0.10)",
          border: "1px solid rgba(18,183,106,0.20)",
          boxShadow: "none",
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
            Credential tokens are encrypted at rest on the server. Only a token-presence flag is returned to the UI.
          </Typography>
        </CardContent>
      </Card>

      <CredentialDialog
        open={openAdd}
        title="Add New Team"
        form={addForm}
        setForm={setAddForm}
        onClose={() => setOpenAdd(false)}
        onSubmit={handleAddTeam}
        submitLabel="Add Team"
        requireToken
      />

      <CredentialDialog
        open={openEdit}
        title="Edit Team"
        form={editForm}
        setForm={setEditForm}
        onClose={() => {
          setOpenEdit(false);
          setEditTeam(null);
        }}
        onSubmit={handleUpdateTeam}
        submitLabel="Update"
        requireToken={editTeam?.status !== "Connected"}
      />
    </Box>
  );
}

function CredentialDialog({ open, title, form, setForm, onClose, onSubmit, submitLabel, requireToken = false }) {
  const isJira = form.platform === "Jira";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 900, fontFamily: mono }}>
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Stack spacing={2.2}>
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>Team Name</Typography>
            <TextField
              fullWidth
              value={form.teamName}
              onChange={(e) => setForm((prev) => ({ ...prev, teamName: e.target.value }))}
              sx={inputSx}
            />
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>Platform</Typography>
            <RadioGroup
              row
              value={form.platform}
              onChange={(e) => setForm((prev) => ({ ...prev, platform: e.target.value }))}
              sx={{ gap: 2 }}
            >
              <FormControlLabel value="GitHub" control={<Radio />} label="GitHub" />
              <FormControlLabel value="Jira" control={<Radio />} label="Jira" />
            </RadioGroup>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>
              {isJira ? "Jira Base URL" : "GitHub Repository URL"}
            </Typography>
            <TextField
              fullWidth
              placeholder={isJira ? "https://company.atlassian.net/projects/TEAM" : "https://github.com/owner/repo"}
              value={form.repo}
              onChange={(e) => setForm((prev) => ({ ...prev, repo: e.target.value }))}
              sx={inputSx}
            />
          </Box>

          {isJira ? (
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>Jira Account Email</Typography>
              <TextField
                fullWidth
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                sx={inputSx}
              />
            </Box>
          ) : null}

          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.8, fontFamily: mono }}>
              {isJira ? "Jira API Token" : "GitHub Personal Access Token"}
            </Typography>
            <TextField
              fullWidth
              type="password"
              value={form.token}
              onChange={(e) => setForm((prev) => ({ ...prev, token: e.target.value }))}
              sx={inputSx}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.2, pt: 1.6, gap: 1.2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            px: 2.2,
            py: 1.0,
            borderColor: "rgba(15,23,42,0.18)",
            color: "text.primary",
            "&:hover": { borderColor: "rgba(15,23,42,0.35)" },
          }}
          fullWidth
        >
          Cancel
        </Button>

        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={!form.teamName.trim() || !form.repo.trim() || (requireToken && !form.token.trim())}
          sx={{
            textTransform: "none",
            fontWeight: 900,
            borderRadius: 2,
            px: 2.2,
            py: 1.0,
            bgcolor: ORANGE,
            boxShadow: "none",
            "&:hover": { bgcolor: "#E07F07", boxShadow: "none" },
          }}
          fullWidth
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
