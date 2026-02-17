import React from "react";
import { Card, CardContent, Box, Typography, LinearProgress, IconButton } from "@mui/material";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";

const iconFor = (key) => {
  if (key === "todo") return <ListAltRoundedIcon fontSize="small" />;
  if (key === "in_progress") return <RadioButtonCheckedRoundedIcon fontSize="small" />;
  if (key === "completed") return <CheckCircleRoundedIcon fontSize="small" />;
  return <Inventory2RoundedIcon fontSize="small" />;
};

export default function StatusCard({
  label,
  count,
  total,
  color,
  tint,
  onClick,
  iconKey,
  variant = "wide", // default to wide
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  const isWide = variant === "wide";

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 3,
        minHeight: isWide ? 132 : 110,
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 10px 22px rgba(16,24,40,0.10)",
          borderColor: "rgba(15,23,42,0.14)",
        },
      }}
    >
      <CardContent sx={{ p: isWide ? 2.75 : 2.25, height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: 34,
                fontWeight: 800,
                mt: 0.5,
                fontFamily: "JetBrains Mono, monospace",
                lineHeight: 1.05,
              }}
            >
              {count}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.4 }}>
              {pct}% of {total}
            </Typography>
          </Box>

          <IconButton
            size="small"
            sx={{
              bgcolor: tint,
              color,
              width: 36,
              height: 36,
              borderRadius: 2,
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
