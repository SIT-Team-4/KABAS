import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  IconButton,
} from "@mui/material";

import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const iconFor = (key) => {
  if (key === "todo") return <ListAltRoundedIcon fontSize="small" />;
  if (key === "in_progress") return <RadioButtonCheckedRoundedIcon fontSize="small" />;
  if (key === "completed") return <CheckCircleRoundedIcon fontSize="small" />;
  return <Inventory2RoundedIcon fontSize="small" />; // backlog
};

export default function StatusCard({
  label,                 // standardized label, e.g. "To-Do"
  count,                 // standardized bucket count
  total,
  color,
  tint,
  onClick,
  iconKey,               // "todo" | "in_progress" | "completed" | "backlog"
  variant = "wide",

  // NEW (backend-ready, optional):
  rawLabel,              // e.g. team uses "Ready", "Selected for Dev", etc.
  rawCount,              // count for that raw label (if backend provides)
  subtitle,              // optional override text line under count
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const isWide = variant === "wide";

  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={handleKeyDown}
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: 3,

        // Wide rectangle like your prototype
        minHeight: isWide ? 132 : 110,

        // Slight border for crispness (matches your modals/cards)
        border: "1px solid rgba(0,0,0,0.08)",

        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-1px)",
              boxShadow: "0 10px 22px rgba(16,24,40,0.10)",
              borderColor: "rgba(15,23,42,0.14)",
            }
          : undefined,
        "&:active": onClick
          ? {
              transform: "translateY(0px)",
              boxShadow: "0 8px 18px rgba(16,24,40,0.08)",
            }
          : undefined,
        "&:focus-visible": onClick
          ? {
              outline: "2px solid rgba(247,144,9,0.35)",
              outlineOffset: "2px",
            }
          : undefined,
      }}
    >
      <CardContent sx={{ p: isWide ? 2.75 : 2.25, height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box sx={{ minWidth: 0 }}>
            {/* Label */}
            <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
              {label}
            </Typography>

            {/* Optional raw label (team-specific naming) */}
            {rawLabel ? (
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                  opacity: 0.8,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {rawLabel}
                {typeof rawCount === "number" ? ` • ${rawCount}` : ""}
              </Typography>
            ) : null}

            {/* Count */}
            <Typography
              sx={{
                fontSize: 34,
                fontWeight: 800,
                mt: rawLabel ? 0.6 : 0.5,
                fontFamily: "JetBrains Mono, monospace",
                lineHeight: 1.05,
              }}
            >
              {count}
            </Typography>

            {/* Subtitle (defaults to % of total) */}
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.4 }}>
              {subtitle ?? `${pct}% of ${total}`}
            </Typography>
          </Box>

          {/* Icon block (same vibe as TaskDetails icon tiles) */}
          <IconButton
            disableRipple
            size="small"
            sx={{
              bgcolor: tint,
              color,
              width: 36,
              height: 36,
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.06)",
              "&:hover": { bgcolor: tint },
            }}
          >
            {iconFor(iconKey)}
          </IconButton>
        </Box>

        <Box sx={{ mt: isWide ? 2.2 : 1.6 }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 6,
              borderRadius: 999,
              backgroundColor: "rgba(15,23,42,0.08)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                backgroundColor: color,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}