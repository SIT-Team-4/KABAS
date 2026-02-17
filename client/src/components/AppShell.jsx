import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { Link, useLocation } from "react-router-dom";

export default function AppShell({ children }) {
  const location = useLocation();

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

          {/* CENTER: Team dropdown */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Select
              size="small"
              value="Team Alpha"
              IconComponent={KeyboardArrowDownRoundedIcon}
              sx={{
                minWidth: 240,
                borderRadius: 2,
                bgcolor: "#FFFFFF",
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  fontSize: 13,
                  py: 1,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(15,23,42,0.14)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(15,23,42,0.22)",
                },
              }}
            >
              <MenuItem value="Team Alpha">Team Alpha</MenuItem>
              <MenuItem value="Team Beta">Team Beta</MenuItem>
            </Select>
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

            {/* Divider like prototype (border-l) */}
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
                  Instructor
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  instructor@google.com
                </Typography>
              </Box>

              <IconButton
                size="small"
                title="Logout"
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

      {/* Content container (this is where your maxWidth lives) */}
      <Box sx={{ maxWidth: 1575, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {children}
      </Box>
    </Box>
  );
}
