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
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";

import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { listTeams } from "../api/teamsApi";
import { useAuth } from "../context/AuthContext";

export default function AppShell({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { user, logout } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [teamQuery, setTeamQuery] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamsError, setTeamsError] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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
    setMobileDrawerOpen(false);
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

  const mobileNavItems = [
    {
      label: "Dashboard",
      to: activeTeam ? `/teams/${activeTeam.id}` : "/teams",
      icon: <DashboardRoundedIcon sx={{ fontSize: 18 }} />,
      active: location.pathname.startsWith("/teams/"),
    },
    {
      label: "All Teams",
      to: "/all-teams",
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />,
      active: location.pathname === "/all-teams",
    },
    {
      label: "Team Credentials",
      to: "/team-credentials",
      icon: <SettingsOutlinedIcon sx={{ fontSize: 18 }} />,
      active: location.pathname === "/team-credentials",
    },
  ];

  const renderTeamSelector = (fullWidth = false) => (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <ButtonBase
        onClick={handleOpenDropdown}
        sx={{
          width: fullWidth ? "100%" : "auto",
          minWidth: fullWidth ? "100%" : 240,
          maxWidth: fullWidth ? "100%" : 280,
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
            display: "block",
            fontSize: 13,
            fontWeight: 700,
            color: "#0F172A",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            textAlign: "left",
          }}
        >
          {activeTeam?.name || "Select Team"}
        </Typography>

        <KeyboardArrowDownRoundedIcon
          sx={{
            color: "rgba(15,23,42,0.55)",
            transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.18s ease",
            flexShrink: 0,
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
            width: isMobile ? 320 : 280,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
            border: "1px solid rgba(16,24,40,0.08)",
          },
        }}
      >
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
  );

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
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 72 },
            maxWidth: 1600,
            mx: "auto",
            width: "100%",
            px: { xs: 1.5, sm: 2, md: 3 },
            gap: { xs: 1, md: 2 },
          }}
        >
          {/* LEFT: Logo */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: 0,
              flexShrink: 1,
            }}
          >
            <Box
              sx={{
                p: 1,
                bgcolor: "#F79009",
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <BarChartRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: 18, md: 20 }, fontWeight: 800, lineHeight: 1 }}>
                KABAS
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 11, md: 13 },
                  color: "text.secondary",
                  mt: 0.25,
                  display: { xs: "none", sm: "block" },
                }}
              >
                Kanban Board Assessment System
              </Typography>
            </Box>
          </Box>

          {/* DESKTOP: Team selector */}
          {!isMobile && (
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              {renderTeamSelector(false)}
            </Box>
          )}

          {/* DESKTOP: Nav + profile */}
          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
          )}

          {/* MOBILE: menu button */}
          {isMobile && (
            <Box sx={{ ml: "auto" }}>
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>

        {/* MOBILE: full width team selector row */}
        {isMobile && (
          <Box sx={{ px: 1.5, pb: 1.5 }}>
            {renderTeamSelector(true)}
          </Box>
        )}
      </AppBar>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            maxWidth: "85vw",
            p: 2,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "#FBF7F2",
            mb: 2,
          }}
        >
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

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "Instructor"}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email || ""}
            </Typography>
          </Box>
        </Box>

        <List disablePadding sx={{ display: "grid", gap: 1 }}>
          {mobileNavItems.map((item) => (
            <ListItemButton
              key={item.label}
              component={Link}
              to={item.to}
              onClick={() => setMobileDrawerOpen(false)}
              sx={{
                borderRadius: 2,
                ...(item.active
                  ? {
                      bgcolor: "#F79009",
                      color: "#fff",
                      "&:hover": { bgcolor: "#DC6803" },
                    }
                  : {
                      "&:hover": { bgcolor: "rgba(15,23,42,0.06)" },
                    }),
              }}
            >
              <Box sx={{ mr: 1.5, display: "flex", alignItems: "center" }}>
                {item.icon}
              </Box>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Button
          onClick={handleLogout}
          startIcon={<LogoutRoundedIcon />}
          sx={{
            ...navBtnBase,
            width: "100%",
            justifyContent: "flex-start",
          }}
        >
          Logout
        </Button>
      </Drawer>

      {/* Content container */}
      <Box sx={{ maxWidth: 1575, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {children}
      </Box>
    </Box>
  );
}