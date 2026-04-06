import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
} from "@mui/material";

import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import DashboardCustomizeRoundedIcon from "@mui/icons-material/DashboardCustomizeRounded";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination = location.state?.from?.pathname || "/all-teams";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await login({ email: email.trim(), password, rememberMe });
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const featureItems = [
    {
      icon: <PersonOutlineRoundedIcon sx={{ fontSize: 18, color: "#F79009" }} />,
      title: "Team Analytics",
      desc: "Track individual and team performance metrics",
    },
    {
      icon: <AccountTreeRoundedIcon sx={{ fontSize: 18, color: "#F79009" }} />,
      title: "GitHub Integration",
      desc: "Monitor commits, PRs, and code contributions",
    },
    {
      icon: <TrendingUpRoundedIcon sx={{ fontSize: 18, color: "#F79009" }} />,
      title: "Jira Insights",
      desc: "View task progress and sprint velocity",
    },
    {
      icon: <DashboardCustomizeRoundedIcon sx={{ fontSize: 18, color: "#F79009" }} />,
      title: "Bird's Eye View",
      desc: "Overview of all teams at a glance",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FBF7F2",
        px: { xs: 3, md: 5 },
        py: 4,
      }}
    >
      {/* Top branding */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 5, md: 10 } }}>
        <Box
          sx={{
            p: 1,
            bgcolor: "#F79009",
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            color: "#fff",
          }}
        >
          <BarChartRoundedIcon />
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            KABAS
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
            Kanban Board Assessment System
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1700,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.9fr" },
          gap: { xs: 5, md: 10 },
          alignItems: "center",
          minHeight: { md: "78vh" },
        }}
      >
        {/* Left content */}
        <Box sx={{ maxWidth: 620 }}>
          <Typography
            sx={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: { xs: 34, md: 52 },
              lineHeight: 1.05,
              fontWeight: 800,
              color: "#0F172A",
              whiteSpace: "pre-line",
            }}
          >
            {"Assess student teams with\nconfidence"}
          </Typography>

          <Typography
            sx={{
              mt: 3,
              fontSize: 16,
              color: "text.secondary",
              maxWidth: 560,
              lineHeight: 1.65,
            }}
          >
            Monitor software engineering projects through GitHub and Jira integration,
            providing actionable insights for instructors.
          </Typography>

          <Box sx={{ mt: 6, display: "grid", gap: 3 }}>
            {featureItems.map((item) => (
              <Box
                key={item.title}
                sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    bgcolor: "rgba(247,144,9,0.12)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 800,
                      fontSize: 16,
                      color: "#0F172A",
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ mt: 0.4, color: "text.secondary", fontSize: 14 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right login card */}
        <Box sx={{ display: "flex", justifyContent: { xs: "stretch", md: "center" } }}>
          <Box sx={{ width: "100%", maxWidth: 430 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(15,23,42,0.08)",
                boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
                p: 3.5,
                bgcolor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#0F172A",
                }}
              >
                Welcome back
              </Typography>

              <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
                Sign in to access your instructor dashboard
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: "grid", gap: 2 }}>
                {error ? (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error}
                  </Alert>
                ) : null}

                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 0.8 }}>
                    Email address
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="instructor@university.edu"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        bgcolor: "#fff",
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box
                    sx={{
                      mb: 0.8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                      Password
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#F79009",
                        cursor: "pointer",
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter your password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    InputProps={{
                      sx: {
                        borderRadius: 2,
                        bgcolor: "#fff",
                      },
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{
                        color: "rgba(15,23,42,0.28)",
                        "&.Mui-checked": { color: "#F79009" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Remember me for 30 days
                    </Typography>
                  }
                  sx={{ mt: -0.5 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting || !email.trim() || !password}
                  sx={{
                    mt: 0.5,
                    py: 1.35,
                    borderRadius: 2,
                    bgcolor: "#F79009",
                    color: "#fff",
                    textTransform: "none",
                    fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 800,
                    fontSize: 16,
                    "&:hover": {
                      bgcolor: "#DC6803",
                    },
                  }}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </Box>
              
              <Typography
                sx={{
                  mt: 3,
                  textAlign: "center",
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Don't have an account?{" "}
                <Box
                  component="span"
                  sx={{ color: "#F79009", fontWeight: 700, cursor: "pointer" }}
                >
                  Contact your administrator
                </Box>
              </Typography>
            </Paper>

            <Typography
              sx={{
                mt: 2.5,
                textAlign: "center",
                fontSize: 12.5,
                color: "text.secondary",
              }}
            >
              By signing in, you agree to our{" "}
              <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }}>
                Terms of Service
              </Box>{" "}
              and{" "}
              <Box component="span" sx={{ textDecoration: "underline", cursor: "pointer" }}>
                Privacy Policy
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
