import React, { useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  ButtonBase,
  Popover,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { listTeams } from "../api/teamsApi";
import { useAuth } from "../context/AuthContext";

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { user, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [teamQuery, setTeamQuery] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamsError, setTeamsError] = useState("");

  const dropdownOpen = Boolean(anchorEl);

  React.useEffect(() => {
    let isMounted = true;

    const loadTeams = async () => {
      try {
        const data = await listTeams();
        if (!isMounted) return;
        setTeams(Array.isArray(data) ? data : []);
        setTeamsError("");
      } catch (err) {
        if (!isMounted) return;
        setTeamsError(err?.message || "Unable to load teams");
      }
    };

    loadTeams();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeTeam = useMemo(() => {
    if (!teams.length) return null;
    if (!teamId) return teams[0];

    const numericTeamId = Number(teamId);
    if (Number.isNaN(numericTeamId)) return teams[0];
    return teams.find((team) => team.id === numericTeamId) || teams[0];
  }, [teamId, teams]);

  const filteredTeams = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    if (!q) return teams;

    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(q) ||
        String(team.classGroup?.name || "").toLowerCase().includes(q) ||
        String(team.id).includes(q)
    );
  }, [teamQuery, teams]);

  const handleOpenDropdown = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
    setTeamQuery("");
  };

  const handleSelectTeam = (team) => {
    navigate(`/teams/${team.id}`);
    handleCloseDropdown();
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const navBtnBase = {
    px: 2,
    py: 1.1,
    borderRadius: 2,
    textTransform: "none",
    fontWeight: 600,
    color: "text.primary",
    "&:hover": { bgcolor: "rgba(15,23,42,0.06)" },
  };

  const activeBtn = {
    bgcolor: "#F79009",
    color: "#FFFFFF",
    "&:hover": { bgcolor: "#DC6803" },
  };

  return (
    <Box>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#FFFFFF",
          color: "#0F172A",
          boxShadow: "none",
          borderBottom: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <Toolbar sx={{ height: 72, maxWidth: 1600, mx: "auto", px: { xs: 2, md: 3 } }}>
          {/* LEFT: Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 725 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: "#F79009",
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "#FFFFFF",
              }}
            >
              <BarChartRoundedIcon />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
                KABAS
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.25 }}>
                Kanban Board Assessment System
              </Typography>
            </Box>
          </Box>

          {/* CENTER: Searchable team dropdown */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Box>
              <ButtonBase
                onClick={handleOpenDropdown}
                sx={{
                  minWidth: 240,
                  height: 40,
                  px: 1.75,
                  borderRadius: 2,
                  border: "1px solid rgba(15,23,42,0.14)",
                  bgcolor: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                  "&:hover": {
                    borderColor: "rgba(15,23,42,0.22)",
                    bgcolor: "#FFFFFF",
                  },
                }}
              >
                <Typography
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {activeTeam?.name || "Select Team"}
                </Typography>

                <KeyboardArrowDownRoundedIcon
                  sx={{
                    color: "rgba(15,23,42,0.55)",
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.18s ease",
                  }}
                />
              </ButtonBase>

              <Popover
                open={dropdownOpen}
                anchorEl={anchorEl}
                onClose={handleCloseDropdown}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    width: 280,
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
                    border: "1px solid rgba(16,24,40,0.08)",
                  },
                }}
              >
                {/* Search bar */}
                <Box sx={{ p: 1.25, bgcolor: "#FBF7F2" }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search teams..."
                    value={teamQuery}
                    onChange={(e) => setTeamQuery(e.target.value)}
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: "rgba(16,24,40,0.45)" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.75,
                        bgcolor: "#fff",
                        fontSize: 13,
                      },
                    }}
                  />
                </Box>

                <Divider />

                {/* Team list */}
                <List disablePadding>
                  {filteredTeams.length > 0 ? (
                    filteredTeams.map((team) => {
                      const isSelected = activeTeam?.id === team.id;

                      return (
                        <ListItemButton
                          key={team.id}
                          onClick={() => handleSelectTeam(team)}
                          sx={{
                            px: 2,
                            py: 1.5,
                            bgcolor: isSelected ? "#F8F0E3" : "#fff",
                            "&:hover": {
                              bgcolor: isSelected ? "#F5E9D7" : "rgba(16,24,40,0.03)",
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 2,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: 13,
                                    color: "#101828",
                                  }}
                                >
                                  {team.name}
                                </Typography>

                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "rgba(16,24,40,0.45)",
                                  }}
                                >
                                  {team.classGroup?.name || "—"}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItemButton>
                      );
                    })
                  ) : (
                    <Box sx={{ px: 2, py: 2 }}>
                      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                        {teamsError || "No teams found."}
                      </Typography>
                    </Box>
                  )}
                </List>
              </Popover>
            </Box>
          </Box>

          {/* RIGHT: Nav + Profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Nav buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                component={Link}
                to="/all-teams"
                startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  ...navBtnBase,
                  ...(location.pathname === "/all-teams" ? activeBtn : null),
                }}
              >
                All Teams
              </Button>

              <Button
                component={Link}
                to="/team-credentials"
                startIcon={<SettingsOutlinedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  ...navBtnBase,
                  ...(location.pathname === "/team-credentials" ? activeBtn : null),
                }}
              >
                Team Credentials
              </Button>
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Profile block */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  p: 1,
                  bgcolor: "rgba(247,144,9,0.12)",
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <PersonOutlineRoundedIcon sx={{ fontSize: 18, color: "#F79009" }} />
              </Box>

              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                  {user?.name || "Instructor"}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {user?.email || ""}
                </Typography>
              </Box>

              <IconButton
                size="small"
                title="Logout"
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(15,23,42,0.06)" },
                }}
              >
                <LogoutRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content container */}
      <Box sx={{ maxWidth: 1575, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {children}
      </Box>
    </Box>
  );
}