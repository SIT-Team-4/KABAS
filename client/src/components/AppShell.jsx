import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  Avatar,
  Divider
} from "@mui/material";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

import { NavLink } from "react-router-dom";

const navBaseSx = {
  fontWeight: 700,
  borderRadius: 2,
  px: 1.5,
  py: 0.9,
  textTransform: "none"
};

const navInactiveSx = {
  color: "text.secondary",
  "&:hover": {
    backgroundColor: "rgba(15,23,42,0.04)",
    color: "text.primary"
  }
};

const navActiveSx = {
  color: "text.primary",
  border: "1px solid rgba(247,144,9,0.9)", // orange outline
  backgroundColor: "rgba(247,144,9,0.10)"  // light orange fill
};

export default function AppShell({ children }) {
  return (
    <Box>
      <AppBar position="sticky">
        <Toolbar sx={{ gap: 2, height: 72 }}>
          {/* Logo + Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 260 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "#F79009",
                display: "grid",
                placeItems: "center",
                color: "white"
              }}
            >
              <BarChartRoundedIcon />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, letterSpacing: "0.04em" }}>
                KABAS
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.1 }}>
                Kanban Board Assessment System
              </Typography>
            </Box>
          </Box>

          {/* Team Selector (static for now) */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Select
              size="small"
              value="Team Alpha"
              sx={{
                minWidth: 260,
                bgcolor: "#FFFFFF",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(15,23,42,0.10)"
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(15,23,42,0.18)"
                }
              }}
            >
              <MenuItem value="Team Alpha">Team Alpha</MenuItem>
              <MenuItem value="Team Beta">Team Beta</MenuItem>
            </Select>
          </Box>

          {/* Nav Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Button
              component={NavLink}
              to="/all-teams"
              startIcon={<GroupOutlinedIcon />}
              sx={({ isActive }) => ({
                ...navBaseSx,
                ...(isActive ? navActiveSx : navInactiveSx)
              })}
            >
              All Teams
            </Button>

            <Button
              component={NavLink}
              to="/team-credentials"
              startIcon={<KeyOutlinedIcon />}
              sx={({ isActive }) => ({
                ...navBaseSx,
                ...(isActive ? navActiveSx : navInactiveSx)
              })}
            >
              Team Credentials
            </Button>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* User Profile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              bgcolor: "rgba(247,144,9,0.10)",
              borderRadius: 2,
              px: 1.5,
              py: 1
            }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: "#F79009" }}>I</Avatar>
            <Box sx={{ lineHeight: 1.15 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Instructor</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                instructor@google.com
              </Typography>
            </Box>
            <LogoutOutlinedIcon fontSize="small" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {children}
      </Box>
    </Box>
  );
}