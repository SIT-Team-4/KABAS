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

const ORANGE = "#F79009";

const navBtnBase = {
  fontWeight: 850,
  borderRadius: 999,
  px: 1.6,
  py: 0.85,
  textTransform: "none",
  lineHeight: 1
};

const navInactive = {
  color: "text.secondary",
  "&:hover": { backgroundColor: "rgba(15,23,42,0.04)", color: "text.primary" }
};

const navActive = {
  color: "text.primary",
  backgroundColor: "rgba(247,144,9,0.12)",
  border: "1px solid rgba(247,144,9,0.55)"
};

export default function AppShell({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "#FFFFFF",
          color: "text.primary",
          borderBottom: "1px solid rgba(15,23,42,0.08)",
          backgroundImage: "none",
        }}
      >
        <Toolbar sx={{ height: 72, gap: 2 }}>
          {/* Brand */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 280 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: ORANGE,
                display: "grid",
                placeItems: "center",
                color: "white"
              }}
            >
              <BarChartRoundedIcon />
            </Box>

            <Box sx={{ lineHeight: 1.1 }}>
              <Typography sx={{ fontWeight: 950, letterSpacing: "-0.02em" }}>KABAS</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Kanban Board Assessment System
              </Typography>
            </Box>
          </Box>

          {/* Team selector (center) */}
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Select
              size="small"
              value="Team Alpha"
              sx={{
                minWidth: 320,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(15,23,42,0.12)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(15,23,42,0.22)" }
              }}
            >
              <MenuItem value="Team Alpha">Team Alpha</MenuItem>
              <MenuItem value="Team Beta">Team Beta</MenuItem>
            </Select>
          </Box>

          {/* Nav */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Button
              component={NavLink}
              to="/all-teams"
              startIcon={<GroupOutlinedIcon />}
              sx={({ isActive }) => ({
                ...navBtnBase,
                ...(isActive ? navActive : navInactive)
              })}
            >
              All Teams
            </Button>

            <Button
              component={NavLink}
              to="/team-credentials"
              startIcon={<KeyOutlinedIcon />}
              sx={({ isActive }) => ({
                ...navBtnBase,
                ...(isActive ? navActive : navInactive)
              })}
            >
              Team Credentials
            </Button>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Profile */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.1,
              borderRadius: 2.5,
              px: 1.4,
              py: 0.9,
              border: "1px solid rgba(15,23,42,0.08)",
              bgcolor: "rgba(255,255,255,0.7)"
            }}
          >
            <Avatar sx={{ width: 34, height: 34, bgcolor: ORANGE }}>I</Avatar>
            <Box sx={{ lineHeight: 1.1 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 13 }}>Instructor</Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                instructor@google.com
              </Typography>
            </Box>
            <LogoutOutlinedIcon fontSize="small" />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page container */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 }, py: 4 }}>
        {children}
      </Box>
    </Box>
  );
}