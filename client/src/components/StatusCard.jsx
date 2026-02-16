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

export default function StatusCard({ label, count, total, color, tint, onClick, iconKey }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 2.5,
        transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
        "&:hover": { transform: "translateY(-1px)", boxShadow: "0 8px 18px rgba(16,24,40,0.08)", borderColor: "rgba(15,23,42,0.14)" }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>{label}</Typography>
            <Typography sx={{ fontSize: 34, fontWeight: 800, mt: 0.5, fontFamily: "JetBrains Mono, monospace" }}>{count}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>{pct}% of {total}</Typography>
          </Box>

          <IconButton size="small" sx={{ bgcolor: tint, color, width: 34, height: 34, borderRadius: 2, "&:hover": { bgcolor: tint } }}>
            {iconFor(iconKey)}
          </IconButton>
        </Box>

        <Box sx={{ mt: 1.8 }}>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{
              height: 6,
              borderRadius: 999,
              backgroundColor: "rgba(15,23,42,0.08)",
              "& .MuiLinearProgress-bar": { borderRadius: 999, backgroundColor: color }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
